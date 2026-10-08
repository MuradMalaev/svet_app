// Хранилище в браузере: localStorage с запасным хранилищем в памяти (приватный режим, iframe и т. п.)
import { dayKey, parseDay, startOfDay, addDays } from './time.js';
import { SRS_INTERVALS } from './meta.js';

const PFX = 'svet.';
const mem = {};

export function read(k, fb) {
  try {
    const v = localStorage.getItem(PFX + k);
    if (v == null) return k in mem ? mem[k] : fb;
    return JSON.parse(v);
  } catch { return k in mem ? mem[k] : fb; }
}
export function write(k, v) {
  mem[k] = v;
  try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch { /* хранилище недоступно — данные живут до закрытия вкладки */ }
}

/* ───────── Настройки ───────── */
export const defaults = {
  theme: 'auto',
  method: 'mwl', asrHanafi: false,
  loc: { name: 'Москва', lat: 55.7558, lon: 37.6173, tz: 'Europe/Moscow', chosen: false },
  arSize: 30, ruSize: 16, tafsirSize: 15,
  showAr: true, showRu: true, tajweed: false, flow: false, chrono: false,
  continuous: false, reciter: 'alafasy',
  hifzBreak: true, hifzHighlight: false,
  notify: false,
  alarm: { fajr: false, tahajjud: false, suhur: false, suhurMin: 30 },
  userName: '', userEmail: '',
};
let settings = { ...defaults, ...read('settings', {}) };
settings.loc = { ...defaults.loc, ...settings.loc };
settings.alarm = { ...defaults.alarm, ...settings.alarm };
const subs = new Set();
export const getSettings = () => settings;
export function setSettings(patch) {
  settings = { ...settings, ...patch };
  write('settings', settings);
  subs.forEach((f) => f(settings, patch));
}
export const onSettings = (f) => { subs.add(f); return () => subs.delete(f); };

/* ───────── Закладки, последнее чтение, заметки ───────── */
export const getBookmarks = () => read('bookmarks', []);
export const isBookmarked = (s, a) => getBookmarks().some((b) => b.s === s && b.a === a);
export function toggleBookmark(s, a, name) {
  const list = getBookmarks();
  const i = list.findIndex((b) => b.s === s && b.a === a);
  if (i >= 0) { list.splice(i, 1); write('bookmarks', list); return false; }
  list.unshift({ s, a, name, ts: Date.now() });
  write('bookmarks', list);
  return true;
}
export function removeBookmark(s, a) { write('bookmarks', getBookmarks().filter((b) => !(b.s === s && b.a === a))); }
export function addBookmarkRaw(b) { const l = getBookmarks(); if (!l.some((x) => x.s === b.s && x.a === b.a)) { l.unshift(b); write('bookmarks', l); } }

export const getLastRead = () => read('lastRead', null);
export const setLastRead = (s, a) => write('lastRead', { s, a });

export const getNotes = () => read('notes', {});
export const getNote = (s, a) => getNotes()[`${s}_${a}`] || '';
export function setNote(s, a, text) {
  const all = getNotes(), k = `${s}_${a}`, t = (text || '').trim();
  if (t) all[k] = t; else delete all[k];
  write('notes', all);
}

/* ───────── Намазы по дням (история 90 дней) ───────── */
export const getPrayed = (day = dayKey()) => (read('prayed', {})[day] || {});
export function togglePrayed(day, key) {
  const all = read('prayed', {});
  const d = { ...(all[day] || {}) };
  d[key] = !d[key];
  if (!d[key]) delete d[key];
  all[day] = d;
  const keep = Object.keys(all).sort().slice(-90);
  write('prayed', Object.fromEntries(keep.map((k) => [k, all[k]])));
  return !!d[key];
}

/* ───────── Азкары: отметки сбрасываются каждый день ───────── */
function azkarDay() {
  const s = read('azkarDay', null), today = dayKey();
  if (!s || s.day !== today) return { day: today, done: {}, counts: {} };
  return s;
}
export const getAzkarToday = () => azkarDay();
export function toggleAzkar(key) {
  const s = azkarDay();
  if (s.done[key]) { delete s.done[key]; delete s.counts[key]; } else s.done[key] = true;
  write('azkarDay', s);
  return !!s.done[key];
}
/** +1 к счётчику; при достижении max азкар считается выполненным */
export function bumpAzkar(key, max) {
  const s = azkarDay();
  const n = Math.min(max, (s.counts[key] || 0) + 1);
  s.counts[key] = n;
  if (n >= max) s.done[key] = true;
  write('azkarDay', s);
  return { n, done: !!s.done[key] };
}

/* ───────── Хифз ───────── */
export const getMemorized = () => new Set(read('hifzDone', []));
export function toggleMemorized(n) {
  const set = getMemorized();
  const on = !set.has(n);
  if (on) set.add(n); else set.delete(n);
  write('hifzDone', [...set].sort((a, b) => a - b));
  return on;
}

