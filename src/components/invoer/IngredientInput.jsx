import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'

export default function IngredientInput({ value, onChange, onAdd, placeholder }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  // Collect all known ingredients from meals + entries
  const allIngredients = useLiveQuery(async () => {
    const set = new Set()
    const meals = await db.meals.toArray()
    for (const m of meals) {
      for (const ing of m.ingredients) {
        set.add(ing.toLowerCase())
      }
    }
    const entries = await db.entries.where('type').equals('maaltijd').toArray()
    for (const e of entries) {
      if (!e.description) continue
      for (const ing of e.description.split(',')) {
        const t = ing.trim().toLowerCase()
        if (t) set.add(t)
      }
    }
    return [...set].sort()
  }, [])

  const query = value.trim().toLowerCase()
  const suggestions = query.length > 0 && allIngredients
    ? allIngredients.filter(ing => ing.includes(query) && ing !== query).slice(0, 6)
    : []

  function handleSelect(ing) {
    onChange(ing)
    setShowSuggestions(false)
    // Trigger add after a tick so state updates
    setTimeout(() => onAdd(ing), 0)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      setShowSuggestions(false)
      onAdd()
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setShowSuggestions(true) }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Ingredient toevoegen...'}
        className="w-full px-3 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 animate-slide-down">
          {suggestions.map(ing => (
            <button
              key={ing}
              onClick={() => handleSelect(ing)}
              className="w-full text-left px-3 py-2.5 text-sm capitalize text-[#1a1a1a] hover:bg-primary-subtle active:bg-primary-light transition-colors border-b border-gray-50 last:border-0"
            >
              {ing}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
