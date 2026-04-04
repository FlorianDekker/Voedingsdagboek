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
      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('maaltijd')}
          className={`flex-1 py-3 rounded-xl font-medium text-base transition-all ${
            mode === 'maaltijd'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          Eten
        </button>
        <button
          onClick={() => setMode('klacht')}
          className={`flex-1 py-3 rounded-xl font-medium text-base transition-all ${
            mode === 'klacht'
              ? 'bg-red-400 text-white shadow-md'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          Klacht
        </button>
      </div>

      {/* Input form */}
      {mode === 'maaltijd' ? (
        <FoodInput onSaved={() => showToast('Maaltijd opgeslagen!')} />
      ) : (
        <SymptomInput onSaved={() => showToast('Klacht opgeslagen!')} />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  )
}
