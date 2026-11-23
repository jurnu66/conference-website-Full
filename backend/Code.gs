/**
 * Backend ของเว็บ Mini-Conference — ใช้ Google Drive + Google Sheets (รันบน Google Apps Script)
 *
 *  - ไฟล์บทความ (PDF)  → โฟลเดอร์ Google Drive
 *  - ข้อมูลบทความ / เวลา / รายชื่อแอดมิน → Google Sheets (3 แท็บ: Submissions, Settings, Admins)
 *  - แอดมินล็อกอินด้วยอีเมล + รหัสผ่าน (เก็บเป็นแฮชในแท็บ Admins) ไม่ผูกกับ Google
 *
 * ขั้นตอนติดตั้งอยู่ใน SETUP.md
 */

const TZ = 'Asia/Bangkok';
const TZ_OFFSET = '+07:00';
const MAX_BYTES = 10 * 1024 * 1024; // PDF ไม่เกิน 10 MB

const SUB_HEADERS = ['id', 'submittedAt', 'title', 'authors', 'email', 'affiliation', 'type', 'abstract',
  'fileName', 'fileUrl', 'folderId', 'status', 'slotDate', 'slotTime', 'room', 'note', 'updatedAt', 'updatedBy'];
const SETTING_KEYS = ['submission_opens', 'submission_deadline', 'notification_date', 'camera_ready_date', 'conference_date'];
const STATUSES = ['submitted', 'under_review', 'accepted', 'rejected', 'camera_ready', 'withdrawn'];
const TYPES = ['oral', 'poster', 'any'];

