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
    return <p className="text-gray-400 text-xs text-center py-6">Nog geen klachten geregistreerd</p>
  }

  const chartData = {
    labels: filtered.map(d => formatShortDate(d.date)),
    datasets: [
      {
        data: filtered.map(d => d.avg),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#ef4444',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `Ernst: ${ctx.parsed.y.toFixed(1)}/5`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: {
          font: { size: 9 },
          maxRotation: 45,
          maxTicksLimit: 10,
        },
        grid: { display: false },
      },
    },
  }

  return (
    <div style={{ height: 200 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
