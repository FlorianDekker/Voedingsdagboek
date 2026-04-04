import { useRef, useState } from 'react'
import { db } from '../db/db'

export default function InstellingenPage() {
  const fileRef = useRef(null)
  const [toast, setToast] = useState(null)

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
    <div className="space-y-4">
      {/* Export */}
      <button
        onClick={handleExport}
        className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
      >
        Exporteer data (JSON)
      </button>

      {/* Import */}
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
      >
        Importeer data (JSON)
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Clear */}
      <button
        onClick={handleClear}
        className="w-full py-3 bg-white border border-red-200 rounded-xl text-sm font-medium text-red-500 shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all"
      >
        Verwijder alle data
      </button>

      {/* Info */}
      <div className="mt-8 text-center text-xs text-gray-400 space-y-1">
        <p>Voedingsdagboek v1.0</p>
        <p>Alle data wordt lokaal opgeslagen in je browser.</p>
        <p>Er wordt niets naar een server gestuurd.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
