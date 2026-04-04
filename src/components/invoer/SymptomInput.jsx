import { useState } from 'react'
import { db } from '../../db/db'
import { SEVERITY_LABELS, SEVERITY_COLORS } from '../../constants/mealTypes'

export default function SymptomInput({ onSaved }) {
  const [severity, setSeverity] = useState(null)
  const [note, setNote] = useState('')

  async function handleSave() {
    if (!severity) return

    await db.entries.add({
      type: 'klacht',
      timestamp: new Date(),
      description: null,
      mealType: null,
      severity,
      note: note.trim() || null,
    })

    setSeverity(null)
    setNote('')
    onSaved?.()
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-400 text-center">Hoe voelt je maag op dit moment?</p>

      {/* Severity selector */}
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => setSeverity(level)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all duration-200 ${
              severity === level
                ? 'scale-115 shadow-xl ring-3 ring-offset-2'
                : severity !== null
                  ? 'opacity-40 scale-95'
                  : 'opacity-70 hover:opacity-90 hover:scale-105'
            }`}
            style={{
              backgroundColor: SEVERITY_COLORS[level],
              '--tw-ring-color': SEVERITY_COLORS[level],
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Severity label */}
      {severity && (
        <p className="text-center text-sm font-semibold animate-fade-in" style={{ color: SEVERITY_COLORS[severity] }}>
          {SEVERITY_LABELS[severity]}
        </p>
      )}

      {/* Optional note */}
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notitie (optioneel)"
        className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300/50 focus:border-red-200 transition-all"
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!severity}
        className="w-full py-4 rounded-2xl font-semibold text-base text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none disabled:active:scale-100"
        style={{
          background: severity
            ? `linear-gradient(to bottom, ${SEVERITY_COLORS[severity]}, ${SEVERITY_COLORS[severity]}dd)`
            : '#d1d5db',
          boxShadow: severity
            ? `0 10px 25px -5px ${SEVERITY_COLORS[severity]}40`
            : undefined,
        }}
      >
        Opslaan
      </button>
    </div>
  )
}
