import { db } from '../db/db'
import { normalizeFood } from './foodNormalizer'

const MIN_OCCURRENCES = 3
const WINDOW_MIN_HOURS = 2
const WINDOW_MAX_HOURS = 24

/**
 * Analyze which foods correlate with stomach symptoms.
 * For each food, checks if symptoms occurred within 2-24 hours after eating.
 * Returns foods ranked by risk score.
 */
export async function analyzeCorrelations() {
  const meals = await db.entries.where('type').equals('maaltijd').sortBy('timestamp')
  const symptoms = await db.entries.where('type').equals('klacht').sortBy('timestamp')

  if (meals.length === 0 || symptoms.length === 0) return []

  // Group meals by normalized food name
  const foodOccurrences = new Map()

  for (const meal of meals) {
    const name = normalizeFood(meal.description)
    if (!foodOccurrences.has(name)) {
      foodOccurrences.set(name, [])
    }
    foodOccurrences.get(name).push(meal)
  }

  const results = []

  for (const [foodName, occurrences] of foodOccurrences) {
    if (occurrences.length < MIN_OCCURRENCES) continue

    let timesFollowed = 0
    let totalSeverityWhenFollowed = 0

    for (const meal of occurrences) {
      const mealTime = new Date(meal.timestamp).getTime()
      const windowStart = mealTime + WINDOW_MIN_HOURS * 3600000
      const windowEnd = mealTime + WINDOW_MAX_HOURS * 3600000

      // Find worst symptom in the window
      const symptomInWindow = symptoms.filter(s => {
        const t = new Date(s.timestamp).getTime()
        return t >= windowStart && t <= windowEnd
      })

      if (symptomInWindow.length > 0) {
        timesFollowed++
        const maxSeverity = Math.max(...symptomInWindow.map(s => s.severity))
        totalSeverityWhenFollowed += maxSeverity
      }
    }

    const followRate = timesFollowed / occurrences.length
    const avgSeverity = timesFollowed > 0 ? totalSeverityWhenFollowed / timesFollowed : 0
    const riskScore = followRate * avgSeverity

    results.push({
      food: foodName,
      timesEaten: occurrences.length,
      timesFollowed,
      followRate,
      avgSeverity,
      riskScore,
      riskLevel: getRiskLevel(riskScore, followRate),
    })
  }

  return results.sort((a, b) => b.riskScore - a.riskScore)
}

function getRiskLevel(riskScore, followRate) {
  if (riskScore > 3.0 || followRate > 0.6) return 'hoog'
  if (riskScore > 1.5 || followRate > 0.3) return 'midden'
  return 'laag'
}

/**
 * Get daily average symptom severity for charting.
 */
export async function getDailySeverity(daysBack = 30) {
  const since = new Date()
  since.setDate(since.getDate() - daysBack)
  since.setHours(0, 0, 0, 0)

  const symptoms = await db.entries
    .where('type').equals('klacht')
    .and(e => new Date(e.timestamp) >= since)
    .sortBy('timestamp')

  // Group by day
  const dailyMap = new Map()
  for (const s of symptoms) {
    const day = new Date(s.timestamp).toDateString()
    if (!dailyMap.has(day)) dailyMap.set(day, [])
    dailyMap.get(day).push(s.severity)
  }

  const result = []
  const d = new Date(since)
  const today = new Date()
  while (d <= today) {
    const key = d.toDateString()
    const severities = dailyMap.get(key) || []
    result.push({
      date: new Date(d),
      avg: severities.length > 0
        ? severities.reduce((a, b) => a + b, 0) / severities.length
        : null,
      count: severities.length,
    })
    d.setDate(d.getDate() + 1)
  }

  return result
}