/* ============ ติดตั้งครั้งแรก: รันฟังก์ชันนี้ 1 ครั้งจากตัวแก้ไข ============ */
function setup() {
  const props = PropertiesService.getScriptProperties();
  const owner = Session.getEffectiveUser().getEmail();

  let folder;
  if (props.getProperty('FOLDER_ID')) {
    folder = DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
  } else {
    folder = DriveApp.createFolder('CPE Seminar - Submissions');
    props.setProperty('FOLDER_ID', folder.getId());
  }

  let ss;
  if (props.getProperty('SHEET_ID')) {
    ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  } else {
    ss = SpreadsheetApp.create('CPE Seminar - Data');
    props.setProperty('SHEET_ID', ss.getId());
    DriveApp.getFileById(ss.getId()).moveTo(folder);
  }

  ensureSheet_(ss, 'Submissions', SUB_HEADERS);
  ensureSheet_(ss, 'Settings', ['key', 'value', 'updatedAt', 'updatedBy']);
  ensureSheet_(ss, 'Admins', ['email', 'role', 'addedBy', 'addedAt']);
  ensureSheet_(ss, 'Templates', ['key', 'fileName', 'fileId', 'updatedAt', 'updatedBy']);
  ensureSheet_(ss, 'Content', ['key', 'value', 'updatedAt', 'updatedBy']);
  const first = ss.getSheetByName('Sheet1');
  if (first && ss.getSheets().length > 1) ss.deleteSheet(first);

  // คอลัมน์ที่เป็นเวลา/วันที่ ตั้งเป็นข้อความ กัน Sheets แปลงเอง
  const sub = ss.getSheetByName('Submissions');
  ['slotDate', 'slotTime', 'submittedAt', 'updatedAt'].forEach(function (h) {
    sub.getRange(2, SUB_HEADERS.indexOf(h) + 1, sub.getMaxRows() - 1, 1).setNumberFormat('@');
  });
  const st = ss.getSheetByName('Settings');
  st.getRange(2, 2, st.getMaxRows() - 1, 2).setNumberFormat('@');

  const have = readSettings_();
  const missing = {};
  SETTING_KEYS.forEach(function (k) { if (!(k in have)) missing[k] = ''; });
  if (Object.keys(missing).length) writeSettings_(missing, 'setup');

  if (!findAdmin_(owner)) addAdminRow_(owner, 'owner', 'setup', '');

  Logger.log('เสร็จแล้ว\nโฟลเดอร์: ' + folder.getUrl() + '\nชีต: ' + ss.getUrl() + '\nแอดมินคนแรก (owner): ' + owner +
    '\nขั้นต่อไป: ตั้ง Script property ADMIN_BOOTSTRAP_PASSWORD (รหัสผ่านชั่วคราวของเจ้าของ) แล้ว Deploy เป็น Web app (ดู SETUP.md)');
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ============ Web app endpoints ============ */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'config';
  if (action === 'config') return json_(publicConfig_());
  if (action === 'template') return json_(templateDownload_(clean_(e.parameter.key, 10)));
  if (action === 'status') return json_(statusLookup_(e.parameter.id, e.parameter.email));
  if (action === 'media') return json_(mediaDownload_(clean_(e.parameter.id, 100)));
  return json_({ ok: false, error: 'unknown_action' });
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    if (req.action === 'submit') return json_(handleSubmit_(req));
    return json_(handleAdmin_(req));
  } catch (err) {
    return json_({ ok: false, error: err && err.code ? err.code : 'server_error', detail: err && err.code ? '' : String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function fail_(code) { const e = new Error(code); e.code = code; return e; }

/* ============ ฝั่งสาธารณะ ============ */
function publicConfig_() {
  const s = readSettings_();
  return { ok: true, now: new Date().toISOString(), status: windowStatus_(s), maxMB: MAX_BYTES / 1048576,
    settings: pick_(s, SETTING_KEYS), templates: templatesMeta_(readTemplates_()), content: readContent_() };
}

function windowStatus_(s) {
  if (!s.submission_opens) return 'unset';
  const now = Date.now();
  if (now < toDate_(s.submission_opens).getTime()) return 'upcoming';
  if (s.submission_deadline && now > toDate_(s.submission_deadline).getTime()) return 'closed';
  return 'open';
}
// "2026-12-15T23:59" (เวลาไทย) → Date
function toDate_(v) {
  const d = new Date(String(v).length === 16 ? v + ':00' + TZ_OFFSET : v);
  if (isNaN(d.getTime())) throw fail_('bad_date');
  return d;
}

function handleSubmit_(r) {
  if (r.hp) return { ok: true, id: 'P-000' }; // กันบอท: ช่องซ่อนต้องว่าง
  const title = clean_(r.title, 300), authors = clean_(r.authors, 500), email = clean_(r.email, 200).toLowerCase();
  if (windowStatus_(readSettings_()) !== 'open') throw fail_('closed');
  const affiliation = clean_(r.affiliation, 300), abstract = clean_(r.abstract, 4000);
  const type = TYPES.indexOf(r.type) >= 0 ? r.type : 'any';
  if (!title || !authors || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw fail_('invalid_fields');

  const bytes = Utilities.base64Decode(String(r.fileBase64 || ''));
  if (!bytes.length) throw fail_('no_file');
  if (bytes.length > MAX_BYTES) throw fail_('file_too_large');
  if (bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) throw fail_('not_pdf'); // %PDF

  const cache = CacheService.getScriptCache();
  const dupKey = 'dup_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, email + '|' + title));
  if (cache.get(dupKey)) throw fail_('duplicate');
  cache.put(dupKey, '1', 60);

  let id;
  const submittedAt = stamp_(new Date());
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_('Submissions');
    id = nextId_(sh);
    const safeTitle = title.substring(0, 60).replace(/[\/\\:*?"<>|]/g, ' ');
    const name = id + ' - ' + safeTitle + '.pdf';
    // วางไฟล์ลงโฟลเดอร์หลักโดยตรง (เร็วกว่าสร้างโฟลเดอร์ย่อยต่อบทความ)
    const file = DriveApp.getFolderById(prop_('FOLDER_ID')).createFile(Utilities.newBlob(bytes, 'application/pdf', name));
    appendSub_(sh, {
      id: id, submittedAt: submittedAt, title: title, authors: authors, email: email, affiliation: affiliation, type: type,
      abstract: abstract, fileName: name, fileUrl: 'https://drive.google.com/file/d/' + file.getId() + '/view', folderId: '', status: 'submitted',
      slotDate: '', slotTime: '', room: '', note: '', updatedAt: stamp_(new Date()), updatedBy: 'author'
    });
  } finally {
    lock.releaseLock();
  }
  let emailSent = true;
  try { // ส่งอีเมลหลังปล่อยล็อก ไม่ให้คิวรอ
    MailApp.sendEmail(email, '[CPE Seminar] ได้รับบทความของคุณแล้ว / Submission received (' + id + ')',
      'ได้รับบทความ "' + title + '" เรียบร้อยแล้ว\nรหัสบทความ: ' + id + '\nส่งเมื่อ: ' + submittedAt.replace('T', ' ') + '\n\n' +
      'ตรวจสอบสถานะได้ที่หน้า "การส่งบทความ" ของเว็บ โดยใช้รหัสบทความและอีเมลนี้\n\n' +
      'We received your paper "' + title + '".\nPaper ID: ' + id + '\nSubmitted: ' + submittedAt.replace('T', ' ') + '\n\n' +
      'You can check the status on the Paper Submission page using this Paper ID and email.');
  } catch (mailErr) { emailSent = false; /* ส่งอีเมลไม่ได้ก็ไม่ล้มการส่งงาน */ }
  return { ok: true, id: id, title: title, submittedAt: submittedAt, emailSent: emailSent };
}

/* ============ ฝั่งแอดมิน (ล็อกอินด้วยอีเมล + รหัสผ่าน) ============ */
const SESSION_SECONDS = 6 * 3600; // ล็อกอินค้างได้ 6 ชม. (เพดานของ CacheService)
const MIN_PASSWORD = 8;

function handleAdmin_(r) {
  if (r.action === 'login') return login_(r);

  const email = verifySession_(r.token);
  const admin = findAdmin_(email);
  if (!admin) throw fail_('unauthorized'); // ถูกลบสิทธิ์ไปแล้ว

  switch (r.action) {
    case 'whoami': return { ok: true, email: email, role: admin.role };

    case 'init': return Object.assign({ ok: true }, initData_(email, admin)); // โหลดทุกอย่างในครั้งเดียว

    case 'deleteSubmission':
      deleteSub_(String(r.id));
      return { ok: true };

    case 'logout':
      CacheService.getScriptCache().remove('sess_' + r.token);
      return { ok: true };

    case 'listSubmissions': return { ok: true, items: readSubs_(), statuses: STATUSES };

    case 'syncDrive': return syncDrive_(email);

    case 'downloadFile': { // ส่งไฟล์ผ่านระบบ แอดมินไม่ต้องมีสิทธิ์ใน Drive
      const sub = readSubs_().filter(function (x) { return x.id === String(r.id); })[0];
      const m = sub && /\/d\/([^\/]+)/.exec(sub.fileUrl);
      if (!m) throw fail_('not_found');
      const f = DriveApp.getFileById(m[1]);
      return { ok: true, name: f.getName(), base64: Utilities.base64Encode(f.getBlob().getBytes()) };
    }

    case 'updateSubmission': {
      const p = r.patch || {};
      const upd = {};
      if ('status' in p) { if (STATUSES.indexOf(p.status) < 0) throw fail_('bad_status'); upd.status = p.status; }
      if ('type' in p) { if (TYPES.indexOf(p.type) < 0) throw fail_('bad_type'); upd.type = p.type; }
      if ('slotDate' in p) { if (p.slotDate && !/^\d{4}-\d\d-\d\d$/.test(p.slotDate)) throw fail_('bad_date'); upd.slotDate = p.slotDate || ''; }
      if ('slotTime' in p) { if (p.slotTime && !/^\d\d:\d\d$/.test(p.slotTime)) throw fail_('bad_time'); upd.slotTime = p.slotTime || ''; }
      if ('room' in p) upd.room = clean_(p.room, 100);
      if ('note' in p) upd.note = clean_(p.note, 1000);
      upd.updatedAt = stamp_(new Date());
      upd.updatedBy = email;
      updateSub_(String(r.id), upd);
      return { ok: true };
    }

    case 'getSettings': return { ok: true, settings: pick_(readSettings_(), SETTING_KEYS) };

    case 'setSettings': {
      const v = r.settings || {};
      const upd = {};
      SETTING_KEYS.forEach(function (k) {
        if (!(k in v)) return;
        const val = String(v[k] || '').trim();
        const isTime = (k === 'submission_opens' || k === 'submission_deadline');
        if (val && isTime && !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(val)) throw fail_('bad_date');
        if (val && !isTime && !/^\d{4}-\d\d-\d\d$/.test(val)) throw fail_('bad_date');
        upd[k] = val;
      });
      writeSettings_(upd, email);
      return { ok: true, settings: pick_(readSettings_(), SETTING_KEYS) };
    }

    case 'uploadTemplate':
      return { ok: true, templates: saveTemplate_(email, clean_(r.key, 10), clean_(r.fileName, 120), String(r.fileBase64 || '')) };

    case 'deleteTemplate':
      return { ok: true, templates: deleteTemplate_(clean_(r.key, 10)) };

    case 'saveContent': return saveContent_(email, r.texts || {});

    case 'uploadMedia': return saveMedia_(email, r);

    case 'listAdmins': return { ok: true, admins: readAdmins_() };

    case 'addAdmin': {
      const e = clean_(r.email, 200).toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw fail_('invalid_email');
      if (String(r.password || '').length < MIN_PASSWORD) throw fail_('weak_password');
      if (findAdmin_(e)) throw fail_('already_admin');
      addAdminRow_(e, 'admin', email, hashPass_(String(r.password)));
      return { ok: true, admins: readAdmins_() };
    }

    case 'removeAdmin': {
      const e = clean_(r.email, 200).toLowerCase();
      const target = findAdmin_(e);
      if (!target) throw fail_('not_found');
      if (target.role === 'owner') throw fail_('cannot_remove_owner');
      if (e === email) throw fail_('cannot_remove_self');
      removeAdminRow_(e);
      return { ok: true, admins: readAdmins_() };
    }

    case 'changePassword': { // เปลี่ยนรหัสของตัวเอง
      if (!checkPass_(String(r.oldPassword || ''), findAdminHash_(email))) throw fail_('invalid_login');
      if (String(r.newPassword || '').length < MIN_PASSWORD) throw fail_('weak_password');
      setPassHash_(email, hashPass_(String(r.newPassword)));
      return { ok: true };
    }

    case 'resetPassword': { // เจ้าของระบบตั้งรหัสใหม่ให้แอดมินคนอื่น
      if (admin.role !== 'owner') throw fail_('forbidden');
      const e = clean_(r.email, 200).toLowerCase();
      if (!findAdmin_(e)) throw fail_('not_found');
      if (String(r.newPassword || '').length < MIN_PASSWORD) throw fail_('weak_password');
      setPassHash_(e, hashPass_(String(r.newPassword)));
      return { ok: true };
    }
  }
  throw fail_('unknown_action');
}

function login_(r) {
  const email = clean_(r.email, 200).toLowerCase();
  const pw = String(r.password || '');
  const cache = CacheService.getScriptCache();
  const failKey = 'fail_' + email;
  const fails = Number(cache.get(failKey) || 0);
  if (fails >= 5) throw fail_('too_many_attempts'); // ล็อก 15 นาทีหลังผิด 5 ครั้ง

  const admin = findAdmin_(email);
  let ok = false;
  if (admin) {
    if (admin.passHash) {
      ok = checkPass_(pw, admin.passHash);
      if (ok && isLegacyHash_(admin.passHash)) setPassHash_(email, hashPass_(pw)); // อัปเกรดแฮชเก่าให้เร็วขึ้น
    } else {
      // เจ้าของระบบล็อกอินครั้งแรกด้วยรหัสชั่วคราวจาก Script property ADMIN_BOOTSTRAP_PASSWORD
      const props = PropertiesService.getScriptProperties();
      const boot = props.getProperty('ADMIN_BOOTSTRAP_PASSWORD');
      if (admin.role === 'owner' && boot && pw === boot) {
        setPassHash_(email, hashPass_(pw));
        props.deleteProperty('ADMIN_BOOTSTRAP_PASSWORD');
        ok = true;
      }
    }
  }
  if (!ok) { cache.put(failKey, String(fails + 1), 900); throw fail_('invalid_login'); }

  cache.remove(failKey);
  const token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('sess_' + token, email, SESSION_SECONDS);
  // ส่งข้อมูลทั้งหมดกลับไปพร้อมกัน หน้าแอดมินไม่ต้องยิงขอซ้ำหลายครั้ง
  return Object.assign({ ok: true, token: token }, initData_(email, admin));
}

function initData_(email, admin) {
  return { email: email, role: admin.role, items: readSubs_(), statuses: STATUSES,
    settings: pick_(readSettings_(), SETTING_KEYS), admins: readAdmins_(), templates: templatesMeta_(readTemplates_()) };
}

function verifySession_(token) {
  if (!token) throw fail_('unauthorized');
  const email = CacheService.getScriptCache().get('sess_' + token);
  if (!email) throw fail_('unauthorized');
  return email;
}

// รหัสผ่านเก็บเป็น รอบ$salt$hash (SHA-256 วนซ้ำ) ไม่เก็บรหัสจริง · แบบเก่า salt$hash = 1000 รอบ
const PW_ROUNDS = 200;
function stretch_(salt, pw, rounds) {
  let b = Utilities.newBlob(salt + pw).getBytes();
  for (let i = 0; i < rounds; i++) b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, b);
  return b.map(function (x) { return ('0' + (x & 0xff).toString(16)).slice(-2); }).join('');
}
function hashPass_(pw) {
  const salt = Utilities.getUuid().replace(/-/g, '');
  return PW_ROUNDS + '$' + salt + '$' + stretch_(salt, pw, PW_ROUNDS);
}
function isLegacyHash_(stored) { return String(stored).split('$').length === 2; }
function checkPass_(pw, stored) {
  if (!stored) return false;
  const p = String(stored).split('$');
  if (p.length === 3) return stretch_(p[1], pw, Number(p[0])) === p[2];
  if (p.length === 2) return stretch_(p[0], pw, 1000) === p[1];
  return false;
}

/* ============ ฟังก์ชันช่วยเกี่ยวกับ Sheets (มีแคชเพื่อความเร็ว) ============ */
// เปิดชีตและอ่าน property ครั้งเดียวต่อคำขอ (openById ช้าราว 0.3–1 วินาทีต่อครั้ง)
let _props = null, _ss = null;
function prop_(k) {
  if (!_props) _props = PropertiesService.getScriptProperties().getProperties();
  const v = _props[k];
  if (!v) throw new Error('ยังไม่ได้ตั้งค่า ' + k + ' (ดู SETUP.md)');
  return v;
}
function ss_() { return _ss || (_ss = SpreadsheetApp.openById(prop_('SHEET_ID'))); }
function sheet_(name) { return ss_().getSheetByName(name); }
function stamp_(d) { return Utilities.formatDate(d, TZ, "yyyy-MM-dd'T'HH:mm:ss"); }
function pick_(o, keys) { const out = {}; keys.forEach(function (k) { out[k] = o[k] || ''; }); return out; }
function clean_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().substring(0, max); }
// กัน formula injection ใน Sheets
function safe_(v) { const s = String(v == null ? '' : v); return /^[=+\-@]/.test(s) ? "'" + s : s; }

function cacheGet_(k) { const v = CacheService.getScriptCache().get(k); return v ? JSON.parse(v) : null; }
function cachePut_(k, o, ttl) { try { CacheService.getScriptCache().put(k, JSON.stringify(o), ttl); } catch (e) { /* ใหญ่เกินแคช ก็อ่านจากชีตแทน */ } }
function cacheDel_(k) { CacheService.getScriptCache().remove(k); }

function appendSub_(sh, obj) {
  sh.appendRow(SUB_HEADERS.map(function (h) { return safe_(obj[h]); }));
}
function readSubs_() {
  const sh = sheet_('Submissions');
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, SUB_HEADERS.length).getDisplayValues().map(function (row) {
    const o = {};
    SUB_HEADERS.forEach(function (h, i) { o[h] = row[i]; });
    delete o.folderId;
    return o;
  });
}
// อ่านทั้งตารางครั้งเดียว แก้ในหน่วยความจำ แล้วเขียนกลับแถวเดียว (แทนที่จะเรียกชีตทีละช่อง)
function updateSub_(id, upd) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_('Submissions');
    const n = sh.getLastRow() - 1;
    if (n < 1) throw fail_('not_found');
    const vals = sh.getRange(2, 1, n, SUB_HEADERS.length).getValues();
    let i = -1;
    for (let k = 0; k < vals.length; k++) if (vals[k][0] === id) { i = k; break; }
    if (i < 0) throw fail_('not_found');
    Object.keys(upd).forEach(function (key) {
      const c = SUB_HEADERS.indexOf(key);
      if (c >= 0) vals[i][c] = safe_(upd[key]);
    });
    sh.getRange(i + 2, 1, 1, SUB_HEADERS.length).setValues([vals[i]]);
  } finally { lock.releaseLock(); }
}
// ลบแถวในชีต แล้วย้ายไฟล์ (และโฟลเดอร์ย่อยแบบเก่าถ้ามี) ไปถังขยะ Drive กู้คืนได้ 30 วัน
function deleteSub_(id) {
  let rec;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_('Submissions');
    const n = sh.getLastRow() - 1;
    if (n < 1) throw fail_('not_found');
    const vals = sh.getRange(2, 1, n, SUB_HEADERS.length).getValues();
    let i = -1;
    for (let k = 0; k < vals.length; k++) if (vals[k][0] === id) { i = k; break; }
    if (i < 0) throw fail_('not_found');
    rec = vals[i];
    sh.deleteRow(i + 2);
  } finally { lock.releaseLock(); }
  const folderId = String(rec[SUB_HEADERS.indexOf('folderId')] || '');
  const fileId = fileIdOf_(rec[SUB_HEADERS.indexOf('fileUrl')]);
  try {
    if (folderId && folderId !== prop_('FOLDER_ID')) DriveApp.getFolderById(folderId).setTrashed(true);
    else if (fileId) DriveApp.getFileById(fileId).setTrashed(true);
  } catch (e) { /* ไฟล์ถูกลบไปก่อนแล้ว ก็ถือว่าเรียบร้อย */ }
}

