/**
 * Static site builder: reads src/data/conference-data.js and writes dist/.
 * Run: npm run build   (or: node build.js)
 *
 * Builds two languages from the same data:
 *   dist/            → ภาษาไทย
 *   dist/en/         → English
 * The ไทย/EN switch in the gray utility bar links to the same page in the other language.
 *
 * Layout follows cdti.ac.th (top bar, 2-row header, banner + quick links, news rows,
 * navy band with photo cards); content structure follows ECTI-FIT + CCAT.
 */
const fs = require("fs");
const path = require("path");
const D = require("./src/data/conference-data.js");

const SRC = path.join(__dirname, "src");
const DIST = path.join(__dirname, "dist");
const IMG = D.images;
const LANGS = ["th", "en"];

/* ---------- build context (set per page) ---------- */
let LANG = "th";   // current language
let CUR = "home";  // current page key

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// pick the current language from { th, en }, or return a plain string as-is
const L = (v) => (v && typeof v === "object" && ("th" in v || "en" in v) ? (v[LANG] ?? v.th ?? v.en) : v);
// inline UI string
const U = (th, en) => (LANG === "en" ? en : th);
// escape + mark placeholders ([...], รอประกาศ, TBA, ---, --:--) so they render faded
const t = (v) => {
  const raw = String(L(v) ?? "");
  if (/^(TBA|รอประกาศ|---|--:--)$/.test(raw.trim())) return `<span class="ph">${esc(raw)}</span>`;
  return esc(raw).replace(/\[[^\]]+\]/g, (m) => `<span class="ph">${m}</span>`);
};
const plain = (v) => String(L(v) ?? "").replace(/[\[\]]/g, "");
const join = (arr, fn) => arr.map(fn).join("");

/* ---------- paths ---------- */
const PAGES = {
  home: { slug: "" , th: "หน้าแรก", en: "Home" },
  about: { slug: "about", th: "กฎบัตรงานประชุม", en: "Conference Charter", img: "panel",
    desc: { th: "เป้าหมาย ขอบเขต และแผนงาน 9 สัปดาห์", en: "Goals, scope and 9-week roadmap" } },
  committee: { slug: "committee", th: "คณะผู้จัดงาน", en: "Organizing Committee", img: "research",
    desc: { th: "ผังองค์กรและหน้าที่ 6 ทีม", en: "Organization chart and 6 teams" } },
  archive: { slug: "archive", th: "งานที่ผ่านมา", en: "Past Conferences", img: "hero",
    desc: { th: "งานประชุมครั้งก่อน ๆ", en: "Previous editions" } },
  cfp: { slug: "cfp", th: "ประกาศรับบทความ", en: "Call for Papers", img: "poster",
    desc: { th: "หัวข้อ ขอบเขต และกำหนดการ", en: "Topics, scope and dates" } },
  submission: { slug: "submission", th: "การส่งบทความ", en: "Paper Submission", img: "research",
    desc: { th: "รูปแบบบทความ เทมเพลต และระบบส่ง", en: "Format, templates and system" } },
  program: { slug: "program", th: "กำหนดการ", en: "Program", img: "panel" },
  registration: { slug: "registration", th: "ลงทะเบียน", en: "Registration", img: "hero" },
  venue: { slug: "venue", th: "สถานที่จัดงาน", en: "Venue", nav: { th: "สถานที่", en: "Venue" }, img: "hero" },
  contact: { slug: "contact", th: "ติดต่อเรา", en: "Contact", img: "research" }
};
const pageName = (k) => (LANG === "en" ? PAGES[k].en : PAGES[k].th);

// relative path from the current page back to dist/
function ROOT() {
  const depth = (LANG === "en" ? 1 : 0) + (CUR === "home" ? 0 : 1);
  return depth === 0 ? "." : Array(depth).fill("..").join("/");
}
const href = (key, lang = LANG) => `${ROOT()}/${lang === "en" ? "en/" : ""}${PAGES[key].slug ? PAGES[key].slug + "/" : ""}index.html`;
const asset = (p) => `${ROOT()}/${p}`;
// full URL for search engines (canonical / hreflang)
const absHref = (key, lang) => `${D.course.siteUrl.replace(/\/$/, "")}/${lang === "en" ? "en/" : ""}${PAGES[key].slug ? PAGES[key].slug + "/" : ""}`;
// Read width/height from the image file so the browser can reserve space (no layout shift).
// Works for JPEG and PNG; swapping a photo in src/img keeps the numbers correct.
const sizeCache = {};
function imgSize(file) {
  if (sizeCache[file]) return sizeCache[file];
  const b = fs.readFileSync(path.join(SRC, "img", file));
  let w = 0, h = 0;
  if (b[0] === 0x89 && b[1] === 0x50) { w = b.readUInt32BE(16); h = b.readUInt32BE(20); }
  else if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return (sizeCache[file] = { w, h });
}
// decorative = true → empty alt (image only sets mood behind text); priority = above-the-fold image
const img = (key, { cls = "", lazy = true, decorative = false, priority = false } = {}) => {
  const { w, h } = imgSize(IMG[key].file);
  return `<img${cls ? ` class="${cls}"` : ""} src="${asset("img/" + IMG[key].file)}" alt="${decorative ? "" : esc(L(IMG[key].alt))}"${w ? ` width="${w}" height="${h}"` : ""}${lazy ? ' loading="lazy"' : ""}${priority ? ' fetchpriority="high"' : ""} decoding="async">`;
};

/* ---------- icons ---------- */
const I = (d, size = 20, sw = 1.8) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a7 7 0 0 1 4 6.5"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  chip: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0"/><circle cx="12" cy="19.5" r="1"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
  archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="m15 5 4 4"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 15h4"/>',
  presentation: '<path d="M2 3h20M4 3v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3M12 16v5M8 21h8"/><path d="m8 11 3-3 2 2 3-3"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  trend: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/><path d="M16 8h4v4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
};
const icon = (name, size, sw) => I(ICON[name] || ICON.info, size, sw);
const TAG = { oral: { th: "บรรยาย", en: "Oral" }, poster: { th: "โปสเตอร์", en: "Poster" }, talk: { th: "พิธีการ", en: "Plenary" }, break: { th: "พัก", en: "Break" } };

/* ---------- navigation ---------- */
function langSwitch() {
  return `<div class="lang-switch" role="group" aria-label="${U("เลือกภาษา", "Choose language")}">${icon("globe", 15)}
      <a href="${href(CUR, "th")}" lang="th" hreflang="th"${LANG === "th" ? ' aria-current="true"' : ""}>ไทย</a>
      <a href="${href(CUR, "en")}" lang="en" hreflang="en"${LANG === "en" ? ' aria-current="true"' : ""}>EN</a>
    </div>`;
}

