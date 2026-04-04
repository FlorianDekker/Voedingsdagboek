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

db.version(3).stores({
  entries: '++id, type, timestamp, mealType, [type+timestamp]',
  foods: '++id, &name, count, lastUsed',
  meals: '++id, name, category'
});

db.version(4).stores({
  entries: '++id, type, timestamp, mealType, [type+timestamp]',
  foods: '++id, &name, count, lastUsed',
  meals: '++id, name, category'
}).upgrade(async tx => {
  const table = tx.table('meals');
  const existing = await table.toArray();
  const hasBeers = existing.some(m => m.name === 'Biertje' || m.name === 'Alcoholvrij biertje');
  if (hasBeers) return;
  const beers = ['lunch', 'avondeten', 'tussendoor'].flatMap(cat => [
    { name: 'Biertje', category: cat, ingredients: ['Bier'] },
    { name: 'Alcoholvrij biertje', category: cat, ingredients: ['Alcoholvrij bier'] },
  ]);
  await table.bulkAdd(beers);
});

db.on('populate', tx => seedMeals(tx.table('meals')));

function seedMeals(table) {
  const meals = [
    // Ontbijt + Lunch
    ...['ontbijt', 'lunch'].flatMap(cat => [
      { name: 'Havermout met fruit', category: cat, ingredients: ['Havermout volkoren fijn gemalen', 'Bevroren fruit', 'Banaan', 'Walnoten', 'Pure chocolade', 'Zout', 'Kaneel'] },
      { name: 'Broodje hagelslag', category: cat, ingredients: ['Volkoren brood', 'Hagelslag', 'Plantaardige halvarine'] },
      { name: 'Broodje pindakaas', category: cat, ingredients: ['Volkoren brood', 'Pindakaas'] },
      { name: 'Broodje ei', category: cat, ingredients: ['Volkoren brood', 'Ei', 'Ketchup'] },
    ]),
    // Alle maaltijden
    ...['ontbijt', 'lunch', 'avondeten', 'tussendoor'].flatMap(cat => [
      { name: 'Glas melk', category: cat, ingredients: ['Lactosevrije melk'] },
      { name: 'Proteïne shake', category: cat, ingredients: ['Vegan proteïne', 'Melk'] },
    ]),
    // Avondeten
    { name: 'Pasta fusilli verspakket', category: 'avondeten', ingredients: ['Fusilli', 'Plantaardige crème fraîche', 'Vegetarische kipstukjes', 'Courgette', 'Ui', 'Tomaat', 'Paprika', 'Sperziebonen', 'Knoflook', 'Zout'] },
    { name: 'Rode linzen curry', category: 'avondeten', ingredients: ['Rijst', 'Naan', 'Rode linzen', 'Doperwten', 'Groentebouillon', 'Blik gemalen tomaten', 'Kokosmelk', 'Citroen', 'Knoflook', 'Gember', 'Rode peper', 'Gemalen komijn', 'Gemalen koriander', 'Kerriepoeder', 'Garam masala', 'Zout'] },
    { name: 'Shakshuka', category: 'avondeten', ingredients: ['Blik tomaten', 'Paprika', 'Fetakaas', 'Pitabroodjes', 'Ui', 'Knoflook', 'Gemalen komijn', 'Zout', 'Peper'] },
    { name: 'Falafel broodje', category: 'avondeten', ingredients: ['Pitabroodjes', 'Falafel', 'Ui', 'Tomaat', 'Komkommer', 'Knoflooksaus'] },
    // Tussendoor
    { name: 'Paprika chips', category: 'tussendoor', ingredients: ['Paprika chips'] },
    { name: "Chocolade pinda's", category: 'tussendoor', ingredients: ["Chocolade pinda's"] },
    { name: 'Bakje yoghurt', category: 'tussendoor', ingredients: ['Lactosevrije yoghurt', 'Honing', 'Cashewnoten'] },
    { name: 'Ijs', category: 'tussendoor', ingredients: ['Ijs'] },
    { name: 'Lactosevrije ijs', category: 'tussendoor', ingredients: ['Lactosevrije ijs'] },
    // Bier (lunch, avondeten, tussendoor)
    ...['lunch', 'avondeten', 'tussendoor'].flatMap(cat => [
      { name: 'Biertje', category: cat, ingredients: ['Bier'] },
      { name: 'Alcoholvrij biertje', category: cat, ingredients: ['Alcoholvrij bier'] },
    ]),
  ];
  return table.bulkAdd(meals);
}
