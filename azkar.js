// Внешние источники, как в исходном приложении: таджвид (alquran.cloud) и тафсир Ибн Касира (spa5k/tafsir_api).
import { TAJWEED_CLASS } from './meta.js';
import { normAr } from './data.js';
import { esc } from './ui.js';

async function getJSON(url, ms) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

/* ───────── Таджвид ───────── */
const HEAVY = new Set(['خ', 'ص', 'ض', 'ط', 'ظ', 'غ', 'ق']);
const DIACRITIC = /[ؐ-ًؚ-ٰٟۖ-ۭ]/;
const SILENT_CIRCLE = /[۟۠]/g;
const TAG = /\[([a-zA-Z]+)(?::\d+)?\[([^\]]*)\]/g;
const BISM_WORDS = ['بسم', 'الله', 'الرحمن', 'الرحيم'];

/** Разметка вида «[h:8078[ٱ]للَّهُ» -> [{text, cls}] */
export function parseTajweedMarkup(raw) {
  const segs = [];
  let cursor = 0;
  for (const m of raw.matchAll(TAG)) {
    if (m.index > cursor) segs.push({ text: raw.slice(cursor, m.index).replace(SILENT_CIRCLE, ''), cls: null });
    segs.push({ text: (m[2] || '').replace(SILENT_CIRCLE, ''), cls: TAJWEED_CLASS[m[1].toLowerCase()] || null });
    cursor = m.index + m[0].length;
  }
  if (cursor < raw.length) segs.push({ text: raw.slice(cursor).replace(SILENT_CIRCLE, ''), cls: null });
  return segs;
}

/** Окрашивает «тяжёлые» буквы (ص ض ط ظ خ غ ق) вместе с их огласовкой — только в неразмеченном тексте */
function applyTafkhim(segs) {
  const out = [];
  for (const seg of segs) {
    if (seg.cls) { out.push(seg); continue; }
    const chars = [...seg.text];
    let buf = '';
    for (let i = 0; i < chars.length; i++) {
      if (HEAVY.has(chars[i])) {
        if (buf) { out.push({ text: buf, cls: null }); buf = ''; }
        let cluster = chars[i];
        while (i + 1 < chars.length && DIACRITIC.test(chars[i + 1])) cluster += chars[++i];
        out.push({ text: cluster, cls: 'tj-tafkhim' });
      } else buf += chars[i];
    }
    if (buf) out.push({ text: buf, cls: null });
  }
  return out;
}

/** API кладёт басмалу в начало первого аята каждой суры — убираем её, как и в основном тексте. */
function stripBismillah(segs) {
  const plain = segs.map((s) => s.text).join('');
  const words = plain.split(' ');
  if (words.length <= 4 || !BISM_WORDS.every((w, i) => normAr(words[i]) === w)) return segs;
  let cut = words.slice(0, 4).join(' ').length + 1;
  const out = [];
  for (const s of segs) {
    if (cut <= 0) out.push(s);
    else if (s.text.length <= cut) cut -= s.text.length;
    else { out.push({ ...s, text: s.text.slice(cut) }); cut = 0; }
  }
  return out;
}

export const segmentsToHtml = (segs) =>
  segs.map((s) => (s.cls ? `<span class="${s.cls}">${esc(s.text)}</span>` : esc(s.text))).join('');

const tajweedCache = new Map();
/** Карта «номер аята -> HTML с подсветкой» для суры. Бросает ошибку при проблемах сети. */
export function fetchTajweed(surah) {
  if (!tajweedCache.has(surah)) {
    const p = getJSON(`https://api.alquran.cloud/v1/surah/${surah}/quran-tajweed`, 9000).then((j) => {
      const ayahs = j?.data?.ayahs;
      if (!Array.isArray(ayahs)) throw new Error('неожиданный ответ сервера');
      const map = {};
      for (const a of ayahs) {
        if (typeof a.numberInSurah !== 'number' || typeof a.text !== 'string') continue;
        let segs = parseTajweedMarkup(a.text);
        if (a.numberInSurah === 1 && surah !== 1 && surah !== 9) segs = stripBismillah(segs);
        map[a.numberInSurah] = segmentsToHtml(applyTafkhim(segs));
      }
      return map;
    });
    p.catch(() => tajweedCache.delete(surah));
    tajweedCache.set(surah, p);
  }
  return tajweedCache.get(surah);
}

/* ───────── Тафсир ───────── */
const TAFSIR_BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ru-tafsir-ibne-kahtir';
const tafsirCache = new Map();

function cleanTafsir(t) {
  return String(t ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}
/** Приводит ответ источника к карте {номер аята: текст} — поддерживает массив и обёртки */
function tafsirMap(j) {
  const list = Array.isArray(j) ? j : Array.isArray(j?.ayahs) ? j.ayahs : null;
  const map = {};
  if (list) {
    for (const x of list) if (x && x.ayah != null && x.text != null) map[+x.ayah] = cleanTafsir(x.text);
  } else if (j && typeof j === 'object') {
    for (const [k, v] of Object.entries(j)) {
      if (/^\d+$/.test(k)) map[+k] = cleanTafsir(typeof v === 'string' ? v : v?.text);
    }
  }
  return map;
}
function fetchTafsirSurah(surah) {
  if (!tafsirCache.has(surah)) {
    const p = getJSON(`${TAFSIR_BASE}/${surah}.json`, 15000).then(tafsirMap);
    p.catch(() => tafsirCache.delete(surah));
    tafsirCache.set(surah, p);
  }
  return tafsirCache.get(surah);
}
/** Текст тафсира к аяту или null, если источник не содержит его. Бросает ошибку при проблемах сети. */
export async function getTafsir(surah, ayah) {
  try {
    const map = await fetchTafsirSurah(surah);
    if (map[ayah]) return map[ayah];
    if (Object.keys(map).length) return null;
  } catch (e) {
    // файл суры недоступен — пробуем файл отдельного аята
    try {
      const j = await getJSON(`${TAFSIR_BASE}/${surah}/${ayah}.json`, 10000);
      const t = cleanTafsir(j?.text);
      return t || null;
    } catch { throw e; }
  }
  return null;
}
