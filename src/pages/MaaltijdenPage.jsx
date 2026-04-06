import { useState, useRef, useEffect } from 'react'
import { db } from '../db/db'
import { useMealsByCategory } from '../hooks/useMeals'
import { MEAL_TYPES } from '../constants/mealTypes'
import { getFoodEmoji } from '../utils/foodEmoji'
import IngredientInput from '../components/invoer/IngredientInput'

export default function MaaltijdenPage() {
  const [activeTab, setActiveTab] = useState(MEAL_TYPES[0].value)
  const [showForm, setShowForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [toast, setToast] = useState(null)
  const [animDir, setAnimDir] = useState(null)
  const pageRef = useRef(null)
  const activeRef = useRef(MEAL_TYPES.findIndex(t => t.value === MEAL_TYPES[0].value))
  const animating = useRef(false)

  const meals = useMealsByCategory(activeTab) || []
  const tabIndex = MEAL_TYPES.findIndex(t => t.value === activeTab)

  function goTo(nextIdx) {
    if (nextIdx === activeRef.current || animating.current) return
    animating.current = true
    setAnimDir(nextIdx > activeRef.current ? 'left' : 'right')
    activeRef.current = nextIdx
    setActiveTab(MEAL_TYPES[nextIdx].value)
    setTimeout(() => { setAnimDir(null); animating.current = false }, 320)
  }

  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    let startX = null, startY = null, horizontal = null
    const onStart = e => {
      const x = e.touches[0].clientX
      if (x < 24) return
      startX = x; startY = e.touches[0].clientY; horizontal = null
    }
    const onMove = e => {
      if (startX === null) return
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (horizontal === null && (dx > 5 || dy > 5)) horizontal = dx > dy
      if (horizontal) e.preventDefault()
    }
    const onEnd = e => {
      if (startX === null) return
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      startX = null
      if (!horizontal || Math.abs(dx) < 50 || dy > Math.abs(dx)) return
      const cur = activeRef.current
      if (dx < 0 && cur < MEAL_TYPES.length - 1) goTo(cur + 1)
      else if (dx > 0 && cur > 0) goTo(cur - 1)
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd) }
  }, [])

  const slideClass = animDir === 'left' ? 'animate-slide-in-left' : animDir === 'right' ? 'animate-slide-in-right' : ''

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

  if (showForm) {
    return <MealForm meal={editingMeal} defaultCategory={activeTab} onClose={handleClose} onSaved={(msg) => { handleClose(); showToast(msg); }} />
  }

  return (
    <div ref={pageRef}>
      {/* Category tabs */}
      <div className="flex bg-surface rounded-2xl p-1 mb-5">
        {MEAL_TYPES.map(({ value, label }, i) => (
          <button
            key={value}
            onClick={() => goTo(i)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === value
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Swipeable meal list */}
      <div className={`min-h-[40vh] overflow-hidden touch-pan-y ${slideClass}`}>
        {meals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted text-sm">Nog geen maaltijden</p>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onEdit={() => handleEdit(meal)} onDeleted={() => showToast('Verwijderd')} />
            ))}
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/25 flex items-center justify-center text-2xl font-light active:scale-90 transition-all duration-150 z-40 hover:shadow-2xl"
      >
        +
      </button>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl z-50 animate-slide-down">
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden active:scale-[0.99] transition-all duration-150 hover:shadow-md">
      <div className="w-[3px] flex-shrink-0 bg-primary rounded-l-2xl" />
      <div className="flex-1 min-w-0 px-4 py-3.5" onClick={onEdit}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">{getFoodEmoji(meal.ingredients, meal.category, meal.name)}</span>
          <p className="text-[14px] font-semibold text-[#1a1a1a]">{meal.name}</p>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {meal.ingredients.map((ing, i) => (
            <span key={i} className="text-[10px] bg-primary-subtle text-primary-dark px-2 py-0.5 rounded-lg capitalize font-medium">
              {ing}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="px-3.5 text-muted-light hover:text-red-400 active:text-red-500 transition-colors self-center"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function MealForm({ meal, defaultCategory, onClose, onSaved }) {
  const [name, setName] = useState(meal?.name || '')
  const [category, setCategory] = useState(meal?.category || defaultCategory || 'ontbijt')
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
      <button onClick={onClose} className="text-sm text-muted mb-4 flex items-center gap-1">
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
          className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white text-muted border border-gray-200'
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
                className="inline-flex items-center gap-1 bg-primary-subtle text-primary px-3 py-1.5 rounded-full text-sm font-medium capitalize"
              >
                {ing}
                <button onClick={() => removeIngredient(ing)} className="ml-0.5 text-primary-dark hover:text-primary">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <IngredientInput
            value={inputValue}
            onChange={setInputValue}
            onAdd={(selected) => {
              if (selected) {
                const trimmed = selected.trim().toLowerCase()
                if (trimmed && !ingredients.includes(trimmed)) {
                  setIngredients([...ingredients, trimmed])
                }
                setInputValue('')
              } else {
                addIngredient()
              }
            }}
          />
          <button
            onClick={addIngredient}
            disabled={!inputValue.trim()}
            className="px-4 py-3 bg-primary-subtle text-primary rounded-2xl text-sm font-semibold disabled:opacity-30 active:scale-95 transition-all"
          >
            +
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name.trim() || ingredients.length === 0}
          className="w-full py-4 bg-primary text-white rounded-full font-semibold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
        >
          {meal?.id ? 'Bijwerken' : 'Maaltijd opslaan'}
        </button>
      </div>
    </div>
  )
}
