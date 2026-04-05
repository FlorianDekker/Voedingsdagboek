import { db } from '../db/db'
import { normalizeFood } from './foodNormalizer'

const MIN_OCCURRENCES = 2
const WINDOW_MIN_HOURS = 2
const WINDOW_MAX_HOURS = 24
const WINDOW_MIN_MS = WINDOW_MIN_HOURS * 3600000
const WINDOW_MAX_MS = WINDOW_MAX_HOURS * 3600000

const WEEKDAY_LABELS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']
const MEAL_TYPE_LABELS = {
  ontbijt: 'Ontbijt',
  lunch: 'Lunch',
  avondeten: 'Avondeten',
  tussendoor: 'Tussendoor',
}

/**
 * Single-pass computation of all analytics from entries.
 * @param {Array} allEntries - All entries from DB
 * @param {number} daysBack - Number of days to analyze (0 = all)
 * @returns {object} Complete analytics object
 */
export function computeAllAnalytics(allEntries, daysBack) {
  const now = new Date()
  const since = new Date()
  if (daysBack > 0) {
    since.setDate(since.getDate() - daysBack)
  } else {
    since.setFullYear(2000)
  }
  since.setHours(0, 0, 0, 0)

  // Split entries by type and filter by range
  const meals = []
  const symptoms = []
  for (const e of allEntries) {
    const ts = new Date(e.timestamp)
    if (ts < since) continue
    if (e.type === 'maaltijd') meals.push({ ...e, _ts: ts.getTime() })
    else if (e.type === 'klacht') symptoms.push({ ...e, _ts: ts.getTime() })
  }

  // Sort by timestamp
  meals.sort((a, b) => a._ts - b._ts)
  symptoms.sort((a, b) => a._ts - b._ts)

  // === BASELINE SYMPTOM RATE ===
  let mealsWithSymptoms = 0
  for (const meal of meals) {
    if (hasSymptomInWindow(meal._ts, symptoms)) {
      mealsWithSymptoms++
    }
  }
  const baselineRate = meals.length > 0 ? mealsWithSymptoms / meals.length : 0

  // === INGREDIENT-LEVEL ANALYSIS ===
  const ingredientMap = new Map() // name -> { occurrences: [meal_ts], timesFollowed, totalSeverity }

  for (const meal of meals) {
    if (!meal.description) continue
    const ingredients = meal.description.split(',').map(s => normalizeFood(s.trim())).filter(Boolean)
    const followed = hasSymptomInWindow(meal._ts, symptoms)
    const maxSev = followed ? getMaxSeverityInWindow(meal._ts, symptoms) : 0

    for (const ing of ingredients) {
      if (!ingredientMap.has(ing)) {
        ingredientMap.set(ing, { timesEaten: 0, timesFollowed: 0, totalSeverity: 0 })
      }
      const data = ingredientMap.get(ing)
      data.timesEaten++
      if (followed) {
        data.timesFollowed++
        data.totalSeverity += maxSev
      }
    }
  }

  const ingredients = []
  for (const [name, data] of ingredientMap) {
    if (data.timesEaten < MIN_OCCURRENCES) continue
    const followRate = data.timesFollowed / data.timesEaten
    const avgSeverity = data.timesFollowed > 0 ? data.totalSeverity / data.timesFollowed : 0
    const lift = baselineRate > 0 ? followRate / baselineRate : followRate > 0 ? 2 : 0
    const riskScore = lift * avgSeverity
    const confidence = data.timesEaten >= 10 ? 'high' : data.timesEaten >= 5 ? 'medium' : 'low'
    const riskLevel = getRiskLevel(lift, followRate, data.timesEaten)

    ingredients.push({
      name, ...data, followRate, avgSeverity, lift, riskScore, confidence, riskLevel, baselineRate,
    })
  }
  ingredients.sort((a, b) => b.riskScore - a.riskScore)

  // === DAILY SEVERITY ===
  const dailyMap = new Map()
  for (const s of symptoms) {
    const day = new Date(s._ts).toDateString()
    if (!dailyMap.has(day)) dailyMap.set(day, [])
    dailyMap.get(day).push(s.severity)
  }

  const dailySeverity = []
  const d = new Date(since)
  while (d <= now) {
    const key = d.toDateString()
    const sevs = dailyMap.get(key) || []
    dailySeverity.push({
      date: new Date(d),
      avg: sevs.length > 0 ? sevs.reduce((a, b) => a + b, 0) / sevs.length : null,
      count: sevs.length,
    })
    d.setDate(d.getDate() + 1)
  }

  // === 7-DAY MOVING AVERAGE ===
  const movingAverage = []
  for (let i = 0; i < dailySeverity.length; i++) {
    const window = dailySeverity.slice(Math.max(0, i - 6), i + 1)
    const withData = window.filter(d => d.avg !== null)
    movingAverage.push({
      date: dailySeverity[i].date,
      avg: withData.length >= 2 ? withData.reduce((a, b) => a + b.avg, 0) / withData.length : null,
    })
  }

  // === HOURLY PATTERN ===
  const hourlyPattern = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0, totalSeverity: 0, avgSeverity: 0 }))
  for (const s of symptoms) {
    const h = new Date(s._ts).getHours()
    hourlyPattern[h].count++
    hourlyPattern[h].totalSeverity += s.severity
  }
  for (const hp of hourlyPattern) {
    hp.avgSeverity = hp.count > 0 ? hp.totalSeverity / hp.count : 0
  }

  // === WEEKDAY PATTERN ===
  // JS getDay: 0=Sun, we want 0=Mon
  const weekdayBuckets = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }))
  for (const s of symptoms) {
    const jsDay = new Date(s._ts).getDay()
    const idx = jsDay === 0 ? 6 : jsDay - 1 // Convert Sun=0 to Mon=0
    weekdayBuckets[idx].total += s.severity
    weekdayBuckets[idx].count++
  }
  const weekdayPattern = weekdayBuckets.map((b, i) => ({
    day: i,
    label: WEEKDAY_LABELS[i],
    avgSeverity: b.count > 0 ? b.total / b.count : 0,
    count: b.count,
  }))

  // === MEAL TYPE PATTERN ===
  const mealTypeBuckets = {}
  for (const type of Object.keys(MEAL_TYPE_LABELS)) {
    mealTypeBuckets[type] = { total: 0, followed: 0 }
  }
  for (const meal of meals) {
    const type = meal.mealType
    if (!mealTypeBuckets[type]) continue
    mealTypeBuckets[type].total++
    if (hasSymptomInWindow(meal._ts, symptoms)) {
      mealTypeBuckets[type].followed++
    }
  }
  const mealTypePattern = Object.entries(mealTypeBuckets).map(([type, data]) => ({
    type,
    label: MEAL_TYPE_LABELS[type],
    followRate: data.total > 0 ? data.followed / data.total : 0,
    count: data.total,
  }))

  // === STREAKS ===
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  for (let i = dailySeverity.length - 1; i >= 0; i--) {
    if (dailySeverity[i].count === 0) {
      if (currentStreak === 0 || currentStreak === dailySeverity.length - 1 - i) {
        currentStreak = dailySeverity.length - i
      }
    } else if (currentStreak === 0) {
      break
    } else {
      break
    }
  }
  // Fix: count from end
  currentStreak = 0
  for (let i = dailySeverity.length - 1; i >= 0; i--) {
    if (dailySeverity[i].count === 0) currentStreak++
    else break
  }
  // Longest streak
  tempStreak = 0
  for (const day of dailySeverity) {
    if (day.count === 0) {
      tempStreak++
      if (tempStreak > longestStreak) longestStreak = tempStreak
    } else {
      tempStreak = 0
    }
  }

  // === TREND (last 14 days vs prior 14 days) ===
  const recentDays = dailySeverity.slice(-14)
  const previousDays = dailySeverity.slice(-28, -14)
  const recentWithData = recentDays.filter(d => d.avg !== null)
  const prevWithData = previousDays.filter(d => d.avg !== null)
  const recentAvg = recentWithData.length > 0 ? recentWithData.reduce((a, b) => a + b.avg, 0) / recentWithData.length : null
  const prevAvg = prevWithData.length > 0 ? prevWithData.reduce((a, b) => a + b.avg, 0) / prevWithData.length : null

  let direction = 'stable'
  if (recentAvg !== null && prevAvg !== null) {
    if (recentAvg < prevAvg - 0.3) direction = 'improving'
    else if (recentAvg > prevAvg + 0.3) direction = 'worsening'
  }

  // === SUMMARY ===
  const totalSymptoms = symptoms.length
  const avgSeverityAll = totalSymptoms > 0 ? symptoms.reduce((a, s) => a + s.severity, 0) / totalSymptoms : 0
  const daysTracked = dailySeverity.length
  const symptomFreeDays = dailySeverity.filter(d => d.count === 0).length

  return {
    ingredients,
    dailySeverity,
    movingAverage,
    hourlyPattern,
    weekdayPattern,
    mealTypePattern,
    streaks: { current: currentStreak, longest: longestStreak },
    trend: { recent: recentAvg, previous: prevAvg, direction },
    summary: { totalSymptoms, avgSeverity: avgSeverityAll, totalMeals: meals.length, daysTracked, symptomFreeDays },
    baselineRate,
  }
}

