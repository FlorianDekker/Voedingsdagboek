import { useRef, useState } from 'react'
import { db } from '../db/db'
import { getApiKey, setApiKey as saveApiKey, hasApiKey } from '../utils/gemini'

export default function InstellingenPage() {
  const fileRef = useRef(null)
  const [toast, setToast] = useState(null)
  const [apiKey, setApiKey] = useState(getApiKey)
  const [keySaved, setKeySaved] = useState(hasApiKey)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleExport() {
    const entries = await db.entries.toArray()
    const foods = await db.foods.toArray()
    const data = JSON.stringify({ entries, foods, exportDate: new Date().toISOString() }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voedingsdagboek-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Export gedownload!')
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.entries) {
        await db.entries.bulkPut(data.entries)
      }
      if (data.foods) {
        await db.foods.bulkPut(data.foods)
      }
      showToast(`${data.entries?.length || 0} invoeren geimporteerd!`)
    } catch {
      showToast('Fout bij importeren')
    }
    e.target.value = ''
  }

  async function handleClear() {
    if (!confirm('Weet je zeker dat je alle data wilt verwijderen? Dit kan niet ongedaan worden.')) return
    await db.entries.clear()
    await db.foods.clear()
    showToast('Alle data verwijderd')
  }

  return (
    <div className="space-y-3">
      {/* AI section */}
      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider px-1 mb-1">AI Fotoherkenning</p>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3.5">
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onBlur={() => { saveApiKey(apiKey.trim()); setKeySaved(!!apiKey.trim()); if (apiKey.trim()) showToast('API-sleutel opgeslagen!') }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur() } }}
            placeholder="Gemini API-sleutel"
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all"
          />
          {keySaved && (
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[11px] text-emerald-500 mt-2 px-1"
        >
          Gratis sleutel ophalen op aistudio.google.com →
        </a>
      </div>

      <div className="h-4" />

      {/* Data section */}
      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider px-1 mb-1">Data</p>

      <SettingsButton onClick={handleExport} icon={ExportIcon}>
        Exporteer data
      </SettingsButton>

      <SettingsButton onClick={() => fileRef.current?.click()} icon={ImportIcon}>
        Importeer data
      </SettingsButton>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <div className="h-4" />

      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider px-1 mb-1">Geavanceerd</p>

      <button
        onClick={handleClear}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-red-100 rounded-2xl text-sm font-medium text-red-400 shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all"
      >
        <TrashIcon />
        Verwijder alle data
      </button>

      {/* Info */}
      <div className="mt-10 text-center text-[10px] text-gray-300 space-y-0.5 leading-relaxed">
        <p className="font-semibold text-gray-400">Voedingsdagboek v1.0</p>
        <p>Alle data wordt lokaal opgeslagen.</p>
        <p>Er wordt niets naar een server gestuurd.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl z-50 animate-slide-down">
          {toast}
        </div>
      )}
    </div>
  )
}

function SettingsButton({ children, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
    >
      {Icon && <Icon />}
      {children}
    </button>
  )
}

function ExportIcon() {
  return (
    <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function ImportIcon() {
  return (
    <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}
