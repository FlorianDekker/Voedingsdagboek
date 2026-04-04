import { formatDate, isSameDay } from '../../utils/formatters'

export default function DaySelector({ date, onChange }) {
  function shift(days) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    onChange(d)
  }

  const isToday = isSameDay(date, new Date())

  return (
    <div className="flex items-center justify-between mb-5 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-gray-100/50">
      <button
        onClick={() => shift(-1)}
        className="p-2 -ml-1 text-gray-300 hover:text-gray-500 active:scale-90 transition-all rounded-xl"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={() => onChange(new Date())}
        className="text-sm font-semibold text-gray-800 capitalize tracking-tight"
      >
        {isToday ? (
          <span className="text-emerald-600">Vandaag</span>
        ) : (
          formatDate(date)
        )}
      </button>

      <button
        onClick={() => shift(1)}
        disabled={isToday}
        className="p-2 -mr-1 text-gray-300 hover:text-gray-500 active:scale-90 transition-all rounded-xl disabled:opacity-20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
