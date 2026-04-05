const MEAL_ICONS = {
  ontbijt: '☀️',
  lunch: '🥗',
  avondeten: '🍽️',
  tussendoor: '🍎',
}

// Maps ingredient keywords to emoji — sorted longest first to prevent substring conflicts
const FOOD_EMOJI = [
  // Compound words that contain shorter keywords
  ['aardappel', '🥔'], ['sinaasappel', '🍊'], ['appelstroop', '🍯'],
  ['appelsap', '🧃'], ['appelmoes', '🍎'], ['pannenkoek', '🥞'],
  ['ontbijtgranen', '🥣'], ['blauwe bes', '🫐'], ['hot dog', '🌭'],
  ['frisdrank', '🥤'], ['kokosnoot', '🥥'], ['champignon', '🍄'],
  ['paddenstoel', '🍄'], ['watermeloen', '🍉'], ['stoofpot', '🍲'],
  // Brood & granen (before shorter matches)
  ['brood', '🍞'], ['toast', '🍞'], ['boterham', '🍞'], ['croissant', '🥐'],
  ['bagel', '🥯'], ['wafel', '🧇'], ['rijst', '🍚'],
  ['pasta', '🍝'], ['spaghetti', '🍝'], ['noodle', '🍜'], ['noedel', '🍜'],
  ['havermout', '🥣'], ['muesli', '🥣'],
  ['tortilla', '🌯'], ['wrap', '🌯'], ['taco', '🌮'], ['pizza', '🍕'],
  // Fruit
  ['mandarijn', '🍊'], ['banaan', '🍌'],
  ['aardbei', '🍓'], ['druif', '🍇'], ['druiven', '🍇'], ['citroen', '🍋'],
  ['meloen', '🍈'], ['perzik', '🍑'], ['kers', '🍒'],
  ['kersen', '🍒'], ['ananas', '🍍'], ['mango', '🥭'], ['kiwi', '🥝'],
  ['peer', '🍐'], ['bosbes', '🫐'], ['kokos', '🥥'], ['avocado', '🥑'],
  ['appel', '🍎'], ['fruit', '🍎'],
  // Groenten
  ['broccoli', '🥦'], ['wortel', '🥕'], ['mais', '🌽'], ['tomaat', '🍅'],
  ['paprika', '🫑'], ['ui', '🧅'], ['knoflook', '🧄'],
  ['friet', '🍟'], ['patat', '🍟'], ['sla', '🥬'], ['komkommer', '🥒'],
  ['aubergine', '🍆'], ['spinazie', '🥬'], ['olijf', '🫒'], ['olijven', '🫒'],
  // Vlees & vis
  ['kip', '🍗'], ['chicken', '🍗'], ['vlees', '🥩'], ['steak', '🥩'],
  ['biefstuk', '🥩'], ['gehakt', '🥩'], ['hamburger', '🍔'], ['burger', '🍔'],
  ['worst', '🌭'], ['hotdog', '🌭'], ['spek', '🥓'], ['bacon', '🥓'],
  ['vis', '🐟'], ['zalm', '🐟'], ['tonijn', '🐟'], ['garnaal', '🦐'],
  ['garnalen', '🦐'], ['kreeft', '🦞'], ['sushi', '🍣'],
  // Zuivel & eieren
  ['ei', '🍳'], ['eieren', '🍳'], ['kaas', '🧀'], ['melk', '🥛'],
  ['yoghurt', '🥛'], ['boter', '🧈'], ['ijs', '🍦'],
  // Drinken
  ['koffie', '☕'], ['thee', '🍵'], ['bier', '🍺'], ['wijn', '🍷'],
  ['sap', '🧃'], ['water', '💧'], ['smoothie', '🥤'], ['cola', '🥤'],
  ['cocktail', '🍹'],
  // Snacks & zoet
  ['chocola', '🍫'], ['chocolade', '🍫'], ['koek', '🍪'], ['cookie', '🍪'],
  ['cake', '🍰'], ['taart', '🎂'], ['donut', '🍩'], ['snoep', '🍬'],
  ['chips', '🍿'], ['noot', '🥜'], ['noten', '🥜'], ['pinda', '🥜'],
  ['honing', '🍯'], ['popcorn', '🍿'],
  // Overig
  ['soep', '🍲'], ['curry', '🍛'], ['salade', '🥗'],
  ['sandwich', '🥪'], ['tosti', '🥪'],
]

export function getFoodEmoji(ingredients, mealType, mealName) {
  // 1. Check meal name first
  const name = (mealName || '').toLowerCase()
  for (const [keyword, emoji] of FOOD_EMOJI) {
    if (name.includes(keyword)) return emoji
  }
  // 2. Then check ingredients
  const ingText = (Array.isArray(ingredients) ? ingredients : []).join(' ').toLowerCase()
  for (const [keyword, emoji] of FOOD_EMOJI) {
    if (ingText.includes(keyword)) return emoji
  }
  // 3. Fall back to meal type icon
  return MEAL_ICONS[mealType] || '🍽️'
}
