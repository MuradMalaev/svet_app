/* ───────── Шрифты ───────── */
@font-face{font-family:"Inter";font-weight:400;font-display:swap;src:url(/static/fonts/Inter-Regular.woff) format("woff")}
@font-face{font-family:"Inter";font-weight:500;font-display:swap;src:url(/static/fonts/Inter-Medium.woff) format("woff")}
@font-face{font-family:"Inter";font-weight:600;font-display:swap;src:url(/static/fonts/Inter-SemiBold.woff) format("woff")}
@font-face{font-family:"Inter";font-weight:700;font-display:swap;src:url(/static/fonts/Inter-Bold.woff) format("woff")}
@font-face{font-family:"Lora";font-weight:400 700;font-display:swap;src:url(/static/fonts/Lora.woff) format("woff")}
/* Мусхафный шрифт UthmanicHafs.ttf подключается из templates/index.html, если лежит в static/fonts/ */

/* ───────── Токены ───────── */
:root{
  --bg:#F6F3E8; --bg2:#ECE7D6; --surface:#FFFFFF; --surface2:#FBF9F2;
  --ink:#14251F; --ink2:#41534B; --muted:#5E6E66; --line:rgba(19,56,48,.11);
  --green:#133830; --gold:#C8A97E; --gold-ink:#7E5E2B; --gold-soft:rgba(200,169,126,.18);
  --card-a:#174238; --card-b:#0D2520; --on-card:#F3EBD9; --on-card-2:rgba(243,235,217,.72);
  --shadow:0 1px 2px rgba(19,56,48,.06),0 8px 24px -10px rgba(19,56,48,.18);
  --radius:20px; --tab-h:68px; --maxw:480px;
  --font:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --serif:"Lora",Georgia,"Times New Roman",serif;
  --ar:"UthmanicHafs","KFGQPC Uthmanic Script HAFS","Amiri Quran","Amiri","Noto Naskh Arabic","Scheherazade New","FreeSerif","Traditional Arabic",serif;
  --ar-size:32px; --ru-size:16px;
  color-scheme:light;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --bg:#0B1F1A; --bg2:#081814; --surface:#112E27; --surface2:#143630;
    --ink:#ECE7D8; --ink2:#BFCBC3; --muted:#8FA79D; --line:rgba(236,231,216,.10);
    --gold:#D4B88A; --gold-ink:#D4B88A; --gold-soft:rgba(212,184,138,.16);
    --card-a:#1C4F42; --card-b:#0F2E27; --shadow:0 1px 2px rgba(0,0,0,.3),0 10px 28px -12px rgba(0,0,0,.6);
    color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#0B1F1A; --bg2:#081814; --surface:#112E27; --surface2:#143630;
  --ink:#ECE7D8; --ink2:#BFCBC3; --muted:#8FA79D; --line:rgba(236,231,216,.10);
  --gold:#D4B88A; --gold-ink:#D4B88A; --gold-soft:rgba(212,184,138,.16);
  --card-a:#1C4F42; --card-b:#0F2E27; --shadow:0 1px 2px rgba(0,0,0,.3),0 10px 28px -12px rgba(0,0,0,.6);
  color-scheme:dark;
}

/* ───────── База ───────── */
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg2);color:var(--ink);font:400 16px/1.5 var(--font);-webkit-font-smoothing:antialiased;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23C8A97E' stroke-opacity='.22'%3E%3Crect x='20' y='20' width='32' height='32'/%3E%3Crect x='20' y='20' width='32' height='32' transform='rotate(45 36 36)'/%3E%3C/g%3E%3C/svg%3E")}
button,input,select{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0;padding:0}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px;border-radius:8px}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.shell{position:relative;max-width:var(--maxw);min-height:100dvh;margin:0 auto;background:var(--bg);box-shadow:0 0 0 1px var(--line),0 0 60px rgba(0,0,0,.08)}
#view{padding:0 16px calc(var(--tab-h) + 28px + env(safe-area-inset-bottom));outline:0;animation:rise .35s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ico{width:1em;height:1em;display:block;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}

/* ───────── Шапка ───────── */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:calc(14px + env(safe-area-inset-top)) 0 14px}
.brand{display:flex;align-items:center;gap:10px;font:700 24px/1 var(--serif);letter-spacing:.01em}
.brand-mark{width:30px;height:30px;color:var(--gold-ink)}
.icon-btn{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;font-size:22px;color:var(--ink2);transition:background .2s,transform .15s}
.icon-btn:hover{background:var(--gold-soft)}
.icon-btn:active{transform:scale(.94)}

/* ───────── Карточка намаза ───────── */
.hero{position:relative;overflow:hidden;border-radius:28px;color:var(--on-card);padding:20px 16px 16px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23C8A97E' stroke-opacity='.13'%3E%3Crect x='14' y='14' width='28' height='28'/%3E%3Crect x='14' y='14' width='28' height='28' transform='rotate(45 28 28)'/%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(155deg,var(--card-a),var(--card-b));
  box-shadow:var(--shadow)}
