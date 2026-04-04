import { Link } from 'react-router-dom'
import EntryCard from './EntryCard'

export default function EntryList({ entries }) {
  if (entries === undefined) {
    return <p className="text-center text-gray-400 text-sm py-8">Laden...</p>
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm mb-3">Geen invoer voor deze dag</p>
        <Link
          to="/invoer"
          className="inline-block bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-emerald-600 transition-colors"
        >
          + Toevoegen
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
