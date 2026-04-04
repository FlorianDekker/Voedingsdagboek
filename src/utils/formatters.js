const nlDateFormat = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const nlTimeFormat = new Intl.DateTimeFormat('nl-NL', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(date) {
  return nlDateFormat.format(new Date(date));
}

export function formatTime(date) {
  return nlTimeFormat.format(new Date(date));
}

export function formatShortDate(date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}

export function isSameDay(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
