import { icon, esc, $, $$, toast, openSheet, switchEl, bindSwitches, promptDialog, confirmDialog } from '../core/ui.js';
import { getSettings, setSettings, exportAll, importAll, resetAll, getMemorized, getStreak } from '../core/store.js';
import { CITIES, PRAYER_METHODS, RECITERS } from '../core/meta.js';
import { deviceTz } from '../core/prayer.js';
import { askPermission, notificationsSupported, rescheduleNotifications } from '../core/notify.js';
import { achievementsList } from './hifz.js';
import { openReadSettings, applyReadingVars } from './quran.js';
import { dayKey } from '../core/time.js';

export const APP_VERSION = '2.0.0';

/** Определяет местоположение через браузер. Возвращает true, если место обновлено. */
export function detectLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { toast('Браузер не умеет определять местоположение'); return resolve(false); }
    toast('Определяю местоположение…');
    navigator.geolocation.getCurrentPosition((p) => {
      setSettings({ loc: { name: 'Моё местоположение', lat: +p.coords.latitude.toFixed(4), lon: +p.coords.longitude.toFixed(4), tz: deviceTz(), chosen: true } });
      rescheduleNotifications();
      toast('Местоположение определено');
      resolve(true);
    }, (err) => {
      toast(err.code === 1 ? 'Доступ к местоположению запрещён — выберите город из списка' : 'Не удалось определить местоположение');
      resolve(false);
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
  });
}

