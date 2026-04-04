import Dexie from 'dexie';

export const db = new Dexie('voedingsdagboek');

db.version(1).stores({
  entries: '++id, type, timestamp, mealType, [type+timestamp]',
  foods: '++id, &name, count, lastUsed'
});

db.version(2).stores({
  entries: '++id, type, timestamp, mealType, [type+timestamp]',
  foods: '++id, &name, count, lastUsed',
  meals: '++id, name, category'
});
