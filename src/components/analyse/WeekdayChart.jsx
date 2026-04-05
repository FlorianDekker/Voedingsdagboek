import { Bar } from 'react-chartjs-2'
import { SEVERITY_COLORS } from '../../constants/mealTypes'

function getSeverityColor(avg) {
  if (avg <= 0) return '#e8e4dd'
  if (avg <= 1.5) return SEVERITY_COLORS[1]
  if (avg <= 2.5) return SEVERITY_COLORS[2]
  if (avg <= 3.5) return SEVERITY_COLORS[3]
  if (avg <= 4.5) return SEVERITY_COLORS[4]
  return SEVERITY_COLORS[5]
}

export default function WeekdayChart({ data }) {
  const hasData = data.some(d => d.count > 0)

  if (!hasData) {
    return (
      <div className="text-center py-6">
        <p className="text-muted text-xs">Geen klachten geregistreerd</p>
      </div>
    )
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.avgSeverity),
      backgroundColor: data.map(d => getSeverityColor(d.avgSeverity)),
      borderRadius: 4,
      barThickness: 20,
    }],
  }

  const options = {
    indexAxis: 'y',
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
          label: (ctx) => {
            const d = data[ctx.dataIndex]
            return `Gem. ${d.avgSeverity.toFixed(1)} (${d.count}x)`
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, font: { size: 9 }, color: '#d0d0d0' },
        grid: { color: 'rgba(0,0,0,0.03)' },
        border: { display: false },
      },
      y: {
        ticks: { font: { size: 10, weight: 500 }, color: '#1a1a1a' },
        grid: { display: false },
        border: { display: false },
      },
    },
  }

  return (
    <div style={{ height: 180, touchAction: 'pan-y' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
