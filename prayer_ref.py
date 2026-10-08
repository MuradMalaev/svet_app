import { icon, esc, $, $$, toast, openSheet, switchEl, bindSwitches, subbar, progressBar, emptyState, shuffle, plural } from '../core/ui.js';
import {
  getSettings, setSettings, getMemorized, toggleMemorized, srsEnsureStarted, srsRemove, srsRecord, srsDueToday, srsDailySeed,
  getHifzPlan, setHifzPlan, getStreak, markStreakToday, getShownAchievements, markAchievementShown,
} from '../core/store.js';
import { getQuran, juzSurahRange, overlapScore } from '../core/data.js';
import { RECITERS } from '../core/meta.js';
import { playAyah, playRange, stopAudio, onAudio, getAudio, togglePlay } from '../core/audio.js';
import { openAudioRange } from './quran.js';
import { dayKey, parseDay, addDays, startOfDay, fmtDMY, diffDays } from '../core/time.js';
import { arDigits } from '../core/ui.js';

let hTab = 'progress';
let audioMode = 'quiz';
let quizScore = { ok: 0, all: 0 };

/* ═════ Достижения: вычисляются из прогресса, хранится только факт показа сертификата ═════ */
const ACHIEVEMENTS = [
  { id: 'first_surah', title: 'Первый шаг', desc: 'Заучена первая сура', icon: 'star', ok: (m) => m.size > 0 },
  { id: 'juz_amma_short', title: 'Джуз Амма: начало', desc: '5 коротких сур заучено', icon: 'quran', ok: (m) => [...m].filter((n) => n >= 78).length >= 5 },
  { id: 'ten_surahs', title: '10 сур позади', desc: '10 сур заучено', icon: 'trophy', ok: (m) => m.size >= 10 },
  { id: 'streak_7', title: 'Неделя подряд', desc: '7 дней подряд занятий', icon: 'flame', ok: (m, s) => s >= 7 },
  { id: 'streak_30', title: 'Месяц постоянства', desc: '30 дней подряд занятий', icon: 'flame', ok: (m, s) => s >= 30 },
  { id: 'juz_amma_full', title: 'Джуз Амма целиком', desc: 'Все суры 30-го джуза заучены', icon: 'trophy', ok: (m) => Array.from({ length: 37 }, (_, i) => 78 + i).every((n) => m.has(n)) },
];
export const achievementsList = () => ACHIEVEMENTS;
export const unlockedAchievements = () => ACHIEVEMENTS.filter((a) => a.ok(getMemorized(), getStreak()));

function maybeShowAchievement() {
  const m = getMemorized(), streak = getStreak(), shown = getShownAchievements();
  const a = ACHIEVEMENTS.find((x) => !shown.has(x.id) && x.ok(m, streak));
  if (!a) return;
  markAchievementShown(a.id);
  openSheet('', `<div class="cert">${icon(a.icon)}<small>Новое достижение</small><h2>${esc(a.title)}</h2><p>${esc(a.desc)}</p></div>
    <button class="btn" data-close style="width:100%;margin-top:14px">Продолжить</button>`, null, { done: false });
}

/* ═════ Напоминание о перерыве (каждые 25 минут занятий) ═════ */
let breakTimer = null;
function startBreakTimer() {
  clearTimeout(breakTimer);
  if (!getSettings().hifzBreak) return;
  breakTimer = setTimeout(() => {
    openSheet('Пора отдохнуть', `<p class="muted-p" style="text-align:center">Мозг лучше запоминает после короткой паузы. Подышите в такт кругу пару минут — или просто закройте глаза на минуту.</p>
      <div class="breath"><div class="breath-c"><span></span></div></div>
      <button class="btn" data-close style="width:100%">Продолжить занятие</button>`, null, { done: false, onClose: startBreakTimer });
  }, 25 * 60 * 1000);
}
const stopBreakTimer = () => clearTimeout(breakTimer);

