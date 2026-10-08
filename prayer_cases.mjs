import { esc, $, subbar, icon, emptyState } from '../core/ui.js';
import { getSettings } from '../core/store.js';
import { computeDay, todayIn, toHijri } from '../core/prayer.js';
import { MONTHS_NOM, WEEKDAYS_SHORT, HIJRI_MONTHS } from '../core/meta.js';

let shift = 0;   // смещение в месяцах от текущего

export function renderSchedule(view) {
  const s = getSettings();
  const t = todayIn(s.loc.tz);
  let y = t.y, m = t.m + shift;
  while (m < 1) { m += 12; y--; }
  while (m > 12) { m -= 12; y++; }
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const rows = [];
  for (let d = 1; d <= days; d++) {
    const r = computeDay({ y, m, d }, s.loc, s.method, s.asrHanafi);
    const wd = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
    const isToday = y === t.y && m === t.m && d === t.d;
    rows.push(`<tr class="${isToday ? 'today' : ''} ${wd === 4 ? 'fri' : ''}"><th scope="row"><b>${d}</b><small>${WEEKDAYS_SHORT[wd]}</small></th>
      <td>${r.text.fajr}</td><td>${r.text.dhuhr}</td><td>${r.text.asr}</td><td>${r.text.maghrib}</td><td>${r.text.isha}</td></tr>`);
  }
  const h1 = toHijri({ y, m, d: 1 }), h2 = toHijri({ y, m, d: days });
  const hijriRange = h1.month === h2.month ? `${HIJRI_MONTHS[h1.month - 1]} ${h1.year}` : `${HIJRI_MONTHS[h1.month - 1]} – ${HIJRI_MONTHS[h2.month - 1]} ${h2.year}`;
  view.innerHTML = `${subbar('Расписание намаза', '#/')}
    <div class="month-nav"><button class="icon-btn" id="m-prev" aria-label="Предыдущий месяц">${icon('back')}</button>
      <div><b>${MONTHS_NOM[m - 1]} ${y}</b><small>${esc(hijriRange)} · ${esc(s.loc.name)}</small></div>
      <button class="icon-btn" id="m-next" aria-label="Следующий месяц">${icon('forward')}</button></div>
    ${days ? `<div class="sched-wrap"><table class="sched"><thead><tr><th scope="col"></th><th scope="col">Фаджр</th><th scope="col">Зухр</th><th scope="col">Аср</th><th scope="col">Магриб</th><th scope="col">Иша</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>` : emptyState('Нет данных', '')}
    <p class="muted-p small" style="margin-top:12px">Метод и мазхаб Асра — в настройках. Дата хиджры табличная и может отличаться от объявленной по луне на 1–2 дня.</p>`;
  $('#m-prev', view).onclick = () => { shift--; renderSchedule(view); };
  $('#m-next', view).onclick = () => { shift++; renderSchedule(view); };
  requestAnimationFrame(() => $('tr.today', view)?.scrollIntoView({ block: 'center' }));
  return () => { shift = 0; };
}
