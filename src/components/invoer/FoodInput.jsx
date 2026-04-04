import { useState, useRef } from 'react'
import { db } from '../../db/db'
import { useFoodSuggestions, updateFoodCatalog } from '../../hooks/useFoods'
import { MEAL_TYPES } from '../../constants/mealTypes'

export default function FoodInput({ onSaved }) {
  const [description, setDescription] = useState('')
  const [mealType, setMealType] = useState(getDefaultMealType())
  const [showSuggestions, setShowSuggestions] = useState(false)
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

    await db.entries.add({
      type: 'maaltijd',
      timestamp: new Date(),
      description: description.trim(),
      mealType,
      severity: null,
      note: null,
    })

    await updateFoodCatalog(description.trim())
    setDescription('')
    inputRef.current?.focus()
    onSaved?.()
  }

  function selectSuggestion(name) {
    setDescription(name)
    setShowSuggestions(false)
    inputRef.current?.focus()
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
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          autoComplete="off"
        />

        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && description.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-40">
            {suggestions.map((food) => (
              <button
                key={food.id}
                onMouseDown={() => selectSuggestion(food.name)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-b border-gray-50 last:border-0"
              >
                {food.name}
                <span className="text-gray-400 text-xs ml-2">{food.count}x</span>
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
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              mealType === value
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                : 'bg-gray-50 text-gray-500'
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
        className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-medium text-base shadow-md hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
      >
        Opslaan
      </button>
    </div>
  )
}
