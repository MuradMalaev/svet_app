import { icon, esc, $, toast, openSheet, subbar, emptyState, clamp, progressBar } from '../core/ui.js';
import { getNames } from '../core/data.js';
import { getNamesViewed, markNameViewed, getNamesFav, toggleNameFav } from '../core/store.js';

let idx = 0;

export async function renderNames(view, param) {
  view.innerHTML = '<div class="skel" style="height:400px;margin-top:70px"></div>';
  let names;
  try { names = await getNames(); } catch { view.innerHTML = emptyState('Не удалось загрузить имена', 'Обновите страницу.'); return; }
  if (param && +param >= 1 && +param <= names.length) idx = +param - 1;
  idx = clamp(idx, 0, names.length - 1);

  const draw = () => {
    const n = names[idx];
    markNameViewed(n.number);
    const fav = getNamesFav().has(n.number), viewed = getNamesViewed().size;
    view.innerHTML = `${subbar('99 имён Аллаха', '#/', `<button class="icon-btn" id="n-list" aria-label="Все имена">${icon('list')}</button><button class="icon-btn" id="n-favs" aria-label="Избранные имена">${icon('heart')}</button>`)}
      <div class="name-wrap" id="swipe">
        <button class="btn ${fav ? '' : 'ghost'}" id="n-fav" style="width:100%">${icon('heart')} ${fav ? 'В избранном' : 'Добавить в избранное'}</button>
        <div class="name-hero"><div class="name-ar" lang="ar">${esc(n.arabic)}</div></div>
        <h1 class="name-tr">${esc(n.transliteration)}</h1>
        <p class="name-meaning">${esc(n.translation)}</p>
        <div class="card name-interp"><h3 class="sub-h">Значение</h3><p>${esc(n.interpretation)}</p></div>
        <div class="pager"><button class="icon-btn" id="n-prev" ${idx === 0 ? 'disabled' : ''} aria-label="Предыдущее имя">${icon('back')}</button>
          <b>${idx + 1} / ${names.length}</b>
          <button class="icon-btn" id="n-next" ${idx === names.length - 1 ? 'disabled' : ''} aria-label="Следующее имя">${icon('forward')}</button></div>
        <div class="seen">${progressBar(viewed / names.length, 'Изучено имён')}<small>Изучено имён: ${viewed} из ${names.length}</small></div>
      </div>`;
  };
  draw();
  const go = (d) => { const j = idx + d; if (j < 0 || j >= names.length) return; idx = j; draw(); window.scrollTo(0, 0); };

  const listSheet = (title, items, empty) => openSheet(title, `
    ${items === null ? '<div class="search" style="margin-bottom:10px">' + icon('search') + '<input id="nq" type="search" placeholder="Имя или значение" autocomplete="off"></div>' : ''}
    <div id="nl"></div>`, (root, close) => {
    const nl = $('#nl', root), q = $('#nq', root);
    const paint = () => {
      const v = (q?.value || '').trim().toLowerCase();
      const src = items === null ? names : names.filter((x) => getNamesFav().has(x.number));
      const rows = src.filter((x) => !v || x.transliteration.toLowerCase().includes(v) || x.translation.toLowerCase().includes(v) || String(x.number) === v);
      const viewed = getNamesViewed();
      nl.innerHTML = rows.length ? rows.map((x) => `<button class="nrow ${viewed.has(x.number) ? 'seen' : ''}" data-i="${x.number - 1}"><span class="nr-n">${x.number}</span><span class="nr-ar" lang="ar">${esc(x.arabic)}</span><span class="nr-t"><b>${esc(x.transliteration)}</b><small>${esc(x.translation)}</small></span></button>`).join('')
        : `<p class="muted-p" style="padding:16px 0">${empty}</p>`;
    };
    paint();
    q?.addEventListener('input', paint);
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) { idx = +b.dataset.i; close(); draw(); window.scrollTo(0, 0); }
    });
  });

  view.onclick = (e) => {
    if (e.target.closest('#n-prev')) return go(-1);
    if (e.target.closest('#n-next')) return go(1);
    if (e.target.closest('#n-fav')) {
      const on = toggleNameFav(names[idx].number);
      toast(on ? 'Добавлено в избранное' : 'Убрано из избранного');
      return draw();
    }
    if (e.target.closest('#n-list')) return listSheet('Все имена', null, '');
    if (e.target.closest('#n-favs')) return listSheet('Избранные имена', [], 'Пока пусто — нажмите «Добавить в избранное» на понравившемся имени');
  };

  // Свайп влево/вправо
  let x0 = null, y0 = null;
  view.ontouchstart = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
  view.ontouchend = (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };
  return () => { view.onclick = null; view.ontouchstart = null; view.ontouchend = null; };
}