function openHifzSettings() {
  const s = getSettings();
  openSheet('Настройки Хифза', `
    <div class="row"><span class="lbl">Напоминание о перерыве<small>Мягкая пауза с дыхательным упражнением каждые 25 минут занятий</small></span>${switchEl(s.hifzBreak, 'sw-br', 'Напоминание о перерыве')}</div>
    <div class="row"><span class="lbl">Подсветка по смыслу (эксперимент)<small>Приблизительная подсветка тем по ключевым словам перевода — не научная разметка, а подсказка</small></span>${switchEl(s.hifzHighlight, 'sw-th', 'Подсветка по смыслу')}</div>`, (root) => {
    bindSwitches(root, (id, on) => {
      if (id === 'sw-br') { setSettings({ hifzBreak: on }); startBreakTimer(); } else setSettings({ hifzHighlight: on });
    });
  });
}

/* ═════ Главный экран Хифза ═════ */
export async function renderHifz(view) {
  view.innerHTML = `${subbar('Хифз', '#/', `<button class="icon-btn" id="h-set" aria-label="Настройки Хифза">${icon('settings')}</button>`)}
    <div class="seg h-tabs" role="tablist">${[['progress', 'Прогресс'], ['test', 'Тест'], ['audio', 'Аудио']].map(([id, t]) => `<button role="tab" data-t="${id}" aria-selected="${hTab === id}">${t}</button>`).join('')}</div>
    <div id="hbody"><div class="skel" style="height:300px"></div></div>`;
  startBreakTimer();
  $('#h-set', view).onclick = openHifzSettings;
  $$('[data-t]', view).forEach((b) => { b.onclick = () => { hTab = b.dataset.t; renderHifz(view); }; });
  const body = $('#hbody', view);
  let surahs;
  try { surahs = await getQuran(); } catch { body.innerHTML = emptyState('Не удалось загрузить данные', 'Обновите страницу.'); return stopBreakTimer; }
  let cleanup = null;
  if (hTab === 'progress') cleanup = paintProgress(body, surahs);
  else if (hTab === 'test') cleanup = paintTest(body, surahs);
  else cleanup = paintAudio(body, surahs);
  return () => { stopBreakTimer(); cleanup?.(); };
}

/* ───── Прогресс ───── */
function paintProgress(body, surahs) {
  markStreakToday();
  const draw = () => {
    const mem = getMemorized(), plan = getHifzPlan(), streak = getStreak();
    const totalAyahs = surahs.reduce((t, s) => t + s.ayahs.length, 0);
    const memAyahs = surahs.filter((s) => mem.has(s.n)).reduce((t, s) => t + s.ayahs.length, 0);
    const percent = memAyahs / totalAyahs;
    let juzDone = 0;
    for (let j = 1; j <= 30; j++) {
      const [a, b] = juzSurahRange(j);
      let ok = true;
      for (let n = a; n <= b; n++) if (!mem.has(n)) { ok = false; break; }
      if (ok) juzDone++;
    }
    const planFrac = plan.active ? Math.min(1, mem.size / plan.count) : 0;
    const due = srsDueToday().length;
    body.innerHTML = `
      <section class="hifz-hero"><span class="hifz-ico">${icon('hifz')}</span><h2>Мой хифз</h2><p>Сохраняй, повторяй, приближайся</p></section>
      <section class="card hifz-stats">
        ${plan.active ? `<div class="plan-row"><b>${mem.size} из ${plan.count} сур по плану</b><span>${Math.round(planFrac * 100)}%</span></div>${progressBar(planFrac, 'Выполнение плана')}
          ${plan.deadline ? `<small class="muted">Дедлайн: ${fmtDMY(parseDay(plan.deadline))}</small>` : ''}`
    : '<p class="muted-p">План не задан — учи в своём темпе или поставь цель</p>'}
        <div class="stats">
          <div><b>${streak}</b><span>${plural(streak, 'день', 'дня', 'дней')} подряд</span></div>
          <div><b>${mem.size}</b><span>сур выучено</span></div>
          <div><b>${(percent * 100).toFixed(2).replace('.', ',')}%</b><span>всего Корана</span></div>
          <div><b>${memAyahs}</b><span>аятов выучено</span></div>
          <div><b>${juzDone} / 30</b><span>джузов выучено</span></div>
        </div>
        <button class="btn" id="plan-btn" style="width:100%;margin-top:14px">${plan.active ? 'Изменить план' : 'Задать план'}</button>
      </section>
      <h2 class="card-h">Достижения</h2>
      <div class="ach-strip">${ACHIEVEMENTS.map((a) => {
    const on = a.ok(mem, streak);
    return `<div class="ach ${on ? 'on' : ''}" title="${esc(a.desc)}"><span>${icon(a.icon)}</span><small>${esc(a.title)}</small></div>`;
  }).join('')}</div>
      <div class="list-head"><h2 class="card-h" style="margin:0">Отметь заученные суры</h2>
        <button class="chip-btn" id="due-btn" aria-label="Пора повторить">${icon('repeat')} Повторить${due ? `<i class="badge">${due}</i>` : ''}</button></div>
      <ul class="hifz-list">${surahs.map((s) => {
    const done = mem.has(s.n);
    return `<li class="hrow ${done ? 'done' : ''}">
        <button class="chk" role="checkbox" aria-checked="${done}" data-chk="${s.n}" aria-label="${esc(s.ru)}: заучена">${icon('check')}</button>
        ${done ? `<a class="icon-btn" href="#/hifz/check/${s.n}" aria-label="Проверить по памяти: ${esc(s.ru)}">${icon('eyeoff')}</a>` : ''}
        <a class="hname" href="#/quran/${s.n}"><b>${s.n}. ${esc(s.ru)}</b><small>${s.ayahs.length} ${plural(s.ayahs.length, 'аят', 'аята', 'аятов')}</small></a>
        <span class="chev">${icon('forward')}</span></li>`;
  }).join('')}</ul>`;
  };
  draw();
  body.onclick = (e) => {
    const chk = e.target.closest('[data-chk]');
    if (chk) {
      const n = +chk.dataset.chk, s = surahs[n - 1];
      const on = toggleMemorized(n);
      if (on) { srsEnsureStarted(n); draw(); maybeShowAchievement(); } else {
        srsRemove(n); draw();
        toast(`«${s.ru}» убрана из заученных`, { label: 'Отменить', onClick: () => { toggleMemorized(n); srsEnsureStarted(n); draw(); } });
      }
      return;
    }
    if (e.target.closest('#plan-btn')) return openPlan(draw);
    if (e.target.closest('#due-btn')) return openDue(surahs, draw);
  };
  return () => { body.onclick = null; };
}