function navHtml() {
  const cur = (k) => (CUR === k ? ' aria-current="page"' : "");
  const link = (key) => `<li class="nav-item"><a class="nav-link" href="${href(key)}"${cur(key)}>${PAGES[key].nav ? L(PAGES[key].nav) : pageName(key)}</a></li>`;
  const drop = (label, keys, id) => `<li class="nav-item${keys.includes(CUR) ? " is-current" : ""}">
      <button class="nav-link" type="button" aria-expanded="false" aria-controls="dd-${id}">${label}${icon("chevron", 16)}</button>
      <div class="dropdown" id="dd-${id}">${join(keys, (k) => `<a href="${href(k)}"${cur(k)}><strong>${pageName(k)}</strong><small>${L(PAGES[k].desc)}</small></a>`)}</div>
    </li>`;
  return `<nav class="nav" id="site-nav" aria-label="${U("เมนูหลัก", "Main menu")}">
    <div class="nav-top">
      <a href="${href("archive")}">${pageName("archive")}</a>
      <a href="${href("contact")}">${pageName("contact")}</a>
      ${langSwitch()}
    </div>
    <ul class="nav-main">
      <li><a class="nav-cta" href="${href("submission")}">${icon("pencil", 17)}${U("ส่งบทความ", "Submit Paper")}</a></li>
      ${link("home")}
      ${drop(U("เกี่ยวกับงาน", "About"), ["about", "committee", "archive"], "about")}
      ${drop(U("บทความ", "Papers"), ["cfp", "submission"], "papers")}
      ${link("program")}
      ${link("registration")}
      ${link("venue")}
    </ul>
  </nav>`;
}

function layout(body) {
  const C = D.conference, K = D.course;
  const title = CUR === "home"
    ? `${plain(C.acronym)} · ${U("งานประชุมวิชาการ", "Mini-Conference")} ${K.code} ${K.instituteShort}`
    : `${pageName(CUR)} · ${plain(C.acronym)}`;
  const ticker = D.dates.filter((d) => d.key).map((d) => `${L(d.title)} ${U("สัปดาห์ที่", "week")} ${d.week}`).join(" · ");
  return `<!DOCTYPE html>
<html lang="${LANG}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(U("งานประชุมวิชาการของรายวิชา", "Mini-conference of course"))} ${K.code} ${esc(L(K.name))} · ${esc(L(K.faculty))} · ${esc(L(K.institute))}">
<meta name="theme-color" content="#1F4EAF">
<meta name="color-scheme" content="light">
<link rel="canonical" href="${absHref(CUR, LANG)}">
<link rel="alternate" hreflang="th" href="${absHref(CUR, "th")}">
<link rel="alternate" hreflang="en" href="${absHref(CUR, "en")}">
<link rel="alternate" hreflang="x-default" href="${absHref(CUR, "th")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Niramit:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${asset("css/style.css")}">
<script>document.documentElement.classList.add("js")</script>
</head>
<body data-page="${CUR}" data-admin="${ROOT()}/admin/index.html" data-pages="${esc(JSON.stringify(Object.keys(PAGES).map((k) => ({ href: href(k), label: pageName(k), current: k === CUR }))))}">
<a class="skip-link" href="#main">${U("ข้ามไปเนื้อหา", "Skip to Content")}</a>

<div class="topbar">
  <div class="container">
    ${icon("megaphone", 20)}
    <a class="ticker" href="${href("cfp")}#dates"><b>${U("ประกาศ", "News")}:</b> ${esc(ticker)} · ${U("ดูกำหนดการทั้งหมด", "See All Dates")} →</a>
    <span class="code">${K.code}</span>
    <a href="${K.instituteUrl}" target="_blank" rel="noopener">cdti.ac.th ↗</a>
    <a class="admin-link" href="${ROOT()}/admin/index.html" rel="nofollow">${U("แอดมิน", "Admin")}</a>
  </div>
</div>

<header class="site-header">
  <div class="container">
    <a class="brand" href="${href("home")}" aria-label="${esc(plain(C.acronym))} ${U("หน้าแรก", "home")}">
      <img class="brand-logo" src="${asset("img/cdti-logo.svg")}" alt="${esc(L(K.institute))}" width="469" height="108">
      <span class="brand-divider" aria-hidden="true"></span>
      <span class="brand-text"><span class="brand-name">${t(C.acronym)}</span><span class="brand-sub">${K.code} Seminar in CPE</span></span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="${U("เปิดเมนู", "Open menu")}" data-label-open="${U("เปิดเมนู", "Open menu")}" data-label-close="${U("ปิดเมนู", "Close menu")}">${icon("menu", 22)}</button>
    ${navHtml()}
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-about">
        <a class="footer-logo" href="${K.instituteUrl}" target="_blank" rel="noopener"><img src="${asset("img/cdti-logo.svg")}" alt="${esc(L(K.institute))}" width="469" height="108" loading="lazy"></a>
        <div class="footer-acr">${t(C.acronym)}</div>
        <p>${U("งานประชุมวิชาการของรายวิชา", "The mini-conference of course")} ${K.code} ${esc(L(K.name))} · ${esc(L(K.faculty))} · ${esc(L(K.institute))}</p>
      </div>
      <div><h2>${U("งานประชุม", "Conference")}</h2><ul>
        <li><a href="${href("about")}">${pageName("about")}</a></li>
        <li><a href="${href("committee")}">${pageName("committee")}</a></li>
        <li><a href="${href("program")}">${pageName("program")}</a></li>
        <li><a href="${href("archive")}">${pageName("archive")}</a></li></ul></div>
      <div><h2>${U("สำหรับผู้เขียน", "For Authors")}</h2><ul>
        <li><a href="${href("cfp")}">${pageName("cfp")}</a></li>
        <li><a href="${href("submission")}">${pageName("submission")}</a></li>
        <li><a href="${href("registration")}">${pageName("registration")}</a></li></ul></div>
      <div><h2>${U("ติดต่อ", "Contact")}</h2><ul>
        <li><a href="${href("venue")}">${pageName("venue")}</a></li>
        <li><a href="${href("contact")}">${pageName("contact")}</a></li>
        <li><a href="${K.instituteUrl}" target="_blank" rel="noopener">${esc(L(K.institute))} ↗</a></li></ul></div>
    </div>
    <div class="footer-bottom">
      <span>© ${K.year} ${K.code} ${esc(L(K.name))} · ${K.instituteShort}</span>
      <span>${U("ภาพจากสถาบันเทคโนโลยีจิตรลดา (cdti.ac.th)", "Photos from Chitralada Technology Institute (cdti.ac.th)")} · <a href="${href("contact")}#credits">${U("ที่มาของภาพ", "Photo credits")}</a></span>
    </div>
  </div>
</footer>

<button class="to-top" type="button" aria-label="${U("กลับขึ้นด้านบน", "Back to top")}">${icon("up", 22)}</button>
<script src="${asset("js/config.js")}" defer></script>
<script src="${asset("js/live.js")}" defer></script>
<script src="${asset("js/content.js")}" defer></script>${CUR === "submission" ? `
<script src="${asset("js/submit.js")}" defer></script>` : ""}
<script src="${asset("js/main.js")}" defer></script>
</body>
</html>
`;
}

