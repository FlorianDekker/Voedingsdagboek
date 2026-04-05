import { useState, useMemo, useRef, useEffect } from 'react'
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
  const [animDir, setAnimDir] = useState(null)
  const entries = useLiveQuery(() => db.entries.toArray())
  const pageRef = useRef(null)
  const activeRef = useRef(RANGES.findIndex(r => r.value === 30))
  const animating = useRef(false)

  function goTo(nextIdx) {
    if (nextIdx === activeRef.current || animating.current) return
    if (nextIdx < 0 || nextIdx >= RANGES.length) return
    animating.current = true
    setAnimDir(nextIdx > activeRef.current ? 'left' : 'right')
    activeRef.current = nextIdx
    setRange(RANGES[nextIdx].value)
    setTimeout(() => { setAnimDir(null); animating.current = false }, 320)
  }

  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    let startX = null, startY = null, horizontal = null
    const onStart = e => {
      const x = e.touches[0].clientX
      if (x < 24) return
      startX = x; startY = e.touches[0].clientY; horizontal = null
    }
    const onMove = e => {
      if (startX === null) return
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (horizontal === null && (dx > 5 || dy > 5)) horizontal = dx > dy
      if (horizontal) e.preventDefault()
    }
    const onEnd = e => {
      if (startX === null) return
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      startX = null
      if (!horizontal || Math.abs(dx) < 50 || dy > Math.abs(dx)) return
      const cur = activeRef.current
      if (dx < 0 && cur < RANGES.length - 1) goTo(cur + 1)
      else if (dx > 0 && cur > 0) goTo(cur - 1)
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd) }
  }, [])

  const slideClass = animDir === 'left' ? 'animate-slide-in-left' : animDir === 'right' ? 'animate-slide-in-right' : ''

  const analytics = useMemo(() => {
    if (!entries) return null
    return computeAllAnalytics(entries, range || 0)
  }, [entries, range])

  const insights = useMemo(() => {
    if (!analytics) return []
    return generateInsights(analytics)
  }, [analytics])

  const loading = !entries || !analytics

  return (
    <div ref={pageRef} className="space-y-5">
      {/* Range selector */}
      <div className="flex bg-surface rounded-xl p-1">
        {RANGES.map(({ value, label }, i) => (
          <button
            key={value}
            onClick={() => goTo(i)}
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : <div className={slideClass}>
        {/* Ingredient analysis — most important, shown first */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-[#1a1a1a] mb-1">Ingrediënten analyse</h2>
          <p className="text-xs text-muted mb-4">
            {analytics.baselineRate > 0
              ? `Welke ingrediënten veroorzaken klachten? Baseline: ${Math.round(analytics.baselineRate * 100)}%`
              : 'Welke ingrediënten veroorzaken klachten?'}
          </p>
          <IngredientRiskTable ingredients={analytics.ingredients} baselineRate={analytics.baselineRate} />
        </div>

        {/* Summary stats */}
        <div className="mb-5">
          <SummaryStats summary={analytics.summary} />
        </div>

        {/* Auto-generated insights */}
        {insights.length > 0 && <div className="mb-5"><InsightCards insights={insights} /></div>}

        {/* Severity over time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Klachten over tijd</h2>
          <SeverityChart data={analytics.dailySeverity} movingAverage={analytics.movingAverage} />
        </div>

        {/* Patterns section */}
        <div className="mb-5">
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
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Per maaltijdtype</h2>
          <MealTypeCard data={analytics.mealTypePattern} />
        </div>

        {/* Streaks */}
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-1">Reeksen</h2>
          <StreakCard streaks={analytics.streaks} />
        </div>
      </div>}
    </div>
  )
}