function readSettings_() {
  const hit = cacheGet_('settings');
  if (hit) return hit;
  const sh = sheet_('Settings');
  const n = sh.getLastRow() - 1;
  const out = {};
  if (n > 0) sh.getRange(2, 1, n, 2).getDisplayValues().forEach(function (r) { out[r[0]] = r[1]; });
  cachePut_('settings', out, 300);
  return out;
}
// เขียนหลายค่าในครั้งเดียว แล้วล้างแคช
function writeSettings_(obj, by) {
  const sh = sheet_('Settings');
  const n = sh.getLastRow() - 1;
  const rows = n > 0 ? sh.getRange(2, 1, n, 4).getValues() : [];
  Object.keys(obj).forEach(function (k) {
    const rec = [k, obj[k], stamp_(new Date()), by];
    let i = -1;
    for (let j = 0; j < rows.length; j++) if (rows[j][0] === k) { i = j; break; }
    if (i >= 0) rows[i] = rec; else rows.push(rec);
  });
  if (rows.length) sh.getRange(2, 1, rows.length, 4).setNumberFormat('@').setValues(rows);
  cacheDel_('settings');
}

function adminSheet_() { // ใช้ตอนเขียน: ตรวจให้แน่ใจว่ามีหัวคอลัมน์ passHash
  const sh = sheet_('Admins');
  if (sh.getRange(1, 5).getValue() !== 'passHash') sh.getRange(1, 5).setValue('passHash').setFontWeight('bold');
  return sh;
}
function adminsFull_() { // รายชื่อแอดมิน (รวมแฮช) เก็บแคช 10 นาที ล้างทุกครั้งที่แก้
  const hit = cacheGet_('admins');
  if (hit) return hit;
  const sh = sheet_('Admins');
  const n = sh.getLastRow() - 1;
  const list = n < 1 ? [] : sh.getRange(2, 1, n, 5).getDisplayValues().map(function (r) {
    return { email: String(r[0]).toLowerCase(), role: r[1], addedBy: r[2], addedAt: r[3], passHash: r[4] };
  });
  cachePut_('admins', list, 600);
  return list;
}
function readAdmins_() {
  return adminsFull_().map(function (a) { return { email: a.email, role: a.role, addedBy: a.addedBy, addedAt: a.addedAt }; });
}
function findAdmin_(email) {
  const list = adminsFull_();
  const e = String(email).toLowerCase();
  for (let i = 0; i < list.length; i++) if (list[i].email === e) return list[i];
  return null;
}
function findAdminHash_(email) { const a = findAdmin_(email); return a ? a.passHash : ''; }
function adminRow_(email) {
  const sh = adminSheet_();
  const rows = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
  for (let i = 0; i < rows.length; i++) if (String(rows[i][0]).toLowerCase() === String(email).toLowerCase()) return i + 2;
  return -1;
}
function setPassHash_(email, hash) {
  const row = adminRow_(email);
  if (row < 0) throw fail_('not_found');
  adminSheet_().getRange(row, 5).setNumberFormat('@').setValue(hash);
  cacheDel_('admins');
}
function addAdminRow_(email, role, by, hash) {
  adminSheet_().appendRow([email.toLowerCase(), role, by, stamp_(new Date()), hash || '']);
  cacheDel_('admins');
}
function removeAdminRow_(email) {
  const row = adminRow_(email);
  if (row > 0) adminSheet_().deleteRow(row);
  cacheDel_('admins');
}