export const getSrs = () => read('hifzSrs', {});
const saveSrs = (m) => write('hifzSrs', m);
export function srsEnsureStarted(n) {
  const m = getSrs();
  if (m[n]) return;
  m[n] = { due: Date.now() + SRS_INTERVALS[0] * 86400000, idx: 0 };
  saveSrs(m);
}
export function srsRemove(n) { const m = getSrs(); delete m[n]; saveSrs(m); }
/** success=true — следующий, более длинный интервал; false — шаг назад (минимум — первый) */
export function srsRecord(n, success) {
  const m = getSrs();
  const cur = m[n] || { idx: 0 };
  const idx = Math.max(0, Math.min(SRS_INTERVALS.length - 1, cur.idx + (success ? 1 : -1)));
  m[n] = { due: Date.now() + SRS_INTERVALS[idx] * 86400000, idx };
  saveSrs(m);
}
export function srsDueToday() {
  const endOfToday = addDays(startOfDay(), 1).getTime();
  return Object.entries(getSrs()).filter(([, c]) => c.due < endOfToday).map(([n]) => +n).sort((a, b) => a - b);
}
/** Каждый день добавляет в очередь 10 новых сур с конца Корана (114, 113, …) */
export function srsDailySeed() {
  const today = dayKey();
  if (read('hifzSeedDay', '') === today) return;
  let cursor = read('hifzSeedCursor', 115);
  if (cursor <= 1) { write('hifzSeedDay', today); return; }
  const m = getSrs();
  let added = 0;
  while (added < 10 && cursor > 1) {
    cursor--;
    if (!m[cursor]) { m[cursor] = { due: Date.now(), idx: 0 }; added++; }
  }
  saveSrs(m);
  write('hifzSeedDay', today);
  write('hifzSeedCursor', cursor);
}

export const getHifzPlan = () => read('hifzPlan', { active: false, count: 10, deadline: null, start: dayKey() });
export const setHifzPlan = (p) => write('hifzPlan', p);

export function getStreak() {
  const s = read('hifzStreak', null);
  if (!s) return 0;
  const gap = Math.round((startOfDay() - parseDay(s.day)) / 86400000);
  return gap <= 1 ? s.count : 0;
}
export function markStreakToday() {
  const today = dayKey(), s = read('hifzStreak', null);
  if (s && s.day === today) return;
  const gap = s ? Math.round((startOfDay() - parseDay(s.day)) / 86400000) : 999;
  write('hifzStreak', { day: today, count: gap === 1 ? s.count + 1 : 1 });
}
export const getShownAchievements = () => new Set(read('achShown', []));
export function markAchievementShown(id) { const s = getShownAchievements(); s.add(id); write('achShown', [...s]); }

/* ───────── Хатм-план ───────── */
export const getKhatm = () => read('khatm', { active: false, mode: 0, pagesPerDay: 5, target: null, start: dayKey(), page: 1 });
export const setKhatm = (p) => write('khatm', p);

/* ───────── 99 имён ───────── */
export const getNamesViewed = () => new Set(read('namesViewed', []));
export function markNameViewed(n) { const s = getNamesViewed(); if (!s.has(n)) { s.add(n); write('namesViewed', [...s]); } }
export const getNamesFav = () => new Set(read('namesFav', []));
export function toggleNameFav(n) {
  const s = getNamesFav(), on = !s.has(n);
  if (on) s.add(n); else s.delete(n);
  write('namesFav', [...s]);
  return on;
}

/* ───────── Резервная копия и сброс ───────── */
export function exportAll() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(PFX)) out[k.slice(PFX.length)] = JSON.parse(localStorage.getItem(k));
    }
  } catch { Object.assign(out, mem); }
  return { app: 'svet', version: 1, savedAt: new Date().toISOString(), data: out };
}
export function importAll(obj) {
  if (!obj || obj.app !== 'svet' || typeof obj.data !== 'object') throw new Error('Это не файл резервной копии «Света»');
  for (const [k, v] of Object.entries(obj.data)) write(k, v);
  settings = { ...defaults, ...read('settings', {}) };
  settings.loc = { ...defaults.loc, ...settings.loc };
  settings.alarm = { ...defaults.alarm, ...settings.alarm };
  subs.forEach((f) => f(settings, {}));
}
export function resetAll() {
  try { Object.keys(localStorage).filter((k) => k.startsWith(PFX)).forEach((k) => localStorage.removeItem(k)); } catch { /* нет доступа */ }
  Object.keys(mem).forEach((k) => delete mem[k]);
  settings = { ...defaults, loc: { ...defaults.loc }, alarm: { ...defaults.alarm } };
  subs.forEach((f) => f(settings, {}));
}
