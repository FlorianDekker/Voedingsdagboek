import { Line } from 'react-chartjs-2'
import { formatShortDate } from '../../utils/formatters'

export default function SeverityChart({ data, movingAverage }) {
  const filtered = data.filter(d => d.avg !== null)

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-xs">Nog geen klachten geregistreerd</p>
      </div>
    )
  }

  // Use all dates for labels (moving average needs the full range)
  const labels = data.map(d => formatShortDate(d.date))

  const datasets = [
    {
      label: 'Dagelijks',
      data: data.map(d => d.avg),
      borderColor: '#f87171',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200)
        gradient.addColorStop(0, 'rgba(248, 113, 113, 0.12)')
        gradient.addColorStop(1, 'rgba(248, 113, 113, 0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#f87171',
      pointBorderWidth: 2,
      pointHoverRadius: 5,
      borderWidth: 2,
      spanGaps: false,
    },
  ]

  // Add moving average if available
  if (movingAverage && movingAverage.some(d => d.avg !== null)) {
    datasets.push({
      label: '7-daags gemiddelde',
      data: movingAverage.map(d => d.avg),
      borderColor: '#65B741',
      borderWidth: 2,
      borderDash: [6, 3],
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: '#65B741',
      fill: false,
      spanGaps: true,
    })
  }

  const chartData = { labels, datasets }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        cornerRadius: 10,
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y
            if (val === null || val === undefined) return null
            const prefix = ctx.datasetIndex === 0 ? 'Ernst' : 'Gem.'
            return `${prefix}: ${val.toFixed(1)}/5`
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, font: { size: 10 }, color: '#d0d0d0' },
        grid: { color: 'rgba(0,0,0,0.03)' },
        border: { display: false },
      },
      x: {
        ticks: {
          font: { size: 9 },
          color: '#d0d0d0',
          maxRotation: 45,
          maxTicksLimit: 8,
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  }

  return (
    <div style={{ height: 200 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
