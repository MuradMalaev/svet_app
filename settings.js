// Работа с датами: ключи дней вида «2026-10-08», разница в календарных днях.
import { pad2 } from './ui.js';

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** «2026-10-08» -> Date (локальная полночь) */
export function parseDay(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}
export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** Разница в календарных днях (b − a), без влияния перехода на летнее время */
export function diffDays(a, b) {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / 86400000);
}
export const fmtDMY = (d) => `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
export const fmtHM = (ms, tz) => new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(new Date(ms));