/* ---------- shared blocks ---------- */
const sectionTitle = (title, sub, more) => `
  <div class="section-title reveal">
    <div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>
    ${more ? `<a class="more" href="${href(more)}">${U("ดูทั้งหมด", "View All")} ${icon("arrow", 18)}</a>` : ""}
  </div>`;

const pageHero = (intro) => `
  <section class="page-hero">
    ${img(PAGES[CUR].img, { lazy: false, decorative: true, priority: true })}
    <div class="container">
      <nav class="crumbs" aria-label="${U("เส้นทางนำทาง", "Breadcrumb")}"><a href="${href("home")}">${pageName("home")}</a><span aria-hidden="true">/</span><span>${pageName(CUR)}</span></nav>
      <h1>${pageName(CUR)}</h1>
      ${intro ? `<p>${intro}</p>` : ""}
    </div>
  </section>`;

// CDTI-style list rows with circle arrow buttons
const DATE_KEY = { 4: "opens", 6: "deadline", 7: "notify", 8: "camera", 9: "conf" }; // week → ตัวตั้งค่าในหลังบ้าน
const dateRows = () => `<ul class="rows">${join(D.dates, (d) => `
  <li class="${d.key ? "key" : ""}"><a href="${href("cfp")}">
    <div class="row-num"><small>${U("สัปดาห์", "Week")}</small><b>${d.week}</b></div>
    <div class="row-text"><strong>${t(d.title)}</strong><span${DATE_KEY[d.week] ? ` data-date="${DATE_KEY[d.week]}"` : ""}>${t(d.date)}</span></div>
    <span class="circle-btn">${icon("arrow", 20, 2.2)}</span>
  </a></li>`)}</ul>`;


const submitForm = () => `
  <div class="note" id="submit-status" role="status" aria-live="polite">${esc(L(D.submission.systemNote))}</div>
  <div id="submit-done" class="card done" hidden role="status" aria-live="polite" tabindex="-1">
    <div class="done-head"><span class="done-icon" aria-hidden="true">${icon("check", 26, 2.4)}</span><h3>${U("ส่งบทความสำเร็จ", "Success")}</h3></div>
    <div class="kv">
      <div>${U("รหัสบทความ", "Paper ID")}</div><div><strong id="done-id" class="done-id"></strong></div>
      <div>${U("ชื่อบทความ", "Title")}</div><div id="done-title"></div>
      <div>${U("ส่งเมื่อ", "Submitted")}</div><div id="done-time"></div>
      <div>${U("สถานะ", "Status")}</div><div><span class="status-pill s-submitted">${U("สำเร็จ (Success)", "Success")}</span></div>
      <div>${U("อีเมลยืนยัน", "Confirmation email")}</div><div id="done-mail"></div>
    </div>
    <p class="muted">${U("เก็บรหัสบทความไว้ ใช้ตรวจสอบสถานะได้ที่ช่อง \"ตรวจสอบสถานะบทความ\" ด้านล่างตลอดเวลา", "Keep your Paper ID. You can check the status any time in the \"Check paper status\" box below.")}</p>
    <button type="button" id="done-again" class="btn btn-outline small">${U("ส่งบทความอีกชิ้น", "Submit another paper")}</button>
  </div>
  <form id="submit-form" class="form" hidden novalidate>
    <label>${U("ชื่อบทความ", "Paper title")} *<input name="title" required maxlength="300"></label>
    <label>${U("ผู้เขียน (คั่นด้วยจุลภาค)", "Authors (comma separated)")} *<input name="authors" required maxlength="500"></label>
    <div class="form-row">
      <label>${U("อีเมลผู้ติดต่อ", "Contact email")} *<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
      <label>${U("สังกัด", "Affiliation")}<input name="affiliation" maxlength="300"></label>
    </div>
    <label>${U("รูปแบบการนำเสนอที่ต้องการ", "Preferred presentation")}
      <select name="type"><option value="any">${U("ไม่ระบุ", "No preference")}</option><option value="oral">${L(TAG.oral)}</option><option value="poster">${L(TAG.poster)}</option></select></label>
    <label>${U("บทคัดย่อ (ไม่บังคับ)", "Abstract (optional)")}<textarea name="abstract" rows="5" maxlength="4000"></textarea></label>
    <label>${U("ไฟล์บทความ (PDF ไม่เกิน 10 MB)", "Paper file (PDF, max 10 MB)")} *<input name="file" type="file" accept="application/pdf,.pdf" required></label>
    <input name="hp" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">
    <div class="form-actions"><button class="btn btn-cdti" type="submit">${U("ส่งบทความ", "Submit")}</button><span id="submit-msg" class="form-msg" role="status" aria-live="polite"></span></div>
  </form>
  <div id="status-box" class="card status-box" hidden>
    <h3>${U("ตรวจสอบสถานะบทความ", "Check paper status")}</h3>
    <form id="status-form" class="form form-inline3" novalidate>
      <label>${U("รหัสบทความ", "Paper ID")}<input name="id" required placeholder="P-001" maxlength="12" autocomplete="off"></label>
      <label>${U("อีเมลที่ใช้ส่ง", "Email used to submit")}<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
      <button class="btn btn-cdti" type="submit">${U("ตรวจสอบ", "Check")}</button>
    </form>
    <div id="status-result" role="status" aria-live="polite"></div>
  </div>`;

const topicCards = () => `<div class="grid-3">${join(D.topics, (tp, i) => `
  <article class="card card-hover topic reveal">
    <span class="track">${U("กลุ่มที่", "Track")} ${i + 1}</span>
    <div class="icon-tile">${icon(tp.icon, 24)}</div>
    <h3>${t(tp.name)}</h3>
    <p>${t(tp.desc)}</p>
  </article>`)}</div>`;

const programTabs = (idPrefix) => {
  const tabs = join(D.program, (p, i) =>
    `<button class="tab" role="tab" id="${idPrefix}-tab-${i}" aria-controls="${idPrefix}-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${L(p.tab)}</button>`);
  const panels = join(D.program, (p, i) => `
    <div class="tab-panel" role="tabpanel" id="${idPrefix}-panel-${i}" aria-labelledby="${idPrefix}-tab-${i}"${i === 0 ? "" : " hidden"}>
      <ol class="timeline">${join(p.items, (it) => `
        <li class="timeline-item">
          <div class="timeline-time">${t(it.time)}</div>
          <div class="timeline-rail"><span></span></div>
          <div class="timeline-body"><div><h3>${t(it.title)}</h3>${it.note ? `<p>${t(it.note)}</p>` : ""}</div><span class="tag ${it.type}">${L(TAG[it.type])}</span></div>
        </li>`)}</ol>
    </div>`);
  return `<div class="tabs" role="tablist" aria-label="${U("ช่วงเวลา", "Time of day")}">${tabs}</div>${panels}`;
};

