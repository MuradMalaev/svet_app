// Напоминания о намазе и «умный будильник» (Фаджр / Тахаджуд / Сухур).
// Веб-ограничение: уведомления срабатывают, пока приложение открыто (вкладка или установленное PWA).
import { getSettings } from './store.js';
import { computeDay, todayIn, shiftDate, tahajjudMs } from './prayer.js';
import { OBLIGATORY } from './meta.js';
import { toast } from './ui.js';

let timers = [];
const supported = () => typeof Notification !== 'undefined';
export const notificationsSupported = supported;
export const notificationState = () => (supported() ? Notification.permission : 'unsupported');

export async function askPermission() {
  if (!supported()) { toast('Этот браузер не поддерживает уведомления'); return false; }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') { toast('Уведомления запрещены в настройках браузера'); return false; }
  try { return (await Notification.requestPermission()) === 'granted'; } catch { return false; }
}

function fire(title, body) {
  try { new Notification(title, { body, icon: '/static/icons/icon-192.png', tag: 'svet-' + title }); } catch { /* не удалось показать */ }
}

export function rescheduleNotifications() {
  timers.forEach(clearTimeout);
  timers = [];
  if (!supported() || Notification.permission !== 'granted') return;
  const s = getSettings(), loc = s.loc, now = Date.now();
  const base = todayIn(loc.tz);
  const days = [0, 1, 2].map((i) => computeDay(shiftDate(base, i), loc, s.method, s.asrHanafi));
  const ev = [];
  for (let i = 0; i < 2; i++) {
    const d = days[i];
    if (s.notify) for (const p of OBLIGATORY) if (d.ms[p.key]) ev.push([d.ms[p.key], `Время намаза: ${p.ru}`, loc.name]);
    if (s.alarm.fajr && d.ms.fajr) ev.push([d.ms.fajr, 'Время Фаджра', 'Наступило время утреннего намаза']);
    if (s.alarm.suhur && d.ms.fajr) ev.push([d.ms.fajr - s.alarm.suhurMin * 60000, 'Сухур', `Осталось ${s.alarm.suhurMin} минут до Фаджра — время сухура`]);
    if (s.alarm.tahajjud) {
      const t = tahajjudMs(d, days[i + 1]);
      if (t) ev.push([t, 'Тахаджуд', 'Наступила последняя треть ночи — время тахаджуда']);
    }
  }
  for (const [ms, title, body] of ev) {
    const wait = ms - now;
    if (wait > 0 && wait < 2 ** 31 - 1) timers.push(setTimeout(() => fire(title, body), wait));
  }
  // раз в сутки пересчитываем расписание заново
  const next = new Date(); next.setHours(24, 1, 0, 0);
  timers.push(setTimeout(rescheduleNotifications, next - now));
}
