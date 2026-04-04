import { db } from '../../db/db'
import { formatTime } from '../../utils/formatters'
import { MEAL_TYPES, SEVERITY_LABELS, SEVERITY_COLORS } from '../../constants/mealTypes'

export default function EntryCard({ entry }) {
  const isMeal = entry.type === 'maaltijd'
  const mealLabel = MEAL_TYPES.find(m => m.value === entry.mealType)?.label

  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
    }
  }

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-start gap-3 group">
      {/* Type indicator */}
      <div
        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
        style={{ backgroundColor: isMeal ? '#10b981' : SEVERITY_COLORS[entry.severity] }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isMeal ? (
          <>
            <p className="text-gray-800 text-sm">{entry.description}</p>
            <div className="flex items-center gap-2 mt-1">
              {mealLabel && (
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                  {mealLabel}
                </span>
              )}
              <span className="text-xs text-gray-400">{formatTime(entry.timestamp)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: SEVERITY_COLORS[entry.severity] }}
              >
                {SEVERITY_LABELS[entry.severity]}
              </span>
              <span className="text-xs text-gray-300">({entry.severity}/5)</span>
            </div>
            {entry.note && (
              <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
            )}
            <span className="text-xs text-gray-400 mt-1 block">{formatTime(entry.timestamp)}</span>
          </>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
