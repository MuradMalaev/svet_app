import { icon, esc, $, $$, toast, copyText, hl, emptyState, plural } from '../core/ui.js';
import { getHadiths } from '../core/data.js';
import { HADITH_TAGS, HADITH_BOOKS } from '../core/meta.js';

let book = 'bukhari', tag = 'Все', query = '';

/** param — «bookId:number» из ссылки в тафсире: открываем нужный хадис */
export async function renderHadith(view, param) {
  let focus = null;
  if (param) {
    const [b, n] = decodeURIComponent(param).split(':');
    if (HADITH_BOOKS.some((x) => x.id === b)) { book = b; tag = 'Все'; query = ''; focus = `${b}-${n}`; }
  }
  view.innerHTML = `<h1 class="page-title">Хадисы</h1><div id="hbox"><div class="skel" style="height:300px;margin-top:16px"></div></div>`;
  const box = $('#hbox', view);
  let all;
  try { all = await getHadiths(); } catch { box.innerHTML = emptyState('Не удалось загрузить хадисы', 'Обновите страницу.'); return; }
  const open = new Set();   // раскрытые блоки: "bukhari-1:isnad"

  box.innerHTML = `
    <div class="book-row">${HADITH_BOOKS.map((b) => {
    const cnt = all.filter((h) => h.bookId === b.id).length;
    return `<button class="book" data-b="${b.id}" aria-pressed="${book === b.id}"><b>${esc(b.ru)}</b><small>${cnt} ${plural(cnt, 'хадис', 'хадиса', 'хадисов')}</small></button>`;
  }).join('')}</div>
    <div class="search" style="margin-top:12px">${icon('search')}<input id="hq" type="search" placeholder="Слово или фраза (рус./араб.)" value="${esc(query)}" autocomplete="off" aria-label="Поиск по хадисам"></div>
    <div class="tag-row" role="group" aria-label="Тема">${HADITH_TAGS.map((t) => `<button class="tag" data-t="${esc(t)}" aria-pressed="${tag === t}">${esc(t)}</button>`).join('')}</div>
    <div id="hlist"></div>`;
  const list = $('#hlist', box);

  const paint = () => {
    const q = query.trim().toLowerCase();
    const items = all.filter((h) => {
      const okBook = q ? true : h.bookId === book;       // при активном поиске ищем по всем книгам
      const okTag = tag === 'Все' || h.tag.toLowerCase() === tag.toLowerCase();
      const okQ = !q || h.title.toLowerCase().includes(q) || h.translationRu.toLowerCase().includes(q) || h.textAr.includes(query.trim());
      return okBook && okTag && okQ;
    });
    if (!items.length) { list.innerHTML = emptyState('Ничего не найдено', 'Измените запрос или тему.'); return; }
    list.innerHTML = (q ? `<p class="page-sub" style="margin:10px 2px">Найдено: ${items.length} · поиск идёт по обеим книгам</p>` : '') + items.map((h) => {
      const id = `${h.bookId}-${h.number}`;
      const isn = open.has(id + ':isnad'), com = open.has(id + ':com');
      return `<article class="hd" id="h-${id}" data-id="${id}">
        <div class="hd-top"><h3>${hl(h.title, q)}</h3><span class="chip">${esc(h.tag)}</span></div>
        <div class="a-ar" lang="ar" dir="rtl">${esc(h.textAr)}</div>
        <p class="a-ru">${hl(h.translationRu, q)}</p>
        <p class="hd-src">${esc(h.source)} · ${esc(h.grade)}</p>
        <div class="hd-acts">
          ${h.isnad?.length ? `<button class="chip-btn" data-x="isnad" aria-expanded="${isn}">Иснад</button>` : ''}
          ${h.commentary ? `<button class="chip-btn" data-x="com" aria-expanded="${com}">Комментарий</button>` : ''}
          <button class="chip-btn" data-x="copy">${icon('copy')} Копировать</button></div>
        ${isn ? `<ol class="isnad">${h.isnad.map((t) => `<li><b>${esc(t.name)}</b><small>${esc(t.gen)}</small></li>`).join('')}</ol>` : ''}
        ${com ? `<p class="hd-com">${esc(h.commentary)}</p>` : ''}
      </article>`;
    }).join('');
  };
  paint();

  let t;
  $('#hq', box).oninput = (e) => { query = e.target.value; clearTimeout(t); t = setTimeout(paint, 160); };
  box.onclick = async (e) => {
    const b = e.target.closest('[data-b]');
    if (b) { book = b.dataset.b; query = ''; $('#hq', box).value = ''; $$('[data-b]', box).forEach((x) => x.setAttribute('aria-pressed', x === b)); return paint(); }
    const tg = e.target.closest('[data-t]');
    if (tg) { tag = tg.dataset.t; $$('[data-t]', box).forEach((x) => x.setAttribute('aria-pressed', x === tg)); return paint(); }
    const x = e.target.closest('[data-x]');
    if (!x) return;
    const id = x.closest('[data-id]').dataset.id, h = all.find((v) => `${v.bookId}-${v.number}` === id);
    if (x.dataset.x === 'copy') {
      return toast((await copyText(`${h.title}\n\n${h.textAr}\n\n${h.translationRu}\n\n${h.source}`)) ? 'Хадис скопирован' : 'Не удалось скопировать');
    }
    const k = id + ':' + x.dataset.x;
    open.has(k) ? open.delete(k) : open.add(k);
    const y = window.scrollY; paint(); window.scrollTo(0, y);
  };
  if (focus) {
    const el = $('#h-' + focus, box);
    if (el) requestAnimationFrame(() => { el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); });
  }
  return () => { box.onclick = null; };
}
