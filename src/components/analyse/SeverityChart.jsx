import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { formatShortDate } from '../../utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export default function SeverityChart({ data }) {
  const filtered = data.filter(d => d.avg !== null)

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300 text-xs">Nog geen klachten geregistreerd</p>
      </div>
    )
  }

  const chartData = {
    labels: filtered.map(d => formatShortDate(d.date)),
    datasets: [
      {
        data: filtered.map(d => d.avg),
        borderColor: '#f87171',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200)
          gradient.addColorStop(0, 'rgba(248, 113, 113, 0.15)')
          gradient.addColorStop(1, 'rgba(248, 113, 113, 0)')
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#f87171',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        cornerRadius: 10,
        padding: 10,
        callbacks: {
          label: (ctx) => `Ernst: ${ctx.parsed.y.toFixed(1)}/5`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, font: { size: 10 }, color: '#d1d5db' },
        grid: { color: 'rgba(0,0,0,0.03)' },
        border: { display: false },
      },
      x: {
        ticks: {
          font: { size: 9 },
          color: '#d1d5db',
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
