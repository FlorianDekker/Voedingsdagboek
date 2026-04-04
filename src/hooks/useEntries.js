import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfDay, endOfDay } from '../utils/formatters';

export function useEntriesForDay(date) {
  return useLiveQuery(
    () => db.entries
      .where('timestamp')
      .between(startOfDay(date), endOfDay(date), true, true)
      .sortBy('timestamp'),
    [date.toDateString()]
  );
}

export function useAllEntries() {
  return useLiveQuery(() => db.entries.orderBy('timestamp').reverse().toArray());
}

export function useSymptomEntries() {
  return useLiveQuery(
    () => db.entries.where('type').equals('klacht').sortBy('timestamp')
  );
}

export function useMealEntries() {
  return useLiveQuery(
    () => db.entries.where('type').equals('maaltijd').sortBy('timestamp')
  );
}