/* ============ ดึงงานจาก Google Drive ============ */
function nextId_(sh) {
  const n = sh.getLastRow() - 1;
  let max = 0;
  if (n > 0) sh.getRange(2, 1, n, 1).getValues().forEach(function (r) {
    const m = /^P-(\d+)$/.exec(String(r[0]));
    if (m) max = Math.max(max, Number(m[1]));
  });
  return 'P-' + ('000' + (max + 1)).slice(-3);
}
function fileIdOf_(url) { const m = /\/d\/([^\/]+)/.exec(String(url)); return m ? m[1] : ''; }

// สแกนโฟลเดอร์ Drive: เพิ่มไฟล์ PDF ที่ยังไม่อยู่ในชีต และรายงานแถวที่ไฟล์หายไปจาก Drive
function syncDrive_(byEmail) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_('Submissions');
    const subs = readSubs_();
    const known = {};
    subs.forEach(function (x) { const f = fileIdOf_(x.fileUrl); if (f) known[f] = true; });

    const found = {};
    const added = [];
    const parent = DriveApp.getFolderById(prop_('FOLDER_ID'));
    const add = function (file, folderName, folderId) {
      if (file.getMimeType() !== 'application/pdf') return;
      found[file.getId()] = true;
      if (known[file.getId()]) return;
      known[file.getId()] = true;
      const id = nextId_(sh);
      const title = String(folderName || file.getName()).replace(/^P-\d+\s*-\s*/, '').replace(/\.pdf$/i, '');
      appendSub_(sh, {
        id: id, submittedAt: stamp_(file.getDateCreated()), title: clean_(title, 300), authors: '(ไม่ระบุ — เพิ่มจาก Drive)', email: '',
        affiliation: '', type: 'any', abstract: '', fileName: file.getName(), fileUrl: file.getUrl(), folderId: folderId || '',
        status: 'submitted', slotDate: '', slotTime: '', room: '', note: 'เพิ่มจากการซิงค์ Drive', updatedAt: stamp_(new Date()), updatedBy: 'sync:' + byEmail
      });
      added.push(id);
    };
    const folders = parent.getFolders();
    while (folders.hasNext()) {
      const f = folders.next();
      const files = f.getFiles();
      while (files.hasNext()) add(files.next(), f.getName(), f.getId());
    }
    const loose = parent.getFiles();
    while (loose.hasNext()) add(loose.next(), '', '');

    const missing = subs.filter(function (x) { return x.fileUrl && !found[fileIdOf_(x.fileUrl)]; }).map(function (x) { return x.id; });
    return { ok: true, added: added, missing: missing };
  } finally { lock.releaseLock(); }
}

