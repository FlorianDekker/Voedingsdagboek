import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { computeAllAnalytics } from '../utils/correlation'
import { generateInsights } from '../utils/insights'
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

export default function AnalysePage() {
  const [range, setRange] = useState(30)
  const entries = useLiveQuery(() => db.entries.toArray())

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
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-green-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Range selector */}
      <div className="flex bg-sand-100 rounded-xl p-1">
        {RANGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              range === value
                ? 'bg-white text-green-accent shadow-sm'
                : 'text-sand-300'
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
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200/60">
        <h2 className="text-xs font-semibold text-sand-300 uppercase tracking-wider mb-4">Klachten over tijd</h2>
        <SeverityChart data={analytics.dailySeverity} movingAverage={analytics.movingAverage} />
      </div>

      {/* Ingredient analysis */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200/60">
        <h2 className="text-xs font-semibold text-sand-300 uppercase tracking-wider mb-1">Ingrediënten analyse</h2>
        <p className="text-[10px] text-sand-300/70 mb-4">
          {analytics.baselineRate > 0
            ? `Baseline: ${Math.round(analytics.baselineRate * 100)}% van maaltijden gevolgd door klachten`
            : 'Geen baseline beschikbaar'}
        </p>
        <IngredientRiskTable ingredients={analytics.ingredients} baselineRate={analytics.baselineRate} />
      </div>

      {/* Patterns section */}
      <div>
        <h2 className="text-xs font-semibold text-sand-300 uppercase tracking-wider mb-3 px-1">Patronen</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-200/60">
            <p className="text-[10px] font-semibold text-sand-300 uppercase tracking-wider mb-3">Per uur</p>
            <HourlyChart data={analytics.hourlyPattern} />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-200/60">
            <p className="text-[10px] font-semibold text-sand-300 uppercase tracking-wider mb-3">Per dag</p>
            <WeekdayChart data={analytics.weekdayPattern} />
          </div>
        </div>
      </div>

      {/* Meal type breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200/60">
        <h2 className="text-xs font-semibold text-sand-300 uppercase tracking-wider mb-4">Per maaltijdtype</h2>
        <MealTypeCard data={analytics.mealTypePattern} />
      </div>

      {/* Streaks */}
      <div>
        <h2 className="text-xs font-semibold text-sand-300 uppercase tracking-wider mb-3 px-1">Reeksen</h2>
        <StreakCard streaks={analytics.streaks} />
      </div>
    </div>
  )
}
