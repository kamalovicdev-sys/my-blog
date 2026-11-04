const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Sanalar O'zbekiston vaqti bilan hisoblanadi
export const TIME_ZONE = 'Asia/Tashkent';

// Bugungi sana, YYYY-MM-DD
export function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());
}

// "2026-03-15" → "Mar 15, 2026"
export function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

// YYYY-MM-DD ustidagi hisob UTC'da: brauzerning soat mintaqasi natijaga ta'sir qilmaydi
function toUtcDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: string, days: number) {
  const value = toUtcDate(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

// Oyni siljitadi, kun oy uzunligiga moslanadi: 31-yanvar + 1 oy → 28-fevral
export function addMonths(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month + months, 0)).getUTCDate();
  return new Date(Date.UTC(year, month - 1 + months, Math.min(day, lastDay))).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / 86_400_000);
}

// Dushanba 0, yakshanba 6
export function weekdayIndex(date: string) {
  return (toUtcDate(date).getUTCDay() + 6) % 7;
}

// "2026-11-10" → "Tue, Nov 10, 2026", long: "Tuesday, November 10, 2026"
export function formatWeekdayDate(date: string, style: 'short' | 'long' = 'short') {
  return toUtcDate(date).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: style, month: style, day: 'numeric', year: 'numeric' });
}

// "2026-11-10" → "November 2026"
export function formatMonth(date: string) {
  return toUtcDate(date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
}
