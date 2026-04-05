import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DaySelector from '../components/dagboek/DaySelector'
import { useEntriesForDay } from '../hooks/useEntries'
import { useSwipe } from '../hooks/useSwipe'
import { db } from '../db/db'
import { formatTime, isSameDay } from '../utils/formatters'
import { MEAL_TYPES, SEVERITY_LABELS, SEVERITY_COLORS } from '../constants/mealTypes'

const MEAL_ICONS = {
  ontbijt: '☀️',
  lunch: '🥗',
  avondeten: '🍽️',
  tussendoor: '🍎',
}

export default function DagboekPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const entries = useEntriesForDay(selectedDate)

  const goNext = useCallback(() => {
    if (!isSameDay(selectedDate, new Date())) {
      const d = new Date(selectedDate)
      d.setDate(d.getDate() + 1)
      setSelectedDate(d)
    }
  }, [selectedDate])

  const goPrev = useCallback(() => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }, [selectedDate])

  const swipeHandlers = useSwipe(goNext, goPrev)

  if (entries === undefined) {
    return (
      <div {...swipeHandlers}>
        <DaySelector date={selectedDate} onChange={setSelectedDate} />
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const isEmpty = entries.length === 0

  return (
    <div {...swipeHandlers}>
      <DaySelector date={selectedDate} onChange={setSelectedDate} />

      {isEmpty ? (
        <div className="text-center py-16 animate-fade-in">
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
        <div className="relative animate-fade-in">
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
            <span className="text-sm">{MEAL_ICONS[entry.mealType] || '🍽️'}</span>
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