/* ============ เทมเพลตบทความ (Word / LaTeX) ============ */
const TEMPLATE_TYPES = { word: ['docx', 'doc', 'dotx', 'dot'], latex: ['zip', 'tex'] };
const MIME_BY_EXT = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword',
  dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template', dot: 'application/msword',
  zip: 'application/zip', tex: 'application/x-tex'
};

// อ่านรายการเทมเพลต (แคช 10 นาที ล้างเมื่อแก้) → { word: {name, fileId, updatedAt} | null, latex: ... }
function readTemplates_() {
  const hit = cacheGet_('templates');
  if (hit) return hit;
  const out = { word: null, latex: null };
  const sh = ss_().getSheetByName('Templates');
  const n = sh ? sh.getLastRow() - 1 : 0;
  if (n > 0) sh.getRange(2, 1, n, 5).getDisplayValues().forEach(function (r) {
    if (TEMPLATE_TYPES[r[0]]) out[r[0]] = { name: r[1], fileId: r[2], updatedAt: r[3] };
  });
  cachePut_('templates', out, 600);
  return out;
}
// ส่วนที่เปิดเผยต่อสาธารณะ (ไม่รวม fileId)
function templatesMeta_(t) {
  const out = {};
  Object.keys(TEMPLATE_TYPES).forEach(function (k) { out[k] = t[k] ? { name: t[k].name, updatedAt: t[k].updatedAt } : null; });
  return out;
}

