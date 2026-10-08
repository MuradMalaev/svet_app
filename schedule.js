// Загрузка JSON-данных (из встроенного набора в artifact-версии или с сервера), поиск, вспомогательные выборки.
import { JUZ_START, CHRONO } from './meta.js';
import { getSettings } from './store.js';

const cache = new Map();

function loadJSON(name) {
  if (cache.has(name)) return cache.get(name);
  const embedded = typeof window !== 'undefined' && window.__SVET_DATA__ && window.__SVET_DATA__[name];
  const p = embedded
    ? Promise.resolve(embedded)
    : fetch(`/static/data/${name}`).then((r) => { if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`); return r.json(); });
  const guarded = p.catch((e) => { cache.delete(name); throw e; });
  cache.set(name, guarded);
  return guarded;
}

export const getQuran = () => loadJSON('quran.json');
export const getHadiths = () => loadJSON('hadiths.json');
export const getNames = () => loadJSON('asma_ul_husna.json');
export const getAzkar = () => loadJSON('azkar.json');

/** Суры в нужном порядке: по Мусхафу или по хронологии ниспослания (настройка «Хронологическое чтение») */
export function orderedSurahs(surahs) {
  if (!getSettings().chrono) return surahs;
  return CHRONO.map((n) => surahs[n - 1]);
}

export const surahByNumber = (surahs, n) => surahs[n - 1];

/** Арабский текст аята (n — номер суры, a — номер аята) */
export const ayahAr = (surahs, n, a) => surahs[n - 1]?.ayahs[a - 1]?.[0] || '';
export const ayahRu = (surahs, n, a) => surahs[n - 1]?.ayahs[a - 1]?.[1] || '';

/** Джуз, в который входит аят */
export function juzOf(s, a) {
  let j = 1;
  for (let i = 0; i < JUZ_START.length; i++) {
    const [js, ja] = JUZ_START[i];
    if (s > js || (s === js && a >= ja)) j = i + 1;
  }
  return j;
}
/** Джузы, начинающиеся в суре n: [[номер джуза, аят начала], …] */
export function juzStartsInSurah(n) {
  return JUZ_START.map(([s, a], i) => [i + 1, a, s]).filter(([, , s]) => s === n).map(([j, a]) => [j, a]);
}
/** Границы джуза в виде сур: первая и последняя сура, содержащие его аяты */
export function juzSurahRange(j) {
  const [s1] = JUZ_START[j - 1];
  const next = JUZ_START[j];
  if (!next) return [s1, 114];
  const [s2, a2] = next;
  return [s1, a2 === 1 ? s2 - 1 : s2];
}

/* ───────── Поиск ───────── */
const DIAC = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
export function normAr(s) {
  return String(s).replace(DIAC, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي');
}
const ARABIC_RE = /[؀-ۿ]/;
let arIndex = null;

/**
 * Поиск по Корану: название или номер суры, «2:255», слово из русского перевода или арабского текста.
 * Возвращает { surahs: [...], hits: [{s, a, ar, ru}], more }
 */
export function searchQuran(surahs, query) {
  const q = query.trim();
  const out = { surahs: [], hits: [], more: 0 };
  if (!q) return out;
  const ql = q.toLowerCase();

  const ref = q.match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/);
  if (ref) {
    const s = +ref[1], a = +ref[2];
    if (surahs[s - 1] && a >= 1 && a <= surahs[s - 1].ayahs.length) {
      out.hits.push({ s, a, ar: surahs[s - 1].ayahs[a - 1][0], ru: surahs[s - 1].ayahs[a - 1][1] });
      return out;
    }
  }
  if (/^\d{1,3}$/.test(q)) {
    const n = +q;
    if (surahs[n - 1]) out.surahs.push(surahs[n - 1]);
  }
  for (const s of surahs) {
    if (out.surahs.includes(s)) continue;
    if (s.ru.toLowerCase().includes(ql) || s.meaning.toLowerCase().includes(ql) || (ARABIC_RE.test(q) && normAr(s.ar).includes(normAr(q)))) out.surahs.push(s);
  }
  if (q.length < 2) return out;

  const isAr = ARABIC_RE.test(q);
  let needle = ql;
  if (isAr) {
    needle = normAr(q);
    if (!arIndex) arIndex = surahs.map((s) => s.ayahs.map((a) => normAr(a[0])));
  }
  const LIMIT = 40;
  for (const s of surahs) {
    for (let i = 0; i < s.ayahs.length; i++) {
      const hit = isAr ? arIndex[s.n - 1][i].includes(needle) : s.ayahs[i][1].toLowerCase().includes(needle);
      if (!hit) continue;
      if (out.hits.length < LIMIT) out.hits.push({ s: s.n, a: i + 1, ar: s.ayahs[i][0], ru: s.ayahs[i][1] });
      else out.more++;
    }
  }
  return out;
}

/* ───────── Родственные хадисы по совпадению слов (как в исходном приложении) ───────── */
const WORD_SPLIT = /[\s,.!?;:—«»"()-]+/;
const sigWords = (t) => new Set(t.toLowerCase().split(WORD_SPLIT).filter((w) => w.length > 3));
export function overlapScore(a, b) {
  const A = sigWords(a), B = sigWords(b);
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n;
}
export function relatedHadiths(ayahRuText, hadiths, limit = 3) {
  return hadiths
    .map((h) => [h, overlapScore(ayahRuText, h.translationRu)])
    .filter(([, sc]) => sc >= 2)
    .sort((x, y) => y[1] - x[1])
    .slice(0, limit)
    .map(([h]) => h);
}

/** Текст «Сура, аят — арабский — перевод» для копирования */
export function ayahCopyText(s, a) {
  return `Сура ${s.ru}, аят ${a}\n\n${s.ayahs[a - 1][0]}\n\n${s.ayahs[a - 1][1]}`;
}