function openPlan(after) {
  const cur = getHifzPlan();
  const minD = fmtISO(addDays(startOfDay(), 1));
  const defD = cur.deadline || fmtISO(addDays(startOfDay(), 60));
  openSheet('План заучивания', `
    <div class="row stack"><label for="pl-n">Выучить сур: <b id="pl-v">${cur.count}</b></label><input class="range wide" id="pl-n" type="range" min="1" max="114" value="${cur.count}"></div>
    <div class="row stack"><label for="pl-d">Дедлайн</label><input class="field wide" id="pl-d" type="date" min="${minD}" value="${defD}"></div>
    <p class="muted-p small" id="pl-hint"></p>
    <div class="two-btns" style="margin-top:8px">${cur.active ? '<button class="btn ghost danger" id="pl-stop">Отменить план</button>' : '<button class="btn ghost" data-close>Закрыть</button>'}<button class="btn" id="pl-save">Сохранить</button></div>`, (root, close) => {
    const n = $('#pl-n', root), d = $('#pl-d', root);
    const hint = () => {
      $('#pl-v', root).textContent = n.value;
      const days = diffDays(startOfDay(), parseDay(d.value || defD));
      const left = Math.max(0, +n.value - getMemorized().size);
      $('#pl-hint', root).textContent = days > 0 && left > 0 ? `Осталось ${days} ${plural(days, 'день', 'дня', 'дней')}: примерно ${(left / (days / 7)).toFixed(1).replace('.', ',')} суры в неделю.` : '';
    };
    n.oninput = hint; d.oninput = hint; hint();
    $('#pl-save', root).onclick = () => {
      if (!d.value || parseDay(d.value) <= startOfDay()) return toast('Выберите дату в будущем');
      setHifzPlan({ active: true, count: +n.value, deadline: d.value, start: dayKey() });
      close(); after();
    };
    $('#pl-stop', root)?.addEventListener('click', () => { setHifzPlan({ active: false, count: 10, deadline: null, start: dayKey() }); close(); after(); });
  }, { done: false });
}
const fmtISO = (d) => dayKey(d);