function saveTemplate_(by, key, fileName, b64) {
  if (!TEMPLATE_TYPES[key]) throw fail_('bad_key');
  const m = /\.([A-Za-z0-9]+)$/.exec(fileName);
  const ext = m ? m[1].toLowerCase() : '';
  if (TEMPLATE_TYPES[key].indexOf(ext) < 0) throw fail_('bad_file_type');
  const bytes = Utilities.base64Decode(b64);
  if (!bytes.length) throw fail_('no_file');
  if (bytes.length > MAX_BYTES) throw fail_('file_too_large');

  const safeName = fileName.replace(/[\/\\:*?"<>|]/g, '_');
  const file = DriveApp.getFolderById(prop_('FOLDER_ID')).createFile(
    Utilities.newBlob(bytes, MIME_BY_EXT[ext] || 'application/octet-stream', 'TEMPLATE_' + key + '_' + safeName));

  let oldId = '';
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = ensureSheet_(ss_(), 'Templates', ['key', 'fileName', 'fileId', 'updatedAt', 'updatedBy']);
    const n = sh.getLastRow() - 1;
    const rows = n > 0 ? sh.getRange(2, 1, n, 5).getValues() : [];
    let i = -1;
    for (let j = 0; j < rows.length; j++) if (rows[j][0] === key) { i = j; break; }
    const rec = [key, safeName, file.getId(), stamp_(new Date()), by];
    if (i >= 0) { oldId = String(rows[i][2]); rows[i] = rec; } else rows.push(rec);
    sh.getRange(2, 1, rows.length, 5).setNumberFormat('@').setValues(rows);
    cacheDel_('templates');
  } finally { lock.releaseLock(); }
  trashFile_(oldId);
  return templatesMeta_(readTemplates_());
}

function deleteTemplate_(key) {
  if (!TEMPLATE_TYPES[key]) throw fail_('bad_key');
  let oldId = '';
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = ss_().getSheetByName('Templates');
    const n = sh ? sh.getLastRow() - 1 : 0;
    const rows = n > 0 ? sh.getRange(2, 1, n, 5).getValues() : [];
    for (let j = 0; j < rows.length; j++) {
      if (rows[j][0] === key) { oldId = String(rows[j][2]); sh.deleteRow(j + 2); break; }
    }
    cacheDel_('templates');
  } finally { lock.releaseLock(); }
  trashFile_(oldId);
  return templatesMeta_(readTemplates_());
}
function trashFile_(id) { if (!id) return; try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { /* ไม่มีแล้วก็ไม่เป็นไร */ } }

