import { db } from '../../db/db'
import { formatTime } from '../../utils/formatters'
import { MEAL_TYPES, SEVERITY_LABELS, SEVERITY_COLORS } from '../../constants/mealTypes'

export default function EntryCard({ entry }) {
  const isMeal = entry.type === 'maaltijd'
  const mealLabel = MEAL_TYPES.find(m => m.value === entry.mealType)?.label
  const barColor = isMeal ? '#2d6a4f' : SEVERITY_COLORS[entry.severity]

  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sand-200/60 flex overflow-hidden active:scale-[0.99] transition-all duration-150">
      {/* Color bar */}
      <div className="w-[3px] flex-shrink-0 rounded-l-2xl" style={{ backgroundColor: barColor }} />

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3.5">
        {isMeal ? (
          <>
            {entry.note && (
              <p className="text-[13px] font-semibold text-[#1a1a2e] mb-1.5">{entry.note}</p>
            )}
            <div className="flex flex-wrap gap-1">
              {entry.description.split(', ').map((ing, i) => (
                <span key={i} className="text-[11px] bg-green-subtle text-green-accent px-2 py-0.5 rounded-lg capitalize font-medium">
                  {ing}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {mealLabel && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-light/70">
                  {mealLabel}
                </span>
              )}
              <span className="text-[10px] text-sand-300">·</span>
              <span className="text-[10px] text-sand-300 font-medium">{formatTime(entry.timestamp)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: SEVERITY_COLORS[entry.severity] }}
              >
                {entry.severity}
              </div>
              <div>
                <span
                  className="text-[13px] font-semibold block"
                  style={{ color: SEVERITY_COLORS[entry.severity] }}
                >
                  {SEVERITY_LABELS[entry.severity]}
                </span>
                {entry.note && (
                  <p className="text-[11px] text-sand-300 mt-0.5">{entry.note}</p>
                )}
              </div>
            </div>
            <span className="text-[10px] text-sand-300 font-medium mt-2 block">{formatTime(entry.timestamp)}</span>
          </>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="px-3 text-sand-200 hover:text-red-400 active:text-red-500 transition-colors self-center"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
