import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useEntriesForDay(date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return useLiveQuery(
    () => db.entries
      .where('timestamp')
      .between(dayStart, dayEnd, true, true)
      .sortBy('timestamp')
      .then(entries => entries.reverse()),
    [dayStart.getTime()]
  );
}

export function useAllEntries() {
  return useLiveQuery(() => db.entries.orderBy('timestamp').reverse().toArray());
}
