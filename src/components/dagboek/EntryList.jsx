import { Link } from 'react-router-dom'
import EntryCard from './EntryCard'

export default function EntryList({ entries }) {
  if (entries === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-green-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-4xl mb-3 opacity-30">-</div>
        <p className="text-sand-300 text-sm mb-4">Nog niets geregistreerd</p>
        <Link
          to="/invoer"
          className="inline-block bg-green-accent text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg shadow-green-accent/20 hover:shadow-xl transition-all active:scale-[0.97]"
        >
          + Toevoegen
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div key={entry.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
          <EntryCard entry={entry} />
        </div>
      ))}
    </div>
  )
}