const peopleRows = (tm) => join(tm.people, (p) => `<li><span>${esc(L(p.role))}</span><span>${t(p.name)}</span></li>`);
const teamContact = (id) => { const tm = D.teams.find((x) => x.id === id); return tm ? tm.people[0].name : "---"; };
const teamCard = (tm) => `
  <article class="card team reveal${tm.id === "chair" ? " is-chair" : ""}">
    <h3>${t(tm.name)}</h3>
    <p>${t(tm.duty)}</p>
    <ul class="people">${peopleRows(tm)}</ul>
  </article>`;

const speakerCards = () => `<div class="stack">${join(D.keynotes, (k) => `
  <article class="card speaker reveal">
    <div class="avatar">${icon("user", 38)}</div>
    <div><div class="label">${U("วิทยากรรับเชิญ", "Keynote speaker")}</div><h3>${t(k.name)}</h3><p>${t(k.affiliation)}</p><p>${t(k.talk)}</p></div>
  </article>`)}</div>`;

const note = (html) => `<div class="note">${icon("info", 18)}<div>${html}</div></div>`;
const kv = (rows) => `<div class="kv table-wrap">${join(rows, ([k, v]) => `<div>${k}</div><div>${v}</div>`)}</div>`;
const contactList = () => `<ul class="info-list">
  <li><span class="icon-tile">${icon("building", 22)}</span><div><div class="k">${U("สถานที่", "Venue")}</div><div class="v">${t(D.venue.name)}</div><div class="k">${t(D.venue.address)}</div></div></li>
  <li><span class="icon-tile">${icon("calendar", 22)}</span><div><div class="k">${U("วันจัดงาน", "Date")}</div><div class="v">${t(D.conference.date)}</div><div class="k">${t(D.conference.dateNote)}</div></div></li>
  <li><span class="icon-tile">${icon("mail", 22)}</span><div><div class="k">${U("อีเมล", "Email")}</div><div class="v">${t(D.contact.email)}</div></div></li>
  <li><span class="icon-tile">${icon("phone", 22)}</span><div><div class="k">${U("โทรศัพท์", "Phone")}</div><div class="v">${t(D.contact.phone)}</div></div></li>
</ul>`;

/* ---------- home ---------- */
function home() {
  const C = D.conference;
  const quick = [
    ["submission", "pencil", U("ส่งบทความ", "Submit Paper")],
    ["cfp", "grid", U("หัวข้อที่เปิดรับ", "Topics")],
    ["program", "clock", pageName("program")],
    ["committee", "users", U("ทีมผู้จัดงาน", "Committee")],
    ["registration", "clipboard", pageName("registration")]
  ];
  const paths = [
    ["submission", "research", "file", U("ส่งบทความ", "Submit a Paper"), U("เทมเพลตและขั้นตอนการส่ง", "Templates and how to submit")],
    ["cfp", "poster", "presentation", U("นำเสนอผลงาน", "Present Your Work"), U("บรรยาย 4 เรื่อง · โปสเตอร์ 10 เรื่อง", "4 oral · 10 poster presentations")],
    ["program", "panel", "mic", U("กำหนดการวันงาน", "Conference Program"), U("วิทยากรและช่วงการนำเสนอ", "Keynotes and sessions")]
  ];
  return layout(`
<section class="hero" id="top">
  ${img("hero", { cls: "hero-img", lazy: false, decorative: true, priority: true })}
  <div class="container">
    <span class="status"><span class="status-dot" aria-hidden="true"></span>${t(C.status)}</span>
    <h1>${t(C.name)}</h1>
    <div class="acr">${t(C.acronym)}</div>
    <div class="flourish" aria-hidden="true"><span></span></div>
    <p class="theme">${U("ธีม", "Theme")}: ${t(C.theme)}</p>
    <div class="meta">
      <span>${icon("calendar", 18)}${t(C.date)} · ${t(C.dateNote)}</span>
      <span>${icon("pin", 18)}${t(C.venue)} · ${t(C.venueNote)}</span>
      <span>${icon("mic", 18)}${t(C.format)}</span>
    </div>
    <div class="btn-row">
      <a class="btn btn-cdti" href="${href("submission")}">${U("ส่งบทความ", "Submit Paper")} ${icon("arrow", 20, 2.2)}</a>
      <a class="btn btn-outline-light" href="${href("cfp")}">${pageName("cfp")}</a>
    </div>
  </div>
</section>

<div class="quick">
  <div class="container">
    <nav class="quick-card" aria-label="${U("ทางลัด", "Quick links")}">${join(quick, ([k, ic, label]) => `
      <a href="${href(k)}"><span class="quick-icon">${icon(ic, 34, 1.6)}</span><span>${label}</span></a>`)}
    </nav>
  </div>
</div>

<nav class="section-nav" aria-label="${U("ส่วนต่าง ๆ ในหน้านี้", "On this page")}">
  <div class="container"><ul>
    <li><a href="#news">${U("ประกาศและกำหนดการสำคัญ", "News & Important Dates")}</a></li>
    <li><a href="#authors">${U("สำหรับผู้เขียน", "For Authors")}</a></li>
    <li><a href="#topics">${U("หัวข้อ", "Topics")}</a></li>
    <li><a href="#keynotes">${U("วิทยากร", "Keynotes")}</a></li>
    <li><a href="#program">${U("กำหนดการวันงาน", "Program")}</a></li>
    <li><a href="#committee">${U("ทีมผู้จัดงาน", "Committee")}</a></li>
    <li><a href="#venue">${U("สถานที่และติดต่อ", "Venue & Contact")}</a></li>
  </ul></div>
</nav>

<section class="section" id="news">
  <div class="container">
    ${sectionTitle(U("ประกาศและกำหนดการสำคัญ", "News & Important Dates"), U("วันที่จริงจะประกาศเมื่อทีมตกลงกันแล้ว ตอนนี้อ้างอิงตามสัปดาห์ของภาคเรียน", "Exact dates will be announced once the team agrees on them. For now they follow the semester weeks."))}
    <div class="news">
      <a class="feature reveal" href="${href("cfp")}">
        ${img("poster")}
        <div class="feature-body">
          <span class="tag">${U("ประกาศ", "News")}</span>
          <h3>${U("ประกาศรับบทความ", "Call for Papers:")} ${t(C.acronym)}</h3>
          <p>${U(`เปิดรับบทความด้านวิศวกรรมคอมพิวเตอร์ใน ${D.topics.length} กลุ่มหัวข้อ นำเสนอแบบบรรยาย 4 เรื่อง และโปสเตอร์ 10 เรื่อง`, `We invite computer engineering papers in ${D.topics.length} topic tracks: 4 oral and 10 poster presentations.`)}</p>
          <div class="date">${U("สัปดาห์ที่", "Week")} 3 · ${t(D.dates[0].date)}</div>
        </div>
      </a>
      <div class="reveal">
        ${dateRows()}
        <div class="news-actions"><a class="btn btn-cdti" href="${href("cfp")}">${U("ดูทั้งหมด", "View All")} ${icon("arrow", 20, 2.2)}</a></div>
      </div>
    </div>
  </div>
</section>

<section class="section dark" id="authors">
  <div class="container">
    ${sectionTitle(U("สำหรับผู้เขียน", "For Authors"), U("ขั้นตอนตั้งแต่ส่งบทความจนถึงวันนำเสนอ", "How to submit, present and follow the program"))}
    <div class="grid-3">${join(paths, ([k, im, ic, h, p]) => `
      <a class="photo-card reveal" href="${href(k)}">
        ${img(im)}
        <div class="band"><span class="badge">${icon(ic, 44, 1.5)}</span><h3>${h}</h3><p>${p}</p></div>
      </a>`)}
    </div>
    <div class="stats">${join(D.stats, (s) => `<div class="stat reveal"><b>${s.value}</b><span>${L(s.label)}</span></div>`)}</div>
  </div>
</section>

<section class="section" id="topics">
  <div class="container">
    ${sectionTitle(U("หัวข้อที่เปิดรับ", "Topics"), U(`บทความด้านวิศวกรรมคอมพิวเตอร์ใน ${D.topics.length} กลุ่มหัวข้อ`, `Computer engineering papers in ${D.topics.length} tracks`), "cfp")}
    ${topicCards()}
  </div>
</section>

<section class="section white" id="keynotes">
  <div class="container">
    ${sectionTitle(U("วิทยากรรับเชิญ", "Keynote Speakers"), "", "program")}
    <div class="media-split">
      ${img("panel", { cls: "reveal" })}
      ${speakerCards()}
    </div>
  </div>
</section>

<section class="section" id="program">
  <div class="container">
    ${sectionTitle(U("กำหนดการวันงาน", "Conference Program"), U("เวลาจะยืนยันหลังประชุมคณะกรรมการวิชาการในสัปดาห์ที่ 7", "Times will be confirmed after the program committee meets in week 7."), "program")}
    <div class="reveal">${programTabs("home")}</div>
  </div>
</section>

<section class="section white" id="committee">
  <div class="container">
    ${sectionTitle(U("ทีมผู้จัดงาน", "Organizing Committee"), U("นักศึกษาทุกคนเป็นทั้งผู้เขียน ผู้พิจารณาบทความ และผู้จัดงาน", "Every student is an author, a reviewer and an organizer."), "committee")}
    <div class="grid-3">${join(D.teams, teamCard)}</div>
  </div>
</section>

<section class="section" id="venue">
  <div class="container">
    ${sectionTitle(U("สถานที่และการติดต่อ", "Venue & Contact"), "", "venue")}
    <div class="grid-2">
      <div class="card reveal">${contactList()}</div>
      <div class="venue-img reveal">${img("hero")}<span class="cap">${U("ห้องจัดงานจะประกาศเมื่อยืนยันแล้ว", "The room will be announced once confirmed")}</span></div>
    </div>
  </div>
</section>`);
}