/** Умный будильник: Фаджр / Тахаджуд / Сухур */
export function openAlarmSheet(onChange) {
  const a = getSettings().alarm;
  openSheet('Умный будильник', `
    <div class="row"><span class="lbl">Фаджр</span>${switchEl(a.fajr, 'al-fajr', 'Фаджр')}</div>
    <div class="row"><span class="lbl">Тахаджуд<small>Начало последней трети ночи</small></span>${switchEl(a.tahajjud, 'al-tah', 'Тахаджуд')}</div>
    <div class="row"><span class="lbl">Сухур</span>${switchEl(a.suhur, 'al-suhur', 'Сухур')}</div>
    <div class="row" id="al-min-row" ${a.suhur ? '' : 'hidden'}><label for="al-min">За сколько минут до Фаджра</label>
      <select class="field" id="al-min">${[15, 20, 30, 45, 60].map((m) => `<option ${m === a.suhurMin ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
    <p class="muted-p small">${notificationsSupported() ? 'В браузере уведомления приходят, только пока приложение открыто (вкладка или установленное PWA). Для будильника на ночь лучше системный будильник.' : 'Этот браузер не поддерживает уведомления.'}</p>`,
  (root) => {
    bindSwitches(root, async (id, on, sw) => {
      const key = { 'al-fajr': 'fajr', 'al-tah': 'tahajjud', 'al-suhur': 'suhur' }[id];
      if (on && !(await askPermission())) { sw.setAttribute('aria-checked', 'false'); return; }
      setSettings({ alarm: { ...getSettings().alarm, [key]: on } });
      if (key === 'suhur') $('#al-min-row', root).hidden = !on;
      rescheduleNotifications();
      onChange?.();
    });
    $('#al-min', root).onchange = (e) => {
      setSettings({ alarm: { ...getSettings().alarm, suhurMin: +e.target.value } });
      rescheduleNotifications();
    };
  });
}

export async function renderSettings(view) {
  const s = getSettings();
  const known = CITIES.some(([n]) => n === s.loc.name);
  const notifOK = notificationsSupported();
  const unlocked = achievementsList().filter((a) => a.ok(getMemorized(), getStreak())).length;
  view.innerHTML = `
    <h1 class="page-title">Настройки</h1><p class="page-sub">Данные хранятся только в этом браузере</p>

    <h2 class="card-h">Профиль</h2>
    <div class="card">
      <button class="row link-row" id="s-name"><span class="lbl">Имя<small>${esc(s.userName || 'Не указано')}</small></span>${icon('forward')}</button>
      <button class="row link-row" id="s-mail"><span class="lbl">Почта<small>${esc(s.userEmail || 'Не указана')}</small></span>${icon('forward')}</button>
      <a class="row link-row" href="#/hifz"><span class="lbl">Достижения<small>Открыто ${unlocked} из ${achievementsList().length}</small></span>${icon('forward')}</a>
    </div>

    <h2 class="card-h">Оформление</h2>
    <div class="card"><div class="row"><span class="lbl">Тема</span>
      <div class="seg sm" id="theme" role="group" aria-label="Тема">${[['auto', 'Авто'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(([v, t]) => `<button data-v="${v}" aria-pressed="${s.theme === v}">${t}</button>`).join('')}</div></div>
      <button class="row link-row" id="s-read"><span class="lbl">Чтение Корана<small>Шрифты, перевод, таджвид, порядок сур</small></span>${icon('forward')}</button></div>

    <h2 class="card-h">Намаз</h2>
    <div class="card">
      <div class="row"><label for="city">Город<small id="loc-sub">${s.loc.lat.toFixed(3)}, ${s.loc.lon.toFixed(3)}</small></label>
        <select class="field" id="city">${!known ? `<option value="__cur" selected>${esc(s.loc.name)}</option>` : ''}${CITIES.map(([n]) => `<option ${n === s.loc.name ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
      <div class="row"><span class="lbl">Моё местоположение<small>Координаты остаются в этом браузере</small></span><button class="btn ghost" id="geo" style="min-height:40px;padding:0 14px">${icon('pin')} Определить</button></div>
      <div class="row stack"><label for="method">Метод расчёта времени</label>
        <select class="field wide" id="method">${PRAYER_METHODS.map((m) => `<option value="${m.id}" ${m.id === s.method ? 'selected' : ''}>${esc(m.ru)}</option>`).join('')}</select></div>
      <div class="row"><span class="lbl">Аср по ханафитскому мазхабу<small>Тень предмета вдвое длиннее самого предмета</small></span>${switchEl(s.asrHanafi, 'sw-hanafi', 'Ханафитский Аср')}</div>
      <div class="row"><span class="lbl">Напоминать о намазе<small>${notifOK ? 'Сработает, пока приложение открыто' : 'Браузер не поддерживает уведомления'}</small></span>${switchEl(s.notify && notifOK, 'sw-notify', 'Напоминать о намазе')}</div>
      <button class="row link-row" id="s-alarm"><span class="lbl">Умный будильник<small>Фаджр, Тахаджуд, Сухур</small></span>${icon('forward')}</button>
      <a class="row link-row" href="#/schedule"><span class="lbl">Расписание на месяц</span>${icon('forward')}</a>
    </div>

    <h2 class="card-h">Аудио</h2>
    <div class="card"><div class="row stack"><label for="reciter">Чтец по умолчанию</label>
      <select class="field wide" id="reciter">${RECITERS.map((r) => `<option value="${r.id}" ${r.id === s.reciter ? 'selected' : ''}>${esc(r.ru)}</option>`).join('')}</select></div></div>

    <h2 class="card-h">Данные</h2>
    <div class="card">
      <div class="row"><span class="lbl">Резервная копия<small>Отметки, закладки, заметки, прогресс Хифза</small></span><button class="btn ghost" id="s-export" style="min-height:40px;padding:0 14px">${icon('download')} Скачать</button></div>
      <div class="row"><span class="lbl">Восстановить из копии</span><button class="btn ghost" id="s-import" style="min-height:40px;padding:0 14px">${icon('upload')} Выбрать файл</button><input type="file" id="s-file" accept="application/json,.json" hidden></div>
      <div class="row"><span class="lbl">Сбросить всё<small>Удалит данные только из этого браузера</small></span><button class="btn ghost danger" id="s-reset" style="min-height:40px;padding:0 14px">Сбросить</button></div>
    </div>
    <p class="about">«Свет» · версия ${APP_VERSION}<br>Коран, хадисы, азкары, имена Аллаха — из встроенных JSON-файлов.<br>Аудио: everyayah.com · таджвид: alquran.cloud · тафсир Ибн Касира: spa5k/tafsir_api.<br>Дата хиджры — табличная, может отличаться от объявленной по луне на 1–2 дня.</p>`;

  const q = (sel) => $(sel, view);
  $$('#theme button', view).forEach((b) => { b.onclick = () => { setSettings({ theme: b.dataset.v }); $$('#theme button', view).forEach((x) => x.setAttribute('aria-pressed', x === b)); }; });
  q('#city').onchange = (e) => {
    const c = CITIES.find(([n]) => n === e.target.value);
    if (!c) return;
    setSettings({ loc: { name: c[0], lat: c[1], lon: c[2], tz: c[3], chosen: true } });
    q('#loc-sub').textContent = `${c[1].toFixed(3)}, ${c[2].toFixed(3)}`;
    rescheduleNotifications();
    toast('Город изменён');
  };
  q('#geo').onclick = async () => { if (await detectLocation()) renderSettings(view); };
  q('#method').onchange = (e) => { setSettings({ method: e.target.value }); rescheduleNotifications(); toast('Метод расчёта изменён'); };
  q('#reciter').onchange = (e) => setSettings({ reciter: e.target.value });
  q('#s-read').onclick = () => openReadSettings(() => {});
  q('#s-alarm').onclick = () => openAlarmSheet();
  q('#s-name').onclick = async () => { const v = await promptDialog('Имя', { value: getSettings().userName, placeholder: 'Как к вам обращаться?' }); if (v !== null) { setSettings({ userName: v.trim() }); renderSettings(view); } };
  q('#s-mail').onclick = async () => { const v = await promptDialog('Почта', { value: getSettings().userEmail, placeholder: 'you@example.com' }); if (v !== null) { setSettings({ userEmail: v.trim() }); renderSettings(view); } };
  bindSwitches(view, async (id, on, sw) => {
    if (id === 'sw-hanafi') { setSettings({ asrHanafi: on }); rescheduleNotifications(); }
    if (id === 'sw-notify') {
      if (on && !(await askPermission())) { sw.setAttribute('aria-checked', 'false'); return; }
      setSettings({ notify: on }); rescheduleNotifications();
    }
  });
  q('#s-export').onclick = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `svet-backup-${dayKey()}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Резервная копия сохранена');
  };
  q('#s-import').onclick = () => q('#s-file').click();
  q('#s-file').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      importAll(JSON.parse(await f.text()));
      applyReadingVars();
      toast('Данные восстановлены');
      renderSettings(view);
    } catch (err) { toast(err.message || 'Не удалось прочитать файл'); }
  };
  q('#s-reset').onclick = async () => {
    if (await confirmDialog('Сбросить все данные?', 'Закладки, заметки, прогресс Хифза, отметки и настройки будут удалены из этого браузера. Это нельзя отменить.', 'Сбросить', true)) {
      resetAll(); applyReadingVars(); rescheduleNotifications();
      toast('Данные сброшены');
      renderSettings(view);
    }
  };
  return () => { view.onclick = null; };
}
