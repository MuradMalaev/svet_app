// Аудио-плеер: чтение по аятам с everyayah.com (как в исходном приложении).
import { RECITERS } from './meta.js';
import { getSettings } from './store.js';
import { toast } from './ui.js';

const el = typeof Audio !== 'undefined' ? new Audio() : null;
if (el) el.preload = 'auto';

let counts = [];          // число аятов в каждой суре — задаётся после загрузки Корана
export const setAyahCounts = (c) => { counts = c; };

const subs = new Set();
const st = {
  playing: false, loading: false, surah: 0, ayah: 0, from: 0, to: 0,
  repeatLeft: 1, repeatTotal: 1, rate: 1, reciter: 'alafasy', continuous: false, sleepAt: null,
};
let sleepTimer = null;

export const onAudio = (f) => { subs.add(f); return () => subs.delete(f); };
export const getAudio = () => ({ ...st });
const emit = () => subs.forEach((f) => f({ ...st }));

export const reciterById = (id) => RECITERS.find((r) => r.id === id) || RECITERS[0];
export const ayahUrl = (reciterId, s, a) =>
  `https://everyayah.com/data/${reciterById(reciterId).dir}/${String(s).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`;

function load() {
  if (!el) return;
  st.loading = true;
  el.src = ayahUrl(st.reciter, st.surah, st.ayah);
  el.defaultPlaybackRate = st.rate;
  el.playbackRate = st.rate;
  try { el.preservesPitch = true; } catch { /* не поддерживается */ }
  emit();
  el.play().catch((e) => {
    if (e && e.name === 'AbortError') return;
    st.playing = false; st.loading = false; emit();
    toast(e && e.name === 'NotAllowedError' ? 'Браузер не разрешил воспроизведение — нажмите ещё раз' : 'Не удалось загрузить аудио — проверьте интернет');
  });
}

if (el) {
  el.addEventListener('playing', () => { st.playing = true; st.loading = false; el.playbackRate = st.rate; emit(); });
  el.addEventListener('pause', () => { if (!el.ended) { st.playing = false; emit(); } });
  el.addEventListener('waiting', () => { st.loading = true; emit(); });
  el.addEventListener('error', () => {
    if (!st.surah) return;
    st.playing = false; st.loading = false; emit();
    toast('Аудио недоступно: проверьте интернет или выберите другого чтеца');
  });
  el.addEventListener('ended', () => {
    if (st.ayah < st.to) { st.ayah++; load(); return; }
    if (st.repeatLeft > 1) { st.repeatLeft--; st.ayah = st.from; load(); return; }
    if (st.continuous && st.surah < 114 && counts[st.surah]) {
      st.surah++; st.from = 1; st.to = counts[st.surah - 1]; st.ayah = 1; st.repeatLeft = 1; load(); return;
    }
    st.playing = false; st.loading = false; emit();
  });
}

/** Воспроизвести аяты from…to суры surah. repeat — сколько раз повторить диапазон, rate — скорость. */
export function playRange({ surah, from = 1, to, repeat = 1, rate = 1, reciter, continuous } = {}) {
  const s = getSettings();
  const max = counts[surah - 1] || to || from;
  Object.assign(st, {
    surah, from, to: Math.min(to || max, max), ayah: from, repeatLeft: repeat, repeatTotal: repeat, rate,
    reciter: reciter || s.reciter, continuous: continuous ?? s.continuous,
  });
  load();
}
export const playAyah = (surah, ayah, opts = {}) => playRange({ surah, from: ayah, to: ayah, ...opts });

export function togglePlay() {
  if (!el || !st.surah) return;
  if (el.paused) el.play().catch(() => {}); else el.pause();
}
export function stopAudio() {
  if (!el) return;
  el.pause();
  st.playing = false; st.loading = false; st.surah = 0; st.sleepAt = null;
  clearTimeout(sleepTimer);
  el.removeAttribute('src');
  emit();
}
/** Таймер сна: через minutes минут остановить воспроизведение. 0 — отключить. */
export function setSleepTimer(minutes) {
  clearTimeout(sleepTimer);
  if (!minutes) { st.sleepAt = null; emit(); return; }
  st.sleepAt = Date.now() + minutes * 60000;
  sleepTimer = setTimeout(() => { stopAudio(); toast('Таймер сна: воспроизведение остановлено'); }, minutes * 60000);
  emit();
}
export const isPlayingAyah = (s, a) => st.playing && st.surah === s && st.ayah === a;