// --- Helpers ---

function hasSymptomInWindow(mealTs, symptoms) {
  const start = mealTs + WINDOW_MIN_MS
  const end = mealTs + WINDOW_MAX_MS
  for (const s of symptoms) {
    if (s._ts >= start && s._ts <= end) return true
    if (s._ts > end) break // symptoms are sorted
  }
  return false
}

function getMaxSeverityInWindow(mealTs, symptoms) {
  const start = mealTs + WINDOW_MIN_MS
  const end = mealTs + WINDOW_MAX_MS
  let max = 0
  for (const s of symptoms) {
    if (s._ts >= start && s._ts <= end) {
      if (s.severity > max) max = s.severity
    }
    if (s._ts > end) break
  }
  return max
}

function getRiskLevel(lift, followRate, timesEaten) {
  if (lift > 1.8 && followRate > 0.4 && timesEaten >= 3) return 'hoog'
  if (lift > 1.3 && followRate > 0.25) return 'midden'
  return 'laag'
}

// Keep old exports for backwards compat during transition
export async function analyzeCorrelations() {
  const entries = await db.entries.toArray()
  const analytics = computeAllAnalytics(entries, 0)
  return analytics.ingredients.map(i => ({
    food: i.name, timesEaten: i.timesEaten, timesFollowed: i.timesFollowed,
    followRate: i.followRate, avgSeverity: i.avgSeverity, riskScore: i.riskScore, riskLevel: i.riskLevel,
  }))
}

export async function getDailySeverity(daysBack = 30) {
  const entries = await db.entries.toArray()
  return computeAllAnalytics(entries, daysBack).dailySeverity
}
