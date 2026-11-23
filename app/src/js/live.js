/* ดึงค่าสดจาก backend (Google Apps Script) แล้วเติมวันที่/เทมเพลตในหน้าเว็บ
   ถ้ายังไม่ได้ตั้ง API_URL หรือเชื่อมต่อไม่ได้ จะแสดงค่าที่ build ไว้ตามเดิม
   หน้าส่งบทความ: ตรวจค่าใหม่ทุก 15 วินาที และทันทีที่แอดมินกดบันทึก/เปิดรับ/ปิดรับ (แท็บอื่นของเบราว์เซอร์เดียวกัน) */
(function () {
  "use strict";
  var cfg = window.CPE_CONFIG || {};
  window.CPE_LIVE = null;
  window.CPE_REFRESH = null;
  if (!cfg.API_URL) return;
  var en = document.documentElement.lang === "en";
  var loc = en ? "en-GB" : "th-TH";
  var CK = "cpe_cfg_v1", SIGNAL = "cpe_cfg_changed";
  var listeners = [];

  window.CPE_FMT = function (v) {
    if (!v) return "";
    if (v.length === 16) return new Date(v + ":00+07:00").toLocaleString(loc, { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" });
    return new Date(v + "T00:00:00+07:00").toLocaleDateString(loc, { dateStyle: "long", timeZone: "Asia/Bangkok" });
  };
  window.CPE_ONCHANGE = function (fn) { listeners.push(fn); };

  function save(d) { try { sessionStorage.setItem(CK, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} return d; }
  function load() {
    try { var raw = sessionStorage.getItem(CK); if (raw) { var o = JSON.parse(raw); if (Date.now() - o.t < 60000) return o.d; } } catch (e) {}
    return null;
  }
  // ดึงค่าใหม่จากเซิร์ฟเวอร์เสมอ (เซิร์ฟเวอร์ล้างแคชเองเมื่อแอดมินบันทึก)
  function fetchFresh() {
    return fetch(cfg.API_URL + "?action=config&_=" + Date.now()).then(function (r) { return r.json(); }).then(save);
  }

  var map = { opens: "submission_opens", deadline: "submission_deadline", notify: "notification_date", camera: "camera_ready_date", conf: "conference_date" };

  function downloadTemplate(key, btn, label) {
    btn.disabled = true; btn.textContent = en ? "Downloading…" : "กำลังโหลด…";
    fetch(cfg.API_URL + "?action=template&key=" + encodeURIComponent(key)).then(function (r) { return r.json(); }).then(function (r) {
      if (!r.ok) throw new Error(r.error);
      var bin = atob(r.base64), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      var url = URL.createObjectURL(new Blob([arr]));
      var a = document.createElement("a"); a.href = url; a.download = r.name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    }).catch(function () { alert(en ? "Could not download. Please try again." : "ดาวน์โหลดไม่สำเร็จ กรุณาลองใหม่"); })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  }

  function apply(c) {
    // เทมเพลต: มีไฟล์ → ปุ่มดาวน์โหลด · ไม่มี (ยังไม่เพิ่ม/ถูกลบ) → กลับเป็น "เร็ว ๆ นี้"
    var tpl = c.templates || {};
    document.querySelectorAll("[data-template]").forEach(function (slot) {
      if (slot.getAttribute("data-orig") === null) slot.setAttribute("data-orig", slot.innerHTML);
      var key = slot.getAttribute("data-template"), t = tpl[key];
      if (!t) { slot.innerHTML = slot.getAttribute("data-orig"); return; }
      var label = (en ? "Download " : "ดาวน์โหลด ") + t.name;
      var b = document.createElement("button");
      b.type = "button"; b.className = "btn-link"; b.textContent = label;
      b.addEventListener("click", function () { downloadTemplate(key, b, label); });
      slot.textContent = ""; slot.appendChild(b);
    });
    var s = c.settings || {};
    document.querySelectorAll("[data-date]").forEach(function (el) {
      var v = s[map[el.getAttribute("data-date")]];
      if (v) { el.textContent = window.CPE_FMT(v); el.classList.remove("ph"); }
    });
  }

  var first = load();
  var p = first ? Promise.resolve(first) : fetchFresh();
  window.CPE_LIVE = p;
  p.then(apply).catch(function () {});

  // รีโหลดสถานะทันที แล้วแจ้งผู้ฟัง (หน้าส่งบทความใช้เพื่อเปิด/ปิดฟอร์ม)
  window.CPE_REFRESH = function () {
    return fetchFresh().then(function (c) {
      window.CPE_LIVE = Promise.resolve(c);
      apply(c);
      listeners.forEach(function (fn) { try { fn(c); } catch (e) {} });
      return c;
    });
  };

  // เฉพาะหน้าส่งบทความ: ตรวจซ้ำทุก 15 วินาที (เฉพาะตอนแท็บเปิดอยู่) + ทันทีเมื่อกลับมาที่แท็บ + ทันทีเมื่อแอดมินแก้ในแท็บอื่น
  if (document.getElementById("submit-form")) {
    var refresh = function () { window.CPE_REFRESH().catch(function () {}); };
    setInterval(function () { if (!document.hidden) refresh(); }, 15000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
    window.addEventListener("storage", function (e) { if (e.key === SIGNAL) refresh(); });
  }
})();
