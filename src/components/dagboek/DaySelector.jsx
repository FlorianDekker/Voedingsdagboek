import { formatDate, isSameDay } from '../../utils/formatters'

export default function DaySelector({ date, onChange }) {
  function shift(days) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    onChange(d)
  }

  const isToday = isSameDay(date, new Date())

  return (
    <div className="flex items-center justify-between mb-5">
      <button
        onClick={() => shift(-1)}
        className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary rounded-xl transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={() => onChange(new Date())}
        className={`text-[15px] font-semibold capitalize ${isToday ? 'text-primary' : 'text-[#1a1a1a]'}`}
      >
        {isToday ? 'Vandaag' : formatDate(date)}
      </button>

      <button
        onClick={() => shift(1)}
        disabled={isToday}
        className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary rounded-xl transition-colors disabled:opacity-20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
