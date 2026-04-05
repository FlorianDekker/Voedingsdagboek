import { useState } from 'react'
import { Link } from 'react-router-dom'
import DaySelector from '../components/dagboek/DaySelector'
import { useEntriesForDay } from '../hooks/useEntries'
import { db } from '../db/db'
import { formatTime } from '../utils/formatters'
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

  if (entries === undefined) {
    return (
      <div>
        <DaySelector date={selectedDate} onChange={setSelectedDate} />
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Group entries by mealType and complaints
  const meals = entries.filter(e => e.type === 'maaltijd')
  const complaints = entries.filter(e => e.type === 'klacht')

  const grouped = {}
  for (const type of MEAL_TYPES) {
    const items = meals.filter(m => m.mealType === type.value)
    if (items.length > 0) {
      grouped[type.value] = items
    }
  }

  const isEmpty = meals.length === 0 && complaints.length === 0

  return (
    <div>
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
        <div className="space-y-5 animate-fade-in">
          {/* Meal sections grouped by type */}
          {MEAL_TYPES.map(({ value, label }) => {
            const items = grouped[value]
            if (!items) return null

            const totalIngredients = items.reduce((acc, m) => {
              return acc + (m.description ? m.description.split(', ').length : 0)
            }, 0)

            return (
              <div key={value} className="animate-slide-up">
                {/* Section header */}
                <div className="flex items-center gap-2.5 mb-2.5 px-1">
                  <span className="text-lg">{MEAL_ICONS[value]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{label}</p>
                  </div>
                  <span className="text-[11px] text-muted font-medium">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Meal cards */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {items.map((entry) => (
                    <MealRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Complaints section */}
          {complaints.length > 0 && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2.5 mb-2.5 px-1">
                <div className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Klachten</p>
                </div>
                <span className="text-[11px] text-muted font-medium">{complaints.length}x</span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {complaints.map((entry) => (
                  <ComplaintRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MealRow({ entry }) {
  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
    }
  }

  const ingredients = entry.description ? entry.description.split(', ') : []

  return (
    <div className="flex items-center px-4 py-3 gap-3">
      {/* Green dot */}
      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{entry.note || 'Maaltijd'}</p>
          <span className="text-[10px] text-muted font-medium ml-2 flex-shrink-0">{formatTime(entry.timestamp)}</span>
        </div>
        {ingredients.length > 0 && (
          <p className="text-[11px] text-muted mt-0.5 truncate capitalize">
            {ingredients.join(' · ')}
          </p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="text-muted-light hover:text-red-400 transition-colors flex-shrink-0 p-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function ComplaintRow({ entry }) {
  async function handleDelete() {
    if (confirm('Verwijderen?')) {
      await db.entries.delete(entry.id)
    }
  }

  return (
    <div className="flex items-center px-4 py-3 gap-3">
      {/* Severity dot */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
        style={{ backgroundColor: SEVERITY_COLORS[entry.severity] }}
      >
        {entry.severity}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: SEVERITY_COLORS[entry.severity] }}>
            {SEVERITY_LABELS[entry.severity]}
          </span>
          <span className="text-[10px] text-muted font-medium ml-2 flex-shrink-0">{formatTime(entry.timestamp)}</span>
        </div>
        {entry.note && (
          <p className="text-[11px] text-muted mt-0.5 truncate">{entry.note}</p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="text-muted-light hover:text-red-400 transition-colors flex-shrink-0 p-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