function openDue(surahs, after) {
  srsDailySeed();
  const html = () => {
    const due = srsDueToday();
    return due.length ? due.map((n) => `<div class="due-row"><a href="#/hifz/check/${n}" data-close><b>${n}. ${esc(surahs[n - 1].ru)}</b></a>
      <button class="icon-btn ok" data-r="${n}:1" aria-label="Знаю хорошо">${icon('checkc')}</button>
      <button class="icon-btn warn" data-r="${n}:0" aria-label="Есть проблемы">${icon('refresh')}</button></div>`).join('')
      : '<p class="muted-p" style="padding:14px 0">Сегодня повторять нечего — всё по расписанию.</p>';
  };
  openSheet('Пора повторить', `<p class="muted-p small">Каждый день сюда добавляются новые 10 сур с конца Корана — плюс те, что подошли по расписанию. Отметьте, как вы знаете суру.</p><div id="due-list">${html()}</div>`, (root) => {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      const [n, ok] = b.dataset.r.split(':').map(Number);
      srsRecord(n, !!ok);
      $('#due-list', root).innerHTML = html();
    });
  }, { onClose: after });
}

/* ───── Тест: случайный аят ───── */
function paintTest(body, surahs) {
  let mode = 'surah', from = 1, to = 114, cur = null, showTr = false, isNext = false;
  const pool = () => {
    const [a, b] = mode === 'surah' ? [from, to] : [juzSurahRange(from)[0], juzSurahRange(to)[1]];
    return surahs.filter((s) => s.n >= a && s.n <= b && s.ayahs.length > 1);
  };
  const random = () => {
    const p = pool();
    if (!p.length) return;
    const s = p[Math.floor(Math.random() * p.length)];
    cur = { s: s.n, a: 1 + Math.floor(Math.random() * (s.ayahs.length - 1)) };
    showTr = false; isNext = false;
  };
  const next = () => {
    if (!cur) return;
    if (cur.a < surahs[cur.s - 1].ayahs.length) { cur = { s: cur.s, a: cur.a + 1 }; showTr = true; isNext = true; } else toast('Это последний аят этой суры');
  };
  const draw = () => {
    const opts = (lo, hi, sel) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${mode === 'surah' ? `${v}. ${esc(surahs[v - 1].ru)}` : `Джуз ${v}`}</option>`).join('');
    const max = mode === 'surah' ? 114 : 30;
    const s = cur && surahs[cur.s - 1];
    body.innerHTML = `
      <div class="seg" style="margin-top:12px"><button data-m="surah" aria-pressed="${mode === 'surah'}">По сурам</button><button data-m="juz" aria-pressed="${mode === 'juz'}">По джузам</button></div>
      <div class="card range-card"><div><label for="rq-a">${mode === 'surah' ? 'Сура от' : 'Джуз от'}</label><select class="field wide" id="rq-a">${opts(1, max, from)}</select></div>
        <div><label for="rq-b">${mode === 'surah' ? 'до' : 'до джуза'}</label><select class="field wide" id="rq-b">${opts(from, max, to)}</select></div></div>
      ${cur ? `<section class="quiz-card"><div class="qc-head"><span class="${isNext ? 'gold' : ''}">${isNext ? 'Следующий аят' : 'Продолжите чтение'}<br>Сура: ${esc(s.ru)}</span>
        <button class="icon-btn big" id="rq-play" aria-label="Слушать аят">${icon('play')}</button></div>
        <div class="a-ar qc-ar" lang="ar" dir="rtl">${esc(s.ayahs[cur.a - 1][0])} <span class="fnum">﴿${arDigits(cur.a)}﴾</span></div>
        ${showTr ? `<p class="a-ru" style="text-align:center">${esc(s.ayahs[cur.a - 1][1])}</p>` : '<button class="chip-btn" id="rq-tr" style="margin:6px auto 0;display:flex">Показать перевод</button>'}
      </section>` : emptyState('Нет аятов в выбранном диапазоне', 'Расширьте диапазон.')}
      <button class="btn ghost" id="rq-next" style="width:100%;margin-top:12px">Показать следующий аят</button>
      <button class="btn" id="rq-rand" style="width:100%;margin-top:8px">${icon('shuffle')} Случайный аят</button>`;
  };
  random(); draw();
  body.onclick = (e) => {
    const m = e.target.closest('[data-m]');
    if (m) { mode = m.dataset.m; from = 1; to = mode === 'surah' ? 114 : 30; random(); return draw(); }
    if (e.target.closest('#rq-rand')) { random(); return draw(); }
    if (e.target.closest('#rq-next')) { next(); return draw(); }
    if (e.target.closest('#rq-tr')) { showTr = true; return draw(); }
    if (e.target.closest('#rq-play') && cur) return openAudioRange(surahs, cur.s, cur.a);
  };
  body.onchange = (e) => {
    if (e.target.id === 'rq-a') { from = +e.target.value; if (from > to) to = from; random(); draw(); }
    if (e.target.id === 'rq-b') { to = +e.target.value; random(); draw(); }
  };
  return () => { body.onclick = null; body.onchange = null; };
}

/* ───── Аудио: квиз и практика ───── */
function paintAudio(body, surahs) {
  body.innerHTML = `<div class="seg" style="margin-top:12px"><button data-am="quiz" aria-pressed="${audioMode === 'quiz'}">Квиз</button><button data-am="practice" aria-pressed="${audioMode === 'practice'}">Практика</button></div><div id="abody"></div>`;
  const ab = $('#abody', body);
  let inner = audioMode === 'quiz' ? quizView(ab, surahs) : practiceView(ab, surahs);
  body.onclick = (e) => {
    const m = e.target.closest('[data-am]');
    if (!m || m.dataset.am === audioMode) return;
    inner?.(); stopAudio();
    audioMode = m.dataset.am;
    paintAudio(body, surahs);
  };
  return () => { inner?.(); body.onclick = null; stopAudio(); };
}

function practiceView(host, surahs) {
  const st = { s: 1, a: 1, b: Math.min(2, surahs[0].ayahs.length), rate: 1, rep: 3, rec: getSettings().reciter };
  const draw = () => {
    const total = surahs[st.s - 1].ayahs.length;
    const opts = (lo, hi, sel) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => `<option ${v === sel ? 'selected' : ''}>${v}</option>`).join('');
    host.innerHTML = `
      <div class="row stack"><label for="pr-s">Сура</label><select class="field wide" id="pr-s">${surahs.map((s) => `<option value="${s.n}" ${s.n === st.s ? 'selected' : ''}>${s.n}. ${esc(s.ru)}</option>`).join('')}</select></div>
      <div class="goto-row"><label for="pr-a">Аяты</label><select class="field" id="pr-a">${opts(1, total, st.a)}</select><span>—</span><select class="field" id="pr-b">${opts(st.a, total, st.b)}</select></div>
      <div class="row stack"><label for="pr-r">Скорость: <b id="pr-rv">${st.rate.toFixed(2)}×</b></label><input class="range wide" id="pr-r" type="range" min="0.5" max="1.5" step="0.05" value="${st.rate}"></div>
      <div class="row stack"><span class="lbl">Повторить диапазон: <b>${st.rep}</b> ${plural(st.rep, 'раз', 'раза', 'раз')}</span><div class="seg sm" id="pr-rep">${[1, 3, 5, 10].map((n) => `<button data-n="${n}" aria-pressed="${st.rep === n}">${n}</button>`).join('')}</div></div>
      <div class="row stack"><label for="pr-c">Чтец</label><select class="field wide" id="pr-c">${RECITERS.map((r) => `<option value="${r.id}" ${r.id === st.rec ? 'selected' : ''}>${esc(r.ru)}</option>`).join('')}</select></div>
      <p class="muted-p small" id="pr-status" style="text-align:center"></p>
      <button class="btn" id="pr-go" style="width:100%">${icon('play')} Начать прослушивание</button>`;
    status(getAudio());
  };
  const status = (a) => {
    const on = (a.playing || a.loading) && a.surah === st.s && a.from === st.a;
    const go = $('#pr-go', host), t = $('#pr-status', host);
    if (!go) return;
    go.innerHTML = on ? `${icon('stop')} Остановить` : `${icon('play')} Начать прослушивание`;
    t.textContent = on ? `Аят ${a.ayah} • повтор ${a.repeatTotal - a.repeatLeft + 1} из ${a.repeatTotal}` : '';
  };
  draw();
  const off = onAudio(status);
  host.onchange = (e) => {
    const id = e.target.id;
    if (id === 'pr-s') { st.s = +e.target.value; st.a = 1; st.b = Math.min(2, surahs[st.s - 1].ayahs.length); draw(); }
    else if (id === 'pr-a') { st.a = +e.target.value; st.b = Math.max(st.a, st.b); draw(); }
    else if (id === 'pr-b') st.b = +e.target.value;
    else if (id === 'pr-c') st.rec = e.target.value;
  };
  host.oninput = (e) => { if (e.target.id === 'pr-r') { st.rate = +e.target.value; $('#pr-rv', host).textContent = st.rate.toFixed(2) + '×'; } };
  host.onclick = (e) => {
    const rep = e.target.closest('#pr-rep button');
    if (rep) { st.rep = +rep.dataset.n; return draw(); }
    if (e.target.closest('#pr-go')) {
      const a = getAudio();
      if ((a.playing || a.loading) && a.surah === st.s) return stopAudio();
      playRange({ surah: st.s, from: st.a, to: st.b, repeat: st.rep, rate: st.rate, reciter: st.rec, continuous: false });
    }
  };
  return () => { off(); host.onchange = host.oninput = host.onclick = null; };
}

function quizView(host, surahs) {
  let q = null, answered = -1, rec = getSettings().reciter;
  const gen = () => {
    const cands = surahs.filter((s) => s.ayahs.length > 3);
    const s = cands[Math.floor(Math.random() * cands.length)];
    const idx = Math.floor(Math.random() * (s.ayahs.length - 1));
    const correct = { s: s.n, a: idx + 2, ar: s.ayahs[idx + 1][0], ru: s.ayahs[idx + 1][1] };
    const scored = [];
    for (const x of surahs) {
      for (let i = 0; i < x.ayahs.length; i++) {
        if (x.n === s.n && (i === idx || i === idx + 1)) continue;
        const sc = overlapScore(correct.ru, x.ayahs[i][1]);
        if (sc > 0) scored.push([sc, x.n, i]);
      }
    }
    scored.sort((p, r) => r[0] - p[0]);
    const top = shuffle(scored.slice(0, 40));
    const dist = [], seen = new Set([correct.ar]);
    for (const [, n, i] of top) {
      const ar = surahs[n - 1].ayahs[i][0];
      if (seen.has(ar)) continue;
      seen.add(ar); dist.push({ s: n, a: i + 1, ar });
      if (dist.length >= 3) break;
    }
    while (dist.length < 3) {
      const x = surahs[Math.floor(Math.random() * 114)], i = Math.floor(Math.random() * x.ayahs.length), ar = x.ayahs[i][0];
      if (!seen.has(ar)) { seen.add(ar); dist.push({ s: x.n, a: i + 1, ar }); }
    }
    q = { cur: { s: s.n, a: idx + 1 }, correct, options: shuffle([correct, ...dist]) };
    answered = -1;
  };
  const draw = () => {
    host.innerHTML = `
      <div class="row stack" style="margin-top:8px"><label for="qz-c">Чтец</label><select class="field wide" id="qz-c">${RECITERS.map((r) => `<option value="${r.id}" ${r.id === rec ? 'selected' : ''}>${esc(r.ru)}</option>`).join('')}</select></div>
      <p class="muted-p small" style="text-align:center">Сура ${esc(surahs[q.cur.s - 1].ru)} • Аят ${q.cur.a}</p>
      <div style="display:grid;place-items:center;margin:8px 0"><button class="play-big" id="qz-play" aria-label="Прослушать аят">${icon('play')}</button></div>
      <p class="muted-p small" style="text-align:center">Нажмите, чтобы прослушать аят</p>
      <h3 class="sub-h" style="margin-top:18px">Какой аят идёт следующим?</h3>
      ${q.options.map((o, i) => {
    const ok = o === q.correct;
    const cls = answered < 0 ? '' : ok ? 'right' : i === answered ? 'wrong' : '';
    return `<button class="opt ${cls}" data-o="${i}" ${answered >= 0 ? 'disabled' : ''}><span lang="ar" dir="rtl">${esc(o.ar)}</span></button>`;
  }).join('')}
      <p class="muted-p small" style="text-align:center">Верно: ${quizScore.ok} из ${quizScore.all}</p>
      ${answered >= 0 ? `<button class="btn" id="qz-next" style="width:100%;margin-top:6px">Следующий вопрос</button>` : ''}`;
  };
  gen(); draw();
  host.onclick = (e) => {
    if (e.target.closest('#qz-play')) {
      const a = getAudio();
      if (a.playing && a.surah === q.cur.s && a.ayah === q.cur.a) return togglePlay();
      return playAyah(q.cur.s, q.cur.a, { reciter: rec, continuous: false });
    }
    const o = e.target.closest('[data-o]');
    if (o && answered < 0) {
      answered = +o.dataset.o;
      quizScore.all++;
      if (q.options[answered] === q.correct) quizScore.ok++;
      return draw();
    }
    if (e.target.closest('#qz-next')) { gen(); draw(); }
  };
  host.onchange = (e) => { if (e.target.id === 'qz-c') rec = e.target.value; };
  const off = onAudio((a) => {
    const b = $('#qz-play', host);
    if (b) b.innerHTML = icon(a.playing && a.surah === q.cur.s && a.ayah === q.cur.a ? 'pause' : 'play');
  });
  return () => { off(); host.onclick = host.onchange = null; };
}

/* ═════ Проверка по памяти ═════ */
const THEMES = [
  ['th-paradise', (t) => t.includes('рай') || (t.includes('сад') && t.includes('блаж'))],
  ['th-hell', (t) => t.includes('ад') || t.includes('огон') || t.includes('наказан')],
  ['th-prophets', (t) => t.includes('пророк') || t.includes('муса') || t.includes('ибрахим') || t.includes('нух')],
  ['th-reflect', (t) => t.includes('размышля') || t.includes('разум') || t.includes('знамен')],
  ['th-law', (t) => t.includes('предпис') || t.includes('запрет') || t.includes('дозволен') || t.includes('закон')],
];
const themeOf = (ru) => { const t = ru.toLowerCase(); const h = THEMES.find(([, f]) => f(t)); return h ? h[0] : ''; };
const mask = (w) => '•'.repeat(Math.min(6, Math.max(2, w.length)));

export async function renderCheck(view, n) {
  view.innerHTML = '<div class="skel" style="height:300px;margin-top:70px"></div>';
  let surahs;
  try { surahs = await getQuran(); } catch { view.innerHTML = emptyState('Не удалось загрузить данные', 'Обновите страницу.'); return; }
  const s = surahs[n - 1];
  if (!s) { view.innerHTML = emptyState('Такой суры нет', ''); return; }
  startBreakTimer();
  const hl = getSettings().hifzHighlight;
  let mode = 'hideAll';
  const revealed = new Set(), scr = new Map(), placed = new Map(), result = new Map();

  const card = (i) => {
    const a = i + 1, ar = s.ayahs[i][0], words = ar.split(' ');
    const th = hl ? themeOf(s.ayahs[i][1]) : '';
    const wrap = (inner) => `<article class="ccard ${th}" data-a="${a}">${inner}</article>`;
    if (mode === 'hideAll') {
      const open = revealed.has(a);
      return wrap(`<div class="cc-row"><div style="flex:1"><small class="muted">Аят ${a}</small><div class="cc-ar ${open ? '' : 'masked'}" lang="ar" dir="rtl">${esc(open ? ar : words.map(mask).join('   '))}</div></div>
        <button class="icon-btn" data-x="eye" aria-label="${open ? 'Скрыть аят' : 'Показать аят'}">${icon(open ? 'eye' : 'eyeoff')}</button></div>`);
    }
    if (mode === 'firstWordOnly') {
      return wrap(`<small class="muted">Аят ${a}</small><div class="cc-ar" lang="ar" dir="rtl">${words.map((w, k) => `<span class="${k ? 'masked' : ''}">${esc(k ? mask(w) : w)}</span>`).join(' ')}</div>`);
    }
    if (!scr.has(a)) scr.set(a, shuffle(words)); if (!placed.has(a)) placed.set(a, []);
    const sw = scr.get(a), pl = placed.get(a), res = result.get(a);
    const bank = sw.map((w, k) => k).filter((k) => !pl.includes(k));
    return wrap(`<div class="cc-row"><small class="muted">Аят ${a}</small>${pl.length ? '<button class="link-btn" data-x="reset">Заново</button>' : ''}</div>
      <div class="drop ${res === false ? 'bad' : res === true ? 'good' : ''}" lang="ar" dir="rtl">${pl.map((k) => `<button class="wd on" data-x="unplace" data-k="${k}" ${res != null ? 'disabled' : ''}>${esc(sw[k])}</button>`).join('')}</div>
      <div class="bank" lang="ar" dir="rtl">${bank.map((k) => `<button class="wd" data-x="place" data-k="${k}">${esc(sw[k])}</button>`).join('')}</div>
      ${!bank.length && pl.length && res == null ? '<button class="btn" data-x="check" style="width:100%;margin-top:10px">Проверить</button>' : ''}
      ${res === true ? '<p class="ok-t">Верно!</p>' : ''}${res === false ? '<p class="bad-t">Не совсем — попробуйте ещё раз</p>' : ''}`);
  };
  const paintAll = () => { $('#clist', view).innerHTML = s.ayahs.map((_, i) => card(i)).join(''); };
  const paintOne = (a) => { const el = $(`.ccard[data-a="${a}"]`, view); if (el) el.outerHTML = card(a - 1); };

  view.innerHTML = `${subbar('Проверка: ' + s.ru, '#/hifz', `<button class="icon-btn" id="c-mode" aria-label="Режим проверки">${icon('eyeoff')}</button>`)}
    <p class="page-sub" id="c-hint" style="margin:12px 0"></p><div id="clist"></div>`;
  const hints = { hideAll: 'Текст скрыт — вспомните аят и откройте его кнопкой-глазом.', firstWordOnly: 'Видно только первое слово каждого аята.', scramble: 'Слова перемешаны — расставьте их в правильном порядке.' };
  const setMode = (m) => { mode = m; revealed.clear(); scr.clear(); placed.clear(); result.clear(); $('#c-hint', view).textContent = hints[m]; paintAll(); };
  setMode('hideAll');

  view.onclick = (e) => {
    if (e.target.closest('#c-mode')) {
      return openSheet('Режим проверки', `<div class="act-list">
        <button data-m="hideAll">${icon('eyeoff')}<span>Скрыть текст всех аятов<small>На каждом аяте — кнопка-глаз</small></span></button>
        <button data-m="firstWordOnly">${icon('list')}<span>Скрыть аят, кроме первого слова</span></button>
        <button data-m="scramble">${icon('shuffle')}<span>Собрать аят<small>Слова перемешаны — расставьте их по порядку</small></span></button></div>`, (root, close) => {
        $$('[data-m]', root).forEach((b) => { if (b.dataset.m === mode) b.classList.add('sel'); });
        root.addEventListener('click', (ev) => { const b = ev.target.closest('[data-m]'); if (b) { close(); setMode(b.dataset.m); } });
      }, { done: false });
    }
    const x = e.target.closest('[data-x]');
    if (!x) return;
    const a = +x.closest('[data-a]').dataset.a, k = +x.dataset.k;
    switch (x.dataset.x) {
      case 'eye': revealed.has(a) ? revealed.delete(a) : revealed.add(a); break;
      case 'place': placed.get(a).push(k); result.delete(a); break;
      case 'unplace': placed.set(a, placed.get(a).filter((v) => v !== k)); result.delete(a); break;
      case 'reset': placed.set(a, []); result.delete(a); break;
      case 'check': {
        const right = s.ayahs[a - 1][0].split(' '), got = placed.get(a).map((i) => scr.get(a)[i]);
        result.set(a, got.length === right.length && got.every((w, i) => w === right[i]));
        break;
      }
    }
    paintOne(a);
  };
  return () => { stopBreakTimer(); view.onclick = null; };
}
