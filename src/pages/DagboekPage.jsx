import { useState } from 'react'
import DaySelector from '../components/dagboek/DaySelector'
import EntryList from '../components/dagboek/EntryList'
import { useEntriesForDay } from '../hooks/useEntries'

export default function DagboekPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const entries = useEntriesForDay(selectedDate)

  return (
    <div>
      <DaySelector date={selectedDate} onChange={setSelectedDate} />
      <EntryList entries={entries} />
    </div>
  )
}
