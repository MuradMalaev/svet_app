import { icon, esc, $, toast, subbar } from '../core/ui.js';
import { getSettings } from '../core/store.js';
import { qiblaBearing, distanceToKaabaKm } from '../core/prayer.js';
import { detectLocation } from './settings.js';

let qTab = 'qibla';
const DIRS = ['север', 'северо-восток', 'восток', 'юго-восток', 'юг', 'юго-запад', 'запад', 'северо-запад'];
const cardinal = (deg) => DIRS[Math.round(deg / 45) % 8];

function dialSvg() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = i * 5, major = a % 90 === 0, mid = a % 30 === 0;
    const r1 = 96, r2 = major ? 80 : mid ? 86 : 90;
    const rad = (a - 90) * Math.PI / 180;
    return `<line x1="${(100 + r1 * Math.cos(rad)).toFixed(1)}" y1="${(100 + r1 * Math.sin(rad)).toFixed(1)}" x2="${(100 + r2 * Math.cos(rad)).toFixed(1)}" y2="${(100 + r2 * Math.sin(rad)).toFixed(1)}" class="${major ? 'tk-m' : 'tk'}"/>`;
  }).join('');
  return `<svg viewBox="0 0 200 200" class="dial-svg" aria-hidden="true"><circle cx="100" cy="100" r="98" class="dial-ring"/>${ticks}
    <text x="100" y="72" class="dial-n">С</text><text x="162" y="104" class="dial-l">В</text><text x="100" y="140" class="dial-l">Ю</text><text x="38" y="104" class="dial-l">З</text></svg>`;
}

export function renderQibla(view) {
  const s = getSettings(), { lat, lon, name } = s.loc;
  const bearing = qiblaBearing(lat, lon), dist = Math.round(distanceToKaabaKm(lat, lon));
  let heading = null, off = null;

  const draw = () => {
    const l = getSettings().loc;
    view.innerHTML = `${subbar('Кибла', '#/')}
      <div class="seg" style="margin-top:12px"><button data-q="qibla" aria-pressed="${qTab === 'qibla'}">${icon('qibla')} Кибла</button><button data-q="mosque" aria-pressed="${qTab === 'mosque'}">${icon('mosque')} Мечети рядом</button></div>
      ${qTab === 'qibla' ? `
        <div class="compass" id="compass">
          <div class="dial" id="dial">${dialSvg()}
            <div class="qmark" id="qmark" style="transform:rotate(${bearing}deg)"><span>${icon('mosque')}</span></div></div>
          <div class="pointer" aria-hidden="true"></div>
        </div>
        <p class="q-status" id="q-status" role="status">${bearing.toFixed(0)}° от севера — ${cardinal(bearing)}</p>
        <div class="card q-info">
          <div class="row"><span class="lbl">Местоположение<small>${esc(l.name)}${l.chosen ? '' : ' (по умолчанию)'}</small></span><button class="btn ghost" id="q-geo" style="min-height:40px;padding:0 14px">${icon('pin')} Определить</button></div>
          <div class="row"><span class="lbl">Направление на Каабу</span><b>${bearing.toFixed(1)}°</b></div>
          <div class="row"><span class="lbl">Расстояние до Каабы</span><b>${dist.toLocaleString('ru-RU')} км</b></div>
        </div>
        <button class="btn" id="q-sensor" style="width:100%;margin-top:12px">${icon('qibla')} Включить компас телефона</button>
        <p class="muted-p small" id="q-hint" style="text-align:center;margin-top:8px">Без датчика циферблат неподвижен: север сверху, значок мечети показывает направление на Каабу. Отойдите от металла и магнитов.</p>`
    : `<div class="card" style="padding:18px;margin-top:16px;text-align:center"><span class="big-ico">${icon('mosque')}</span><h3 class="sub-h">Мечети рядом с вами</h3>
        <p class="muted-p">Откроется карта с поиском мечетей возле выбранного места: ${esc(l.name)}.</p>
        <a class="btn" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/${encodeURIComponent('мечеть')}/@${l.lat},${l.lon},14z">${icon('external')} Открыть карту</a></div>`}`;
  };
  draw();

  const setHeading = (h) => {
    heading = (h + 360) % 360;
    const dial = $('#dial', view);
    if (!dial) return;
    dial.style.transform = `rotate(${-heading}deg)`;
    const diff = Math.abs(((bearing - heading + 540) % 360) - 180);
    const ok = diff <= 5;
    const st = $('#q-status', view);
    if (st) { st.textContent = ok ? 'Вы смотрите в сторону Каабы' : `Поверните телефон: до киблы ${Math.round(((bearing - heading + 360) % 360))}° по часовой`; st.classList.toggle('ok', ok); }
    $('#compass', view)?.classList.toggle('ok', ok);
  };
  const onOrient = (e) => {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if (e.absolute && typeof e.alpha === 'number') h = 360 - e.alpha;
    else if (e.type === 'deviceorientationabsolute' && typeof e.alpha === 'number') h = 360 - e.alpha;
    if (h != null && !Number.isNaN(h)) setHeading(h);
  };
  const startSensor = async () => {
    try {
      const DOE = window.DeviceOrientationEvent;
      if (!DOE) return toast('Датчик ориентации недоступен на этом устройстве');
      if (typeof DOE.requestPermission === 'function') {
        const r = await DOE.requestPermission();
        if (r !== 'granted') return toast('Доступ к датчику не разрешён');
      }
      window.addEventListener('deviceorientationabsolute', onOrient, true);
      window.addEventListener('deviceorientation', onOrient, true);
      off = () => { window.removeEventListener('deviceorientationabsolute', onOrient, true); window.removeEventListener('deviceorientation', onOrient, true); };
      const hint = $('#q-hint', view);
      if (hint) hint.textContent = 'Держите телефон горизонтально. Если стрелка не двигается — датчик недоступен (на компьютере его нет).';
      const b = $('#q-sensor', view); if (b) b.hidden = true;
      setTimeout(() => { if (heading == null) toast('Датчик не отвечает — используйте направление в градусах'); }, 2500);
    } catch { toast('Не удалось включить компас'); }
  };

  view.onclick = async (e) => {
    const q = e.target.closest('[data-q]');
    if (q) { qTab = q.dataset.q; off?.(); off = null; return renderQibla(view); }
    if (e.target.closest('#q-sensor')) return startSensor();
    if (e.target.closest('#q-geo')) { if (await detectLocation()) renderQibla(view); }
  };
  return () => { off?.(); view.onclick = null; };
}
