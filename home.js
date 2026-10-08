// Расчёт времени намаза по солнечным углам, хиджра-дата (табличная), направление киблы.
import { PRAYER_METHODS, KAABA, HIJRI_MONTHS } from './meta.js';

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const sin = (x) => Math.sin(x * D2R), cos = (x) => Math.cos(x * D2R), tan = (x) => Math.tan(x * D2R);
const asin = (x) => Math.asin(x) * R2D, acos = (x) => Math.acos(x) * R2D;
const atan2 = (y, x) => Math.atan2(y, x) * R2D;
const arccot = (x) => Math.atan(1 / x) * R2D;
const fix = (a, n) => a - n * Math.floor(a / n);

function julian(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}
function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360);
  const q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360);
  const e = 23.439 - 0.00000036 * D;
  const ra = atan2(cos(e) * sin(L), cos(L)) / 15;
  return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fix(ra, 24) };
}
function angleTime(angle, noon, lat, decl, after = false) {
  const x = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
  if (x < -1 || x > 1) return NaN;
  const t = acos(x) / 15;
  return after ? noon + t : noon - t;
}

/** Смещение часового пояса tz от UTC (в часах) в момент atMs */
export function tzOffsetHours(tz, atMs) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
    }).formatToParts(new Date(atMs)).map((x) => [x.type, x.value]));
    const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return (asUTC - Math.floor(atMs / 1000) * 1000) / 3600000;
  } catch { return -new Date(atMs).getTimezoneOffset() / 60; }
}
export const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } };

/** Сегодняшняя календарная дата в часовом поясе tz: {y, m, d} */
export function todayIn(tz, atMs = Date.now()) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date(atMs)).map((x) => [x.type, x.value]));
    return { y: +p.year, m: +p.month, d: +p.day };
  } catch { const n = new Date(atMs); return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }; }
}
export function shiftDate({ y, m, d }, n) {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

const NOTE = 'Для высоких широт Фаджр и Иша рассчитаны по правилу ночной доли.';

/**
 * Время намаза на календарную дату {y,m,d} в часовом поясе tz.
 * Возвращает { ms: {fajr,…}, text: {fajr:'05:12',…}, note }.
 */
export function computeDay(date, { lat, lon, tz }, methodId = 'mwl', asrHanafi = false) {
  const m = PRAYER_METHODS.find((x) => x.id === methodId) || PRAYER_METHODS[0];
  const { y, m: mo, d } = date;
  const offset = tzOffsetHours(tz, Date.UTC(y, mo - 1, d, 12) - 3 * 3600000);
  const jd = julian(y, mo, d) - lon / (15 * 24);
  const { decl, eqt } = sunPosition(jd + 0.5);
  const noon = 12 - eqt;
  const horizon = 0.833;

  const sunrise = angleTime(horizon, noon, lat, decl);
  const sunset = angleTime(horizon, noon, lat, decl, true);
  let fajr = angleTime(m.fajr, noon, lat, decl);
  const asrAngle = -arccot((asrHanafi ? 2 : 1) + tan(Math.abs(lat - decl)));
  const asr = angleTime(asrAngle, noon, lat, decl, true);
  let isha = m.ishaMin ? sunset + m.ishaMin / 60 : angleTime(m.isha, noon, lat, decl, true);

  let note = null;
  if (!Number.isNaN(sunrise) && !Number.isNaN(sunset)) {
    const night = fix(sunrise - sunset, 24);
    if (Number.isNaN(fajr)) { fajr = sunrise - night / 7; note = NOTE; }
    else if (sunrise - fajr > (night * m.fajr) / 60) { fajr = sunrise - (night * m.fajr) / 60; note = NOTE; }
    if (!m.ishaMin) {
      if (Number.isNaN(isha)) { isha = sunset + night / 7; note = NOTE; }
      else if (isha - sunset > (night * m.isha) / 60) { isha = sunset + (night * m.isha) / 60; note = NOTE; }
    }
  }
  const shift = offset - lon / 15;
  const raw = { fajr, sunrise, dhuhr: noon + 1 / 60, asr, maghrib: sunset, isha };
  const ms = {}, text = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Number.isNaN(v)) { ms[k] = null; text[k] = '—'; continue; }
    const mins = Math.round((v + shift) * 60);                      // минуты от местной полуночи
    ms[k] = Date.UTC(y, mo - 1, d) + mins * 60000 - offset * 3600000;
    const wrapped = ((mins % 1440) + 1440) % 1440;
    text[k] = `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
  }
  return { ms, text, note, offset };
}

/** Начало последней трети ночи: Магриб + 2/3 ночи (до Фаджра следующего дня) */
export function tahajjudMs(today, tomorrow) {
  if (!today.ms.maghrib || !tomorrow.ms.fajr) return null;
  return today.ms.maghrib + ((tomorrow.ms.fajr - today.ms.maghrib) * 2) / 3;
}

/* ───────── Хиджра (табличный Кувейтский алгоритм) ───────── */
export function toHijri({ y, m, d }) {
  const jd = Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;     // юлианский день на полдень (целое)
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day, text: `${day} ${HIJRI_MONTHS[month - 1]} ${year}` };
}

/* ───────── Кибла ───────── */
export function qiblaBearing(lat, lon) {
  const p1 = lat * D2R, p2 = KAABA.lat * D2R, dl = (KAABA.lon - lon) * D2R;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}
export function distanceToKaabaKm(lat, lon) {
  const R = 6371, dLat = (KAABA.lat - lat) * D2R, dLon = (KAABA.lon - lon) * D2R;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * D2R) * Math.cos(KAABA.lat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
