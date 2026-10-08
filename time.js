import { icon, $, $$, toast, openSheet, closeSheet, esc } from './core/ui.js';
import { getSettings, onSettings } from './core/store.js';
import { getQuran } from './core/data.js';
import { setAyahCounts, onAudio, getAudio, togglePlay, stopAudio, setSleepTimer } from './core/audio.js';
import { renderHome } from './screens/home.js';
import { renderQuran, renderReader, applyReadingVars } from './screens/quran.js';
import { renderHifz, renderCheck } from './screens/hifz.js';
import { renderAzkar } from './screens/azkar.js';
import { renderHadith } from './screens/hadith.js';
import { renderNames } from './screens/names.js';
import { renderTracker, renderKhatm } from './screens/tracker.js';
import { renderQibla } from './screens/qibla.js';
import { renderSchedule } from './screens/schedule.js';
import { renderSettings } from './screens/settings.js';

const TABS = [
  { id: 'home', ru: 'Главная', icon: 'home', href: '#/' },
  { id: 'quran', ru: 'Коран', icon: 'quran', href: '#/quran' },
  { id: 'azkar', ru: 'Азкары', icon: 'azkar', href: '#/azkar' },
  { id: 'hadith', ru: 'Хадисы', icon: 'hadith', href: '#/hadith' },
  { id: 'settings', ru: 'Настройки', icon: 'settings', href: '#/settings' },
];
const TITLES = { home: 'Свет', quran: 'Коран', azkar: 'Азкары', hadith: 'Хадисы', settings: 'Настройки', hifz: 'Хифз', names: '99 имён', tracker: 'Трекер', qibla: 'Кибла', schedule: 'Расписание' };

const view = $('#view');
let cleanup = null, seq = 0, surahNames = [];

function applyTheme(s = getSettings()) {
  if (s.theme === 'light' || s.theme === 'dark') document.documentElement.dataset.theme = s.theme;
  else document.documentElement.removeAttribute('data-theme');
}
applyTheme(); applyReadingVars();
onSettings((s, patch) => { if ('theme' in patch || !Object.keys(patch).length) applyTheme(s); });

function paintTabs(active) {
  $('#tabbar').innerHTML = TABS.map((t) =>
    `<a class="tab" href="${t.href}" ${t.id === active ? 'aria-current="page"' : ''}>${icon(t.icon)}<span>${t.ru}</span></a>`).join('');
}

const ROUTES = {
  '': { tab: 'home', fn: (p) => renderHome(view, p) },
  quran: { tab: 'quran', fn: (p) => (p[0] ? renderReader(view, +p[0], +p[1] || 0) : renderQuran(view)) },
  hifz: { tab: 'home', fn: (p) => (p[0] === 'check' ? renderCheck(view, +p[1]) : renderHifz(view)) },
  azkar: { tab: 'azkar', fn: () => renderAzkar(view) },
  hadith: { tab: 'hadith', fn: (p) => renderHadith(view, p[0]) },
  names: { tab: 'home', fn: (p) => renderNames(view, p[0]) },
  tracker: { tab: 'home', fn: (p) => (p[0] === 'khatm' ? renderKhatm(view) : renderTracker(view)) },
  qibla: { tab: 'home', fn: () => renderQibla(view) },
  schedule: { tab: 'home', fn: () => renderSchedule(view) },
  settings: { tab: 'settings', fn: () => renderSettings(view) },
};

async function route() {
  const my = ++seq;
  closeSheet();
  cleanup?.(); cleanup = null;
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const r = ROUTES[parts[0] || ''] || ROUTES[''];
  const name = ROUTES[parts[0] || ''] ? (parts[0] || 'home') : 'home';
  paintTabs(r.tab);
  view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
  const keepScroll = parts[0] === 'quran' && parts[2];
  if (!keepScroll) window.scrollTo(0, 0);
  document.title = (TITLES[name] || 'Свет') + (name === 'home' ? '' : ' · Свет');
  let c;
  try { c = await r.fn(parts.slice(1)); } catch (e) {
    console.error(e);
    view.innerHTML = '<div class="empty" style="margin-top:80px"><h3>Что-то пошло не так</h3><p>Попробуйте обновить страницу.</p><a class="btn" href="#/" style="margin-top:14px">На главную</a></div>';
  }
  if (my !== seq) { c?.(); return; }
  cleanup = c || null;
}
addEventListener('hashchange', route);

/* ───── Мини-плеер ───── */
function paintPlayer(a) {
  const el = $('#miniplayer');
  if (!el) return;
  if (!a.surah) { el.hidden = true; document.body.classList.remove('has-player'); return; }
  el.hidden = false; document.body.classList.add('has-player');
  const name = surahNames[a.surah - 1] || `Сура ${a.surah}`;
  el.innerHTML = `<button class="mp-main" id="mp-toggle" aria-label="${a.playing ? 'Пауза' : 'Играть'}">${icon(a.loading && !a.playing ? 'timer' : a.playing ? 'pause' : 'play')}</button>
    <a class="mp-text" href="#/quran/${a.surah}/${a.ayah}"><b>${esc(name)}</b><small>Аят ${a.ayah}${a.repeatTotal > 1 ? ` · повтор ${a.repeatTotal - a.repeatLeft + 1}/${a.repeatTotal}` : ''}${a.sleepAt ? ' · таймер сна' : ''}</small></a>
    <button class="icon-btn" id="mp-sleep" aria-label="Таймер сна" aria-pressed="${!!a.sleepAt}">${icon('moon')}</button>
    <button class="icon-btn" id="mp-stop" aria-label="Остановить">${icon('stop')}</button>`;
}
$('#miniplayer').addEventListener('click', (e) => {
  if (e.target.closest('#mp-toggle')) return togglePlay();
  if (e.target.closest('#mp-stop')) return stopAudio();
  if (e.target.closest('#mp-sleep')) {
    openSheet('Таймер сна', `<div class="act-list">${[15, 30, 45, 60, 90].map((m) => `<button data-m="${m}"><span>${m} минут</span></button>`).join('')}
      <button data-m="0"><span>Отключить таймер</span></button></div>`, (root, close) => {
      root.addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-m]');
        if (!b) return;
        const m = +b.dataset.m;
        setSleepTimer(m);
        toast(m ? `Воспроизведение остановится через ${m} минут` : 'Таймер сна отключён');
        close();
      });
    }, { done: false });
  }
});
onAudio(paintPlayer);

/* ───── Запуск ───── */
paintTabs('home');
route();
getQuran().then((surahs) => {
  setAyahCounts(surahs.map((s) => s.ayahs.length));
  surahNames = surahs.map((s) => s.ru);
  paintPlayer(getAudio());
}).catch(() => { /* экраны сами покажут ошибку загрузки */ });

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !window.__SVET_DATA__) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

/* Единый файл (GitHub Pages): убираем service worker и кэш старой Flutter-версии, иначе браузер покажет прежний сайт */
if (window.__SVET_DATA__) {
  try {
    navigator.serviceWorker?.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
    window.caches?.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
  } catch { /* без доступа к service worker */ }
}
