import Dexie from 'dexie';

export const db = new Dexie('voedingsdagboek');

db.version(1).stores({
  entries: '++id, type, timestamp, mealType, [type+timestamp]',
  foods: '++id, &name, count, lastUsed'
});
