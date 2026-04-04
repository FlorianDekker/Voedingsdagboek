import { useState, useRef } from 'react'
import { db } from '../../db/db'
import { useFoodSuggestions, updateFoodCatalog, useTopFoods } from '../../hooks/useFoods'
import { MEAL_TYPES, SEVERITY_COLORS } from '../../constants/mealTypes'

export default function FoodInput({ onSaved }) {
  const [ingredients, setIngredients] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [mealType, setMealType] = useState(getDefaultMealType())
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [symptomPrompt, setSymptomPrompt] = useState(false)
  const [savedTimestamp, setSavedTimestamp] = useState(null)
  const inputRef = useRef(null)
  const suggestions = useFoodSuggestions(inputValue) || []
  const topFoods = useTopFoods() || []

  function getDefaultMealType() {
    const hour = new Date().getHours()
    if (hour < 10) return 'ontbijt'
    if (hour < 14) return 'lunch'
    if (hour < 18) return 'tussendoor'
    return 'avondeten'
  }

  function addIngredient(name) {
    const trimmed = name.trim().toLowerCase()
    if (!trimmed || ingredients.includes(trimmed)) return
    setIngredients([...ingredients, trimmed])
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function removeIngredient(name) {
    setIngredients(ingredients.filter(i => i !== name))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addIngredient(inputValue)
    }
  }

  async function handleSave() {
    if (ingredients.length === 0) return

    const ts = new Date()
    await db.entries.add({
      type: 'maaltijd',
      timestamp: ts,
      description: ingredients.join(', '),
      mealType,
      severity: null,
      note: null,
    })

    for (const ing of ingredients) {
      await updateFoodCatalog(ing)
    }

    setIngredients([])
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

  // Quick-add foods: show top foods that aren't already selected
  const quickFoods = topFoods.filter(f => !ingredients.includes(f.name))

  return (
    <div className="space-y-4">
      {/* Selected ingredients as chips */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium capitalize"
            >
              {ing}
              <button
                onClick={() => removeIngredient(ing)}
                className="ml-0.5 text-emerald-400 hover:text-emerald-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={ingredients.length > 0 ? 'Nog iets toevoegen...' : 'Zoek ingredient...'}
          className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all"
          autoComplete="off"
        />

        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && inputValue.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-40 animate-slide-down">
            {suggestions
              .filter(f => !ingredients.includes(f.name))
              .map((food) => (
                <button
                  key={food.id}
                  onMouseDown={() => addIngredient(food.name)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <span className="capitalize">{food.name}</span>
                  <span className="text-gray-300 text-xs ml-2">{food.count}x</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Quick-add frequent ingredients */}
      {quickFoods.length > 0 && !inputValue && (
        <div>
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider mb-2">Veelgebruikt</p>
          <div className="flex flex-wrap gap-1.5">
            {quickFoods.slice(0, 12).map((food) => (
              <button
                key={food.id}
                onClick={() => addIngredient(food.name)}
                className="bg-white border border-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-medium capitalize hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
              >
                + {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
        disabled={ingredients.length === 0}
        className="w-full py-4 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none disabled:active:scale-100"
      >
        Opslaan{ingredients.length > 0 ? ` (${ingredients.length})` : ''}
      </button>
    </div>
  )
}