// ผู้ใช้ทั่วไปโหลดเทมเพลต: ส่งผ่านระบบ ไม่ต้องแชร์ไฟล์ใน Drive เป็นสาธารณะ
function templateDownload_(key) {
  const t = TEMPLATE_TYPES[key] ? readTemplates_()[key] : null;
  if (!t) return { ok: false, error: 'not_found' };
  try {
    return { ok: true, name: t.name, base64: Utilities.base64Encode(DriveApp.getFileById(t.fileId).getBlob().getBytes()) };
  } catch (e) { return { ok: false, error: 'not_found' }; }
}

/* ============ ผู้ส่งตรวจสถานะบทความเอง (รหัสบทความ + อีเมลที่ใช้ส่ง) ============ */
function statusLookup_(idRaw, emailRaw) {
  const m = /^P-?(\d{1,6})$/i.exec(clean_(idRaw, 12));
  const email = clean_(emailRaw, 200).toLowerCase();
  if (!m || !email) return { ok: false, error: 'not_found' };
  const num = String(Number(m[1]));
  const id = 'P-' + (num.length < 3 ? ('000' + num).slice(-3) : num);

  const cache = CacheService.getScriptCache();
  const key = 'stf_' + id;
  const fails = Number(cache.get(key) || 0);
  if (fails >= 10) return { ok: false, error: 'too_many_attempts' }; // กันเดารหัส/อีเมล

  const sub = readSubs_().filter(function (x) { return x.id === id; })[0];
  if (!sub || String(sub.email).toLowerCase() !== email) {
    cache.put(key, String(fails + 1), 900);
    return { ok: false, error: 'not_found' }; // ไม่บอกว่าผิดที่รหัสหรืออีเมล
  }
  // ส่งกลับเฉพาะข้อมูลที่ผู้ส่งควรเห็น (ไม่รวมอีเมล ผู้เขียน หรือหมายเหตุของแอดมิน)
  return { ok: true, id: sub.id, title: sub.title, status: sub.status, type: sub.type, submittedAt: sub.submittedAt,
    slotDate: sub.slotDate, slotTime: sub.slotTime, room: sub.room, updatedAt: sub.updatedAt };
}

/* ============ แก้เนื้อหาเว็บผ่านหน้าเว็บ (ข้อความ + รูปภาพ) ============
   เก็บเป็นคู่ key → ค่า ในชีต Content แล้วทุกหน้าเว็บนำไปทับข้อความ/รูปเดิมตอนโหลด
   คีย์ข้อความ  t|<ภาษา>|<ขอบเขต>|<แฮชข้อความเดิม>|<ลำดับที่>    คีย์รูป  i|<แฮชชื่อไฟล์รูปเดิม> (ค่า = fileId|mime) */
const TEXT_KEY_RE = /^t\|(th|en)\|[a-z0-9-]{1,24}\|[0-9a-f]{8}\|\d{1,3}$/;
const IMG_KEY_RE = /^i\|[0-9a-f]{8}$/;
const IMG_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
const MAX_IMG_BYTES = 4 * 1024 * 1024;
const MAX_CONTENT_KEYS = 3000;

// → { ver, map } (แคช 10 นาที ล้างทุกครั้งที่แก้) ver เปลี่ยนทุกครั้งที่มีการแก้ ใช้ให้เบราว์เซอร์รู้ว่าแคชเก่า
function readContent_() {
  const hit = cacheGet_('content');
  if (hit) return hit;
  const out = { ver: '0', map: {} };
  const sh = ss_().getSheetByName('Content');
  const n = sh ? sh.getLastRow() - 1 : 0;
  if (n > 0) sh.getRange(2, 1, n, 2).getDisplayValues().forEach(function (r) {
    if (r[0] === '_ver') out.ver = r[1]; else out.map[r[0]] = r[1];
  });
  cachePut_('content', out, 600);
  return out;
}

