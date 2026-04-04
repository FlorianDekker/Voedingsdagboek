import { useState, useRef } from 'react'
import { db } from '../../db/db'
import { useFoodSuggestions, updateFoodCatalog } from '../../hooks/useFoods'
import { MEAL_TYPES, SEVERITY_COLORS } from '../../constants/mealTypes'

export default function FoodInput({ onSaved }) {
  const [description, setDescription] = useState('')
  const [mealType, setMealType] = useState(getDefaultMealType())
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [symptomPrompt, setSymptomPrompt] = useState(false)
  const [savedTimestamp, setSavedTimestamp] = useState(null)
  const inputRef = useRef(null)
  const suggestions = useFoodSuggestions(description) || []

  function getDefaultMealType() {
    const hour = new Date().getHours()
    if (hour < 10) return 'ontbijt'
    if (hour < 14) return 'lunch'
    if (hour < 18) return 'tussendoor'
    return 'avondeten'
  }

  async function handleSave() {
    if (!description.trim()) return

    const ts = new Date()
    await db.entries.add({
      type: 'maaltijd',
      timestamp: ts,
      description: description.trim(),
      mealType,
      severity: null,
      note: null,
    })

    await updateFoodCatalog(description.trim())
    setDescription('')
    setSavedTimestamp(ts)
    setSymptomPrompt(true)
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
    inputRef.current?.focus()
    onSaved?.('Maaltijd + gevoel opgeslagen!')
  }

  function handleSkip() {
    setSymptomPrompt(false)
    setSavedTimestamp(null)
    inputRef.current?.focus()
    onSaved?.('Maaltijd opgeslagen!')
  }

  function selectSuggestion(name) {
    setDescription(name)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Show symptom prompt after food save
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
    <div className="space-y-4">
      {/* Food description input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Wat heb je gegeten?"
          className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all"
          autoComplete="off"
        />

        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && description.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-40 animate-slide-down">
            {suggestions.map((food) => (
              <button
                key={food.id}
                onMouseDown={() => selectSuggestion(food.name)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-b border-gray-50 last:border-0 transition-colors"
              >
                <span className="capitalize">{food.name}</span>
                <span className="text-gray-300 text-xs ml-2">{food.count}x</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Meal type selector */}
      <div className="grid grid-cols-4 gap-2">
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

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!description.trim()}
        className="w-full py-4 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none disabled:active:scale-100"
      >
        Opslaan
      </button>
    </div>
  )
}
