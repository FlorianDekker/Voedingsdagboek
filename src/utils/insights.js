/**
 * Generate Dutch-language insights from analytics data.
 * @param {object} analytics - Output from computeAllAnalytics()
 * @returns {Array<{type: string, text: string, priority: number}>}
 */
export function generateInsights(analytics) {
  const { ingredients, streaks, trend, summary, mealTypePattern, hourlyPattern, baselineRate, dailySeverity } = analytics
  const insights = []

  // Not enough data
  if (summary.daysTracked < 7 || summary.totalMeals < 5) {
    return [{ type: 'info', text: 'Blijf registreren voor inzichten! Je hebt nog niet genoeg data voor betrouwbare analyse.', priority: 0 }]
  }

  // High-risk ingredients
  const highRisk = ingredients.filter(i => i.riskLevel === 'hoog' && i.confidence !== 'low')
  for (const ing of highRisk.slice(0, 2)) {
    const pct = Math.round(ing.followRate * 100)
    insights.push({
      type: 'warning',
      text: `${capitalize(ing.name)} komt ${ing.lift.toFixed(1)}x vaker voor bij klachten dan gemiddeld (${ing.timesEaten}x gegeten, ${pct}% klachten erna).`,
      priority: 10 + ing.riskScore,
    })
  }

  // Trend
  if (trend.direction === 'improving' && trend.recent !== null && trend.previous !== null) {
    insights.push({
      type: 'positive',
      text: `Je klachten nemen af: gem. ${trend.recent.toFixed(1)} deze 2 weken vs. ${trend.previous.toFixed(1)} de 2 weken ervoor.`,
      priority: 8,
    })
  } else if (trend.direction === 'worsening' && trend.recent !== null && trend.previous !== null) {
    insights.push({
      type: 'warning',
      text: `Je klachten nemen toe: gem. ${trend.recent.toFixed(1)} deze 2 weken vs. ${trend.previous.toFixed(1)} de 2 weken ervoor.`,
      priority: 9,
    })
  }

  // Streak
  if (streaks.current >= 3) {
    const isRecord = streaks.current >= streaks.longest
    insights.push({
      type: 'positive',
      text: isRecord
        ? `Al ${streaks.current} dagen geen klachten — je langste reeks!`
        : `Al ${streaks.current} dagen geen klachten. Je record is ${streaks.longest} dagen.`,
      priority: 7,
    })
  }

  // Meal type pattern
  const mealTypesWithData = mealTypePattern.filter(m => m.count >= 3)
  if (mealTypesWithData.length >= 2) {
    const worst = [...mealTypesWithData].sort((a, b) => b.followRate - a.followRate)[0]
    const best = [...mealTypesWithData].sort((a, b) => a.followRate - b.followRate)[0]
    if (worst.followRate > 0.3 && worst.followRate > best.followRate * 1.5) {
      const worstPct = Math.round(worst.followRate * 100)
      const bestPct = Math.round(best.followRate * 100)
      insights.push({
        type: 'info',
        text: `De meeste klachten komen na ${worst.label.toLowerCase()} (${worstPct}% vs. ${bestPct}% bij ${best.label.toLowerCase()}).`,
        priority: 5,
      })
    }
  }

  // Hourly peak
  const peakHours = hourlyPattern.filter(h => h.count >= 2).sort((a, b) => b.count - a.count)
  if (peakHours.length > 0 && peakHours[0].count >= 3) {
    const peak = peakHours[0]
    insights.push({
      type: 'info',
      text: `Klachten pieken rond ${peak.hour}:00-${peak.hour + 1}:00 (${peak.count}x geregistreerd).`,
      priority: 4,
    })
  }

  // No symptoms at all
  if (summary.totalSymptoms === 0 && summary.totalMeals > 0) {
    insights.push({
      type: 'positive',
      text: 'Geen klachten geregistreerd in deze periode. Goed bezig!',
      priority: 6,
    })
  }

  // Sort by priority descending, limit to 4
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 4)
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
