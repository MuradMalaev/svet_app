import { icon, esc, $, $$, toast, progressBar, emptyState } from '../core/ui.js';
import { getAzkarToday, toggleAzkar, bumpAzkar } from '../core/store.js';
import { getAzkar, getQuran } from '../core/data.js';
import { AZKAR_CATS } from '../core/meta.js';
import { arDigits } from '../core/ui.js';
import { plural } from '../core/ui.js';

let cat = 'morning';

/** Азкар-«чтение суры» подтягивает текст из Корана (в исходном JSON там только подсказка) */
function resolveRef(item, surahs) {
  if (!item.ref || !surahs) return item;
  const s = surahs[item.ref.surah - 1];
  if (!s) return item;
  const parts = [], ru = [];
  for (let a = item.ref.from; a <= item.ref.to; a++) {
    parts.push(`${s.ayahs[a - 1][0]} ﴿${arDigits(a)}﴾`);
    ru.push(s.ayahs[a - 1][1]);
  }
  return { ...item, textAr: parts.join(' '), translationRu: ru.join(' '), refLabel: `${s.ru}, ${item.ref.from === item.ref.to ? 'аят ' + item.ref.from : 'аяты ' + item.ref.from + '–' + item.ref.to}` };
}

export async function renderAzkar(view) {
  view.innerHTML = `<h1 class="page-title">Азкары</h1>
    <div class="seg" role="tablist" aria-label="Время">${AZKAR_CATS.map((c) => `<button role="tab" data-c="${c.id}" aria-selected="${cat === c.id}">${c.ru}</button>`).join('')}</div>
    <div id="zk"><div class="skel" style="height:300px;margin-top:16px"></div></div>`;
  $$('[data-c]', view).forEach((b) => { b.onclick = () => { cat = b.dataset.c; renderAzkar(view); }; });
  const host = $('#zk', view);
  let data, surahs = null;
  try { data = await getAzkar(); } catch { host.innerHTML = emptyState('Не удалось загрузить азкары', 'Обновите страницу.'); return; }
  try { surahs = await getQuran(); } catch { /* ссылки на суры покажутся без текста */ }

  const total = AZKAR_CATS.reduce((t, c) => t + (data[c.id]?.length || 0), 0);
  const draw = () => {
    const today = getAzkarToday();
    const doneCount = AZKAR_CATS.reduce((t, c) => t + (data[c.id] || []).filter((i) => today.done[`${c.id}_${i.id}`]).length, 0);
    const list = (data[cat] || []).map((raw) => resolveRef(raw, surahs));
    host.innerHTML = `
      <div class="card zk-progress"><div><b>Мой прогресс</b><small>Сегодня выполнено ${doneCount} из ${total} ${plural(total, 'азкара', 'азкаров', 'азкаров')}</small></div>${progressBar(total ? doneCount / total : 0, 'Прогресс азкаров за день')}</div>
      ${list.length ? list.map((it) => {
    const key = `${cat}_${it.id}`, done = !!today.done[key], n = today.counts[key] || 0;
    return `<article class="zk ${done ? 'done' : ''}" data-k="${key}" data-max="${it.count}">
        <header><button class="zk-chk" data-x="chk" aria-pressed="${done}" aria-label="${done ? 'Снять отметку' : 'Отметить выполненным'}: ${esc(it.title)}">${icon(done ? 'checkc' : 'circle')}</button>
          <h3>${esc(it.title)}</h3><span class="cnt">${it.count} ${plural(it.count, 'раз', 'раза', 'раз')}</span></header>
        ${it.refLabel ? `<small class="muted ref">${esc(it.refLabel)}</small>` : ''}
        <div class="a-ar" lang="ar" dir="rtl">${esc(it.textAr)}</div>
        ${it.translit ? `<p class="zk-tr">${esc(it.translit)}</p>` : ''}
        ${it.translationRu ? `<p class="a-ru">${esc(it.translationRu)}</p>` : ''}
        ${it.virtue ? `<p class="zk-virtue">${esc(it.virtue)}</p>` : ''}
        ${it.count > 1 && !done ? `<button class="tasbih" data-x="bump" aria-label="Отсчитать: ${esc(it.title)}"><b>${n}</b> / ${it.count}<small>Нажимайте после каждого повторения</small></button>` : ''}
      </article>`;
  }).join('') : emptyState('Данные не найдены', '')}`;
  };
  draw();
  view.onclick = (e) => {
    const x = e.target.closest('[data-x]');
    if (!x) return;
    const card = x.closest('[data-k]');
    const key = card.dataset.k;
    if (x.dataset.x === 'chk') { toggleAzkar(key); } else {
      const r = bumpAzkar(key, +card.dataset.max);
      if (r.done) toast('Азкар выполнен');
    }
    const y = window.scrollY;
    draw();
    window.scrollTo(0, y);
  };
  return () => { view.onclick = null; };
}
