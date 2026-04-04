import { useState, useRef, useEffect } from 'react'
import { db } from '../db/db'
import { useMealsByCategory } from '../hooks/useMeals'
import { MEAL_TYPES, SEVERITY_COLORS } from '../constants/mealTypes'
import { Link } from 'react-router-dom'
import { hasApiKey, fileToBase64, analyzeMealPhoto } from '../utils/gemini'

function getDefaultMealType() {
  const hour = new Date().getHours()
  if (hour < 10) return 'ontbijt'
  if (hour < 13) return 'lunch'
  if (hour < 17) return 'tussendoor'
  return 'avondeten'
}

export default function InvoerPage() {
  const [mealType, setMealType] = useState(getDefaultMealType())
  const [symptomPrompt, setSymptomPrompt] = useState(false)
  const [savedTimestamp, setSavedTimestamp] = useState(null)
  const [toast, setToast] = useState(null)
  const [mode, setMode] = useState('maaltijd')
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [checkedIngredients, setCheckedIngredients] = useState([])
  const [animDir, setAnimDir] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [aiName, setAiName] = useState('')
  const [aiIngredients, setAiIngredients] = useState([])
  const [aiChecked, setAiChecked] = useState([])
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [newIngredient, setNewIngredient] = useState('')
  const fileInputRef = useRef(null)
  const pageRef = useRef(null)
  const defaultIdx = MEAL_TYPES.findIndex(t => t.value === getDefaultMealType())
  const activeRef = useRef(defaultIdx)
  const animatingRef = useRef(false)

  const meals = useMealsByCategory(mealType) || []
  const tabIndex = MEAL_TYPES.findIndex(t => t.value === mealType)

  function goTo(nextIdx) {
    if (nextIdx === activeRef.current || animatingRef.current) return
    animatingRef.current = true
    setAnimDir(nextIdx > activeRef.current ? 'left' : 'right')
    activeRef.current = nextIdx
    setMealType(MEAL_TYPES[nextIdx].value)
    setTimeout(() => { setAnimDir(null); animatingRef.current = false }, 320)
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

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  function handleSelectMeal(meal) {
    setSelectedMeal(meal)
    setCheckedIngredients([...meal.ingredients])
  }

  function toggleIngredient(ing) {
    setCheckedIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    )
  }

  async function handleConfirmMeal() {
    if (checkedIngredients.length === 0) return
    const ts = new Date()
    await db.entries.add({
      type: 'maaltijd',
      timestamp: ts,
      description: checkedIngredients.join(', '),
      mealType,
      severity: null,
      note: selectedMeal.name,
    })
    setSelectedMeal(null)
    setCheckedIngredients([])
    setSavedTimestamp(ts)
    setSymptomPrompt(true)
  }

  function handleCancelMeal() {
    setSelectedMeal(null)
    setCheckedIngredients([])
  }

  // AI Photo handlers
  async function handlePhotoCapture(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (!hasApiKey()) {
      showToast('Stel eerst een API-sleutel in via Instellingen')
      return
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const { base64, mimeType } = await fileToBase64(file)
      const result = await analyzeMealPhoto(base64, mimeType)
      setAiResult(result)
      setAiName(result.name)
      setAiIngredients([...result.ingredients])
      setAiChecked([...result.ingredients])
    } catch (err) {
      setAiError(err.message)
    }
    setAiLoading(false)
  }

  function handleAiCancel() {
    setAiResult(null)
    setAiError(null)
    setAiName('')
    setAiIngredients([])
    setAiChecked([])
    setSaveAsTemplate(false)
    setNewIngredient('')
  }

  function handleAiToggle(ing) {
    setAiChecked(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing])
  }

  function handleAiAddIngredient() {
    const trimmed = newIngredient.trim().toLowerCase()
    if (!trimmed || aiIngredients.includes(trimmed)) return
    setAiIngredients(prev => [...prev, trimmed])
    setAiChecked(prev => [...prev, trimmed])
    setNewIngredient('')
  }

  async function handleAiConfirm() {
    const checked = aiIngredients.filter(i => aiChecked.includes(i))
    if (checked.length === 0) return
    const ts = new Date()
    await db.entries.add({
      type: 'maaltijd',
      timestamp: ts,
      description: checked.join(', '),
      mealType,
      severity: null,
      note: aiName.trim() || 'Maaltijd',
    })
    if (saveAsTemplate) {
      await db.meals.add({
        name: aiName.trim() || 'Maaltijd',
        category: mealType,
        ingredients: checked,
      })
    }
    handleAiCancel()
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
    showToast('Maaltijd + gevoel opgeslagen!')
  }

  function handleSkip() {
    setSymptomPrompt(false)
    setSavedTimestamp(null)
    showToast('Maaltijd opgeslagen!')
  }

  // AI Loading
  if (aiLoading) {
    return (
      <div className="animate-scale-in">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-base font-semibold text-gray-800">Foto analyseren...</p>
          <p className="text-xs text-gray-400 mt-1">Even geduld, AI herkent ingrediënten</p>
        </div>
      </div>
    )
  }

  // AI Error
  if (aiError) {
    return (
      <div className="animate-scale-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">{aiError}</p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleAiCancel}
              className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-2xl text-sm font-semibold active:scale-[0.98] transition-all"
            >
              Annuleren
            </button>
            <button
              onClick={() => { setAiError(null); fileInputRef.current?.click() }}
              className="flex-1 py-3 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
            >
              Opnieuw
            </button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
      </div>
    )
  }

  // AI Result editor
  if (aiResult) {
    return (
      <div className="fixed inset-0 z-40" onClick={handleAiCancel}>
        <div className="fixed inset-0 bg-black/10" />
        <div className="relative pt-6 px-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-scale-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400">AI-herkenning</p>
            <button onClick={handleAiCancel} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Editable name */}
          <input
            type="text"
            value={aiName}
            onChange={e => setAiName(e.target.value)}
            placeholder="Naam van de maaltijd"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-xl text-sm font-semibold text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all"
          />

          {/* Ingredients */}
          <div className="space-y-2 mb-4">
            {aiIngredients.map((ing) => {
              const checked = aiChecked.includes(ing)
              return (
                <button
                  key={ing}
                  onClick={() => handleAiToggle(ing)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    checked
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-50 text-gray-300 border border-gray-100 line-through'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}>
                    {checked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="capitalize">{ing}</span>
                </button>
              )
            })}
          </div>

          {/* Add ingredient */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              value={newIngredient}
              onChange={e => setNewIngredient(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAiAddIngredient() } }}
              placeholder="Ingredient toevoegen..."
              className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all"
            />
            <button
              onClick={handleAiAddIngredient}
              disabled={!newIngredient.trim()}
              className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold disabled:opacity-30 active:scale-95 transition-all"
            >
              +
            </button>
          </div>

          {/* Save as template toggle */}
          <button
            onClick={() => setSaveAsTemplate(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 mb-4 bg-gray-50 rounded-xl"
          >
            <span className="text-sm text-gray-600">Ook als maaltijd bewaren</span>
            <div className={`w-10 h-6 rounded-full transition-all duration-200 flex items-center ${
              saveAsTemplate ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'
            }`}>
              <div className="w-5 h-5 bg-white rounded-full shadow-sm mx-0.5" />
            </div>
          </button>

          <button
            onClick={handleAiConfirm}
            disabled={aiChecked.length === 0}
            className="w-full py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
          >
            Opslaan ({aiChecked.length} ingrediënten)
          </button>
        </div>
        </div>
      </div>
    )
  }

  // Ingredient selection screen
  if (selectedMeal) {
    return (
      <div className="fixed inset-0 z-40" onClick={handleCancelMeal}>
        <div className="fixed inset-0 bg-black/10" />
        <div className="relative pt-6 px-4" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-gray-800">{selectedMeal.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Vink ingrediënten aan of uit</p>
            </div>
            <button onClick={handleCancelMeal} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 mb-5">
            {selectedMeal.ingredients.map((ing) => {
              const checked = checkedIngredients.includes(ing)
              return (
                <button
                  key={ing}
                  onClick={() => toggleIngredient(ing)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    checked
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-50 text-gray-300 border border-gray-100 line-through'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}>
                    {checked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="capitalize">{ing}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleConfirmMeal}
            disabled={checkedIngredients.length === 0}
            className="w-full py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
          >
            Opslaan ({checkedIngredients.length}/{selectedMeal.ingredients.length})
          </button>
        </div>
        </div>
      </div>
    )
  }

  // Symptom prompt screen
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
    <div ref={pageRef}>
      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        <button
          onClick={() => setMode('maaltijd')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'maaltijd' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'
          }`}
        >
          Eten
        </button>
        <button
          onClick={() => setMode('klacht')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'klacht' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'
          }`}
        >
          Klacht
        </button>
      </div>

      {mode === 'maaltijd' ? (
        <div className="animate-fade-in">
          {/* Meal type filter */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
            {MEAL_TYPES.map(({ value, label }, i) => (
              <button
                key={value}
                onClick={() => goTo(i)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  mealType === value
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3.5 mb-4 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Maaltijd fotograferen
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />

          {/* Meal list */}
          <div className={`min-h-[30vh] overflow-hidden touch-pan-y ${slideClass}`}>
          {meals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-sm mb-4">
                Nog geen maaltijden voor {MEAL_TYPES.find(m => m.value === mealType)?.label.toLowerCase()}
              </p>
              <Link
                to="/maaltijden"
                className="inline-block bg-gradient-to-b from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-all"
              >
                + Maaltijd aanmaken
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {meals.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => handleSelectMeal(meal)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100/50 px-4 py-3.5 text-left active:scale-[0.98] transition-all"
                >
                  <p className="text-sm font-semibold text-gray-800">{meal.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{meal.ingredients.length} ingrediënten</p>
                </button>
              ))}

              <Link
                to="/maaltijden"
                className="block text-center text-xs text-gray-300 hover:text-gray-400 py-3 transition-colors"
              >
                Maaltijden beheren
              </Link>
            </div>
          )}
          </div>
        </div>
      ) : (
        <SymptomOnlyInput onSaved={() => showToast('Klacht opgeslagen!')} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl z-50 animate-slide-down">
          {toast}
        </div>
      )}
    </div>
  )
}

function SymptomOnlyInput({ onSaved }) {
  const [severity, setSeverity] = useState(null)
  const [note, setNote] = useState('')
  const SEVERITY_LABELS = { 1: 'Goed', 2: 'Licht', 3: 'Matig', 4: 'Slecht', 5: 'Erg slecht' }

  async function handleSave() {
    if (!severity) return
    await db.entries.add({
      type: 'klacht',
      timestamp: new Date(),
      description: null,
      mealType: null,
      severity,
      note: note.trim() || null,
    })
    setSeverity(null)
    setNote('')
    onSaved?.()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <p className="text-sm text-gray-400 text-center">Hoe voelt je maag op dit moment?</p>

      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => setSeverity(level)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all duration-200 ${
              severity === level
                ? 'scale-115 shadow-xl ring-3 ring-offset-2'
                : severity !== null ? 'opacity-40 scale-95' : 'opacity-70 hover:opacity-90 hover:scale-105'
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
        <p className="text-center text-sm font-semibold animate-fade-in" style={{ color: SEVERITY_COLORS[severity] }}>
          {SEVERITY_LABELS[severity]}
        </p>
      )}

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notitie (optioneel)"
        className="w-full px-4 py-3.5 bg-white border border-gray-200/80 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300/50 focus:border-red-200 transition-all"
      />

      <button
        onClick={handleSave}
        disabled={!severity}
        className="w-full py-4 rounded-2xl font-semibold text-base text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none"
        style={{
          background: severity
            ? `linear-gradient(to bottom, ${SEVERITY_COLORS[severity]}, ${SEVERITY_COLORS[severity]}dd)`
            : '#d1d5db',
          boxShadow: severity ? `0 10px 25px -5px ${SEVERITY_COLORS[severity]}40` : undefined,
        }}
      >
        Opslaan
      </button>
    </div>
  )
}
