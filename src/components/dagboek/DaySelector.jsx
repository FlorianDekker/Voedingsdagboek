import { formatDate, isSameDay } from '../../utils/formatters'

export default function DaySelector({ date, onChange }) {
  function shift(days) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    onChange(d)
  }

  const isToday = isSameDay(date, new Date())

  return (
    <div className="flex items-center justify-between mb-6 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-sm border border-gray-100/40">
      <button
        onClick={() => shift(-1)}
        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90 transition-all rounded-xl hover:bg-gray-50"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={() => onChange(new Date())}
        className="text-[15px] font-bold text-gray-800 capitalize tracking-tight"
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
        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 active:scale-90 transition-all rounded-xl hover:bg-gray-50 disabled:opacity-20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