// upd: { key: ค่าใหม่ | null (ลบ) } เขียนครั้งเดียวทั้งชุด · คืนรายการค่ารูปที่ถูกแทนที่/ลบ เพื่อย้ายไฟล์ไปถังขยะ
function writeContent_(upd, by) {
  const replaced = [];
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = ensureSheet_(ss_(), 'Content', ['key', 'value', 'updatedAt', 'updatedBy']);
    const n = sh.getLastRow() - 1;
    const rows = n > 0 ? sh.getRange(2, 1, n, 4).getValues() : [];
    const now = stamp_(new Date());
    const idx = {};
    rows.forEach(function (r, i) { idx[r[0]] = i; });
    Object.keys(upd).forEach(function (k) {
      const v = upd[k];
      if (k in idx) {
        const old = String(rows[idx[k]][1]);
        if (k.indexOf('i|') === 0 && old) replaced.push(old);
        if (v === null) rows[idx[k]] = null; else rows[idx[k]] = [k, v, now, by];
      } else if (v !== null) { idx[k] = rows.length; rows.push([k, v, now, by]); }
    });
    const keep = rows.filter(function (r) { return r && r[0] !== '_ver'; });
    if (keep.length > MAX_CONTENT_KEYS) throw fail_('too_many_edits');
    const prev = '_ver' in idx && rows[idx._ver] ? Number(rows[idx._ver][1]) || 0 : 0;
    keep.push(['_ver', String(Math.max(Date.now(), prev + 1)), now, by]); // เพิ่มขึ้นเสมอ
    // ช่องเป็นรูปแบบ "ข้อความล้วน" ค่าที่ขึ้นต้นด้วย = + - @ จึงไม่ถูกตีเป็นสูตร
    sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), 4).clearContent();
    sh.getRange(2, 1, keep.length, 4).setNumberFormat('@').setValues(keep);
    cacheDel_('content');
  } finally { lock.releaseLock(); }
  return replaced;
}

// บันทึกการแก้ข้อความ (null = คืนค่าเดิม) · คีย์รูปลบได้ (คืนรูปเดิม) แต่ตั้งค่าได้ทาง uploadMedia เท่านั้น
function saveContent_(by, texts) {
  const upd = {};
  Object.keys(texts).forEach(function (k) {
    const v = texts[k];
    if (TEXT_KEY_RE.test(k)) {
      if (v === null) upd[k] = null;
      else { const t = clean_(v, 3000); if (!t) throw fail_('empty_text'); upd[k] = t; }
    } else if (IMG_KEY_RE.test(k) && v === null) upd[k] = null;
    else throw fail_('bad_key');
  });
  if (!Object.keys(upd).length) return { ok: true, content: readContent_() };
  writeContent_(upd, by).forEach(function (old) { trashFile_(old.split('|')[0]); });
  return { ok: true, content: readContent_() };
}

function saveMedia_(by, r) {
  const key = clean_(r.key, 12);
  if (!IMG_KEY_RE.test(key)) throw fail_('bad_key');
  const mime = String(r.mime || '');
  const ext = IMG_MIME[mime];
  if (!ext) throw fail_('bad_file_type');
  const bytes = Utilities.base64Decode(String(r.base64 || ''));
  if (!bytes.length) throw fail_('no_file');
  if (bytes.length > MAX_IMG_BYTES) throw fail_('file_too_large');
  const file = DriveApp.getFolderById(prop_('FOLDER_ID')).createFile(
    Utilities.newBlob(bytes, mime, 'SITEIMG_' + key.slice(2) + '_' + Date.now() + '.' + ext));
  const upd = {}; upd[key] = file.getId() + '|' + mime;
  writeContent_(upd, by).forEach(function (old) { trashFile_(old.split('|')[0]); });
  return { ok: true, content: readContent_() };
}

// ผู้เข้าชมโหลดรูปที่แอดมินอัปโหลด: ส่งเฉพาะไฟล์ที่อยู่ในรายการเนื้อหาเท่านั้น (ไม่เปิดไฟล์อื่นใน Drive)
function mediaDownload_(id) {
  const map = readContent_().map;
  let mime = '';
  Object.keys(map).forEach(function (k) {
    if (k.indexOf('i|') !== 0) return;
    const p = String(map[k]).split('|');
    if (p[0] === id) mime = p[1];
  });
  if (!mime) return { ok: false, error: 'not_found' };
  try {
    return { ok: true, mime: mime, base64: Utilities.base64Encode(DriveApp.getFileById(id).getBlob().getBytes()) };
  } catch (e) { return { ok: false, error: 'not_found' }; }
}

/* ============ ตรวจการตั้งค่า: รันฟังก์ชันนี้จากตัวแก้ไข แล้วดู Execution log ============ */
function diagnose() {
  const props = PropertiesService.getScriptProperties();
  ['FOLDER_ID', 'SHEET_ID'].forEach(function (k) {
    const id = props.getProperty(k);
    if (!id) { Logger.log(k + ': ยังไม่ได้ตั้งค่า'); return; }
    try {
      const f = DriveApp.getFileById(id);
      Logger.log(k + ' = ' + id + '\n   ชี้ไปที่: "' + f.getName() + '"  ประเภท: ' + f.getMimeType());
    } catch (e) {
      Logger.log(k + ' = ' + id + '\n   ไม่ใช่ไฟล์ (อาจเป็นโฟลเดอร์ ซึ่งถูกต้องสำหรับ FOLDER_ID) หรือไม่มีสิทธิ์เข้าถึง');
      try { Logger.log('   โฟลเดอร์: "' + DriveApp.getFolderById(id).getName() + '"'); } catch (e2) { Logger.log('   ไม่พบโฟลเดอร์นี้: ' + e2); }
    }
  });
  Logger.log('ที่ถูกต้อง: FOLDER_ID ต้องเป็น "โฟลเดอร์" (ไม่ใช่ไฟล์) และ SHEET_ID ต้องเป็นประเภท application/vnd.google-apps.spreadsheet');
}
