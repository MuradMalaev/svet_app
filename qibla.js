import { icon } from './icons.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const pad2 = (n) => String(n).padStart(2, '0');
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const arDigits = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[d]);

/** Склонение: plural(5, 'аят', 'аята', 'аятов') */
export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

let toastTimer;
/** Всплывающее сообщение. action = { label, onClick } — например «Отменить». */
export function toast(msg, action) {
  const el = $('#toast');
  if (!el) return;
  el.innerHTML = '';
  el.append(document.createTextNode(msg));
  if (action) {
    const b = document.createElement('button');
    b.textContent = action.label;
    b.onclick = () => { el.classList.remove('show'); action.onClick(); };
    el.append(b);
  }
  el.classList.toggle('has-action', !!action);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), action ? 5000 : 2200);
}

export function starPath(cx, cy, R, r, n = 8) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2, rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}
const STAR = starPath(20, 20, 19, 14.6);
export const starBadge = (n) => `<span class="star"><svg viewBox="0 0 40 40" aria-hidden="true"><polygon points="${STAR}"/></svg><span>${n}</span></span>`;

/* ───── Нижняя панель (sheet) ───── */
let sheetClose = null;
/**
 * Открывает нижнюю панель. opts.done === false — без кнопки «Готово».
 * onMount(root, close) — навешивание обработчиков. Возвращает функцию закрытия.
 */
export function openSheet(title, html, onMount, opts = {}) {
  closeSheet();
  const root = $('#sheet-root');
  root.innerHTML = `<div class="sheet-back"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-grip"></div>${title ? `<h2>${esc(title)}</h2>` : ''}<div class="sheet-body">${html}</div>
    ${opts.done === false ? '' : '<button class="btn sheet-done" style="width:100%;margin-top:12px" data-close>Готово</button>'}</div></div>`;
  const back = root.firstElementChild;
  const prevFocus = document.activeElement;
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => {
    if (sheetClose !== close) return;
    sheetClose = null;
    root.innerHTML = '';
    document.removeEventListener('keydown', onKey);
    opts.onClose?.();
    prevFocus?.focus?.();
  };
  sheetClose = close;
  back.addEventListener('click', (e) => {
    if (e.target === back || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', onKey);
  onMount?.($('.sheet', root), close);
  return close;
}
export function closeSheet() { sheetClose?.(); }

/** Диалог подтверждения. Возвращает Promise<boolean>. */
export function confirmDialog(title, text, okLabel = 'Да', danger = false) {
  return new Promise((resolve) => {
    let answered = false;
    openSheet(title, `<p class="muted-p">${esc(text)}</p>
      <div class="two-btns"><button class="btn ghost" data-a="no">Отмена</button><button class="btn ${danger ? 'danger-btn' : ''}" data-a="yes">${esc(okLabel)}</button></div>`,
    (root, close) => {
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        answered = true;
        resolve(b.dataset.a === 'yes');
        close();
      });
    }, { done: false, onClose: () => { if (!answered) resolve(false); } });
  });
}

/** Диалог ввода текста. Возвращает Promise<string|null>. */
export function promptDialog(title, { value = '', placeholder = '', multiline = false, okLabel = 'Сохранить', extra = '' } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    const field = multiline
      ? `<textarea class="field wide" rows="5" id="p-in" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
      : `<input class="field wide" id="p-in" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
    openSheet(title, `${field}<div class="two-btns" style="margin-top:12px">
      ${extra ? `<button class="btn ghost danger" data-a="extra">${esc(extra)}</button>` : '<button class="btn ghost" data-a="no">Отмена</button>'}
      <button class="btn" data-a="yes">${esc(okLabel)}</button></div>`,
    (root, close) => {
      const input = $('#p-in', root);
      setTimeout(() => input.focus(), 50);
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        answered = true;
        resolve(b.dataset.a === 'yes' ? input.value : b.dataset.a === 'extra' ? '' : null);
        close();
      });
    }, { done: false, onClose: () => { if (!answered) resolve(null); } });
  });
}

export function switchEl(on, id, label) {
  return `<button class="switch" role="switch" aria-checked="${!!on}" id="${id}" aria-label="${esc(label)}"></button>`;
}
/** Универсальная обработка кликов по переключателям внутри root. */
export function bindSwitches(root, onChange) {
  if (root._swh) root.removeEventListener('click', root._swh);
  root._swh = (e) => {
    const sw = e.target.closest('.switch');
    if (!sw || !root.contains(sw)) return;
    const on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on);
    onChange(sw.id, on, sw);
  };
  root.addEventListener('click', root._swh);
}

export const progressBar = (frac, label = '') =>
  `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(clamp(frac, 0, 1) * 100)}" ${label ? `aria-label="${esc(label)}"` : ''}><i style="width:${(clamp(frac, 0, 1) * 100).toFixed(1)}%"></i></div>`;

export const ringSvg = (frac, text, size = 64) => {
  const r = 26, c = 2 * Math.PI * r, f = clamp(frac, 0, 1);
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="${esc(text)}"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 32 32)"/><text x="32" y="36.5" text-anchor="middle">${esc(text)}</text></svg>`;
};

/** Шапка вложенного экрана: стрелка назад, заголовок, действия справа. */
export function subbar(title, back = '#/', actions = '') {
  return `<div class="r-bar"><a class="icon-btn" href="${back}" aria-label="Назад">${icon('back')}</a>
    <div class="r-title"><b>${esc(title)}</b></div><div class="r-actions">${actions || '<span class="icon-btn" aria-hidden="true"></span>'}</div></div>`;
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* нет доступа к буферу */ }
    ta.remove();
    return ok;
  }
}

export function emptyState(title, text, btn = '') {
  return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(text)}</p>${btn}</div>`;
}

export function hl(text, q) {
  const t = String(text ?? '');
  if (!q) return esc(t);
  const i = t.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return esc(t);
  return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length));
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export { icon };