/* ---------- sub-pages ---------- */
function subpage(intro, sections, opts = {}) {
  const toc = sections.filter((s) => s.id && s.title);
  const body = `
${pageHero(intro)}
<div class="page-body"><div class="container">
  <div class="page-layout${opts.wide ? " wide" : ""}">
    ${opts.wide ? "" : `<aside class="page-toc" aria-label="${U("ในหน้านี้", "On this page")}">${toc.length > 1 ? `<strong>${U("ในหน้านี้", "On this page")}</strong>${join(toc, (s) => `<a href="#${s.id}">${s.title}</a>`)}` : `<strong>${pageName(CUR)}</strong><a href="${href("home")}">${U("กลับหน้าแรก", "Back to Home")}</a>`}</aside>`}
    <div class="page-main">${join(sections, (s) => `
      <section class="block${s.bare ? " bare" : ""}"${s.id ? ` id="${s.id}"` : ""}>${s.title ? `<h2>${s.title}</h2>` : ""}${s.lead ? `<p class="lead-text">${s.lead}</p>` : ""}${s.html}</section>`)}
    </div>
  </div>
</div></div>`;
  return layout(body);
}

const pages = {
  about: () => {
    const C = D.conference;
    return subpage(U("สรุปสิ่งที่ทีมตกลงกันแล้วและสิ่งที่ต้องทำต่อ สำหรับงานประชุมวิชาการของรายวิชา 300-1412", "What the team has agreed on so far, and what is still to do, for the 300-1412 mini-conference."), [
      { id: "objective", title: U("เป้าหมาย", "Objective"), html: `<p>${U("ให้นักศึกษาเห็นภาพรวมของการจัดงานประชุมวิชาการ และได้ลองทำหน้าที่ผู้จัดงานจริง ตั้งแต่เปิดรับบทความจนถึงวันนำเสนอ", "Help students see the whole picture of running an academic conference and take on the organizer role themselves, from the call for papers to presentation day.")}</p>
        <ul class="steps" style="margin-top:16px">${join(U(["เขียนบทความของตัวเอง", "พิจารณาบทความของเพื่อน", "ร่วมตัดสินผล", "จัดงาน", "นำเสนองาน"], ["Write your own paper", "Review other papers", "Take part in decisions", "Organize the event", "Present your research"]), (x) => `<li>${x}</li>`)}</ul>` },
      { id: "identity", title: U("อัตลักษณ์ของงาน", "Conference Identity"), lead: U("ช่องสีจางคือส่วนที่ทีมยังต้องตัดสินใจ", "Faded fields are still to be decided by the team."), html: kv([
        [U("ชื่องาน (ไทย)", "Name (Thai)"), t(C.name.th)], [U("ชื่องาน (อังกฤษ)", "Name (English)"), t(C.name.en)], [U("ชื่อย่อ", "Acronym"), t(C.acronym)], [U("ธีม", "Theme"), t(C.theme)],
        [U("ขอบเขต", "Scope"), `${U(`${D.topics.length} กลุ่มหัวข้อ`, `${D.topics.length} tracks`)} · <a href="${href("cfp")}">${U("ดูรายละเอียด", "Details")}</a>`], [U("กลุ่มเป้าหมาย", "Audience"), t(C.audience)],
        [U("วันและสถานที่", "Date & venue"), `${t(C.date)} · ${t(C.venue)}`], [U("อัตลักษณ์ภาพ", "Visual identity"), U("สีฟ้าและเหลือง", "Blue and yellow")]]) },
      { id: "workflow", title: U("ขั้นตอนของงาน", "Conference Workflow"), html: `<ol class="steps">${join(D.workflow, (w) => `<li>${esc(L(w))}</li>`)}</ol>` },
      { id: "roadmap", title: U("แผนงาน 9 สัปดาห์", "9-Week Roadmap"), lead: U("จากวางแผนถึงวันจัดงาน", "From planning to conference day"), html: `<div class="table-wrap"><table>
        <thead><tr><th>${U("สัปดาห์", "Week")}</th><th>${U("งานหลัก", "Milestone")}</th><th>${U("สถานะ", "Status")}</th></tr></thead>
        <tbody>${join(D.roadmap, (r) => `<tr${r.done ? ' class="is-done"' : ""}><td class="num">${r.week}</td><td>${esc(L(r.title))}</td><td>${r.done ? `<span class="check">✓ ${U("เสร็จแล้ว", "Done")}</span>` : `<span class="ph">${U("ยังไม่ถึง", "Upcoming")}</span>`}</td></tr>`)}</tbody>
      </table></div>` },
      { id: "deliverables", title: U("สิ่งที่ต้องส่งในสัปดาห์ที่ 1", "Week 1 Deliverables"), html: `<div class="grid-3">${join([
        ["file", U("กฎบัตรงานประชุม", "Conference Charter"), U("เอกสารหน้านี้", "This page")],
        ["users", U("ผังองค์กร", "Organization Chart"), `<a href="${href("committee")}">${pageName("committee")}</a>`],
        ["calendar", U("ไทม์ไลน์เบื้องต้น", "Initial Timeline"), U("ตารางด้านบน", "The table above")]], ([ic, h, p]) =>
        `<div class="card"><div class="icon-tile">${icon(ic, 24)}</div><h3 style="font-size:18px;margin-top:14px">${h}</h3><p style="color:var(--muted);font-size:16px">${p}</p></div>`)}</div>` }
    ]);
  },

  committee: () => {
    const chair = D.teams[0], rest = D.teams.slice(1);
    return subpage(U('ทุกทีมต้องมีหัวหน้า สมาชิก และงานที่ต้องส่งชัดเจน ใส่ชื่อแทน "---" เมื่อแบ่งทีมเสร็จ', 'Every team needs a lead, members and clear deliverables. Names replace "---" once teams are set.'), [
      { id: "chart", title: U("ผังองค์กร", "Organization Chart"), html: `<div class="org">${teamCard(chair)}<div class="org-line" aria-hidden="true"></div><div class="org-row">${join(rest, teamCard)}</div></div>` },
      { id: "members", title: U("สมาชิกแต่ละทีม", "Team Members"), html: `<div class="accordion">${join(D.teams, (tm, i) => `
        <details${i === 0 ? " open" : ""}><summary><span>${esc(L(tm.name))}<small>${esc(L(tm.duty))}</small></span>${icon("chevron", 20)}</summary>
        <div class="acc-body"><ul class="member-list">${peopleRows(tm)}</ul></div></details>`)}</div>` },
      { id: "advisors", title: U("อาจารย์ประจำวิชา", "Course Instructors"), html: `<div class="grid-2">${join(D.course.instructors, (n) => `<div class="card speaker"><div class="avatar sm">${icon("user", 26)}</div><div><h3 style="font-size:18px">${esc(n)}</h3><p>${esc(L(D.course.faculty))}</p></div></div>`)}</div>` }
    ], { wide: true });
  },

  archive: () => subpage("", [
    { html: `<div class="empty"><div class="icon-tile">${icon("archive", 30)}</div><h2 style="border:0;margin:0;padding:0">${U("ยังไม่มีงานที่ผ่านมา", "No past conferences yet")}</h2><p>${U("งานนี้เป็นงานประชุมวิชาการครั้งแรกของรายวิชา งานปีถัดไปจะแสดงที่หน้านี้", "This is the course's first mini-conference. Future editions will be listed here.")}</p></div>` }
  ]),

  cfp: () => {
    const C = D.conference;
    return subpage(U("เชิญส่งบทความวิจัยด้านวิศวกรรมคอมพิวเตอร์ ประกาศฉบับนี้เป็นร่างแรกและจะอัปเดตในสัปดาห์ที่ 3", "We invite research papers in computer engineering. This is a first draft and will be updated in week 3."), [
      { id: "theme", title: U("ธีมของงาน", "Theme"), html: `<p style="font-size:20px;font-weight:600;color:var(--navy)">${t(C.theme)}</p>` },
      { id: "scope", title: U("ขอบเขตหัวข้อ", "Scope"), lead: U("ธีมบอกทิศทางกว้าง ๆ ส่วนขอบเขตบอกว่าบทความแบบไหนเข้าข่าย", "The theme sets the direction; the scope says which papers belong."), html: topicCards() },
      { id: "fit", title: U("บทความแบบไหนเข้าข่าย", "What Fits"), html: note(U(`ต้องมีส่วนที่เป็นงานด้านเทคนิค เช่น ออกแบบ พัฒนา หรือทดลองระบบ ส่วนงานวิเคราะห์ธุรกิจที่ไม่มีการพัฒนาทางเทคนิค <span class="ph">[คณะกรรมการวิชาการกำลังพิจารณา]</span>`, `Papers need a technical part, such as designing, building or testing a system. Business analysis with no technical work: <span class="ph">[under discussion by the program committee]</span>`)) },
      { id: "dates", title: U("กำหนดการสำคัญ", "Important Dates"), html: dateRows() },
      { id: "types", title: U("รูปแบบการนำเสนอ", "Presentation Formats"), html: `<div class="grid-2">
        <div class="card"><span class="tag oral">${L(TAG.oral)}</span><h3 style="margin-top:12px">${U("นำเสนอแบบบรรยาย 4 บทความ", "4 oral presentations")}</h3><p style="color:var(--muted)">${U("เวลานำเสนอ", "Talk length")} ${t({ th: "รอประกาศ", en: "TBA" })}</p></div>
        <div class="card"><span class="tag poster">${L(TAG.poster)}</span><h3 style="margin-top:12px">${U("นำเสนอแบบโปสเตอร์ 10 บทความ", "10 poster presentations")}</h3><p style="color:var(--muted)">${U("ขนาดโปสเตอร์", "Poster size")} ${t({ th: "รอประกาศ", en: "TBA" })}</p></div></div>` },
      { bare: true, html: `<a class="btn btn-cdti" href="${href("submission")}">${U("วิธีส่งบทความ", "How to Submit")} ${icon("arrow", 20, 2.2)}</a>` }
    ]);
  },

  submission: () => {
    const S = D.submission;
    return subpage(U("รูปแบบบทความ เทมเพลต และช่องทางส่งบทความ", "Paper format, templates and where to submit."), [
      { id: "system", title: U("ส่งบทความ", "Submit a Paper"), html: submitForm() },
      { id: "format", title: U("รูปแบบบทความ", "Paper Format"), html: kv([[U("ความยาว", "Length"), t(S.length)], [U("ภาษา", "Language"), t(S.language)], [U("การพิจารณา", "Review"), t(S.review)], [U("ไฟล์ที่ส่ง", "File type"), "PDF"]]) },
      { id: "templates", title: U("เทมเพลต", "Templates"), html: `<div class="grid-2">${join(S.templates, (tp) => `<div class="card speaker"><div class="icon-tile">${icon("file", 24)}</div><div style="flex:1"><h3 style="font-size:18px">${esc(L(tp.label))}</h3><p class="tpl-slot"${tp.key ? ` data-template="${tp.key}"` : ""}>${tp.file ? `<a href="${esc(tp.file)}">${U("ดาวน์โหลด", "Download")}</a>` : `<span class="ph">${U("เร็ว ๆ นี้", "Coming Soon")}</span>`}</p></div></div>`)}</div>` },
      { id: "steps", title: U("ขั้นตอน", "Steps"), html: `<ol class="steps">${join(U(["เขียนบทความตามเทมเพลต", "ส่งผ่านระบบ", "รอผลการพิจารณา", "แก้ไขตามความเห็น", "ส่งฉบับสมบูรณ์"], ["Write using the template", "Submit online", "Wait for reviews", "Revise", "Send the camera-ready version"]), (x) => `<li>${x}</li>`)}</ol>` }
    ]);
  },

  program: () => subpage(U("กำหนดการวันงาน เวลาจริงจะยืนยันหลังประชุมคณะกรรมการวิชาการในสัปดาห์ที่ 7", "The conference day schedule. Times will be confirmed after the program committee meets in week 7."), [
    { id: "schedule", title: U("ตารางเวลา", "Schedule"), html: programTabs("prog") },
    { id: "keynotes", title: U("วิทยากรรับเชิญ", "Keynote Speakers"), html: speakerCards() },
    { id: "sessions", title: U("ช่วงการนำเสนอ", "Sessions"), html: `<div class="table-wrap"><table><thead><tr><th>${U("ช่วง", "Session")}</th><th>${U("ประเภท", "Type")}</th><th>${U("บทความ", "Papers")}</th><th>${U("ประธานช่วง", "Chair")}</th></tr></thead><tbody>
      <tr><td>${U("บรรยาย ช่วงที่ 1", "Oral session 1")}</td><td><span class="tag oral">${L(TAG.oral)}</span></td><td>2</td><td><span class="ph">---</span></td></tr>
      <tr><td>${U("บรรยาย ช่วงที่ 2", "Oral session 2")}</td><td><span class="tag oral">${L(TAG.oral)}</span></td><td>2</td><td><span class="ph">---</span></td></tr>
      <tr><td>${U("โปสเตอร์", "Poster session")}</td><td><span class="tag poster">${L(TAG.poster)}</span></td><td>10</td><td><span class="ph">---</span></td></tr></tbody></table></div>` }
  ]),

  registration: () => {
    const R = D.registration;
    return subpage(U("ข้อมูลการลงทะเบียนเข้าร่วมงาน", "How to register for the conference."), [
      { id: "types", title: U("ประเภทผู้เข้าร่วม", "Participant Types"), html: `<div class="table-wrap"><table><thead><tr><th>${U("ประเภท", "Type")}</th><th>${U("รายละเอียด", "Details")}</th><th>${U("ค่าลงทะเบียน", "Fee")}</th></tr></thead><tbody>${join(R.types, (r) => `<tr><td><strong>${esc(L(r.name))}</strong></td><td>${t(r.detail)}</td><td>${t(R.fee)}</td></tr>`)}</tbody></table></div>` },
      { id: "how", title: U("วิธีลงทะเบียน", "How to Register"), html: note(t(R.note)) }
    ]);
  },

  venue: () => subpage("", [
    { id: "place", title: U("สถานที่", "Location"), html: `<div class="grid-2"><div>${contactList()}</div>
      <div class="venue-img">${img("hero")}<span class="cap">${U("ห้องจัดงานยังรอยืนยัน", "The room is not confirmed yet.")}</span></div></div>` },
    { id: "travel", title: U("การเดินทาง", "Getting There"), html: note(`<span class="ph">${U("[ข้อมูลการเดินทางและที่จอดรถ จากทีมสถานที่และการจัดงาน]", "[Travel and parking details from the Venue & Logistics team]")}</span>`) }
  ]),

  contact: () => subpage("", [
    { id: "channels", title: U("ช่องทางติดต่อ", "Contact Details"), html: `<ul class="info-list">
      <li><span class="icon-tile">${icon("mail", 22)}</span><div><div class="k">${U("อีเมล", "Email")}</div><div class="v">${t(D.contact.email)}</div></div></li>
      <li><span class="icon-tile">${icon("phone", 22)}</span><div><div class="k">${U("โทรศัพท์", "Phone")}</div><div class="v">${t(D.contact.phone)}</div></div></li>
      <li><span class="icon-tile">${icon("building", 22)}</span><div><div class="k">${U("สำนักงาน", "Office")}</div><div class="v">${t(D.contact.office)}</div></div></li></ul>` },
    { id: "teams", title: U("ติดต่อตามเรื่อง", "Who to Contact"), html: `<div class="table-wrap"><table><thead><tr><th>${U("เรื่อง", "Topic")}</th><th>${U("ทีม", "Team")}</th><th>${U("ผู้ติดต่อ", "Contact")}</th></tr></thead><tbody>${join([
      [U("การส่งบทความ / การพิจารณา", "Submissions / reviews"), "tpc"], [U("เว็บไซต์ / ลงทะเบียน", "Website / registration"), "web"],
      [U("สถานที่ / อุปกรณ์", "Venue / equipment"), "venue"], [U("เรื่องอื่น ๆ", "Anything else"), "chair"]],
      ([topic, id]) => `<tr><td>${topic}</td><td>${esc(L(D.teams.find((x) => x.id === id).name))}</td><td>${t(teamContact(id))}</td></tr>`)}</tbody></table></div>` },
    { id: "credits", title: U("ที่มาของภาพ", "Photo Credits"), html: `<ul class="member-list">${join(Object.values(IMG), (im) => `<li><span>${esc(im.credit)}</span><a href="${esc(im.source)}" target="_blank" rel="noopener">${U("ที่มา", "Source")} ↗</a></li>`)}</ul>` }
  ])
};


