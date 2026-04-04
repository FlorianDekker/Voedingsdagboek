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
    <div className="space-y-4">
      {/* Severity description */}
      <p className="text-sm text-gray-500 text-center">Hoe voelt je maag?</p>

      {/* Severity selector */}
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => setSeverity(level)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
              severity === level
                ? 'scale-110 shadow-lg ring-2 ring-offset-2'
                : 'opacity-60 hover:opacity-80'
            }`}
            style={{
              backgroundColor: SEVERITY_COLORS[level],
              color: 'white',
              ringColor: severity === level ? SEVERITY_COLORS[level] : undefined,
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Severity label */}
      {severity && (
        <p className="text-center font-medium" style={{ color: SEVERITY_COLORS[severity] }}>
          {SEVERITY_LABELS[severity]}
        </p>
      )}

      {/* Optional note */}
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notitie (optioneel)"
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!severity}
        className="w-full py-3.5 bg-red-400 text-white rounded-xl font-medium text-base shadow-md hover:bg-red-500 active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
      >
        Opslaan
      </button>
    </div>
  )
}
