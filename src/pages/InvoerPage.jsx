import { useState } from 'react'
import { db } from '../db/db'
import { useMealsByCategory } from '../hooks/useMeals'
import { MEAL_TYPES, SEVERITY_COLORS } from '../constants/mealTypes'
import { Link } from 'react-router-dom'

function getDefaultMealType() {
  const hour = new Date().getHours()
  if (hour < 10) return 'ontbijt'
  if (hour < 14) return 'lunch'
  if (hour < 18) return 'tussendoor'
  return 'avondeten'
}

export default function InvoerPage() {
  const [mealType, setMealType] = useState(getDefaultMealType())
  const [symptomPrompt, setSymptomPrompt] = useState(false)
  const [savedTimestamp, setSavedTimestamp] = useState(null)
  const [toast, setToast] = useState(null)
  const [mode, setMode] = useState('maaltijd')
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [checkedIngredients, setCheckedIngredients] = useState([])

  const meals = useMealsByCategory(mealType) || []

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  function handleSelectMeal(meal) {
    setSelectedMeal(meal)
    setCheckedIngredients([...meal.ingredients])
  }

  function toggleIngredient(ing) {
    setCheckedIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    )
  }

  async function handleConfirmMeal() {
    if (checkedIngredients.length === 0) return
    const ts = new Date()
    await db.entries.add({
      type: 'maaltijd',
      timestamp: ts,
      description: checkedIngredients.join(', '),
      mealType,
      severity: null,
      note: selectedMeal.name,
    })
    setSelectedMeal(null)
    setCheckedIngredients([])
    setSavedTimestamp(ts)
    setSymptomPrompt(true)
  }

  function handleCancelMeal() {
    setSelectedMeal(null)
    setCheckedIngredients([])
  }

  async function handleSeverityTap(level) {
    await db.entries.add({
      type: 'klacht',
      timestamp: savedTimestamp || new Date(),
      description: null,
      mealType: null,
      severity: level,
      note: null,
    })
    setSymptomPrompt(false)
    setSavedTimestamp(null)
    showToast('Maaltijd + gevoel opgeslagen!')
  }

  function handleSkip() {
    setSymptomPrompt(false)
    setSavedTimestamp(null)
    showToast('Maaltijd opgeslagen!')
  }

  // Ingredient selection screen
  if (selectedMeal) {
    return (
      <div className="animate-scale-in">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-gray-800">{selectedMeal.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Vink ingrediënten aan of uit</p>
            </div>
            <button onClick={handleCancelMeal} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 mb-5">
            {selectedMeal.ingredients.map((ing) => {
              const checked = checkedIngredients.includes(ing)
              return (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    checked
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-50 text-gray-300 border border-gray-100 line-through'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}>
                    {checked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="capitalize">{ing}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleConfirmMeal}
            disabled={checkedIngredients.length === 0}
            className="w-full py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
          >
            Opslaan ({checkedIngredients.length}/{selectedMeal.ingredients.length})
          </button>
        </div>
      </div>
    )
  }

  // Symptom prompt screen
  if (symptomPrompt) {
    return (
      <div className="animate-scale-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-base font-semibold text-gray-800 mb-1">Hoe voelt je maag?</p>
          <p className="text-xs text-gray-400 mb-5">Tik op een niveau of sla over</p>

          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleSeverityTap(level)}
                className="w-13 h-13 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md active:scale-90 transition-transform"
                style={{ backgroundColor: SEVERITY_COLORS[level] }}
              >
                {level}
              </button>
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Overslaan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        <button
          onClick={() => setMode('maaltijd')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'maaltijd' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
          }`}
        >
          Eten
        </button>
        <button
          onClick={() => setMode('klacht')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'klacht' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'
          }`}
        >
          Klacht
        </button>
      </div>

      {mode === 'maaltijd' ? (
        <div className="animate-fade-in">
          {/* Meal type filter */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {MEAL_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMealType(value)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  mealType === value
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-white text-gray-400 border border-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Meal list */}
          {meals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-sm mb-4">
                Nog geen maaltijden voor {MEAL_TYPES.find(m => m.value === mealType)?.label.toLowerCase()}
              </p>
              <Link
                to="/maaltijden"
                className="inline-block bg-gradient-to-b from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-all"
              >
                + Maaltijd aanmaken
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {meals.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => handleSelectMeal(meal)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100/50 px-4 py-3.5 text-left active:scale-[0.98] transition-all"
                >
                  <p className="text-sm font-semibold text-gray-800">{meal.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {meal.ingredients.map((ing, i) => (
                      <span key={i} className="text-[10px] bg-emerald-50/80 text-emerald-600 px-1.5 py-0.5 rounded capitalize font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </button>
              ))}

              <Link
                to="/maaltijden"
                className="block text-center text-xs text-gray-300 hover:text-gray-400 py-3 transition-colors"
              >
                Maaltijden beheren
              </Link>
            </div>
          )}
        </div>
      ) : (
        <SymptomOnlyInput onSaved={() => showToast('Klacht opgeslagen!')} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl z-50 animate-slide-down">
          {toast}
        </div>
      )}
    </div>
  )
}

function SymptomOnlyInput({ onSaved }) {
  const [severity, setSeverity] = useState(null)
  const [note, setNote] = useState('')
  const SEVERITY_LABELS = { 1: 'Goed', 2: 'Licht', 3: 'Matig', 4: 'Slecht', 5: 'Erg slecht' }

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
    <div className="space-y-5 animate-fade-in">
      <p className="text-sm text-gray-400 text-center">Hoe voelt je maag op dit moment?</p>

      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => setSeverity(level)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all duration-200 ${
              severity === level
                ? 'scale-115 shadow-xl ring-3 ring-offset-2'
                : severity !== null ? 'opacity-40 scale-95' : 'opacity-70 hover:opacity-90 hover:scale-105'
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

      {severity && (
        <p className="text-center text-sm font-semibold animate-fade-in" style={{ color: SEVERITY_COLORS[severity] }}>
          {SEVERITY_LABELS[severity]}
        </p>
      )}

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notitie (optioneel)"
        className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300/50 focus:border-red-200 transition-all"
      />

      <button
        onClick={handleSave}
        disabled={!severity}
        className="w-full py-4 rounded-2xl font-semibold text-base text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
        style={{
          background: severity
            ? `linear-gradient(to bottom, ${SEVERITY_COLORS[severity]}, ${SEVERITY_COLORS[severity]}dd)`
            : '#d1d5db',
          boxShadow: severity ? `0 10px 25px -5px ${SEVERITY_COLORS[severity]}40` : undefined,
        }}
      >
        Opslaan
      </button>
    </div>
  )
}