.hero-mosque{position:absolute;right:6px;bottom:140px;width:150px;color:var(--gold);opacity:.14;pointer-events:none}
.hero-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.hero-bell{display:grid;place-items:center;width:40px;height:40px;margin:-8px -6px -8px 0;border-radius:50%;font-size:21px;color:var(--gold);background:rgba(243,235,217,.08);transition:background .2s}
.hero-bell:hover{background:rgba(243,235,217,.16)}
.hero-loc{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--on-card-2)}
.hero-loc .ico{font-size:15px;color:var(--gold)}
.hero-date{display:inline-flex;align-items:center;gap:4px;margin-top:4px;font-size:13px;color:var(--on-card-2)}
.hero-date .ico{font-size:14px;color:var(--gold)}
.hero-link{color:var(--gold);text-decoration:underline;text-underline-offset:2px}
.hero-main{position:relative;margin:22px 0 22px}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
.hero-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:6px}
.hero-name{font:600 38px/1.1 var(--serif)}
.hero-time{font:600 38px/1.1 var(--font);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.hero-count{display:inline-block;margin-top:12px;padding:6px 12px;border-radius:999px;background:rgba(243,235,217,.10);font-size:13px;font-weight:500;font-variant-numeric:tabular-nums}
.times{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:2px}
.t{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 2px 9px;border-radius:16px;color:var(--on-card);transition:background .25s}
.t-name{font-size:11px;font-weight:500;color:var(--on-card-2)}
.t-time{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.t-mark{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;border:1.5px solid rgba(243,235,217,.35);font-size:14px;color:transparent;transition:all .2s}
button.t:hover .t-mark{border-color:var(--gold)}
.t.done .t-mark{background:var(--gold);border-color:var(--gold);color:var(--green)}
.t.sun .t-mark{border:0;color:var(--on-card-2);font-size:18px}
.t.active{background:var(--gold);color:var(--green)}
.t.active .t-name{color:rgba(19,56,48,.75)}
.t.active .t-mark{border-color:rgba(19,56,48,.45)}
.t.active.done .t-mark{background:var(--green);border-color:var(--green);color:var(--gold)}
.t.active.sun .t-mark{color:var(--green)}
.hero-note{position:relative;margin-top:10px;font-size:12px;color:var(--on-card-2)}
.hero-skel{height:300px}

/* ───────── Сетка разделов ───────── */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}
.tile{display:flex;flex-direction:column;align-items:center;gap:12px;padding:18px 6px 14px;border-radius:var(--radius);background:var(--surface);box-shadow:var(--shadow);border:1px solid var(--line);font-size:13px;font-weight:600;text-align:center;transition:transform .15s,box-shadow .2s}
.tile:hover{transform:translateY(-2px)}
.tile:active{transform:scale(.97)}
.tile-ico{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;font-size:26px;color:var(--green);background:linear-gradient(145deg,#E2CBA2,var(--gold));box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
.resume{display:flex;align-items:center;gap:12px;margin-top:16px;padding:14px 16px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)}
.resume .ico{font-size:22px;color:var(--gold-ink)}
.resume small{display:block;font-size:12px;color:var(--muted)}
.resume b{font-weight:600}
.resume .go{margin-left:auto;font-size:18px;color:var(--muted)}

/* ───────── Нижняя навигация ───────── */
.tabbar{position:fixed;z-index:20;bottom:0;left:50%;transform:translateX(-50%);width:min(100%,var(--maxw));height:calc(var(--tab-h) + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);display:grid;grid-template-columns:repeat(5,1fr);background:color-mix(in srgb,var(--surface) 88%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--line)}
.tab{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:11px;font-weight:500;color:var(--muted);transition:color .2s}
.tab .ico{font-size:24px}
.tab[aria-current="page"]{color:var(--green);font-weight:600}
:root[data-theme="dark"] .tab[aria-current="page"]{color:var(--gold)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .tab[aria-current="page"]{color:var(--gold)}}
.tab[aria-current="page"]::before{content:"";position:absolute;top:0;width:28px;height:3px;border-radius:0 0 4px 4px;background:var(--gold)}

/* ───────── Экраны: общее ───────── */
.page-title{font:700 30px/1.15 var(--serif);padding:calc(14px + env(safe-area-inset-top)) 0 4px}
.page-sub{color:var(--muted);font-size:14px}
.seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;padding:4px;border-radius:14px;background:var(--bg2)}
.seg button{padding:9px 10px;border-radius:10px;font-size:14px;font-weight:600;color:var(--muted);transition:all .2s}
.seg button[aria-pressed="true"],.seg button[aria-selected="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.search{position:relative}
.search .ico{position:absolute;left:14px;top:50%;translate:0 -50%;font-size:20px;color:var(--muted)}
.search input{width:100%;height:48px;padding:0 14px 0 44px;border-radius:14px;border:1px solid var(--line);background:var(--surface);outline-offset:2px}
.search input::placeholder{color:var(--muted)}
.empty{margin-top:28px;padding:28px 20px;border-radius:var(--radius);border:1px dashed var(--line);text-align:center;color:var(--ink2)}
.empty h3{font:600 18px var(--serif);margin-bottom:6px;color:var(--ink)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 20px;border-radius:14px;font-weight:600;background:var(--green);color:var(--on-card);transition:transform .15s}
.btn:active{transform:scale(.97)}
.btn.ghost{background:transparent;border:1px solid var(--line);color:var(--ink)}
.skel{border-radius:var(--radius);background:linear-gradient(100deg,var(--bg2) 30%,var(--surface2) 50%,var(--bg2) 70%);background-size:200% 100%;animation:sh 1.3s linear infinite}
@keyframes sh{to{background-position:-200% 0}}

/* ───────── Коран: список ───────── */
.q-head{position:sticky;top:0;z-index:5;margin:0 -16px;padding:0 16px 12px;background:linear-gradient(var(--bg) 82%,transparent)}
.q-head .seg{margin:12px 0}
.surah-list{margin:6px 0 0;padding:0;list-style:none;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);overflow:hidden}
.surah-list li+li{border-top:1px solid var(--line)}
.srow{display:flex;align-items:center;gap:14px;padding:12px 16px;min-height:64px;transition:background .15s}
.srow:hover{background:var(--surface2)}
.star{position:relative;display:grid;place-items:center;flex:none;width:40px;height:40px;color:var(--gold)}
.star svg{position:absolute;inset:0;width:100%;height:100%;fill:var(--gold-soft);stroke:currentColor;stroke-width:1.2;stroke-linejoin:round}
.star span{position:relative;font-size:12px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.sname{flex:1;min-width:0}
.sname b{display:block;font-weight:600}
.sname small{color:var(--muted);font-size:13px}
.sar{font:400 24px/1.2 var(--ar);color:var(--gold-ink);direction:rtl}
.lock{font-size:16px;color:var(--muted)}
.hits{display:grid;gap:10px;margin-top:6px}
.hit{display:block;padding:14px 16px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line)}
.hit small{display:block;margin-bottom:6px;color:var(--gold-ink);font-weight:600;font-size:13px}
.hit .ar{font:400 24px/1.9 var(--ar);direction:rtl;text-align:right}
.hit p{color:var(--ink2);font-size:15px}
mark{background:var(--gold-soft);color:inherit;border-radius:4px;padding:0 2px}

/* ───────── Коран: чтение ───────── */
.r-bar{position:sticky;top:0;z-index:6;margin:0 -16px;padding:calc(8px + env(safe-area-inset-top)) 8px 8px;display:flex;align-items:center;gap:4px;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.r-title{flex:1;text-align:center;line-height:1.2}
.r-title b{display:block;font:600 17px var(--serif)}
.r-title small{font-size:12px;color:var(--muted)}
.s-banner{position:relative;margin:16px 0;padding:22px 16px;border-radius:24px;text-align:center;color:var(--on-card);overflow:hidden;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23C8A97E' stroke-opacity='.13'%3E%3Crect x='14' y='14' width='28' height='28'/%3E%3Crect x='14' y='14' width='28' height='28' transform='rotate(45 28 28)'/%3E%3C/g%3E%3C/svg%3E"),linear-gradient(155deg,var(--card-a),var(--card-b))}
.s-banner .ar{font:400 44px/1.4 var(--ar);color:var(--gold)}
.s-banner h1{font:600 22px var(--serif)}
.s-banner p{margin-top:4px;font-size:13px;color:var(--on-card-2)}
.bism{padding:8px 0 18px;text-align:center;font:400 calc(var(--ar-size)*.95)/1.9 var(--ar);color:var(--ink);direction:rtl}
.ayah{padding:18px 0;border-top:1px solid var(--line);scroll-margin-top:84px}
.ayah.flash{animation:flash 1.8s ease}
@keyframes flash{0%,60%{background:var(--gold-soft)}100%{background:transparent}}
.a-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}
.a-num{display:grid;place-items:center;min-width:32px;height:32px;padding:0 8px;border-radius:999px;background:var(--gold-soft);color:var(--gold-ink);font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}
.a-acts{display:flex;gap:2px}
.a-acts .icon-btn{width:40px;height:40px;font-size:20px;color:var(--muted)}
.a-acts .icon-btn[aria-pressed="true"]{color:var(--gold-ink)}
.a-acts .icon-btn[aria-pressed="true"] .ico{fill:currentColor}
.a-ar{font:400 var(--ar-size)/1.95 var(--ar);direction:rtl;text-align:right;word-spacing:.08em}
.a-ru{margin-top:12px;font-size:var(--ru-size);line-height:1.6;color:var(--ink2)}
.no-ru .a-ru{display:none}
.r-nav{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
.r-nav .btn{background:var(--surface);color:var(--ink);border:1px solid var(--line);font-size:14px}
.r-nav .btn:only-child{grid-column:1/-1}

/* ───────── Шит и тост ───────── */
.sheet-back{position:fixed;inset:0;z-index:40;background:rgba(5,15,12,.5);display:flex;align-items:flex-end;justify-content:center;animation:fade .2s both}
@keyframes fade{from{opacity:0}}
.sheet{width:min(100%,var(--maxw));max-height:86dvh;overflow:auto;padding:12px 20px calc(24px + env(safe-area-inset-bottom));border-radius:28px 28px 0 0;background:var(--bg);animation:up .28s cubic-bezier(.2,.8,.2,1) both}
@keyframes up{from{transform:translateY(40px);opacity:0}}
.sheet-grip{width:40px;height:4px;margin:0 auto 14px;border-radius:4px;background:var(--line)}
.sheet h2{font:600 20px var(--serif);margin-bottom:12px}
.row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-top:1px solid var(--line)}
.row:first-of-type{border-top:0}
.row label,.row .lbl{font-weight:500}
.row small{display:block;color:var(--muted);font-size:13px;font-weight:400}
.range{width:150px;accent-color:var(--gold-ink)}
.switch{position:relative;width:50px;height:30px;flex:none;border-radius:999px;background:var(--bg2);border:1px solid var(--line);transition:background .2s}
.switch::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
.switch[aria-checked="true"]{background:var(--gold)}
.switch[aria-checked="true"]::after{transform:translateX(20px)}
.preview{margin:4px 0 8px;padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}
#toast{position:fixed;z-index:60;left:50%;bottom:calc(var(--tab-h) + 22px + env(safe-area-inset-bottom));translate:-50% 20px;opacity:0;padding:11px 18px;border-radius:999px;background:var(--green);color:var(--on-card);font-size:14px;font-weight:500;pointer-events:none;transition:all .25s;box-shadow:var(--shadow);max-width:90vw}
#toast.show{opacity:1;translate:-50% 0}
:root[data-theme="dark"] #toast{background:var(--gold);color:var(--green)}
#toast.has-action{pointer-events:auto;display:flex;align-items:center;gap:14px}
#toast button{font-weight:700;color:var(--gold);text-decoration:underline}
:root[data-theme="dark"] #toast button{color:var(--green)}

/* ───────── Профиль ───────── */
.card{margin-top:16px;padding:4px 16px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)}
.card-h{margin:24px 4px 0;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.field{min-width:150px;max-width:55%;height:42px;padding:0 10px;border-radius:12px;border:1px solid var(--line);background:var(--bg);}
.row.stack{flex-direction:column;align-items:stretch;gap:8px}
.field.wide{max-width:none;width:100%}
.seg.sm button{padding:7px 10px;font-size:13px}
.about{margin-top:28px;text-align:center;color:var(--muted);font-size:13px}
.danger{color:#B3382C}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .danger{color:#F08A7E}}
:root[data-theme="dark"] .danger{color:#F08A7E}

/* ───────── Заглушки ───────── */
.stub{display:grid;justify-items:center;gap:14px;margin-top:64px;text-align:center;padding:0 12px}
.stub .tile-ico{width:84px;height:84px;font-size:40px}
.stub h1{font:700 28px var(--serif)}
.stub p{max-width:32ch;color:var(--ink2)}

@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}

/* ═════════ Дополнения: общие компоненты ═════════ */
.muted,.muted-p{color:var(--muted)}
.muted-p{font-size:15px;line-height:1.55}
.small{font-size:13px}
.sub-h{margin:16px 0 6px;font:600 16px var(--serif)}
.sub-h .ico{display:inline-block;vertical-align:-3px;margin-right:4px;color:var(--gold-ink)}
.two-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.btn.danger-btn{background:#B3382C;color:#fff}
.btn.ghost.danger{color:#B3382C}
:root[data-theme="dark"] .btn.ghost.danger{color:#F08A7E}
.btn:disabled,.icon-btn:disabled{opacity:.4;pointer-events:none}
.chips,.tag-row{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.chip{display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;background:var(--gold-soft);color:var(--gold-ink);font-size:13px;font-weight:600}
.chip-btn{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface);font-size:14px;font-weight:600;color:var(--ink2);transition:all .2s}
.chip-btn:hover{border-color:var(--gold)}
.chip-btn[aria-expanded="true"]{background:var(--gold-soft);color:var(--gold-ink);border-color:var(--gold)}
.chip-btn .ico{font-size:17px}
.bar{height:8px;border-radius:99px;background:var(--bg2);overflow:hidden}
.bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--gold),#E2CBA2);transition:width .4s}
.ring{display:block}
.ring-bg{fill:none;stroke:var(--bg2);stroke-width:6}
.ring-fg{fill:none;stroke:var(--gold);stroke-width:6;stroke-linecap:round}
.ring text{font:700 14px var(--font);fill:currentColor}
.r-actions{display:flex;justify-content:flex-end;min-width:44px}
.r-actions .icon-btn[aria-pressed="true"]{color:var(--gold-ink);background:var(--gold-soft)}
.r-bar .r-title{display:block;min-width:0;padding:2px 4px;border-radius:12px}
button.r-title:hover{background:var(--gold-soft)}
.r-title small .ico{display:inline-block;vertical-align:-2px;font-size:13px}
.link-row{width:100%;text-align:left;color:inherit}
.link-row>.ico{font-size:18px;color:var(--muted)}
.card>.row:first-child{border-top:0}
.goto-row{display:flex;align-items:center;gap:10px;margin:0 0 10px}
.goto-row .field{min-width:0;max-width:none;flex:1}
.goto-row .btn{flex:2;padding:0 10px}
.act-list{display:grid;gap:4px}
.act-list button{display:flex;align-items:center;gap:14px;width:100%;padding:13px 12px;border-radius:14px;text-align:left;font-weight:500}
.act-list button:hover,.act-list button.sel{background:var(--gold-soft)}
.act-list button .ico{font-size:21px;color:var(--gold-ink)}
.act-list small{display:block;color:var(--muted);font-size:12px}
.act-list button.sel{font-weight:700}
.legend{margin:0 0 10px;padding:0;list-style:none;display:grid;gap:10px}
.legend li{display:flex;align-items:center;gap:12px}
.dot{width:16px;height:16px;border-radius:50%;flex:none;background:currentColor}
.tj-madd6{color:#CC2936}.tj-madd45{color:#E91E8C}.tj-madd246{color:#F57C20}.tj-madd2{color:#D4A72C}
.tj-ghunna{color:#4CAF7D}.tj-qalqala{color:#5BC8F5}.tj-tafkhim{color:#4A90D9}.tj-silent{color:#B0B0B0}
.legend .dot.tj-madd6{background:#CC2936}.legend .dot.tj-madd45{background:#E91E8C}.legend .dot.tj-madd246{background:#F57C20}.legend .dot.tj-madd2{background:#D4A72C}
.legend .dot.tj-ghunna{background:#4CAF7D}.legend .dot.tj-qalqala{background:#5BC8F5}.legend .dot.tj-tafkhim{background:#4A90D9}.legend .dot.tj-silent{background:#B0B0B0}
.legend li{color:var(--ink)}
.sheet .field.wide,.field.wide{height:46px}
textarea.field{height:auto;padding:10px;line-height:1.5;resize:vertical}
.range.wide{width:100%}
.preview .a-ar{text-align:center}

/* ═════════ Миниплеер ═════════ */
.miniplayer{position:fixed;z-index:19;left:50%;transform:translateX(-50%);bottom:calc(var(--tab-h) + 10px + env(safe-area-inset-bottom));width:min(calc(100% - 24px),calc(var(--maxw) - 24px));display:flex;align-items:center;gap:6px;padding:8px 8px 8px 10px;border-radius:20px;color:var(--on-card);background:linear-gradient(155deg,var(--card-a),var(--card-b));box-shadow:var(--shadow)}
.miniplayer[hidden]{display:none}
.mp-main{display:grid;place-items:center;flex:none;width:42px;height:42px;border-radius:50%;font-size:22px;color:var(--green);background:var(--gold)}
.mp-text{flex:1;min-width:0;line-height:1.25}
.mp-text b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp-text small{font-size:12px;color:var(--on-card-2)}
.miniplayer .icon-btn{width:40px;height:40px;color:var(--on-card-2)}
.miniplayer .icon-btn[aria-pressed="true"]{color:var(--gold)}
body.has-player #view{padding-bottom:calc(var(--tab-h) + 92px + env(safe-area-inset-bottom))}
body.has-player #toast{bottom:calc(var(--tab-h) + 82px + env(safe-area-inset-bottom))}

/* ═════════ Коран: дополнения ═════════ */
.chrono-note{margin:8px 2px}
.mrow{display:flex;align-items:center;padding-right:8px}
.mrow .srow{flex:1;min-width:0}
.srow.cur{background:var(--gold-soft)}
.pick-list{max-height:48dvh;overflow:auto}
.ayah.playing{background:var(--gold-soft);margin:0 -16px;padding-left:16px;padding-right:16px;border-radius:16px}
.a-note{display:flex;align-items:flex-start;gap:8px;width:100%;margin-top:10px;padding:10px 12px;border-radius:12px;text-align:left;background:var(--gold-soft);color:var(--gold-ink);font-size:14px}
.a-note .ico{font-size:17px;margin-top:2px}
.flow{padding:16px 0;font:400 var(--ar-size)/2.2 var(--ar);text-align:justify;word-spacing:.08em}
.fa{cursor:pointer;border-radius:8px;transition:background .2s}
.fa:hover,.fa.playing{background:var(--gold-soft)}
.fnum{color:var(--gold-ink);font-size:.7em}
.flow-hint{text-align:center;margin-top:8px}
.about-ar{font:400 38px/1.5 var(--ar);text-align:center;color:var(--gold-ink);margin:8px 0}
.tf-title{font:600 17px var(--serif);margin-bottom:10px}
.tf-ayah{padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--line);font:400 calc(var(--ar-size)*.8)/2 var(--ar);text-align:right;margin-bottom:12px}
.tf-text{white-space:pre-line;font-size:var(--tf-size,16px);line-height:1.65;color:var(--ink2)}
.rel{margin-top:16px;padding-top:4px;border-top:1px solid var(--line)}
.rel-i{display:flex;align-items:center;gap:10px;margin-top:8px;padding:10px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);font-size:14px}
.rel-i .ico{font-size:16px;color:var(--gold-ink)}
.share-canvas{width:100%;border-radius:16px;border:1px solid var(--line)}

/* ═════════ Хифз ═════════ */
.h-tabs{margin:12px 0}
.hifz-hero{display:grid;justify-items:center;gap:4px;margin-top:6px;padding:22px 16px;border-radius:24px;text-align:center;color:var(--on-card);background:linear-gradient(155deg,var(--card-a),var(--card-b));box-shadow:var(--shadow)}
.hifz-ico{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;font-size:28px;color:var(--green);background:linear-gradient(145deg,#E2CBA2,var(--gold))}
.hifz-hero h2{font:600 22px var(--serif)}
.hifz-hero p{font-size:14px;color:var(--on-card-2)}
.hifz-stats{padding:16px}
.plan-row{display:flex;justify-content:space-between;margin-bottom:8px}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
.stats>div{padding:12px;border-radius:14px;background:var(--bg)}
.stats b{display:block;font:700 22px var(--serif);color:var(--gold-ink)}
.stats span{font-size:13px;color:var(--muted)}
.ach-strip{display:flex;gap:10px;overflow-x:auto;padding:12px 2px 6px;scrollbar-width:none}
.ach{display:grid;justify-items:center;gap:6px;flex:none;width:92px;padding:12px 6px;border-radius:16px;background:var(--surface);border:1px solid var(--line);text-align:center;opacity:.5;filter:grayscale(1)}
.ach.on{opacity:1;filter:none;border-color:var(--gold)}
.ach span{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;font-size:22px;color:var(--green);background:var(--gold)}
.ach small{font-size:11px;font-weight:600;line-height:1.25}
.list-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:24px 4px 8px}
.badge{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;margin-left:4px;border-radius:99px;background:#B3382C;color:#fff;font:700 11px var(--font);font-style:normal}
.hifz-list{margin:0;padding:0;list-style:none;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);overflow:hidden}
.hrow{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;min-height:60px}
.hrow+.hrow{border-top:1px solid var(--line)}
.chk{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:50%;border:1.8px solid var(--line);font-size:16px;color:transparent;transition:all .2s}
.hrow .chk{border-color:var(--muted)}
.hrow.done .chk{background:var(--gold);border-color:var(--gold);color:var(--green)}
.hname{flex:1;min-width:0;padding:8px 4px}
.hname b{display:block;font-weight:600}
.hname small{color:var(--muted);font-size:13px}
.chev{color:var(--muted);font-size:18px;padding-right:6px}
.due-row{display:flex;align-items:center;gap:6px;padding:8px 0;border-top:1px solid var(--line)}
.due-row a{flex:1}
.icon-btn.ok{color:#2E8B57}.icon-btn.warn{color:#C26A1B}
.range-card{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 16px;margin-top:12px}
.range-card label,.goto-row label{font-size:13px;color:var(--muted)}
.quiz-card{margin-top:14px;padding:16px;border-radius:24px;color:var(--on-card);background:linear-gradient(155deg,var(--card-a),var(--card-b));box-shadow:var(--shadow)}
.qc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px;color:var(--on-card-2)}
.qc-head .gold{color:var(--gold)}
.icon-btn.big{width:52px;height:52px;border-radius:50%;font-size:26px;background:var(--gold);color:var(--green)}
.quiz-card .a-ar,.qc-ar{text-align:center;color:var(--on-card);margin:12px 0}
.quiz-card .a-ru{color:var(--on-card-2)}
.quiz-card .chip-btn{background:rgba(243,235,217,.1);color:var(--on-card);border-color:transparent}
.play-big{display:grid;place-items:center;width:76px;height:76px;border-radius:50%;font-size:36px;color:var(--green);background:linear-gradient(145deg,#E2CBA2,var(--gold));box-shadow:var(--shadow)}
.opt{display:block;width:100%;margin-top:8px;padding:14px;border-radius:16px;border:1.5px solid var(--line);background:var(--surface);text-align:right;font:400 24px/1.8 var(--ar);transition:all .2s}
.opt:hover:not(:disabled){border-color:var(--gold)}
.opt.right{border-color:#2E8B57;background:rgba(46,139,87,.14)}
.opt.wrong{border-color:#B3382C;background:rgba(179,56,44,.12)}
.cert{display:grid;justify-items:center;gap:6px;padding:12px 0;text-align:center}
.cert .ico{width:72px;height:72px;padding:16px;border-radius:50%;color:var(--green);background:linear-gradient(145deg,#E2CBA2,var(--gold))}
.cert small{color:var(--gold-ink);font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.cert h2{font:700 24px var(--serif)!important;margin:0!important}
.breath{display:grid;place-items:center;height:170px}
.breath-c{width:80px;height:80px;border-radius:50%;background:var(--gold-soft);border:2px solid var(--gold);animation:breath 8s ease-in-out infinite}
@keyframes breath{0%,100%{transform:scale(.7)}50%{transform:scale(1.5)}}
.ccard{margin-top:12px;padding:14px 16px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--line)}
.ccard.th-paradise{border-left-color:#4CAF7D}.ccard.th-hell{border-left-color:#CC2936}.ccard.th-prophets{border-left-color:#4A90D9}.ccard.th-reflect{border-left-color:#D4A72C}.ccard.th-law{border-left-color:#8E5BD6}
.cc-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cc-ar{font:400 var(--ar-size)/2 var(--ar);text-align:right}
.masked{color:var(--muted);letter-spacing:.1em;opacity:.7;user-select:none}
.drop{display:flex;flex-wrap:wrap;gap:6px;min-height:56px;margin:10px 0;padding:8px;border-radius:14px;border:1.5px dashed var(--line);justify-content:flex-start}
.drop.good{border-color:#2E8B57;background:rgba(46,139,87,.1)}.drop.bad{border-color:#B3382C;background:rgba(179,56,44,.08)}
.bank{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-start}
.wd{padding:6px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);font:400 22px/1.6 var(--ar)}
.wd.on{background:var(--gold-soft);border-color:var(--gold)}
.ok-t{color:#2E8B57;font-weight:700;margin-top:8px}.bad-t{color:#B3382C;font-weight:600;margin-top:8px}
.link-btn{color:var(--gold-ink);font-weight:600;font-size:14px;text-decoration:underline}

/* ═════════ Азкары ═════════ */
.zk-progress{display:grid;gap:10px;padding:14px 16px}
.zk-progress small{display:block;color:var(--muted);font-size:13px}
.zk{margin-top:14px;padding:16px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);transition:opacity .25s}
.zk.done{opacity:.62}
.zk header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.zk h3{flex:1;font:600 17px/1.3 var(--serif)}
.zk-chk{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;font-size:26px;color:var(--muted)}
.zk.done .zk-chk{color:var(--gold-ink)}
.cnt{padding:3px 10px;border-radius:99px;background:var(--gold-soft);color:var(--gold-ink);font-size:12px;font-weight:700;white-space:nowrap}
.zk .a-ar{font-size:calc(var(--ar-size)*.85)}
.ref{display:block;margin-bottom:4px}
.zk-tr{margin-top:10px;font-style:italic;color:var(--ink2);font-size:15px}
.zk-virtue{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--gold-soft);color:var(--gold-ink);font-size:14px}
.tasbih{display:grid;justify-items:center;gap:2px;width:100%;margin-top:14px;padding:14px;border-radius:18px;color:var(--on-card);background:linear-gradient(155deg,var(--card-a),var(--card-b));font-size:20px;transition:transform .12s}
.tasbih:active{transform:scale(.97)}
.tasbih b{font:700 34px var(--font);color:var(--gold)}
.tasbih small{font-size:12px;color:var(--on-card-2)}

/* ═════════ Хадисы ═════════ */
.book-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.book{display:grid;gap:2px;padding:12px;border-radius:16px;border:1.5px solid var(--line);background:var(--surface);text-align:left}
.book small{color:var(--muted);font-size:13px}
.book[aria-pressed="true"]{border-color:var(--gold);background:var(--gold-soft)}
.tag{padding:6px 14px;border-radius:99px;border:1px solid var(--line);background:var(--surface);font-size:13px;font-weight:600;color:var(--ink2)}
.tag[aria-pressed="true"]{background:var(--green);color:var(--on-card);border-color:var(--green)}
:root[data-theme="dark"] .tag[aria-pressed="true"]{background:var(--gold);color:var(--green);border-color:var(--gold)}
.tag-row{overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}
.tag{flex:none;white-space:nowrap}
.hd{margin-top:14px;padding:16px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);scroll-margin-top:16px}
.hd.flash{animation:flash 1.8s ease}
.hd-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}
.hd-top h3{font:600 17px/1.35 var(--serif)}
.hd-top .chip{flex:none}
.hd .a-ar{font-size:calc(var(--ar-size)*.8)}
.hd-src{margin-top:10px;color:var(--gold-ink);font-size:13px;font-weight:600}
.hd-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.isnad{margin:12px 0 0;padding:0;list-style:none;border-left:2px solid var(--gold);display:grid;gap:8px}
.isnad li{padding-left:14px}
.isnad small{display:block;color:var(--muted);font-size:12px}
.hd-com{margin-top:12px;padding:12px;border-radius:12px;background:var(--bg);color:var(--ink2);font-size:15px;line-height:1.6}

/* ═════════ 99 имён ═════════ */
.name-wrap{display:grid;gap:12px;margin-top:14px;text-align:center}
.name-hero{display:grid;place-items:center;min-height:200px;border-radius:28px;color:var(--on-card);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23C8A97E' stroke-opacity='.13'%3E%3Crect x='14' y='14' width='28' height='28'/%3E%3Crect x='14' y='14' width='28' height='28' transform='rotate(45 28 28)'/%3E%3C/g%3E%3C/svg%3E"),linear-gradient(155deg,var(--card-a),var(--card-b));box-shadow:var(--shadow)}
.name-ar{font:400 64px/1.5 var(--ar);color:var(--gold)}
.name-tr{font:700 28px var(--serif)}
.name-meaning{color:var(--gold-ink);font-weight:600}
.name-interp{padding:14px 16px;text-align:left;margin-top:0}
.name-interp .sub-h{margin-top:8px}
.name-interp p{color:var(--ink2);line-height:1.6}
.pager{display:flex;align-items:center;justify-content:space-between}
.pager b{font-variant-numeric:tabular-nums}
.seen{display:grid;gap:6px}
.seen small{color:var(--muted)}
.nrow{display:flex;align-items:center;gap:12px;width:100%;padding:10px 4px;border-top:1px solid var(--line);text-align:left}
.nrow.seen{display:flex}
.nr-n{width:28px;color:var(--muted);font-size:13px;font-variant-numeric:tabular-nums}
.nr-ar{font:400 26px/1.4 var(--ar);width:96px;text-align:center;color:var(--gold-ink)}
.nr-t{flex:1;min-width:0}
.nr-t b{display:block;font-weight:600}
.nr-t small{color:var(--muted);font-size:13px}
.nrow.seen .nr-n{color:var(--gold-ink);font-weight:700}

/* ═════════ Трекер ═════════ */
.trk-pray{padding:16px;margin-top:14px}
.trk-head{display:flex;align-items:center;gap:12px}
.trk-head small{display:block;color:var(--muted);font-size:13px}
.trk-ico{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;font-size:22px;color:var(--green);background:linear-gradient(145deg,#E2CBA2,var(--gold))}
.trk-prayers{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:14px}
.trk-p{display:grid;justify-items:center;gap:6px;padding:10px 0;border-radius:14px;font-size:12px;font-weight:600;color:var(--ink2)}
.trk-p span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1.6px solid var(--muted);font-size:16px;color:transparent;transition:all .2s}
.trk-p.done span{background:var(--gold);border-color:var(--gold);color:var(--green)}
.trk-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.trk-cat{display:grid;gap:8px;padding:14px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)}
.trk-cat-h{display:flex;align-items:center;gap:8px}
.trk-cat-h .ico{font-size:20px;color:var(--gold-ink)}
.trk-cat small{color:var(--muted);font-size:13px}
.week{padding:16px}
.week-bars{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:140px}
.wk{position:relative;display:grid;grid-template-rows:1fr auto auto;justify-items:center;height:100%;gap:2px;text-align:center}
.wk i{align-self:end;width:100%;max-width:28px;min-height:3px;border-radius:8px 8px 3px 3px;background:var(--gold);opacity:.75}
.wk.today i{opacity:1;background:var(--green)}
:root[data-theme="dark"] .wk.today i{background:#E2CBA2}
.wk b{font-size:12px}.wk small{font-size:11px;color:var(--muted)}
.quote{margin:24px 8px;text-align:center;font:italic 400 16px/1.6 var(--serif);color:var(--ink2)}
.khatm-card{display:grid;gap:16px;margin-top:14px;padding:18px;border-radius:24px;color:var(--on-card);background:linear-gradient(155deg,var(--card-a),var(--card-b));box-shadow:var(--shadow)}
.khatm-card .ring-bg{stroke:rgba(243,235,217,.15)}
.khatm-card .ring text{fill:var(--on-card)}
.khatm-top{display:flex;align-items:center;gap:16px}
.khatm-top .ring{width:84px;height:84px}
.khatm-top small{display:block;margin-top:2px;color:var(--on-card-2)}
.khatm-page{display:grid;grid-template-columns:1fr 90px;gap:8px;align-items:center}
.khatm-page label{grid-column:1/-1;font-size:14px;color:var(--on-card-2)}
.khatm-page .field{max-width:none;min-width:0;color:var(--ink)}
.khatm-page .btn{grid-column:1/-1;background:var(--gold);color:var(--green)}
.khatm-note{font-size:13px;color:var(--on-card-2)}

/* ═════════ Кибла ═════════ */
.compass{position:relative;display:grid;place-items:center;width:min(100%,320px);aspect-ratio:1;margin:18px auto 8px}
.dial{position:relative;width:100%;height:100%;transition:transform .15s linear}
.dial-svg{position:absolute;inset:0;width:100%;height:100%}
.dial-ring{fill:var(--surface);stroke:var(--gold);stroke-width:1.5}
.tk{stroke:var(--muted);stroke-width:1}.tk-m{stroke:var(--gold-ink);stroke-width:2}
.dial-n{fill:#B3382C;font:700 14px var(--font);text-anchor:middle}
.dial-l{fill:var(--ink2);font:600 12px var(--font);text-anchor:middle}
.qmark{position:absolute;inset:0;pointer-events:none}
.qmark span{position:absolute;top:10%;left:50%;translate:-50% 0;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;font-size:24px;color:var(--green);background:linear-gradient(145deg,#E2CBA2,var(--gold));box-shadow:var(--shadow)}
.pointer{position:absolute;top:-6px;left:50%;translate:-50% 0;width:0;height:0;border:10px solid transparent;border-top:16px solid var(--green)}
:root[data-theme="dark"] .pointer{border-top-color:var(--gold)}
.compass.ok .dial-ring{stroke:#2E8B57;stroke-width:4}
.q-status{text-align:center;font-weight:600;margin:8px 0 12px}
.q-status.ok{color:#2E8B57}
.q-info{padding:4px 16px}
.big-ico{display:inline-grid;place-items:center;width:56px;height:56px;border-radius:50%;font-size:28px;color:var(--green);background:linear-gradient(145deg,#E2CBA2,var(--gold))}

/* ═════════ Расписание ═════════ */
.month-nav{display:flex;align-items:center;justify-content:space-between;margin:12px 0;text-align:center}
.month-nav b{display:block;font:600 18px var(--serif)}
.month-nav small{color:var(--muted);font-size:12px}
.sched-wrap{overflow-x:auto;border-radius:var(--radius);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)}
.sched{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums;text-align:center}
.sched th,.sched td{padding:9px 4px}
.sched thead th{position:sticky;top:0;background:var(--surface2);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.sched tbody tr+tr{border-top:1px solid var(--line)}
.sched tbody th{text-align:left;padding-left:12px;white-space:nowrap}
.sched tbody th b{margin-right:4px}.sched tbody th small{color:var(--muted)}
.sched tr.fri{background:rgba(200,169,126,.08)}
.sched tr.today{background:var(--gold-soft);font-weight:700}
.sched tr.today th b{color:var(--gold-ink)}

/* ═════════ Уточнения ═════════ */
.seg button{display:inline-flex;align-items:center;justify-content:center;gap:6px}
.seg button .ico{font-size:17px}
.sched thead th{top:0}
.sched-wrap{overflow:auto}
#toast{width:max-content;max-width:calc(100% - 32px);border-radius:18px;text-align:center;line-height:1.35}
