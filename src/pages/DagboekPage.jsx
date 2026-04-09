import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import DaySelector from '../components/dagboek/DaySelector'
import { useEntriesForDay } from '../hooks/useEntries'
import { db } from '../db/db'
import { formatTime, isSameDay } from '../utils/formatters'
import { getFoodEmoji } from '../utils/foodEmoji'
import IngredientInput from '../components/invoer/IngredientInput'
import { MEAL_TYPES, SEVERITY_LABELS, SEVERITY_COLORS } from '../constants/mealTypes'

function toLocalISO(date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function DagboekPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [animDir, setAnimDir] = useState(null)
  const [editing, setEditing] = useState(null)
  const entries = useEntriesForDay(selectedDate)
  const pageRef = useRef(null)
  const dateRef = useRef(selectedDate)
  const animating = useRef(false)
  dateRef.current = selectedDate

  function shift(dir) {
    if (animating.current) return
    if (dir === 1 && isSameDay(dateRef.current, new Date())) return
    animating.current = true
    setAnimDir(dir === 1 ? 'left' : 'right')
    const d = new Date(dateRef.current)
    d.setDate(d.getDate() + dir)
    setSelectedDate(d)
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
      if (dx < 0) shift(1)
      else shift(-1)
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd) }
  }, [])

  const slideClass = animDir === 'left' ? 'animate-slide-in-left' : animDir === 'right' ? 'animate-slide-in-right' : ''

  const isEmpty = !entries || entries.length === 0

  return (
    <div ref={pageRef} className="min-h-[calc(100vh-10rem)]">
      <DaySelector date={selectedDate} onChange={setSelectedDate} />

      {entries === undefined ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className={`text-center py-16 animate-fade-in ${slideClass}`}>
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-muted-light" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-[#1a1a1a] font-semibold text-sm mb-1">Nog niets geregistreerd</p>
          <p className="text-muted text-xs mb-5">Begin met het registreren van je maaltijden</p>
          <Link
            to="/invoer"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-primary/20 transition-all active:scale-[0.97]"
          >
            + Toevoegen
          </Link>
        </div>
      ) : (
        <div className={`relative animate-fade-in ${slideClass}`}>
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gray-100 rounded-full" />

          <div className="space-y-0">
            {entries.map((entry, i) => {
              const isMeal = entry.type === 'maaltijd'
              return (
                <div key={entry.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                  {isMeal ? (
                    <MealRow entry={entry} onEdit={() => setEditing(entry)} />
                  ) : (
                    <ComplaintRow entry={entry} onEdit={() => setEditing(entry)} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {editing && (
        editing.type === 'maaltijd'
          ? <EditMealModal entry={editing} onClose={() => setEditing(null)} />
          : <EditComplaintModal entry={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function MealRow({ entry, onEdit }) {
  const mealLabel = MEAL_TYPES.find(m => m.value === entry.mealType)?.label
  const ingredients = entry.description ? entry.description.split(', ') : []

  return (
    <div className="flex gap-3 py-2 pl-1">
      {/* Timeline dot */}
      <div className="flex-shrink-0 w-[38px] flex flex-col items-center pt-3.5">
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm z-10" />
      </div>

      {/* Card */}
      <div
        onClick={onEdit}
        className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 mr-1 active:scale-[0.98] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{getFoodEmoji(ingredients, entry.mealType, entry.note)}</span>
            <p className="text-[13px] font-semibold text-[#1a1a1a]">{entry.note || 'Maaltijd'}</p>
          </div>
          <span className="text-[10px] text-muted font-medium">{formatTime(entry.timestamp)}</span>
        </div>
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {ingredients.map((ing, i) => (
              <span key={i} className="text-[10px] bg-primary-light text-primary-dark px-2 py-0.5 rounded-full capitalize font-medium">
                {ing}
              </span>
            ))}
          </div>
        )}
        {mealLabel && (
          <p className="text-[10px] text-primary/50 font-semibold uppercase tracking-wider mt-2">{mealLabel}</p>
        )}
      </div>
    </div>
  )
}

function ComplaintRow({ entry, onEdit }) {
  const color = SEVERITY_COLORS[entry.severity]

  return (
    <div className="flex gap-3 py-2 pl-1">
      {/* Timeline dot */}
      <div className="flex-shrink-0 w-[38px] flex flex-col items-center pt-3">
        <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm z-10" style={{ backgroundColor: color }} />
      </div>

      {/* Card */}
      <div
        onClick={onEdit}
        className="flex-1 rounded-2xl px-4 py-3 mr-1 border active:scale-[0.98] transition-all cursor-pointer"
        style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: color }}
            >
              {entry.severity}
            </div>
            <div>
              <span className="text-[13px] font-semibold block" style={{ color }}>
                {SEVERITY_LABELS[entry.severity]}
              </span>
              {entry.note && (
                <p className="text-[11px] text-muted mt-0.5">{entry.note}</p>
              )}
            </div>
          </div>
          <span className="text-[10px] text-muted font-medium">{formatTime(entry.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

function EditMealModal({ entry, onClose }) {
  const [name, setName] = useState(entry.note || '')
  const [mealType, setMealType] = useState(entry.mealType || 'ontbijt')
  const [ingredients, setIngredients] = useState(
    entry.description ? entry.description.split(', ') : []
  )
  const [newIng, setNewIng] = useState('')
  const [dateTime, setDateTime] = useState(toLocalISO(entry.timestamp))
  const [savedAsMeal, setSavedAsMeal] = useState(false)

  // Check if this meal already exists as a template
  const existingMeal = useLiveQuery(async () => {
    if (!name.trim()) return null
    const all = await db.meals.toArray()
    return all.find(m => m.name.toLowerCase() === name.trim().toLowerCase()) || null
  }, [name])

  function addIngredient() {
    const trimmed = newIng.trim().toLowerCase()
    if (!trimmed || ingredients.includes(trimmed)) return
    setIngredients([...ingredients, trimmed])
    setNewIng('')
  }

  async function handleSave() {
    await db.entries.update(entry.id, {
      note: name.trim() || null,
      mealType,
      description: ingredients.join(', '),
      timestamp: new Date(dateTime),
    })
    onClose()
  }

  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fixed inset-0 bg-black/10" />
      <div className="relative pt-6 px-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-scale-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Maaltijd bewerken</p>
            <button onClick={onClose} className="text-muted hover:text-[#1a1a1a] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Naam"
            className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-xl text-sm font-semibold text-[#1a1a1a] mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />

          {/* Meal type */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {MEAL_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMealType(value)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  mealType === value
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-surface text-muted border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {ingredients.map(ing => (
                <span key={ing} className="inline-flex items-center gap-1 bg-primary-subtle text-primary px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                  {ing}
                  <button onClick={() => setIngredients(ingredients.filter(i => i !== ing))} className="text-primary-dark">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <IngredientInput
              value={newIng}
              onChange={setNewIng}
              onAdd={(selected) => {
                if (selected) {
                  const trimmed = selected.trim().toLowerCase()
                  if (trimmed && !ingredients.includes(trimmed)) {
                    setIngredients([...ingredients, trimmed])
                  }
                  setNewIng('')
                } else {
                  addIngredient()
                }
              }}
            />
            <button
              onClick={addIngredient}
              disabled={!newIng.trim()}
              className="px-4 py-2.5 bg-primary-subtle text-primary rounded-xl text-sm font-semibold disabled:opacity-30 active:scale-95 transition-all"
            >
              +
            </button>
          </div>

          {/* Date/time */}
          <input
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-surface border border-gray-200 rounded-xl text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />

          {/* Save as meal template */}
          {!existingMeal && !savedAsMeal && ingredients.length > 0 && name.trim() && (
            <button
              onClick={async () => {
                await db.meals.add({
                  name: name.trim(),
                  category: mealType,
                  ingredients: [...ingredients],
                })
                setSavedAsMeal(true)
              }}
              className="w-full flex items-center justify-center gap-2 py-3 mb-3 bg-surface text-[#1a1a1a] rounded-full text-sm font-medium active:scale-[0.98] transition-all border border-gray-200"
            >
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Als maaltijd bewaren
            </button>
          )}
          {savedAsMeal && (
            <p className="text-center text-xs text-primary font-medium mb-3">Maaltijd bewaard!</p>
          )}

          {/* Actions */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-primary text-white rounded-full font-semibold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all mb-3"
          >
            Opslaan
          </button>
          <button
            onClick={handleDelete}
            className="w-full py-3 text-red-400 text-sm font-medium active:scale-[0.98] transition-all"
          >
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  )
}

function EditComplaintModal({ entry, onClose }) {
  const [severity, setSeverity] = useState(entry.severity)
  const [note, setNote] = useState(entry.note || '')
  const [dateTime, setDateTime] = useState(toLocalISO(entry.timestamp))

  async function handleSave() {
    await db.entries.update(entry.id, {
      severity,
      note: note.trim() || null,
      timestamp: new Date(dateTime),
    })
    onClose()
  }

  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fixed inset-0 bg-black/10" />
      <div className="relative pt-6 px-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Klacht bewerken</p>
            <button onClick={onClose} className="text-muted hover:text-[#1a1a1a] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Severity */}
          <p className="text-sm text-muted text-center mb-4">Hoe voelt je maag?</p>
          <div className="flex justify-center gap-3 mb-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                onClick={() => setSeverity(level)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold transition-all duration-200 ${
                  severity === level
                    ? 'scale-115 shadow-xl ring-3 ring-offset-2'
                    : severity !== null ? 'opacity-40 scale-95' : ''
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
            <p className="text-center text-sm font-semibold mb-4 animate-fade-in" style={{ color: SEVERITY_COLORS[severity] }}>
              {SEVERITY_LABELS[severity]}
            </p>
          )}

          {/* Note */}
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Notitie (optioneel)"
            className="w-full px-4 py-3 mb-3 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />

          {/* Date/time */}
          <input
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            className="w-full px-4 py-3 mb-4 bg-surface border border-gray-200 rounded-xl text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />

          {/* Actions */}
          <button
            onClick={handleSave}
            disabled={!severity}
            className="w-full py-3.5 bg-primary text-white rounded-full font-semibold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-30 mb-3"
          >
            Opslaan
          </button>
          <button
            onClick={handleDelete}
            className="w-full py-3 text-red-400 text-sm font-medium active:scale-[0.98] transition-all"
          >
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  )
}
