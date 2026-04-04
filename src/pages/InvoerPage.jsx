import { useState } from 'react'
import FoodInput from '../components/invoer/FoodInput'
import SymptomInput from '../components/invoer/SymptomInput'

export default function InvoerPage() {
  const [mode, setMode] = useState('maaltijd')
  const [toast, setToast] = useState(null)

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div>
      {/* Segmented control */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => setMode('maaltijd')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'maaltijd'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-400'
          }`}
        >
          Eten
        </button>
        <button
          onClick={() => setMode('klacht')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            mode === 'klacht'
              ? 'bg-white text-red-500 shadow-sm'
              : 'text-gray-400'
          }`}
        >
          Klacht
        </button>
      </div>

      {/* Input form */}
      <div className="animate-fade-in" key={mode}>
        {mode === 'maaltijd' ? (
          <FoodInput onSaved={(msg) => showToast(msg || 'Opgeslagen!')} />
        ) : (
          <SymptomInput onSaved={() => showToast('Klacht opgeslagen!')} />
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl z-50 animate-slide-down">
          {toast}
        </div>
      )}
    </div>
  )
}
