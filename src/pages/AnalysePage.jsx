import { useState, useMemo, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { computeAllAnalytics } from '../utils/correlation'
import { generateInsights } from '../utils/insights'
import { useSwipe } from '../hooks/useSwipe'
import '../utils/chartSetup'

import SummaryStats from '../components/analyse/SummaryStats'
import InsightCards from '../components/analyse/InsightCards'
import SeverityChart from '../components/analyse/SeverityChart'
import IngredientRiskTable from '../components/analyse/IngredientRiskTable'
import HourlyChart from '../components/analyse/HourlyChart'
import WeekdayChart from '../components/analyse/WeekdayChart'
import MealTypeCard from '../components/analyse/MealTypeCard'
import StreakCard from '../components/analyse/StreakCard'

const RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
  { value: 0, label: 'Alles' },
]

const RANGE_VALUES = RANGES.map(r => r.value)

export default function AnalysePage() {
  const [range, setRange] = useState(30)
  const entries = useLiveQuery(() => db.entries.toArray())

  const goNextRange = useCallback(() => {
    const idx = RANGE_VALUES.indexOf(range)
    if (idx < RANGE_VALUES.length - 1) setRange(RANGE_VALUES[idx + 1])
  }, [range])

  const goPrevRange = useCallback(() => {
    const idx = RANGE_VALUES.indexOf(range)
    if (idx > 0) setRange(RANGE_VALUES[idx - 1])
  }, [range])

  const swipeHandlers = useSwipe(goNextRange, goPrevRange)

  const analytics = useMemo(() => {
    if (!entries) return null
    return computeAllAnalytics(entries, range || 0)
  }, [entries, range])

  const insights = useMemo(() => {
    if (!analytics) return []
    return generateInsights(analytics)
  }, [analytics])

  if (!entries || !analytics) {
    return (
      <div {...swipeHandlers} className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5" {...swipeHandlers}>
      {/* Range selector */}
      <div className="flex bg-surface rounded-xl p-1">
        {RANGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              range === value
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <SummaryStats summary={analytics.summary} />

      {/* Auto-generated insights */}
      {insights.length > 0 && <InsightCards insights={insights} />}

      {/* Severity over time */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Klachten over tijd</h2>
        <SeverityChart data={analytics.dailySeverity} movingAverage={analytics.movingAverage} />
      </div>

      {/* Ingredient analysis */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Ingrediënten analyse</h2>
        <p className="text-[10px] text-muted/70 mb-4">
          {analytics.baselineRate > 0
            ? `Baseline: ${Math.round(analytics.baselineRate * 100)}% van maaltijden gevolgd door klachten`
            : 'Geen baseline beschikbaar'}
        </p>
        <IngredientRiskTable ingredients={analytics.ingredients} baselineRate={analytics.baselineRate} />
      </div>

      {/* Patterns section */}
      <div>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-1">Patronen</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Per uur</p>
            <HourlyChart data={analytics.hourlyPattern} />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Per dag</p>
            <WeekdayChart data={analytics.weekdayPattern} />
          </div>
        </div>
      </div>

      {/* Meal type breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Per maaltijdtype</h2>
        <MealTypeCard data={analytics.mealTypePattern} />
      </div>

      {/* Streaks */}
      <div>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-1">Reeksen</h2>
        <StreakCard streaks={analytics.streaks} />
      </div>
    </div>
  )
}
