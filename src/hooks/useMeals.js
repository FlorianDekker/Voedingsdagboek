import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useAllMeals() {
  return useLiveQuery(() => db.meals.toArray());
}

export function useMealsByCategory(category) {
  return useLiveQuery(
    () => category
      ? db.meals.where('category').equals(category).toArray()
      : db.meals.toArray(),
    [category]
  );
}
