import { useState, useEffect } from 'react'
import SeverityChart from '../components/analyse/SeverityChart'
import FoodRiskTable from '../components/analyse/FoodRiskTable'
import { analyzeCorrelations, getDailySeverity } from '../utils/correlation'

const RANGES = [
  { value: 7, label: '7 dagen' },
  { value: 30, label: '30 dagen' },
  { value: 90, label: '90 dagen' },
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
    return <p className="text-center text-gray-400 text-sm py-8">Laden...</p>
  }

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex gap-2">
        {RANGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              range === value
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                : 'bg-gray-50 text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Severity over time chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-600 mb-3">Klachten over tijd</h2>
        <SeverityChart data={dailyData} />
      </div>

      {/* Food risk analysis */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-600 mb-3">Voedsel analyse</h2>
        <FoodRiskTable correlations={correlations} />
      </div>
    </div>
  )
}
