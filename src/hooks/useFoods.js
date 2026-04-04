import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { normalizeFood } from '../utils/foodNormalizer';

export function useFoodSuggestions(query) {
  return useLiveQuery(
    () => {
      if (!query || query.length < 1) return [];
      const normalized = normalizeFood(query);
      return db.foods
        .orderBy('count')
        .reverse()
        .filter(f => normalizeFood(f.name).includes(normalized))
        .limit(8)
        .toArray();
    },
    [query]
  );
}

export async function updateFoodCatalog(foodName) {
  const normalized = normalizeFood(foodName);
  const existing = await db.foods.where('name').equals(normalized).first();
  if (existing) {
    await db.foods.update(existing.id, {
      count: existing.count + 1,
      lastUsed: new Date(),
    });
  } else {
    await db.foods.add({
      name: normalized,
      count: 1,
      lastUsed: new Date(),
    });
  }
}