/* ---------- หน้าแอดมิน (/admin/) ---------- */
function adminPage() {
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light">
<title>หลังบ้านแอดมิน · ${esc(plain(D.conference.acronym))}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Niramit:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css">
</head>
<body class="admin">
<header class="admin-bar"><div class="container admin-bar-in">
  <strong>หลังบ้านแอดมิน · ${esc(plain(D.conference.acronym))}</strong>
  <span id="who" class="admin-who" hidden><span id="who-email"></span> <button type="button" id="logout" class="btn-link">ออกจากระบบ</button></span>
</div></header>
<main class="container admin-main">
  <section id="login" class="card admin-login" hidden>
    <h1>เข้าสู่ระบบแอดมิน</h1>
    <p>สำหรับผู้จัดงานเท่านั้น</p>
    <form id="login-form" class="form">
      <label>อีเมล<input type="email" name="email" required autocomplete="username"></label>
      <label>รหัสผ่าน<input type="password" name="password" required autocomplete="current-password"></label>
      <div class="form-actions"><button class="btn btn-cdti" type="submit">เข้าสู่ระบบ</button></div>
    </form>
    <p id="login-msg" class="form-msg err" role="alert"></p>
  </section>
  <section id="app" hidden>
    <div class="admin-tabs" role="tablist">
      <button role="tab" aria-selected="true" data-tab="subs">งานที่ส่ง</button>
      <button role="tab" aria-selected="false" data-tab="time">กำหนดเวลา</button>
      <button role="tab" aria-selected="false" data-tab="tpl">เทมเพลต</button>
      <button role="tab" aria-selected="false" data-tab="admins">แอดมิน</button>
      <button type="button" id="edit-site" class="btn btn-yellow small admin-edit-site">แก้ไขเว็บไซต์ →</button>
    </div>
    <div id="toast" class="form-msg" role="status" aria-live="polite"></div>

    <div id="tab-subs" class="card">
      <div class="admin-tools">
        <input id="q" type="search" placeholder="ค้นหาชื่อบทความ / ผู้เขียน / รหัส" aria-label="ค้นหา">
        <select id="f-status" aria-label="กรองสถานะ"><option value="">ทุกสถานะ</option></select>
        <span id="count" class="muted"></span>
        <button type="button" id="reload" class="btn btn-outline small">โหลดใหม่</button>
        <button type="button" id="sync" class="btn btn-cdti small">ซิงค์จาก Drive</button>
      </div>
      <div class="table-wrap"><table class="admin-table"><thead><tr><th>รหัส</th><th>บทความ</th><th>สถานะ</th><th>วันที่นำเสนอ</th><th>เวลา</th><th>ห้อง</th><th></th></tr></thead><tbody id="subs"></tbody></table></div>
    </div>

    <div id="tab-time" class="card" hidden>
      <h2>กำหนดเวลาของงาน</h2>
      <p class="muted">เวลาทั้งหมดเป็นเวลาประเทศไทย (UTC+7) วันที่เหล่านี้จะแสดงบนเว็บอัตโนมัติ และเวลาเปิด–ปิดรับบทความควบคุมฟอร์มส่งบทความจริง</p>
      <p id="time-status" class="form-msg" role="status" aria-live="polite"></p>
      <form id="time-form" class="form">
        <div class="form-row">
          <label>เปิดรับบทความ<input type="datetime-local" name="submission_opens"></label>
          <label>ปิดรับบทความ<input type="datetime-local" name="submission_deadline"></label>
        </div>
        <div class="form-row">
          <label>แจ้งผลการพิจารณา<input type="date" name="notification_date"></label>
          <label>ส่งฉบับสมบูรณ์<input type="date" name="camera_ready_date"></label>
          <label>วันจัดงาน<input type="date" name="conference_date"></label>
        </div>
        <div class="form-actions">
          <button class="btn btn-cdti" type="submit">บันทึก</button>
          <button class="btn btn-outline" type="button" id="open-now">เปิดรับตอนนี้</button>
          <button class="btn btn-outline" type="button" id="close-now">ปิดรับตอนนี้</button>
        </div>
      </form>
    </div>

    <div id="tab-tpl" class="card" hidden>
      <h2>เทมเพลตบทความ</h2>
      <p class="muted">ผู้ใช้ดาวน์โหลดได้จากหน้าส่งบทความ ถ้ายังไม่ได้เพิ่มหรือถูกลบ หน้าเว็บจะแสดง "เร็ว ๆ นี้" แทน อัปโหลดไฟล์ใหม่จะแทนที่ไฟล์เดิม (ไม่เกิน 10 MB)</p>
      <div id="tpl-list" class="grid-2"></div>
    </div>

    <div id="tab-admins" class="card" hidden>
      <h2>แอดมิน</h2>
      <p class="muted">แอดมินทุกคนดูงานและแก้เวลาได้ ตั้งรหัสผ่านเริ่มต้นให้คนใหม่ (อย่างน้อย 8 ตัวอักษร) แล้วแจ้งเขาเอง เขาเปลี่ยนรหัสเองได้ภายหลัง</p>
      <form id="admin-form" class="form">
        <div class="form-row">
          <label>อีเมลแอดมินคนใหม่<input type="email" name="email" required placeholder="name@example.com"></label>
          <label>รหัสผ่านเริ่มต้น<input type="text" name="password" required minlength="8" autocomplete="off"></label>
        </div>
        <div class="form-actions"><button class="btn btn-cdti" type="submit">เพิ่มแอดมิน</button></div>
      </form>
      <div class="table-wrap"><table class="admin-table"><thead><tr><th>อีเมล</th><th>บทบาท</th><th>เพิ่มโดย</th><th></th></tr></thead><tbody id="admins"></tbody></table></div>
      <h2 style="margin-top:32px">เปลี่ยนรหัสผ่านของฉัน</h2>
      <form id="pw-form" class="form">
        <div class="form-row">
          <label>รหัสผ่านเดิม<input type="password" name="oldPassword" required autocomplete="current-password"></label>
          <label>รหัสผ่านใหม่ (8 ตัวขึ้นไป)<input type="password" name="newPassword" required minlength="8" autocomplete="new-password"></label>
        </div>
        <div class="form-actions"><button class="btn btn-cdti" type="submit">เปลี่ยนรหัสผ่าน</button></div>
      </form>
    </div>
  </section>
</main>
<script src="../js/config.js"></script>
<script src="../js/admin.js" defer></script>
</body>
</html>
`;
}

/* ---------- write ---------- */
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f));
}
function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(path.join(SRC, "css"), path.join(DIST, "css"));
  copyDir(path.join(SRC, "js"), path.join(DIST, "js"));
  copyDir(path.join(SRC, "img"), path.join(DIST, "img"));
  let count = 0;
  for (const lang of LANGS) {
    LANG = lang;
    const base = lang === "en" ? path.join(DIST, "en") : DIST;
    CUR = "home";
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, "index.html"), home());
    count++;
    for (const [key, fn] of Object.entries(pages)) {
      CUR = key;
      const dir = path.join(base, PAGES[key].slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), fn());
      count++;
    }
  }
  fs.mkdirSync(path.join(DIST, "admin"), { recursive: true });
  fs.writeFileSync(path.join(DIST, "admin", "index.html"), adminPage());
  count++;
  console.log(`Built ${count} pages (ไทย + English) → dist`);
}
build();
