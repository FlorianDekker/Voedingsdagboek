import { Bar } from 'react-chartjs-2'
import { SEVERITY_COLORS } from '../../constants/mealTypes'

function getSeverityColor(avg) {
  if (avg === null) return '#e5e5e5'
  if (avg <= 1.5) return SEVERITY_COLORS[1]
  if (avg <= 2.5) return SEVERITY_COLORS[2]
  if (avg <= 3.5) return SEVERITY_COLORS[3]
  if (avg <= 4.5) return SEVERITY_COLORS[4]
  return SEVERITY_COLORS[5]
}

export default function IngredientTimelineChart({ timeline, onClose }) {
  if (!timeline) return null

  const hasData = timeline.buckets.some(b => b.avg !== null)

  return (
    <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-scale-in">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-[#1a1a1a] capitalize">{timeline.ingredient}</p>
        <button onClick={onClose} className="text-muted hover:text-[#1a1a1a] transition-colors p-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-muted mb-3">
        Gem. ernst in de 48 uur na het eten ({timeline.occurrences}x gegeten)
      </p>

      {!hasData ? (
        <p className="text-xs text-muted text-center py-4">Geen klachten geregistreerd na dit ingredient</p>
      ) : (
        <div style={{ height: 160, touchAction: 'pan-y' }}>
          <Bar
            data={{
              labels: timeline.buckets.map(b => b.label),
              datasets: [{
                data: timeline.buckets.map(b => b.avg),
                backgroundColor: timeline.buckets.map(b => getSeverityColor(b.avg)),
                borderRadius: 3,
                barThickness: 8,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  backgroundColor: '#1a1a1a',
                  titleFont: { size: 10 },
                  bodyFont: { size: 10 },
                  cornerRadius: 8,
                  padding: 8,
                  callbacks: {
                    title: (items) => {
                      const b = timeline.buckets[items[0].dataIndex]
                      return `${b.hourStart}-${b.hourEnd} uur na maaltijd`
                    },
                    label: (ctx) => {
                      const b = timeline.buckets[ctx.dataIndex]
                      if (b.avg === null) return 'Geen data'
                      return `Gem. ernst: ${b.avg.toFixed(1)}/5 (${b.count}x)`
                    },
                  },
                },
              },
              scales: {
                y: {
                  min: 0,
                  max: 5,
                  ticks: { stepSize: 1, font: { size: 9 }, color: '#d0d0d0' },
                  grid: { color: 'rgba(0,0,0,0.03)' },
                  border: { display: false },
                },
                x: {
                  ticks: {
                    font: { size: 8 },
                    color: '#d0d0d0',
                    maxTicksLimit: 12,
                  },
                  grid: { display: false },
                  border: { display: false },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  )
}
