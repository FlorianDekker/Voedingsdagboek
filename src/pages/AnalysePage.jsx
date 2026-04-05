import { useState, useEffect } from 'react'
import SeverityChart from '../components/analyse/SeverityChart'
import FoodRiskTable from '../components/analyse/FoodRiskTable'
import { analyzeCorrelations, getDailySeverity } from '../utils/correlation'

const RANGES = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
  { value: 0, label: 'Alles' },
]

export default function AnalysePage() {
  const [range, setRange] = useState(30)
  const [correlations, setCorrelations] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [corr, daily] = await Promise.all([
        analyzeCorrelations(),
        getDailySeverity(range || 365),
      ])
      setCorrelations(corr)
      setDailyData(daily)
      setLoading(false)
    }
    load()
  }, [range])

  if (loading) {
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

      {/* Severity over time chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200/60">
        <h2 className="text-xs font-semibold text-sand-300 uppercase tracking-wider mb-4">Klachten over tijd</h2>
        <SeverityChart data={dailyData} />
      </div>

      {/* Food risk analysis */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-200/60">
        <h2 className="text-xs font-semibold text-sand-300 uppercase tracking-wider mb-4">Voedsel analyse</h2>
        <FoodRiskTable correlations={correlations} />
      </div>
    </div>
  )
}
