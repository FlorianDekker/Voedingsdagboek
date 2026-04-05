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

export default function HourlyChart({ data }) {
  const hasData = data.some(d => d.count > 0)

  if (!hasData) {
    return (
      <div className="text-center py-6">
        <p className="text-muted text-xs">Geen klachten geregistreerd</p>
      </div>
    )
  }

  const chartData = {
    labels: data.map(d => `${d.hour}h`),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: data.map(d => getSeverityColor(d.avgSeverity)),
      borderRadius: 4,
      barThickness: 8,
    }],
  }

  const options = {
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
            const h = data[ctx.dataIndex]
            return `${h.count}x (gem. ${h.avgSeverity.toFixed(1)})`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
  }

  return (
    <div style={{ height: 140, touchAction: 'pan-y' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
