import { formatDate, isSameDay } from '../../utils/formatters'

export default function DaySelector({ date, onChange }) {
  function shift(days) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    onChange(d)
  }

  const isToday = isSameDay(date, new Date())

  return (
    <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-3 py-2 shadow-sm">
      <button
        onClick={() => shift(-1)}
        className="p-2 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={() => onChange(new Date())}
        className="text-sm font-medium text-gray-700 capitalize"
      >
        {isToday ? 'Vandaag' : formatDate(date)}
      </button>

      <button
        onClick={() => shift(1)}
        disabled={isToday}
        className="p-2 text-gray-400 hover:text-gray-600 active:scale-90 transition-transform disabled:opacity-30"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
