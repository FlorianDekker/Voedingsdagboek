import { db } from '../../db/db'
import { formatTime } from '../../utils/formatters'
import { MEAL_TYPES, SEVERITY_LABELS, SEVERITY_COLORS } from '../../constants/mealTypes'

export default function EntryCard({ entry }) {
  const isMeal = entry.type === 'maaltijd'
  const mealLabel = MEAL_TYPES.find(m => m.value === entry.mealType)?.label
  const barColor = isMeal ? '#10b981' : SEVERITY_COLORS[entry.severity]

  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 flex overflow-hidden group active:scale-[0.99] transition-transform">
      {/* Color bar */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: barColor }} />

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3">
        {isMeal ? (
          <>
            <div className="flex flex-wrap gap-1">
              {entry.description.split(', ').map((ing, i) => (
                <span key={i} className="text-xs bg-emerald-50/80 text-emerald-700 px-2 py-0.5 rounded-md capitalize font-medium">
                  {ing}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {mealLabel && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                  {mealLabel}
                </span>
              )}
              <span className="text-[10px] text-gray-300 font-medium">{formatTime(entry.timestamp)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold"
                style={{ color: SEVERITY_COLORS[entry.severity] }}
              >
                {SEVERITY_LABELS[entry.severity]}
              </span>
              <span className="text-[10px] text-gray-300 font-medium">({entry.severity}/5)</span>
            </div>
            {entry.note && (
              <p className="text-xs text-gray-400 mt-0.5">{entry.note}</p>
            )}
            <span className="text-[10px] text-gray-300 font-medium mt-1 block">{formatTime(entry.timestamp)}</span>
          </>
        )}
      </div>

      {/* Delete button - always visible on mobile */}
      <button
        onClick={handleDelete}
        className="px-3 text-gray-200 hover:text-red-400 active:text-red-500 transition-colors self-center"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
