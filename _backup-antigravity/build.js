/**
 * Static Site Builder for CDTI CPE Mini-Conference Website
 * Generates static HTML pages in app/dist/ from conference-data.js
 */

const fs = require('fs');
const path = require('path');
const DATA = require('./src/data/conference-data.js');

const DIST_DIR = path.join(__dirname, 'dist');

// SVG Icon Library for crisp, self-contained, offline-friendly graphics
const ICONS = {
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  mapPin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  arrowRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  download: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  fileText: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  mic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
  award: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
  coffee: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`,
  building: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line><line x1="9" y1="18" x2="9" y2="18.01"></line><line x1="15" y1="18" x2="15" y2="18.01"></line></svg>`,
  mail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  phone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  cpu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
  code: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  shield: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  wifi: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
  user: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  layers: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
  arrowUp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`
};

function getTopicIcon(id) {
  switch(id) {
    case 'ai-ds': return ICONS.cpu;
    case 'se': return ICONS.code;
    case 'networks-security': return ICONS.shield;
    case 'iot-embedded': return ICONS.wifi;
    case 'hci': return ICONS.user;
    case 'intelligent-systems': return ICONS.layers;
    default: return ICONS.cpu;
  }
}

// Generate Standard Page Layout (Header, Navigation, Footer, Modals)
function renderPageLayout({
  title,
  currentKey = 'home',
  relativePath = '.',
  contentHtml,
  isHome = false,
  pageBannerHtml = ''
}) {
  const cssPath = `${relativePath}/css/style.css`;
  const jsDataPath = `${relativePath}/js/conference-data.js`;
  const jsMainPath = `${relativePath}/js/main.js`;

  const navHome = isHome ? '#home' : `${relativePath}/index.html`;
  const navAbout = `${relativePath}/about/index.html`;
  const navCommittee = `${relativePath}/committee/index.html`;
  const navCfp = `${relativePath}/cfp/index.html`;
  const navSubmission = `${relativePath}/submission/index.html`;
  const navProgram = `${relativePath}/program/index.html`;
  const navRegistration = `${relativePath}/registration/index.html`;
  const navVenue = `${relativePath}/venue/index.html`;
  const navArchive = `${relativePath}/archive/index.html`;
  const navContact = `${relativePath}/contact/index.html`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${DATA.meta.courseCode} ${DATA.meta.instituteShort}</title>
  <meta name="description" content="เว็บไซต์งานประชุมวิชาการ Mini-Conference รายวิชา ${DATA.meta.courseCode} ${DATA.meta.courseNameTh} สถาบันเทคโนโลยีจิตรลดา (CDTI)">
  <link rel="stylesheet" href="${cssPath}">
</head>
<body id="top">

  <!-- Top Notification Bar -->
  <div class="top-bar">
    <div class="container">
      <div class="top-bar-left">
        <span class="top-badge">${DATA.meta.courseCode}</span>
        <span>${DATA.meta.courseNameTh} (${DATA.meta.courseNameEn}) · ${DATA.meta.instituteTh}</span>
      </div>
      <div class="top-bar-right">
        <span>สถานะ: <strong>${DATA.conference.statusBadge}</strong></span>
        <a href="${DATA.meta.officialWebsite}" target="_blank" rel="noopener">เว็บสถาบัน CDTI ↗</a>
      </div>
    </div>
  </div>

  <!-- Main Navigation Bar -->
  <header class="main-header">
    <div class="container">
      <nav class="navbar" aria-label="Main Navigation">
        <a href="${navHome}" class="brand-logo" aria-label="CDTI Mini-Conference Home">
          <div class="brand-emblem">CDTI</div>
          <div class="brand-text">
            <span class="brand-title">${DATA.conference.shortName}</span>
            <span class="brand-sub">${DATA.meta.courseCode} Seminar in CPE</span>
          </div>
        </a>

        <button class="mobile-toggle" aria-label="Toggle Navigation Menu">☰</button>

        <ul class="nav-menu">
          <li class="nav-item">
            <a href="${navHome}" class="nav-link ${currentKey === 'home' ? 'active' : ''}">Home</a>
          </li>
          
          <!-- Dropdown: About & Committee -->
          <li class="nav-item has-dropdown">
            <a href="${navAbout}" class="nav-link ${currentKey === 'about' || currentKey === 'committee' ? 'active' : ''}">
              About ${ICONS.chevronDown}
            </a>
            <div class="dropdown-menu">
              <a href="${navAbout}" class="dropdown-item">
                <strong>Conference Charter</strong>
                <span class="sub-desc">กฎบัตรและแผนงาน 9 สัปดาห์</span>
              </a>
              <a href="${navCommittee}" class="dropdown-item">
                <strong>Organizing Committee</strong>
                <span class="sub-desc">ทีมงานและโครงสร้าง 6 ฝ่าย</span>
              </a>
            </div>
          </li>

          <!-- Dropdown: Papers & Submissions -->
          <li class="nav-item has-dropdown">
            <a href="${navCfp}" class="nav-link ${currentKey === 'cfp' || currentKey === 'submission' ? 'active' : ''}">
              Submissions ${ICONS.chevronDown}
            </a>
            <div class="dropdown-menu">
              <a href="${navCfp}" class="dropdown-item">
                <strong>Call for Papers (CFP)</strong>
                <span class="sub-desc">หัวข้อขอบเขตและกำหนดการ</span>
              </a>
              <a href="${navSubmission}" class="dropdown-item">
                <strong>Author Guidelines & System</strong>
                <span class="sub-desc">ข้อกำหนดและระบบส่งบทความ</span>
              </a>
            </div>
          </li>

          <li class="nav-item">
            <a href="${navProgram}" class="nav-link ${currentKey === 'program' ? 'active' : ''}">Program</a>
          </li>
          <li class="nav-item">
            <a href="${navRegistration}" class="nav-link ${currentKey === 'registration' ? 'active' : ''}">Registration</a>
          </li>
          <li class="nav-item">
            <a href="${navVenue}" class="nav-link ${currentKey === 'venue' ? 'active' : ''}">Venue</a>
          </li>
          <li class="nav-item">
            <a href="${navArchive}" class="nav-link ${currentKey === 'archive' ? 'active' : ''}">Archive</a>
          </li>
          <li class="nav-item">
            <a href="${navContact}" class="nav-link ${currentKey === 'contact' ? 'active' : ''}">Contact</a>
          </li>
        </ul>

        <div class="nav-actions">
          <button class="btn btn-primary btn-sm" data-modal-target="submissionModal">Submit Paper</button>
          <button class="btn btn-accent btn-sm" data-modal-target="registrationModal">Register</button>
        </div>
      </nav>
    </div>
  </header>

  ${pageBannerHtml}

  <!-- Page Main Content -->
  <main id="mainContent">
    ${contentHtml}
  </main>

  <!-- Main Footer -->
  <footer class="main-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-brand-title">${DATA.conference.nameTh}</div>
          <div class="footer-brand-sub">${DATA.conference.nameEn}</div>
          <p class="footer-desc">
            การประชุมวิชาการระดับปริญญาตรีจำลองมาตรฐานสากล รายวิชา ${DATA.meta.courseCode} ${DATA.meta.courseNameTh} (${DATA.meta.courseNameEn}) ${DATA.meta.facultyTh} ${DATA.meta.instituteTh}
          </p>
          <div class="section-tag green">
            ${ICONS.check} สถาปัตยกรรมเว็บเบื้องต้น พร้อมไฟล์ข้อมูลส่วนกลาง
          </div>
        </div>

        <div class="footer-col">
          <div class="footer-heading">Navigation</div>
          <div class="footer-links">
            <a href="${navHome}" class="footer-link">Home (หน้าแรก)</a>
            <a href="${navAbout}" class="footer-link">About & Roadmap (กฎบัตร)</a>
            <a href="${navCommittee}" class="footer-link">Committee (คณะกรรมการ)</a>
            <a href="${navCfp}" class="footer-link">Call for Papers (CFP)</a>
            <a href="${navProgram}" class="footer-link">Program & Schedule (กำหนดการ)</a>
            <a href="${navArchive}" class="footer-link">Archive (รายงานย้อนหลัง)</a>
          </div>
        </div>

        <div class="footer-col">
          <div class="footer-heading">Authors & Attendees</div>
          <div class="footer-links">
            <a href="${navSubmission}" class="footer-link">Submission Guidelines</a>
            <a href="${navSubmission}" class="footer-link">Paper Templates (.zip, .docx)</a>
            <a href="${navRegistration}" class="footer-link">Registration Info</a>
            <a href="${navVenue}" class="footer-link">Venue & Logistics</a>
            <a href="${navContact}" class="footer-link">Contact Organizing Team</a>
          </div>
        </div>

        <div class="footer-col">
          <div class="footer-heading">Contact & Venue</div>
          <div class="footer-desc">
            <strong>${DATA.venue.titleTh}</strong><br>
            ${DATA.venue.buildingTh}<br>
            ${DATA.venue.addressTh}<br>
            อีเมล: <a href="mailto:${DATA.contact.email}" style="color: var(--soft-blue);">${DATA.contact.email}</a>
          </div>
          <div style="margin-top: 14px;">
            <button class="btn btn-outline-white btn-sm" data-modal-target="submissionModal">Submit Paper</button>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div>
          © ${new Date().getFullYear()} ${DATA.meta.instituteShort} CPE Seminar Team. All rights reserved.
        </div>
        <div>
          Designed for ${DATA.meta.courseCode} Seminar in CPE · Chitralada Technology Institute
        </div>
      </div>
    </div>
  </footer>

  <!-- Back to Top Button -->
  <button class="back-to-top" title="Back to Top" aria-label="Back to Top">${ICONS.arrowUp}</button>

  <!-- Paper Submission Modal (Placeholder/Mock System) -->
  <div class="modal-overlay" id="submissionModal" role="dialog" aria-modal="true" aria-labelledby="subModalTitle">
    <div class="modal-box">
      <button class="modal-close-btn" aria-label="Close Modal">✕</button>
      <div class="section-tag">Submission System (จำลองระบบ)</div>
      <h3 class="section-title" id="subModalTitle" style="font-size: 1.5rem; margin-top: 8px;">ส่งบทความวิจัย</h3>
      <div class="section-subtitle">Paper Submission Portal</div>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin: 8px 0 20px 0;">
        สำหรับการส่งบทความในรายวิชา ${DATA.meta.courseCode} (จำลองระบบทดสอบเพื่อความสะดวกในการเตรียมข้อมูล)
      </p>

      <form id="mockSubmissionForm">
        <div class="form-group">
          <label class="form-label">เลือกแทร็กวิจัย (Research Track) *</label>
          <select class="form-control" id="paperTrack" required>
            ${DATA.topics.map(t => `<option value="${t.code}">${t.code}: ${t.nameTh} (${t.nameEn})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">ชื่อบทความวิจัย (Paper Title) *</label>
          <input type="text" class="form-control" id="paperTitle" placeholder="เช่น Machine Learning for Thai Sentiment Analysis" required>
        </div>

        <div class="form-group">
          <label class="form-label">ชื่อผู้วิจัยและรหัสนักศึกษา (Authors) *</label>
          <input type="text" class="form-control" id="paperAuthor" placeholder="เช่น [ชื่อ-นามสกุล นักศึกษา], [รหัสนักศึกษา]" required>
        </div>

        <div class="form-group">
          <label class="form-label">บทคัดย่อ (Abstract) *</label>
          <textarea class="form-control" rows="4" placeholder="พิมพ์บทคัดย่อความยาวไม่เกิน 250 คำ..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">แนบไฟล์บทความ (PDF format, Double-Blind) *</label>
          <input type="file" class="form-control" accept=".pdf">
          <small style="color: var(--text-light); display: block; margin-top: 4px;">* กรุณาตัดรายชื่อและสถาบันออกสำหรับรอบ Peer Review</small>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;">
          <button type="button" class="btn btn-outline" data-modal-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Paper</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Registration Modal (Placeholder/Mock System) -->
  <div class="modal-overlay" id="registrationModal" role="dialog" aria-modal="true" aria-labelledby="regModalTitle">
    <div class="modal-box">
      <button class="modal-close-btn" aria-label="Close Modal">✕</button>
      <div class="section-tag green">Registration Portal</div>
      <h3 class="section-title" id="regModalTitle" style="font-size: 1.5rem; margin-top: 8px;">ลงทะเบียนเข้าร่วมงาน</h3>
      <div class="section-subtitle">Conference Attendee Registration</div>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin: 8px 0 20px 0;">
        เข้าร่วมงานฟรีสำหรับนักศึกษา อาจารย์ และบุคลากร สถาบันเทคโนโลยีจิตรลดา
      </p>

      <form id="mockRegistrationForm">
        <div class="form-group">
          <label class="form-label">ประเภทผู้เข้าร่วม (Registration Type) *</label>
          <select class="form-control" required>
            <option value="student">นักศึกษาในรายวิชาสัมมนา (Author / Presenter) — ฟรี</option>
            <option value="cdti-student">นักศึกษา CDTI ทั่วไป (Attendee) — ฟรี</option>
            <option value="faculty">อาจารย์และบุคลากร CDTI — ฟรี</option>
            <option value="guest">ผู้สนใจทั่วไป (Guest Participant) — ฟรี</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">ชื่อ-นามสกุล (Full Name) *</label>
          <input type="text" class="form-control" id="regName" placeholder="เช่น นายสมชาย วิศวกรรม" required>
        </div>

        <div class="form-group">
          <label class="form-label">อีเมลติดต่อ (Email) *</label>
          <input type="email" class="form-control" placeholder="example@cdti.ac.th" required>
        </div>

        <div class="form-group">
          <label class="form-label">รูปแบบการเข้าร่วม (Participation Mode) *</label>
          <select class="form-control" required>
            <option value="onsite">Onsite ณ อาคาร 60 พรรษา ราชสุดาสมโภช CDTI</option>
            <option value="online">Online Live Streaming</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;">
          <button type="button" class="btn btn-outline" data-modal-close>Cancel</button>
          <button type="submit" class="btn btn-accent">Confirm Registration</button>
        </div>
      </form>
    </div>
  </div>

  <script src="${jsDataPath}"></script>
  <script src="${jsMainPath}"></script>
</body>
</html>`;
}

// Build Subpage Banner Header
function buildPageBanner(titleTh, titleEn, breadcrumbLabel, relativePath = '..') {
  return `
  <section class="page-banner">
    <div class="container">
      <div class="breadcrumb-nav">
        <a href="${relativePath}/index.html">Home</a>
        <span>${ICONS.chevronRight}</span>
        <span>${breadcrumbLabel}</span>
      </div>
      <h1 class="page-banner-title">${titleTh}</h1>
      <div class="page-banner-subtitle">${titleEn}</div>
      <div class="section-tag" style="background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.3);">
        ${DATA.meta.courseCode} ${DATA.meta.courseNameTh} · ${DATA.meta.instituteShort}
      </div>
    </div>
  </section>`;
}

// -------------------------------------------------------------
// 1. PAGE: HOME (index.html)
// -------------------------------------------------------------
function buildHomePage() {
  const heroHtml = `
  <!-- Hero Section -->
  <section class="hero-section" id="home">
    <div class="container">
      <div class="hero-inner">
        <div class="hero-badges">
          <span class="course-badge">${DATA.meta.courseCode} ${DATA.meta.courseNameEn}</span>
          <span class="status-badge">${ICONS.check} ${DATA.conference.statusBadge}</span>
        </div>

        <h1 class="hero-title">
          ${DATA.conference.nameTh}
          <span class="highlight">${DATA.conference.nameEn}</span>
        </h1>

        <div class="hero-theme">
          <strong>Theme:</strong> ${DATA.conference.themeTh}<br>
          <span style="font-size: 0.95rem; color: var(--text-muted);">${DATA.conference.themeEn}</span>
        </div>

        <!-- Event Key Facts Box (ccat style) -->
        <div class="event-facts-grid">
          <div class="fact-card">
            <div class="fact-icon">${ICONS.calendar}</div>
            <div>
              <div class="fact-label">Conference Date</div>
              <div class="fact-value">${DATA.conference.dateTh}</div>
              <div class="fact-sub">${DATA.conference.timeTh}</div>
            </div>
          </div>

          <div class="fact-card">
            <div class="fact-icon">${ICONS.mapPin}</div>
            <div>
              <div class="fact-label">Location / Venue</div>
              <div class="fact-value">${DATA.conference.venueTh}</div>
              <div class="fact-sub">${DATA.meta.instituteTh}</div>
            </div>
          </div>

          <div class="fact-card">
            <div class="fact-icon">${ICONS.mic}</div>
            <div>
              <div class="fact-label">Conference Format</div>
              <div class="fact-value">${DATA.conference.formatTh}</div>
              <div class="fact-sub">Oral & Poster Technical Sessions</div>
            </div>
          </div>
        </div>

        <div class="hero-cta">
          <button class="btn btn-primary btn-lg" data-modal-target="submissionModal">
            ${ICONS.fileText} Submit Paper
          </button>
          <button class="btn btn-accent btn-lg" data-modal-target="registrationModal">
            ${ICONS.users} Register Now
          </button>
          <a href="./cfp/index.html" class="btn btn-outline btn-lg">
            Call for Papers ${ICONS.arrowRight}
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Summary Statistics -->
  <section class="stats-section">
    <div class="container">
      <div class="stats-card-wrapper">
        ${DATA.statistics.map(s => `
          <div class="stat-item">
            <div class="stat-num">${s.value}</div>
            <div class="stat-title-th">${s.labelTh}</div>
            <div class="stat-title-en">${s.labelEn}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;

  const datesHtml = `
  <!-- Important Dates Section -->
  <section class="section section-alt" id="dates">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.calendar} Timeline</div>
        <h2 class="section-title">กำหนดการสำคัญ</h2>
        <div class="section-subtitle">Important Dates & Milestones</div>
        <p class="section-desc">
          กำหนดการดำเนินงานวิชาการของรายวิชาสัมมนา ${DATA.meta.courseCode} ตั้งแต่การเปิดรับบทความวิจัยไปจนถึงวันจัดงาน Mini-Conference
        </p>
      </div>

      <div class="dates-timeline">
        ${DATA.importantDates.map(d => `
          <div class="date-card ${d.status === 'highlight' ? 'highlight' : ''}">
            <span class="date-badge ${d.status}">${d.statusBadge}</span>
            <div class="date-title-th">${d.titleTh}</div>
            <div class="date-title-en">${d.titleEn}</div>
            <div class="date-value">${ICONS.calendar} ${d.dateTh}</div>
            <div class="date-desc">${d.descTh}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-actions">
        <a href="./cfp/index.html" class="btn btn-primary">
          ดูรายละเอียด Call for Papers ทั้งหมด ${ICONS.arrowRight}
        </a>
      </div>
    </div>
  </section>`;

  const topicsHtml = `
  <!-- Topics / Scope Section (ecti-fit style cards) -->
  <section class="section" id="topics">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.layers} Research Tracks</div>
        <h2 class="section-title">หัวข้อและขอบเขตบทความ</h2>
        <div class="section-subtitle">Topics & Scope of Interest</div>
        <p class="section-desc">
          ครอบคลุม 6 ขอบเขตสาขาวิชาทางด้านวิศวกรรมคอมพิวเตอร์และเทคโนโลยีดิจิทัลสมัยใหม่
        </p>
      </div>

      <div class="topics-grid">
        ${DATA.topics.map(t => `
          <div class="topic-card">
            <div class="topic-header">
              <div class="topic-icon-wrap" style="color: ${t.color}">
                ${getTopicIcon(t.id)}
              </div>
              <div>
                <span class="topic-tag">${t.code}</span>
                <div class="topic-title-th">${t.nameTh}</div>
                <div class="topic-title-en">${t.nameEn}</div>
              </div>
            </div>
            <p class="topic-desc">${t.descTh}</p>
            <div class="subtopics-list">
              ${t.subtopics.map(sub => `<div class="subtopic-item">${sub}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section-actions">
        <a href="./cfp/index.html" class="btn btn-outline">
          ดูรายละเอียดขอบเขตและเกณฑ์การส่งบทความ ${ICONS.arrowRight}
        </a>
      </div>
    </div>
  </section>`;

  const keynoteHtml = `
  <!-- Keynote Speakers Section (Placeholder) -->
  <section class="section section-alt" id="keynote">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.mic} Distinguished Speakers</div>
        <h2 class="section-title">วิทยากรรับเชิญ</h2>
        <div class="section-subtitle">Keynote Speakers (Placeholder)</div>
        <p class="section-desc">
          การบรรยายพิเศษจากผู้ทรงคุณวุฒิเพื่อสร้างแรงบันดาลใจและมุมมองเทคโนโลยีในโลกอุตสาหกรรม
        </p>
      </div>

      <div class="keynote-grid">
        ${DATA.keynotes.map(k => `
          <div class="keynote-card">
            <div class="keynote-avatar-placeholder">
              ${ICONS.user}
            </div>
            <span class="keynote-badge">${k.status}</span>
            <div class="keynote-name">${k.nameTh}</div>
            <div class="keynote-role">${k.positionTh}</div>
            
            <div class="keynote-topic-box">
              <div class="keynote-topic-title">${k.topicTh}</div>
              <div class="keynote-time">${ICONS.clock} ${k.timeTh}</div>
            </div>
            
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">${k.bioTh}</p>
          </div>
        `).join('')}
      </div>

      <div class="section-actions">
        <a href="./program/index.html" class="btn btn-outline">
          ดูสูติบัตรและโปรแกรมการบรรยาย ${ICONS.arrowRight}
        </a>
      </div>
    </div>
  </section>`;

  const scheduleHtml = `
  <!-- Schedule Section (ecti-fit style: daily tabs + timeline) -->
  <section class="section" id="schedule">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.clock} Conference Program</div>
        <h2 class="section-title">กำหนดการวันงานประชุม</h2>
        <div class="section-subtitle">Schedule & Technical Sessions</div>
        <p class="section-desc">
          ${DATA.schedule.dayLabelTh} · ${DATA.schedule.dateTh} ณ ${DATA.schedule.locationTh}
        </p>
      </div>

      <div class="schedule-container">
        <!-- Tabs -->
        <div class="schedule-tabs">
          <button class="tab-btn active" data-filter="all">ทั้งหมด (All Sessions)</button>
          <button class="tab-btn" data-filter="morning">ช่วงเช้า (Morning)</button>
          <button class="tab-btn" data-filter="oral">Oral Sessions (4 Papers)</button>
          <button class="tab-btn" data-filter="poster">Poster Sessions (10 Papers)</button>
          <button class="tab-btn" data-filter="afternoon">ช่วงบ่าย (Afternoon)</button>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          ${DATA.schedule.sessions.map(s => `
            <div class="timeline-item ${s.highlight ? 'highlight' : ''}" data-type="${s.type}">
              <div class="timeline-marker"></div>
              <div class="timeline-card">
                <div class="timeline-header">
                  <div class="session-time">${ICONS.clock} ${s.time}</div>
                  <span class="session-badge ${s.type}">${s.badgeTh}</span>
                </div>
                <div class="timeline-title-th">${s.titleTh}</div>
                <div class="timeline-title-en">${s.titleEn}</div>

                <div class="session-meta">
                  <div class="session-meta-item">${ICONS.mapPin} ${s.locationTh}</div>
                  <div class="session-meta-item">${ICONS.user} ${s.speakerTh}</div>
                </div>

                ${s.papers ? `
                  <div class="paper-pills-wrap">
                    ${s.papers.map(p => `
                      <div class="paper-pill">
                        <span class="paper-pill-code">${p.code}</span>
                        <span>${p.titleTh}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section-actions">
        <a href="./program/index.html" class="btn btn-primary">
          ดูรายละเอียดโปรแกรมและบทความทั้งหมด (Full Program) ${ICONS.arrowRight}
        </a>
      </div>
    </div>
  </section>`;

  const teamsHtml = `
  <!-- Organizing Teams Section (ecti-fit style collapsible accordions) -->
  <section class="section section-alt" id="committees">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.users} Governance</div>
        <h2 class="section-title">ทีมจัดงาน 6 ทีม</h2>
        <div class="section-subtitle">Organizing Committees & Teams</div>
        <p class="section-desc">
          การดำเนินงานโดยนักศึกษารายวิชาสัมมนา ${DATA.meta.courseCode} สถาบันเทคโนโลยีจิตรลดา แบ่งโครงสร้างความรับผิดชอบ 6 ฝ่าย
        </p>
      </div>

      <div class="accordion-wrapper">
        ${DATA.teams.map((t, idx) => `
          <div class="accordion-item">
            <button class="accordion-header" aria-expanded="${idx === 0 ? 'true' : 'false'}">
              <div class="accordion-title-wrap">
                <div class="team-number-badge">${idx + 1}</div>
                <div>
                  <div class="accordion-title-th">${t.titleTh}</div>
                  <div class="accordion-title-en">${t.titleEn}</div>
                </div>
              </div>
              <div class="accordion-icon">${ICONS.chevronDown}</div>
            </button>
            <div class="accordion-content ${idx === 0 ? 'open' : ''}">
              <div class="team-duty-box">
                <div class="duty-label">หน้าที่และความรับผิดชอบหลัก (Core Responsibilities)</div>
                <div class="duty-text">${t.dutyTh}</div>
              </div>

              <div class="duty-label" style="margin-bottom: 10px;">รายชื่อคณะทำงาน (Committee Members)</div>
              <div class="members-grid">
                ${t.members.map(m => `
                  <div class="member-card">
                    <div class="member-avatar">${ICONS.user}</div>
                    <div>
                      <div class="member-name">${m.name}</div>
                      <div class="member-role">${m.roleTh}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section-actions">
        <a href="./committee/index.html" class="btn btn-outline">
          ดูผังโครงสร้างองค์กรแบบสมบูรณ์ (Org Chart) ${ICONS.arrowRight}
        </a>
      </div>
    </div>
  </section>`;

  const venueHtml = `
  <!-- Venue Preview Section -->
  <section class="section" id="venue">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.building} Campus & Facilities</div>
        <h2 class="section-title">สถานที่จัดงานประชุม</h2>
        <div class="section-subtitle">Conference Venue & Location</div>
        <p class="section-desc">
          ${DATA.venue.titleTh} · ${DATA.venue.buildingTh}
        </p>
      </div>

      <div class="venue-preview-grid">
        <div class="venue-card-details">
          <div class="venue-title-th">${DATA.venue.titleTh}</div>
          <div class="venue-title-en">${DATA.venue.titleEn}</div>

          <div class="venue-address-box">
            <div style="color: var(--primary-blue); font-size: 1.3rem;">${ICONS.mapPin}</div>
            <div>
              <strong>${DATA.venue.buildingTh}</strong><br>
              ${DATA.venue.addressTh}
            </div>
          </div>

          <div class="venue-list">
            <div class="venue-list-item">
              ${ICONS.check}
              <div><strong>ห้องประชุมหลัก:</strong> ${DATA.venue.roomsTh}</div>
            </div>
            <div class="venue-list-item">
              ${ICONS.check}
              <div><strong>การเดินทางสะดวก:</strong> รถไฟฟ้า BTS อนุสาวรีย์ชัยสมรภูมิ / พญาไท ต่อรถประจำทาง</div>
            </div>
            <div class="venue-list-item">
              ${ICONS.check}
              <div><strong>ที่จอดรถ:</strong> พื้นที่จอดรถภายในสถาบันและสนามเสือป่า</div>
            </div>
          </div>

          <div style="margin-top: 24px;">
            <a href="./venue/index.html" class="btn btn-primary btn-sm">
              ดูแผนที่และการเดินทางฉบับเต็ม ${ICONS.arrowRight}
            </a>
          </div>
        </div>

        <div class="venue-map-placeholder">
          <div class="map-icon">${ICONS.mapPin}</div>
          <h3 style="color: var(--dark-blue); font-size: 1.2rem; margin-bottom: 6px;">แผนที่สถาบันเทคโนโลยีจิตรลดา (CDTI)</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 380px; margin-bottom: 16px;">
            สำนักพระราชวัง สนามเสือป่า ถนนศรีอยุธยา แขวงดุสิต เขตดุสิต กรุงเทพมหานคร 10300
          </p>
          <a href="https://maps.google.com/?q=Chitralada+Technology+Institute" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
            เปิดบน Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  </section>`;

  const contactHtml = `
  <!-- Contact Section -->
  <section class="section section-alt" id="contact">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.mail} Inquiries</div>
        <h2 class="section-title">ติดต่อสอบถาม</h2>
        <div class="section-subtitle">Contact Organizing Team</div>
        <p class="section-desc">
          หากมีข้อสงสัยเกี่ยวกับรายวิชาสัมมนา การส่งบทความวิชาการ หรือการเข้าร่วมงาน สามารถติดต่อฝ่ายจัดการประชุมได้โดยตรง
        </p>
      </div>

      <div class="contact-grid">
        <div class="contact-info-card">
          <h3 class="section-title" style="font-size: 1.35rem; margin-bottom: 20px;">ช่องทางการติดต่อ</h3>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.users}</div>
            <div>
              <div class="contact-item-title">อาจารย์ผู้ประสานงานรายวิชา (Faculty Advisor)</div>
              <div class="contact-item-val">${DATA.contact.facultyAdvisorTh}</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.user}</div>
            <div>
              <div class="contact-item-title">ประธานจัดการประชุม (General Chair)</div>
              <div class="contact-item-val">${DATA.contact.generalChairTh}</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.mail}</div>
            <div>
              <div class="contact-item-title">อีเมลกลางประสานงาน</div>
              <div class="contact-item-val">${DATA.contact.email}</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.building}</div>
            <div>
              <div class="contact-item-title">สำนักงานภาควิชาวิศวกรรมคอมพิวเตอร์</div>
              <div class="contact-item-val" style="font-size: 0.88rem; font-weight: normal; line-height: 1.5;">
                ${DATA.contact.officeTh}
              </div>
            </div>
          </div>
        </div>

        <div class="contact-form-card">
          <h3 class="section-title" style="font-size: 1.35rem; margin-bottom: 20px;">ส่งข้อความสอบถาม (Quick Message)</h3>
          <form id="contactForm">
            <div class="form-group">
              <label class="form-label">ชื่อ-นามสกุล *</label>
              <input type="text" class="form-control" placeholder="ชื่อผู้ติดต่อ" required>
            </div>
            <div class="form-group">
              <label class="form-label">อีเมลติดต่อ *</label>
              <input type="email" class="form-control" placeholder="your-email@cdti.ac.th" required>
            </div>
            <div class="form-group">
              <label class="form-label">หัวข้อสอบถาม *</label>
              <input type="text" class="form-control" placeholder="เช่น สอบถามเรื่องการจัดทำ Template หรือเวลาการนำเสนอ" required>
            </div>
            <div class="form-group">
              <label class="form-label">ข้อความ *</label>
              <textarea class="form-control" rows="4" placeholder="พิมพ์รายละเอียดข้อสงสัยที่ต้องการติดต่อ..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Send Inquiry</button>
          </form>
        </div>
      </div>
    </div>
  </section>`;

  const content = heroHtml + datesHtml + topicsHtml + keynoteHtml + scheduleHtml + teamsHtml + venueHtml + contactHtml;

  return renderPageLayout({
    title: `${DATA.conference.nameTh} (${DATA.conference.shortName})`,
    currentKey: 'home',
    relativePath: '.',
    contentHtml: content,
    isHome: true
  });
}

// -------------------------------------------------------------
// 2. PAGE: ABOUT (about.html & about/index.html)
// -------------------------------------------------------------
function buildAboutPage() {
  const banner = buildPageBanner('เกี่ยวกับงานประชุมและกฎบัตร', 'Conference Charter & 9-Week Roadmap', 'About');
  
  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag">${ICONS.award} Conference Charter</div>
        <h2 class="section-title">กฎบัตรและวิสัยทัศน์งานประชุม</h2>
        <div class="section-subtitle">Mission & Core Academic Principles</div>
      </div>

      <div style="background-color: var(--bg-light-blue); border-left: 4px solid var(--primary-blue); padding: 24px; border-radius: var(--radius-md); margin-bottom: 40px;">
        <h3 style="color: var(--dark-blue); font-size: 1.25rem; margin-bottom: 8px;">พันธกิจรายวิชาสัมมนา (Course Mission)</h3>
        <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6;">
          ${DATA.charter.missionTh}
        </p>
        <p style="font-size: 0.88rem; color: var(--text-light); margin-top: 8px;">
          ${DATA.charter.missionEn}
        </p>
      </div>

      <div class="dates-timeline" style="margin-bottom: 60px;">
        ${DATA.charter.principles.map(p => `
          <div class="date-card">
            <div class="date-badge upcoming">${ICONS.check} Principle</div>
            <div class="date-title-th">${p.titleTh}</div>
            <div class="date-title-en">${p.titleEn}</div>
            <div class="date-desc" style="font-size: 0.9rem; line-height: 1.55;">${p.descTh}</div>
          </div>
        `).join('')}
      </div>

      <!-- 9-Week Roadmap Detailed -->
      <div class="section-header text-left" style="margin-top: 60px;">
        <div class="section-tag green">${ICONS.calendar} 9-Week Master Plan</div>
        <h2 class="section-title">แผนงานการดำเนินงาน 9 สัปดาห์</h2>
        <div class="section-subtitle">Course Progression & Deliverables</div>
        <p class="section-desc" style="margin: 8px 0 0 0;">
          การดำเนินงานตามลำดับขั้นของนักศึกษาตลอดภาคการศึกษา ตั้งแต่การคิกออฟจนถึงวันจัดงาน Mini-Conference
        </p>
      </div>

      <div class="roadmap-grid">
        ${DATA.roadmap.map(r => `
          <div class="roadmap-card ${r.status}">
            <div class="week-badge">Week ${r.week} · สัปดาห์ที่ ${r.week}</div>
            <div class="roadmap-title-th">${r.nameTh}</div>
            <div class="roadmap-title-en">${r.nameEn}</div>
            <div class="roadmap-desc">${r.descTh}</div>
            <div class="roadmap-deliverable">
              <strong>ผลงานส่งมอบ:</strong> ${r.deliverableTh}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="section-actions" style="margin-top: 50px;">
        <a href="../committee/index.html" class="btn btn-primary">
          ดูโครงสร้างคณะกรรมการ 6 ทีม ${ICONS.arrowRight}
        </a>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'About & Roadmap | เกี่ยวกับงานประชุมและกฎบัตร',
    currentKey: 'about',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 3. PAGE: COMMITTEE (committee.html & committee/index.html)
// -------------------------------------------------------------
function buildCommitteePage() {
  const banner = buildPageBanner('คณะกรรมการดำเนินงาน', 'Organizing Teams & Committee Structure', 'Committee');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header">
        <div class="section-tag">${ICONS.users} Org Chart</div>
        <h2 class="section-title">โครงสร้างทีมงาน 6 ฝ่าย</h2>
        <div class="section-subtitle">Student Committee Hierarchy & Leadership</div>
        <p class="section-desc">
          การบริหารงานจำลองสมาคมวิชาการระดับสากล ขับเคลื่อนโดยนักศึกษารายวิชาสัมมนา ${DATA.meta.courseCode} สถาบันเทคโนโลยีจิตรลดา
        </p>
      </div>

      <!-- Visual Org Chart Flow -->
      <div style="background-color: var(--bg-light-blue); padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--card-border); margin-bottom: 48px; text-align: center;">
        <div style="display: inline-block; background-color: var(--dark-blue); color: #fff; padding: 14px 32px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); margin-bottom: 24px;">
          <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--light-blue); font-weight: 600;">Supervisory & Faculty Advisor</div>
          <div style="font-size: 1.15rem; font-weight: 700;">อาจารย์ประจำรายวิชาสัมมนา CPE</div>
          <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">${DATA.contact.facultyAdvisorTh}</div>
        </div>

        <div style="width: 2px; height: 24px; background-color: var(--primary-blue); margin: 0 auto 24px auto;"></div>

        <div style="display: inline-block; background-color: var(--primary-blue); color: #fff; padding: 12px 28px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); margin-bottom: 28px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #fff; font-weight: 600;">Executive Coordination</div>
          <div style="font-size: 1.1rem; font-weight: 700;">General Chair (ประธานจัดการประชุม)</div>
          <div style="font-size: 0.85rem;">${DATA.contact.generalChairTh}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 16px;">
          ${DATA.teams.slice(1).map(t => `
            <div style="background-color: #fff; padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--card-border); font-size: 0.84rem; font-weight: 600; color: var(--dark-blue);">
              ${t.titleTh}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Deep Dive into the 6 Teams -->
      <div style="display: flex; flex-direction: column; gap: 32px;">
        ${DATA.teams.map((t, idx) => `
          <div class="venue-card-details" style="border-left: 4px solid var(--primary-blue);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
              <div>
                <span class="topic-tag">Team ${idx + 1} · ${t.badge}</span>
                <h3 style="font-size: 1.4rem; color: var(--dark-blue); font-weight: 700; margin-top: 4px;">${t.titleTh}</h3>
                <div style="font-size: 0.85rem; color: var(--text-light);">${t.titleEn}</div>
              </div>
            </div>

            <div class="team-duty-box" style="margin-bottom: 20px;">
              <div class="duty-label">ภาระหน้าที่และความรับผิดชอบ (Role & Responsibilities)</div>
              <div class="duty-text">${t.dutyTh}</div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">${t.dutyEn}</div>
            </div>

            <div class="duty-label" style="margin-bottom: 12px;">สมาชิกในทีม (Team Members)</div>
            <div class="members-grid">
              ${t.members.map(m => `
                <div class="member-card">
                  <div class="member-avatar">${ICONS.user}</div>
                  <div>
                    <div class="member-name">${m.name}</div>
                    <div class="member-role">${m.roleTh}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Committee | คณะกรรมการดำเนินงาน 6 ทีม',
    currentKey: 'committee',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 4. PAGE: CALL FOR PAPERS (cfp.html & cfp/index.html)
// -------------------------------------------------------------
function buildCfpPage() {
  const banner = buildPageBanner('ประกาศเปิดรับบทความวิจัย', 'Call for Papers (CFP)', 'Call for Papers');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag green">${ICONS.check} CFP Announcement</div>
        <h2 class="section-title">นโยบายและขอบเขตการรับบทความ</h2>
        <div class="section-subtitle">Scope, Tracks & Submission Requirements</div>
        <p class="section-desc" style="margin: 8px 0 0 0;">
          ขอเชิญนักศึกษาในรายวิชาสัมมนา ${DATA.meta.courseCode} ${DATA.meta.courseNameTh} ส่งบทความวิจัยฉบับเต็มเพื่อรับการตรวจประเมินแบบ Double-Blind Peer Review
        </p>
      </div>

      <!-- Categories Breakdown: 4 Oral vs 10 Poster -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px;">
        <div style="background: linear-gradient(135deg, #F0F6FF, #E2EEFD); padding: 28px; border-radius: var(--radius-md); border: 1px solid var(--light-blue);">
          <span class="date-badge open">4 Selected Papers</span>
          <h3 style="color: var(--dark-blue); font-size: 1.35rem; margin-top: 8px;">การนำเสนอแบบบรรยาย (Oral Presentation)</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 8px 0 16px 0; line-height: 1.55;">
            คัดเลือกบทความที่มีคะแนนรีวิวระดับยอดเยี่ยม 4 อันดับแรก ความยาวบทความ 4-6 หน้า นำเสนอบนเวทีห้องประชุมใหญ่ 15 นาที พร้อมช่วงตอบข้อซักถาม 5 นาที
          </p>
          <ul style="font-size: 0.85rem; color: var(--deep-navy); display: flex; flex-direction: column; gap: 6px;">
            <li>• สไลด์นำเสนอตามเทมเพลตมาตรฐาน</li>
            <li>• บรรยายภาษาไทยหรือภาษาอังกฤษ</li>
            <li>• มีสิทธิ์ชิงรางวัล Best Paper Award</li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, #FDF4FF, #F3E8FD); padding: 28px; border-radius: var(--radius-md); border: 1px solid #E9D5FF);">
          <span class="date-badge upcoming" style="background-color: #EDE9FE; color: #6D28D9;">10 Papers</span>
          <h3 style="color: #4C1D95; font-size: 1.35rem; margin-top: 8px;">การนำเสนอแบบโปสเตอร์ (Poster Presentation)</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 8px 0 16px 0; line-height: 1.55;">
            สำหรับบทความวิจัย 10 เรื่อง ความยาว 2-4 หน้า จัดแสดงนิทรรศการโปสเตอร์ขนาด A1 แนวตั้ง พร้อมสาธิตผลงาน (Live Demonstration / Prototype) แก่ผู้ร่วมงาน
          </p>
          <ul style="font-size: 0.85rem; color: var(--deep-navy); display: flex; flex-direction: column; gap: 6px;">
            <li>• ขนาดโปสเตอร์มาตรฐาน A1 (594 x 841 mm)</li>
            <li>• นำเสนอแบบ Interactive ต่อผู้เยี่ยมชมบอร์ด</li>
            <li>• มีสิทธิ์ชิงรางวัล Best Poster & Popular Vote</li>
          </ul>
        </div>
      </div>

      <!-- Topics / Tracks Grid -->
      <div class="section-header text-left">
        <div class="section-tag">${ICONS.layers} 6 Research Tracks</div>
        <h2 class="section-title">หัวข้อวิจัยที่เปิดรับ (Tracks)</h2>
      </div>

      <div class="topics-grid" style="margin-bottom: 56px;">
        ${DATA.topics.map(t => `
          <div class="topic-card">
            <div class="topic-header">
              <div class="topic-icon-wrap" style="color: ${t.color}">
                ${getTopicIcon(t.id)}
              </div>
              <div>
                <span class="topic-tag">${t.code}</span>
                <div class="topic-title-th">${t.nameTh}</div>
                <div class="topic-title-en">${t.nameEn}</div>
              </div>
            </div>
            <p class="topic-desc">${t.descTh}</p>
            <div class="subtopics-list">
              ${t.subtopics.map(sub => `<div class="subtopic-item">${sub}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Important Deadlines Table -->
      <div class="venue-card-details" style="margin-bottom: 48px;">
        <h3 class="section-title" style="font-size: 1.4rem; margin-bottom: 16px;">ตารางกำหนดการสำคัญ (Important Deadlines)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.92rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--card-border); text-align: left; color: var(--text-light); font-size: 0.8rem; text-transform: uppercase;">
              <th style="padding: 12px 16px;">Milestone / เหตุการณ์</th>
              <th style="padding: 12px 16px;">วันที่กำหนด</th>
              <th style="padding: 12px 16px;">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${DATA.importantDates.map(d => `
              <tr style="border-bottom: 1px solid var(--card-border);">
                <td style="padding: 14px 16px;">
                  <strong style="color: var(--dark-blue);">${d.titleTh}</strong><br>
                  <span style="font-size: 0.8rem; color: var(--text-light);">${d.titleEn}</span>
                </td>
                <td style="padding: 14px 16px; font-weight: 600; color: var(--deep-navy);">${d.dateTh}</td>
                <td style="padding: 14px 16px;">
                  <span class="date-badge ${d.status}">${d.statusBadge}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Template Downloads -->
      <div class="venue-card-details">
        <h3 class="section-title" style="font-size: 1.4rem; margin-bottom: 8px;">ดาวน์โหลดเทมเพลตบทความวิจัย</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
          โปรดจัดเตรียมบทความให้ตรงตามข้อกำหนดเทมเพลตมาตรฐานของรายวิชาสัมมนา CDTI
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
          ${DATA.guidelines.templates.map(tmpl => `
            <div style="padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--card-border); background-color: var(--bg-light-blue); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">${tmpl.type} (${tmpl.size})</div>
                <div style="font-weight: 600; color: var(--dark-blue); font-size: 0.95rem; margin-top: 4px;">${tmpl.name}</div>
              </div>
              <button onclick="showToast('ดาวน์โหลดเทมเพลต: ${tmpl.name} (ไฟล์จำลอง)')" class="btn btn-outline btn-sm" style="margin-top: 14px; width: fit-content;">
                ${ICONS.download} Download Template
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Call for Papers (CFP) | ประกาศเปิดรับบทความวิจัย',
    currentKey: 'cfp',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 5. PAGE: SUBMISSION (submission.html & submission/index.html)
// -------------------------------------------------------------
function buildSubmissionPage() {
  const banner = buildPageBanner('แนวทางและระบบส่งบทความ', 'Submission Workflow & Guidelines', 'Submission');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag green">${ICONS.check} 9-Step Pipeline</div>
        <h2 class="section-title">ขั้นตอนการดำเนินงานบทความวิชาการ</h2>
        <div class="section-subtitle">Conference Workflow from CFP to Proceedings</div>
      </div>

      <!-- 9-Step Pipeline Visual -->
      <div class="workflow-pipeline" style="margin-bottom: 48px;">
        ${DATA.workflow.map(w => `
          <div class="pipeline-step">
            <div class="pipeline-circle">${w.step}</div>
            <div class="pipeline-step-th">${w.nameTh}</div>
            <div class="pipeline-step-en">${w.nameEn}</div>
          </div>
        `).join('')}
      </div>

      <!-- Submission Guidelines Box -->
      <div class="venue-card-details" style="margin-bottom: 48px;">
        <h3 class="section-title" style="font-size: 1.4rem; margin-bottom: 16px;">ข้อกำหนดสำหรับผู้แต่ง (Author Checklist)</h3>
        
        <div class="venue-list">
          <div class="venue-list-item">
            ${ICONS.check}
            <div>
              <strong>รูปแบบบทความ:</strong> ${DATA.guidelines.paperFormatTh}<br>
              <span style="font-size: 0.8rem; color: var(--text-light);">${DATA.guidelines.paperFormatEn}</span>
            </div>
          </div>
          <div class="venue-list-item">
            ${ICONS.check}
            <div>
              <strong>ภาษาที่ใช้:</strong> ${DATA.guidelines.languageTh}<br>
              <span style="font-size: 0.8rem; color: var(--text-light);">${DATA.guidelines.languageEn}</span>
            </div>
          </div>
          <div class="venue-list-item">
            ${ICONS.check}
            <div>
              <strong>นโยบาย Double-Blind Review:</strong> ${DATA.guidelines.blindPolicyTh}<br>
              <span style="font-size: 0.8rem; color: var(--text-light);">${DATA.guidelines.blindPolicyEn}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Mock Submission Form on Page -->
      <div class="contact-form-card" style="max-width: 800px; margin: 0 auto;">
        <div class="section-tag">${ICONS.fileText} Online Submission Form</div>
        <h3 class="section-title" style="font-size: 1.5rem; margin-top: 8px;">แบบฟอร์มส่งบทความออนไลน์</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 24px;">
          ส่งบทความฉบับเต็ม (.pdf) สำหรับนักศึกษา 14 คนในรายวิชาสัมมนา ${DATA.meta.courseCode}
        </p>

        <form id="submissionPageForm" onsubmit="event.preventDefault(); showToast('บันทึกการส่งบทความสำเร็จ (จำลองระบบทดสอบ)'); this.reset();">
          <div class="form-group">
            <label class="form-label">กลุ่มหัวข้อวิจัย (Research Track) *</label>
            <select class="form-control" required>
              ${DATA.topics.map(t => `<option value="${t.code}">${t.code}: ${t.nameTh} (${t.nameEn})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">ชื่อบทความวิจัย (Title) *</label>
            <input type="text" class="form-control" placeholder="พิมพ์ชื่อบทความวิจัยฉบับเต็ม" required>
          </div>

          <div class="form-group">
            <label class="form-label">ชื่อผู้วิจัยและรหัสนักศึกษา (Author / Student ID) *</label>
            <input type="text" class="form-control" placeholder="เช่น [ชื่อ-นามสกุล], รหัส 64xxxxxx" required>
          </div>

          <div class="form-group">
            <label class="form-label">บทคัดย่อภาษาอังกฤษ (English Abstract) *</label>
            <textarea class="form-control" rows="5" placeholder="Enter full paper abstract (max 250 words)..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">คำสำคัญ (Keywords) *</label>
            <input type="text" class="form-control" placeholder="เช่น Machine Learning, IoT, Cloud Security (คั่นด้วยจุลภาค)" required>
          </div>

          <div class="form-group">
            <label class="form-label">อัปโหลดไฟล์บทความ PDF (Anonymized for Double-Blind Review) *</label>
            <input type="file" class="form-control" accept=".pdf" required>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 14px;">
            Submit Paper for Peer Review
          </button>
        </form>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Submission | ขั้นตอนและระบบส่งบทความวิชาการ',
    currentKey: 'submission',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 6. PAGE: PROGRAM (program.html & program/index.html)
// -------------------------------------------------------------
function buildProgramPage() {
  const banner = buildPageBanner('กำหนดการและสูติบัตรการประชุม', 'Technical Program & Presentations', 'Program');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag">${ICONS.calendar} Conference Day</div>
        <h2 class="section-title">กำหนดการประชุมวิชาการฉบับเต็ม</h2>
        <div class="section-subtitle">${DATA.schedule.dayLabelTh} · ${DATA.schedule.dateTh}</div>
        <p class="section-desc" style="margin: 8px 0 0 0;">
          ณ ${DATA.schedule.locationTh} รวม 14 บทความวิจัย (4 Oral Presentations และ 10 Poster Presentations)
        </p>
      </div>

      <!-- Schedule Timeline Detailed -->
      <div class="schedule-container" style="max-width: 960px; margin-bottom: 56px;">
        <div class="timeline">
          ${DATA.schedule.sessions.map(s => `
            <div class="timeline-item ${s.highlight ? 'highlight' : ''}">
              <div class="timeline-marker"></div>
              <div class="timeline-card">
                <div class="timeline-header">
                  <div class="session-time">${ICONS.clock} ${s.time}</div>
                  <span class="session-badge ${s.type}">${s.badgeTh}</span>
                </div>
                <div class="timeline-title-th" style="font-size: 1.2rem;">${s.titleTh}</div>
                <div class="timeline-title-en">${s.titleEn}</div>

                <div class="session-meta">
                  <div class="session-meta-item">${ICONS.mapPin} ${s.locationTh}</div>
                  <div class="session-meta-item">${ICONS.user} ${s.speakerTh}</div>
                </div>

                ${s.papers ? `
                  <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">
                      รายการบทความในเซสชันนี้ (${s.papers.length} Papers)
                    </div>
                    ${s.papers.map(p => `
                      <div class="paper-pill" style="padding: 10px 14px;">
                        <span class="paper-pill-code" style="font-size: 0.9rem;">${p.code}</span>
                        <div style="display: flex; flex-direction: column;">
                          <strong style="color: var(--dark-blue);">${p.titleTh}</strong>
                          <span style="font-size: 0.78rem; color: var(--text-light);">${p.titleEn}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Presentation Guidelines (Oral & Poster) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="venue-card-details">
          <h3 class="section-title" style="font-size: 1.3rem; margin-bottom: 12px;">คำแนะนำสำหรับผู้นำเสนอ Oral</h3>
          <ul style="font-size: 0.88rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 10px; line-height: 1.55;">
            <li>• เวลาในการนำเสนอ 15 นาที + ตอบข้อซักถาม 5 นาที รวม 20 นาทีต่อบทความ</li>
            <li>• สไลด์นำเสนออัตราส่วน 16:9 โปรดส่งไฟล์ให้ฝ่ายโสตฯ ล่วงหน้าอย่างน้อย 30 นาทีก่อนเริ่มเซสชัน</li>
            <li>• มีอุปกรณ์ไมค์ลอย พอยเตอร์เลเซอร์ และจอมอนิเตอร์บอกเวลาในห้องประชุม</li>
          </ul>
        </div>

        <div class="venue-card-details">
          <h3 class="section-title" style="font-size: 1.3rem; margin-bottom: 12px;">คำแนะนำสำหรับผู้นำเสนอ Poster</h3>
          <ul style="font-size: 0.88rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 10px; line-height: 1.55;">
            <li>• ติดโปสเตอร์ขนาด A1 แนวตั้ง ณ บอร์ดที่กำหนด (P-01 ถึง P-10) ภายในเวลา 09:00 น.</li>
            <li>• ผู้นำเสนอประจำบอร์ดตลอดช่วงเวลา 13:00 - 14:30 น. เพื่อตอบข้อซักถามผู้เข้าชม</li>
            <li>• มีโต๊ะวางเครื่องคอมพิวเตอร์พกพาสำหรับการสาธิตต้นแบบ (Prototype Demo)</li>
          </ul>
        </div>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Program | กำหนดการและสูติบัตรการประชุมวิชาการ',
    currentKey: 'program',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 7. PAGE: REGISTRATION (registration.html & registration/index.html)
// -------------------------------------------------------------
function buildRegistrationPage() {
  const banner = buildPageBanner('ลงทะเบียนเข้าร่วมการประชุม', 'Conference Registration Portal', 'Registration');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag green">${ICONS.users} Free Attendance</div>
        <h2 class="section-title">ข้อมูลและอัตราค่าลงทะเบียน</h2>
        <div class="section-subtitle">Registration Categories & Policy</div>
        <p class="section-desc" style="margin: 8px 0 0 0;">
          รายวิชาสัมมนา ${DATA.meta.courseCode} เปิดให้เข้าชมฟรีสำหรับนักศึกษา คณาจารย์ สถาบันเทคโนโลยีจิตรลดา และบุคคลภายนอกที่ลงทะเบียนล่วงหน้า
        </p>
      </div>

      <div class="dates-timeline" style="margin-bottom: 48px;">
        <div class="date-card">
          <span class="date-badge open">Free · ฟรี</span>
          <div class="date-title-th">ผู้นำเสนอบทความ (Authors)</div>
          <div class="date-title-en">Seminar Students Presenters (14 Authors)</div>
          <div class="date-desc">สำหรับนักศึกษาในรายวิชาสัมมนา CPE ทุกคน มีสิทธิ์นำเสนอ ได้รับสูติบัตร อาหารว่าง และเล่ม Proceedings</div>
        </div>

        <div class="date-card">
          <span class="date-badge open">Free · ฟรี</span>
          <div class="date-title-th">ผู้เข้าร่วมฟัง CDTI (Attendees)</div>
          <div class="date-title-en">CDTI Students & Faculty Members</div>
          <div class="date-desc">สำหรับนักศึกษาและคณาจารย์สถาบันเทคโนโลยีจิตรลดา ได้รับสิทธิ์เข้าร่วมฟังทุกเซสชัน อาหารว่าง และสิทธิ์โหวต Popular Vote</div>
        </div>

        <div class="date-card">
          <span class="date-badge open">Free · ฟรี</span>
          <div class="date-title-th">ผู้สังเกตการณ์ทั่วไป (Guest / Online)</div>
          <div class="date-title-en">General Public & Online Viewers</div>
          <div class="date-desc">รับชมการถ่ายทอดสดออนไลน์ Live Streaming และดาวน์โหลดเอกสารประกอบการประชุมทางวิชาการ</div>
        </div>
      </div>

      <!-- Registration Form on Page -->
      <div class="contact-form-card" style="max-width: 760px; margin: 0 auto;">
        <div class="section-tag green">Online Registration</div>
        <h3 class="section-title" style="font-size: 1.5rem; margin-top: 8px;">แบบฟอร์มลงทะเบียนเข้าร่วมงาน</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 24px;">
          กรุณากรอกข้อมูลเพื่อจัดเตรียมอาหารว่าง สูติบัตร และป้ายชื่อผู้เข้าร่วมงาน
        </p>

        <form id="regPageForm" onsubmit="event.preventDefault(); showToast('ลงทะเบียนสำเร็จเรียบร้อยแล้ว'); this.reset();">
          <div class="form-group">
            <label class="form-label">ประเภทผู้เข้าร่วมงาน *</label>
            <select class="form-control" required>
              <option value="author">นักศึกษาผู้นำเสนอบทความ (Presenter / Author)</option>
              <option value="cdti-student">นักศึกษา CDTI (Attendee)</option>
              <option value="faculty">อาจารย์ / บุคลากร CDTI</option>
              <option value="guest">บุคคลภายนอก / ผู้สังเกตการณ์ทั่วไป</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">ชื่อ-นามสกุล *</label>
            <input type="text" class="form-control" placeholder="ชื่อและนามสกุลจริง" required>
          </div>

          <div class="form-group">
            <label class="form-label">หน่วยงาน / สถาบัน / สาขาวิชา *</label>
            <input type="text" class="form-control" placeholder="เช่น คณะเทคโนโลยีดิจิทัล สถาบันเทคโนโลยีจิตรลดา" required>
          </div>

          <div class="form-group">
            <label class="form-label">อีเมลสำหรับรับสูติบัตร *</label>
            <input type="email" class="form-control" placeholder="your-email@cdti.ac.th" required>
          </div>

          <div class="form-group">
            <label class="form-label">รูปแบบการเข้าร่วมงาน *</label>
            <select class="form-control" required>
              <option value="onsite">เข้าร่วมแบบ Onsite ณ สถาบันเทคโนโลยีจิตรลดา</option>
              <option value="online">เข้าร่วมแบบ Online Live Streaming</option>
            </select>
          </div>

          <button type="submit" class="btn btn-accent btn-lg" style="width: 100%; margin-top: 14px;">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Registration | ลงทะเบียนเข้าร่วมงานประชุมวิชาการ',
    currentKey: 'registration',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 8. PAGE: VENUE (venue.html & venue/index.html)
// -------------------------------------------------------------
function buildVenuePage() {
  const banner = buildPageBanner('สถานที่จัดการประชุมและการเดินทาง', 'Venue & Directions', 'Venue');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag">${ICONS.building} Conference Venue</div>
        <h2 class="section-title">${DATA.venue.titleTh}</h2>
        <div class="section-subtitle">${DATA.venue.buildingTh}</div>
      </div>

      <div class="venue-address-box" style="margin-bottom: 40px;">
        <div style="color: var(--primary-blue); font-size: 1.4rem;">${ICONS.mapPin}</div>
        <div>
          <strong style="font-size: 1.1rem; color: var(--dark-blue);">${DATA.venue.buildingTh}</strong><br>
          ${DATA.venue.addressTh}<br>
          <span style="font-size: 0.85rem; color: var(--text-light);">${DATA.venue.addressEn}</span>
        </div>
      </div>

      <!-- Room Breakdown -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px;">
        <div class="venue-card-details">
          <span class="topic-tag">Oral Presentations</span>
          <h3 style="color: var(--dark-blue); font-size: 1.3rem; margin-top: 6px;">ห้องประชุมใหญ่ ชั้น 4</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 8px 0;">
            ห้องประชุมมาตรฐานพร้อมระบบโสตทัศนูปกรณ์ จอโปรเจกเตอร์ความละเอียดสูง และเครื่องเสียงสำหรับพิธีเปิด ปาฐกถา และการบรรยาย 4 บทความ Oral
          </p>
        </div>

        <div class="venue-card-details">
          <span class="topic-tag">Poster & Networking</span>
          <h3 style="color: var(--dark-blue); font-size: 1.3rem; margin-top: 6px;">โถงนิทรรศการ ชั้น 2</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 8px 0;">
            พื้นที่เปิดโล่งสำหรับติดตั้งบอร์ดแสดงโปสเตอร์ 10 บทความวิจัย จุดรับประทานอาหารว่าง และพื้นที่แลกเปลี่ยนความคิดเห็น
          </p>
        </div>
      </div>

      <!-- Transportation Options -->
      <div class="section-header text-left">
        <div class="section-tag">${ICONS.mapPin} Transit Guide</div>
        <h2 class="section-title">คำแนะนำการเดินทาง</h2>
        <div class="section-subtitle">How to Reach the Venue</div>
      </div>

      <div class="dates-timeline" style="margin-bottom: 48px;">
        ${DATA.venue.transportation.map(t => `
          <div class="date-card">
            <div class="date-badge upcoming">${ICONS.check} ${t.modeEn}</div>
            <div class="date-title-th">${t.modeTh}</div>
            <div class="date-desc" style="font-size: 0.88rem; line-height: 1.55; margin-top: 10px;">
              ${t.descTh}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-light); margin-top: 6px;">
              ${t.descEn}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Interactive Map Card -->
      <div class="venue-map-placeholder" style="height: 340px;">
        <div class="map-icon">${ICONS.mapPin}</div>
        <h3 style="font-size: 1.3rem; color: var(--dark-blue); margin-bottom: 6px;">พิกัดสถาบันเทคโนโลยีจิตรลดา (CDTI)</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin-bottom: 18px;">
          ${DATA.venue.addressTh}
        </p>
        <a href="https://maps.google.com/?q=Chitralada+Technology+Institute" target="_blank" rel="noopener" class="btn btn-primary">
          เปิดเส้นทางนำทางบน Google Maps ↗
        </a>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Venue | สถานที่จัดการประชุมและการเดินทาง CDTI',
    currentKey: 'venue',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 9. PAGE: CONTACT (contact.html & contact/index.html)
// -------------------------------------------------------------
function buildContactPage() {
  const banner = buildPageBanner('ติดต่อคณะผู้จัดงาน', 'Contact & Organizing Inquiries', 'Contact');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag">${ICONS.mail} Directory</div>
        <h2 class="section-title">ช่องทางการติดต่อและสอบถาม</h2>
        <div class="section-subtitle">Department & Organizing Staff</div>
      </div>

      <div class="contact-grid">
        <div class="contact-info-card">
          <h3 class="section-title" style="font-size: 1.35rem; margin-bottom: 20px;">ข้อมูลผู้ประสานงานหลัก</h3>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.users}</div>
            <div>
              <div class="contact-item-title">อาจารย์ผู้ประสานงานรายวิชา (Faculty Advisor)</div>
              <div class="contact-item-val">${DATA.contact.facultyAdvisorTh}</div>
              <div style="font-size: 0.82rem; color: var(--text-light);">${DATA.contact.facultyAdvisorEn}</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.user}</div>
            <div>
              <div class="contact-item-title">ประธานจัดการประชุม (General Chair)</div>
              <div class="contact-item-val">${DATA.contact.generalChairTh}</div>
              <div style="font-size: 0.82rem; color: var(--text-light);">${DATA.contact.generalChairEn}</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.mail}</div>
            <div>
              <div class="contact-item-title">อีเมลกลางประสานงาน</div>
              <div class="contact-item-val">${DATA.contact.email}</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.phone}</div>
            <div>
              <div class="contact-item-title">โทรศัพท์สำนักงาน</div>
              <div class="contact-item-val">${DATA.contact.phone}</div>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">${ICONS.building}</div>
            <div>
              <div class="contact-item-title">สถานที่ตั้งสำนักงานสาขา</div>
              <div class="contact-item-val" style="font-size: 0.88rem; font-weight: normal; line-height: 1.5;">
                ${DATA.contact.officeTh}
              </div>
            </div>
          </div>
        </div>

        <div class="contact-form-card">
          <h3 class="section-title" style="font-size: 1.35rem; margin-bottom: 12px;">แบบฟอร์มติดต่อสอบถาม</h3>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px;">
            ทีมงานฝ่าย Website & Registration จะประสานงานและตอบกลับโดยเร็ว
          </p>

          <form id="contactPageForm" onsubmit="event.preventDefault(); showToast('ข้อความของคุณถูกส่งไปยังทีมงานเรียบร้อยแล้ว'); this.reset();">
            <div class="form-group">
              <label class="form-label">ชื่อผู้ติดต่อ *</label>
              <input type="text" class="form-control" placeholder="ชื่อ-นามสกุล" required>
            </div>
            <div class="form-group">
              <label class="form-label">อีเมลตอบกลับ *</label>
              <input type="email" class="form-control" placeholder="email@address.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">หัวข้อเรื่องที่ต้องการสอบถาม *</label>
              <select class="form-control" required>
                <option value="cfp">การส่งบทความวิชาการ (CFP & Submission)</option>
                <option value="review">กระบวนการพิจารณาบทความ (Peer Review)</option>
                <option value="program">ตารางเวลาและโปรแกรมการนำเสนอ (Program)</option>
                <option value="venue">สถานที่และการเดินทาง (Venue & Logistics)</option>
                <option value="other">เรื่องอื่นๆ</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ข้อความรายละเอียด *</label>
              <textarea class="form-control" rows="5" placeholder="พิมพ์ข้อความของคุณที่นี่..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Contact | ติดต่อสอบถามทีมงานจัดการประชุม',
    currentKey: 'contact',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// 10. PAGE: ARCHIVE (archive.html & archive/index.html - ccat style)
// -------------------------------------------------------------
function buildArchivePage() {
  const banner = buildPageBanner('คลังเอกสารและรายงานการประชุมย้อนหลัง', 'Conference Archives & Past Proceedings', 'Archive');

  const content = `
  <section class="section">
    <div class="container">
      <div class="section-header text-left">
        <div class="section-tag">${ICONS.fileText} Repository</div>
        <h2 class="section-title">รายงานการประชุมวิชาการย้อนหลัง</h2>
        <div class="section-subtitle">Past Editions & Archived Proceedings</div>
        <p class="section-desc" style="margin: 8px 0 0 0;">
          รวบรวมประวัติการจัดงานประชุมวิชาการสัมมนาของนักศึกษาวิศวกรรมคอมพิวเตอร์ สถาบันเทคโนโลยีจิตรลดาในปีก่อนหน้า
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 28px; margin-bottom: 48px;">
        ${DATA.archives.map(a => `
          <div class="venue-card-details" style="border-left: 4px solid var(--primary-blue);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
              <div>
                <span class="topic-tag">Academic Year ${a.year}</span>
                <h3 style="font-size: 1.35rem; color: var(--dark-blue); font-weight: 700; margin-top: 4px;">${a.titleTh}</h3>
                <div style="font-size: 0.85rem; color: var(--text-light);">${a.titleEn}</div>
              </div>
              <button onclick="showToast('ดาวน์โหลดเล่ม Proceeding ${a.year} (ไฟล์จำลอง)')" class="btn btn-outline btn-sm">
                ${ICONS.download} Download Proceedings (${a.year})
              </button>
            </div>

            <div style="margin: 14px 0; background-color: var(--bg-light-blue); padding: 12px 16px; border-radius: var(--radius-sm);">
              <strong>ธีมงานประชุม:</strong> ${a.themeTh} (${a.themeEn})
            </div>

            <div style="display: flex; gap: 20px; font-size: 0.85rem; color: var(--text-secondary); flex-wrap: wrap;">
              <div><strong>จำนวนบทความ:</strong> ${a.papersCount}</div>
              <div><strong>Oral Sessions:</strong> ${a.oralCount}</div>
              <div><strong>Poster Sessions:</strong> ${a.posterCount}</div>
            </div>
          </div>
        `).join('')}

        <!-- Current Year Card -->
        <div class="venue-card-details" style="border: 2px dashed var(--primary-blue); background-color: var(--bg-light-blue);">
          <span class="topic-tag" style="background-color: var(--accent-green-bg); color: var(--accent-green);">Current Edition (${DATA.meta.academicYear})</span>
          <h3 style="font-size: 1.35rem; color: var(--dark-blue); font-weight: 700; margin-top: 4px;">${DATA.conference.nameTh}</h3>
          <div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px;">${DATA.conference.nameEn}</div>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.55;">
            การประชุมกำลังอยู่ระหว่างการดำเนินงานตามแผนงาน 9 สัปดาห์ บทความฉบับสมบูรณ์และเล่มรายงานการประชุมจะถูกเผยแพร่ในหน้านี้ภายหลังเสร็จสิ้นการประชุม Mini-Conference
          </p>
        </div>
      </div>
    </div>
  </section>`;

  return renderPageLayout({
    title: 'Archive | คลังเอกสารและรายงานการประชุมย้อนหลัง',
    currentKey: 'archive',
    relativePath: '..',
    contentHtml: content,
    pageBannerHtml: banner
  });
}

// -------------------------------------------------------------
// BUILD EXECUTION
// -------------------------------------------------------------
function buildSite() {
  console.log('🚀 Starting Static Site Build for CDTI CPE Mini-Conference...');

  // Ensure directories exist
  const subdirs = ['about', 'committee', 'cfp', 'submission', 'program', 'registration', 'venue', 'contact', 'archive', 'css', 'js', 'data'];
  subdirs.forEach(dir => {
    fs.mkdirSync(path.join(DIST_DIR, dir), { recursive: true });
  });

  // 1. Build Pages
  const pages = [
    { name: 'home', build: buildHomePage, dir: '.' },
    { name: 'about', build: buildAboutPage, dir: 'about' },
    { name: 'committee', build: buildCommitteePage, dir: 'committee' },
    { name: 'cfp', build: buildCfpPage, dir: 'cfp' },
    { name: 'submission', build: buildSubmissionPage, dir: 'submission' },
    { name: 'program', build: buildProgramPage, dir: 'program' },
    { name: 'registration', build: buildRegistrationPage, dir: 'registration' },
    { name: 'venue', build: buildVenuePage, dir: 'venue' },
    { name: 'contact', build: buildContactPage, dir: 'contact' },
    { name: 'archive', build: buildArchivePage, dir: 'archive' }
  ];

  pages.forEach(p => {
    const htmlContent = p.build();
    if (p.dir === '.') {
      fs.writeFileSync(path.join(DIST_DIR, 'index.html'), htmlContent, 'utf8');
      console.log('  ✔ Created dist/index.html');
    } else {
      // Write subpage inside folder (dist/sub/index.html)
      fs.writeFileSync(path.join(DIST_DIR, p.dir, 'index.html'), htmlContent, 'utf8');
      // Also write root-level HTML file (dist/sub.html) for flexible static hosting
      // adjusting relative paths
      const rootHtmlContent = htmlContent.replace(/\.\.\//g, './');
      fs.writeFileSync(path.join(DIST_DIR, `${p.name}.html`), rootHtmlContent, 'utf8');
      console.log(`  ✔ Created dist/${p.dir}/index.html and dist/${p.name}.html`);
    }
  });

  // 2. Copy CSS, JS, and Data assets
  fs.copyFileSync(path.join(__dirname, 'src/css/style.css'), path.join(DIST_DIR, 'css/style.css'));
  console.log('  ✔ Copied dist/css/style.css');

  fs.copyFileSync(path.join(__dirname, 'src/js/main.js'), path.join(DIST_DIR, 'js/main.js'));
  console.log('  ✔ Copied dist/js/main.js');

  fs.copyFileSync(path.join(__dirname, 'src/data/conference-data.js'), path.join(DIST_DIR, 'js/conference-data.js'));
  fs.copyFileSync(path.join(__dirname, 'src/data/conference-data.js'), path.join(DIST_DIR, 'data/conference-data.js'));
  console.log('  ✔ Copied dist/js/conference-data.js and dist/data/conference-data.js');

  console.log('🎉 Build completed successfully! Output static files are in app/dist/');
}

buildSite();
