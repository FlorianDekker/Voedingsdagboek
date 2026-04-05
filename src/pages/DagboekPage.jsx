import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DaySelector from '../components/dagboek/DaySelector'
import { useEntriesForDay } from '../hooks/useEntries'
import { db } from '../db/db'
import { formatTime, isSameDay } from '../utils/formatters'
import { MEAL_TYPES, SEVERITY_LABELS, SEVERITY_COLORS } from '../constants/mealTypes'

const MEAL_ICONS = {
  ontbijt: '☀️',
  lunch: '🥗',
  avondeten: '🍽️',
  tussendoor: '🍎',
}

// Maps ingredient keywords to emoji — sorted longest first to prevent substring conflicts
// (e.g. "aardappel" must match before "appel")
const FOOD_EMOJI = [
  // Compound words that contain shorter keywords
  ['aardappel', '🥔'], ['sinaasappel', '🍊'], ['appelstroop', '🍯'],
  ['appelsap', '🧃'], ['appelmoes', '🍎'], ['pannenkoek', '🥞'],
  ['ontbijtgranen', '🥣'], ['blauwe bes', '🫐'], ['hot dog', '🌭'],
  ['frisdrank', '🥤'], ['kokosnoot', '🥥'], ['champignon', '🍄'],
  ['paddenstoel', '🍄'], ['watermeloen', '🍉'], ['stoofpot', '🍲'],
  // Brood & granen (before shorter matches)
  ['brood', '🍞'], ['toast', '🍞'], ['boterham', '🍞'], ['croissant', '🥐'],
  ['bagel', '🥯'], ['wafel', '🧇'], ['rijst', '🍚'],
  ['pasta', '🍝'], ['spaghetti', '🍝'], ['noodle', '🍜'], ['noedel', '🍜'],
  ['havermout', '🥣'], ['muesli', '🥣'],
  ['tortilla', '🌯'], ['wrap', '🌯'], ['taco', '🌮'], ['pizza', '🍕'],
  // Fruit
  ['mandarijn', '🍊'], ['banaan', '🍌'],
  ['aardbei', '🍓'], ['druif', '🍇'], ['druiven', '🍇'], ['citroen', '🍋'],
  ['meloen', '🍈'], ['perzik', '🍑'], ['kers', '🍒'],
  ['kersen', '🍒'], ['ananas', '🍍'], ['mango', '🥭'], ['kiwi', '🥝'],
  ['peer', '🍐'], ['bosbes', '🫐'], ['kokos', '🥥'], ['avocado', '🥑'],
  ['appel', '🍎'], ['fruit', '🍎'],
  // Groenten
  ['broccoli', '🥦'], ['wortel', '🥕'], ['mais', '🌽'], ['tomaat', '🍅'],
  ['paprika', '🫑'], ['ui', '🧅'], ['knoflook', '🧄'],
  ['friet', '🍟'], ['patat', '🍟'], ['sla', '🥬'], ['komkommer', '🥒'],
  ['aubergine', '🍆'], ['spinazie', '🥬'], ['olijf', '🫒'], ['olijven', '🫒'],
  // Vlees & vis
  ['kip', '🍗'], ['chicken', '🍗'], ['vlees', '🥩'], ['steak', '🥩'],
  ['biefstuk', '🥩'], ['gehakt', '🥩'], ['hamburger', '🍔'], ['burger', '🍔'],
  ['worst', '🌭'], ['hotdog', '🌭'], ['spek', '🥓'], ['bacon', '🥓'],
  ['vis', '🐟'], ['zalm', '🐟'], ['tonijn', '🐟'], ['garnaal', '🦐'],
  ['garnalen', '🦐'], ['kreeft', '🦞'], ['sushi', '🍣'],
  // Zuivel & eieren
  ['ei', '🍳'], ['eieren', '🍳'], ['kaas', '🧀'], ['melk', '🥛'],
  ['yoghurt', '🥛'], ['boter', '🧈'], ['ijs', '🍦'],
  // Drinken
  ['koffie', '☕'], ['thee', '🍵'], ['bier', '🍺'], ['wijn', '🍷'],
  ['sap', '🧃'], ['water', '💧'], ['smoothie', '🥤'], ['cola', '🥤'],
  ['cocktail', '🍹'],
  // Snacks & zoet
  ['chocola', '🍫'], ['chocolade', '🍫'], ['koek', '🍪'], ['cookie', '🍪'],
  ['cake', '🍰'], ['taart', '🎂'], ['donut', '🍩'], ['snoep', '🍬'],
  ['chips', '🍿'], ['noot', '🥜'], ['noten', '🥜'], ['pinda', '🥜'],
  ['honing', '🍯'], ['popcorn', '🍿'],
  // Overig
  ['soep', '🍲'], ['curry', '🍛'], ['salade', '🥗'],
  ['sandwich', '🥪'], ['tosti', '🥪'],
]

function getFoodEmoji(ingredients, mealType, mealName) {
  const text = (ingredients.join(' ') + ' ' + (mealName || '')).toLowerCase()
  for (const [keyword, emoji] of FOOD_EMOJI) {
    if (text.includes(keyword)) return emoji
  }
  return MEAL_ICONS[mealType] || '🍽️'
}

export default function DagboekPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [animDir, setAnimDir] = useState(null)
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
    <div ref={pageRef}>
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
                    <MealRow entry={entry} />
                  ) : (
                    <ComplaintRow entry={entry} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function MealRow({ entry }) {
  const mealLabel = MEAL_TYPES.find(m => m.value === entry.mealType)?.label
  const ingredients = entry.description ? entry.description.split(', ') : []

  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
    }
  }

  return (
    <div className="flex gap-3 py-2 pl-1">
      {/* Timeline dot */}
      <div className="flex-shrink-0 w-[38px] flex flex-col items-center pt-3.5">
        <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm z-10" />
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 mr-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{getFoodEmoji(ingredients, entry.mealType, entry.note)}</span>
            <p className="text-[13px] font-semibold text-[#1a1a1a]">{entry.note || 'Maaltijd'}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted font-medium">{formatTime(entry.timestamp)}</span>
            <button
              onClick={handleDelete}
              className="text-muted-light hover:text-red-400 transition-colors p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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

function ComplaintRow({ entry }) {
  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
    }
  }

  const color = SEVERITY_COLORS[entry.severity]

  return (
    <div className="flex gap-3 py-2 pl-1">
      {/* Timeline dot */}
      <div className="flex-shrink-0 w-[38px] flex flex-col items-center pt-3">
        <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm z-10" style={{ backgroundColor: color }} />
      </div>

      {/* Card */}
      <div className="flex-1 rounded-2xl px-4 py-3 mr-1 border" style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}>
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
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted font-medium">{formatTime(entry.timestamp)}</span>
            <button
              onClick={handleDelete}
              className="text-muted-light hover:text-red-400 transition-colors p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
