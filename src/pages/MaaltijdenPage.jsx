import { useState } from 'react'
import { db } from '../db/db'
import { useAllMeals } from '../hooks/useMeals'
import { MEAL_TYPES } from '../constants/mealTypes'

export default function MaaltijdenPage() {
  const meals = useAllMeals() || []
  const [showForm, setShowForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  function handleEdit(meal) {
    setEditingMeal(meal)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditingMeal(null)
  }

  // Group meals by category
  const grouped = {}
  for (const mt of MEAL_TYPES) {
    grouped[mt.value] = meals.filter(m => m.category === mt.value)
  }

  if (showForm) {
    return <MealForm meal={editingMeal} onClose={handleClose} onSaved={(msg) => { handleClose(); showToast(msg); }} />
  }

  return (
    <div>
      {MEAL_TYPES.map(({ value, label }) => (
        <div key={value} className="mb-6">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider px-1 mb-2">{label}</p>
          {grouped[value].length === 0 ? (
            <p className="text-xs text-gray-300 px-1 mb-2">Nog geen maaltijden</p>
          ) : (
            <div className="space-y-2 mb-2">
              {grouped[value].map((meal) => (
                <MealCard key={meal.id} meal={meal} onEdit={() => handleEdit(meal)} onDeleted={() => showToast('Verwijderd')} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center text-2xl font-light active:scale-90 transition-transform z-40"
      >
        +
      </button>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl z-50 animate-slide-down">
          {toast}
        </div>
      )}
    </div>
  )
}

function MealCard({ meal, onEdit, onDeleted }) {
  async function handleDelete() {
    if (confirm(`"${meal.name}" verwijderen?`)) {
      await db.meals.delete(meal.id)
      onDeleted()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 flex overflow-hidden active:scale-[0.99] transition-transform">
      <div className="w-1 flex-shrink-0 bg-emerald-400" />
      <div className="flex-1 min-w-0 px-4 py-3" onClick={onEdit}>
        <p className="text-sm font-semibold text-gray-800">{meal.name}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {meal.ingredients.map((ing, i) => (
            <span key={i} className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded capitalize">
              {ing}
            </span>
          ))}
        </div>
      </div>
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

function MealForm({ meal, onClose, onSaved }) {
  const [name, setName] = useState(meal?.name || '')
  const [category, setCategory] = useState(meal?.category || 'ontbijt')
  const [ingredients, setIngredients] = useState(meal?.ingredients || [])
  const [inputValue, setInputValue] = useState('')

  function addIngredient() {
    const trimmed = inputValue.trim().toLowerCase()
    if (!trimmed || ingredients.includes(trimmed)) return
    setIngredients([...ingredients, trimmed])
    setInputValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addIngredient()
    }
  }

  function removeIngredient(ing) {
    setIngredients(ingredients.filter(i => i !== ing))
  }

  async function handleSave() {
    if (!name.trim() || ingredients.length === 0) return

    const data = {
      name: name.trim(),
      category,
      ingredients,
    }

    if (meal?.id) {
      await db.meals.update(meal.id, data)
      onSaved('Maaltijd bijgewerkt!')
    } else {
      await db.meals.add(data)
      onSaved('Maaltijd aangemaakt!')
    }
  }

  return (
    <div className="animate-scale-in">
      <button onClick={onClose} className="text-sm text-gray-400 mb-4 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Terug
      </button>

      <div className="space-y-4">
        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naam (bijv. Havermout met fruit)"
          className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all"
          autoFocus
        />

        {/* Category */}
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                category === value
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium capitalize"
              >
                {ing}
                <button onClick={() => removeIngredient(ing)} className="ml-0.5 text-emerald-400 hover:text-emerald-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingredient toevoegen..."
            className="flex-1 px-4 py-3 bg-white border border-gray-200/80 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all"
          />
          <button
            onClick={addIngredient}
            disabled={!inputValue.trim()}
            className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-semibold disabled:opacity-30 active:scale-95 transition-all"
          >
            +
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || ingredients.length === 0}
          className="w-full py-4 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-base shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
        >
          {meal?.id ? 'Bijwerken' : 'Maaltijd opslaan'}
        </button>
      </div>
    </div>
  )
}
