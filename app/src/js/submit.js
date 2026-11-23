(function () {
  "use strict";
  var cfg = window.CPE_CONFIG || {};
  var form = document.getElementById("submit-form");
  var banner = document.getElementById("submit-status");
  var done = document.getElementById("submit-done");
  var statusBox = document.getElementById("status-box");
  if (!form || !banner) return;
  var en = document.documentElement.lang === "en";
  var T = function (th, e) { return en ? e : th; };
  var MAX = 10 * 1024 * 1024;
  var submitBtn = form.querySelector("button[type=submit]");
  var msgEl = document.getElementById("submit-msg");
  var sending = false, touched = false, showingDone = false, lastStatus = null;

  var fmt = function (v) { return window.CPE_FMT ? window.CPE_FMT(v) : v; };
  function setBanner(msg, ok) { banner.textContent = msg; banner.classList.toggle("success", !!ok); }

  if (!cfg.API_URL || !window.CPE_LIVE) { form.hidden = true; setBanner(T("ระบบส่งบทความยังไม่เปิดใช้งาน", "The submission system is not available yet.")); return; }
  statusBox.hidden = false; // ตรวจสถานะได้ตลอด ไม่ว่าฟอร์มเปิดหรือปิด

  form.addEventListener("input", function () { touched = true; });

  // อัปเดตฟอร์มตามสถานะล่าสุดจากเซิร์ฟเวอร์ (เรียกตอนโหลด ตอนตรวจซ้ำ และทันทีที่แอดมินเปิด/ปิดรับ)
  function applyStatus(c) {
    var s = c.settings || {}, prev = lastStatus;
    lastStatus = c.status;
    if (showingDone) return; // ใบรับ "สำเร็จ" ค้างไว้จนกว่าจะกดส่งอีกชิ้น
    if (c.status === "open") {
      setBanner(s.submission_deadline ? T("เปิดรับบทความ ปิดรับ ", "Open. Deadline: ") + fmt(s.submission_deadline) : T("เปิดรับบทความ", "Submissions are open."));
      if (!showingDone) form.hidden = false;
      submitBtn.disabled = sending;
      if (prev && prev !== "open" && !showingDone) msgEl.textContent = "";
    } else {
      if (c.status === "upcoming") setBanner(T("ระบบจะเปิดรับบทความ ", "Submissions open on ") + fmt(s.submission_opens));
      else if (c.status === "closed") setBanner(T("ปิดรับบทความแล้ว เมื่อ ", "Submissions closed on ") + fmt(s.submission_deadline));
      else setBanner(T("ยังไม่กำหนดวันเปิดรับบทความ", "The submission dates have not been set yet."));
      // ถ้าผู้ใช้กำลังกรอกอยู่ ไม่ลบสิ่งที่พิมพ์ไว้ แต่ปิดปุ่มส่งและแจ้งชัดเจน
      if (touched && !showingDone && !form.hidden) {
        submitBtn.disabled = true;
        msgEl.className = "form-msg err";
        msgEl.textContent = T("ปิดรับบทความแล้ว ไม่สามารถส่งได้", "Submissions are closed. You can no longer submit.");
      } else { form.hidden = true; }
    }
  }
  window.CPE_LIVE.then(applyStatus).catch(function () { form.hidden = true; setBanner(T("เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่", "Cannot reach the system. Please try again.")); });
  if (window.CPE_ONCHANGE) window.CPE_ONCHANGE(applyStatus);

  var ERR = {
    closed: ["ปิดรับบทความแล้ว", "Submissions are closed."],
    invalid_fields: ["กรอกข้อมูลไม่ครบหรืออีเมลไม่ถูกต้อง", "Please complete all fields with a valid email."],
    no_file: ["ยังไม่ได้เลือกไฟล์", "No file selected."],
    file_too_large: ["ไฟล์ใหญ่เกิน 10 MB", "File is larger than 10 MB."],
    not_pdf: ["ต้องเป็นไฟล์ PDF", "The file must be a PDF."],
    duplicate: ["เพิ่งส่งบทความนี้ไปแล้ว กรุณารอสักครู่", "This paper was just submitted. Please wait a moment."]
  };

  /* ---------- ส่งสำเร็จ: แสดงใบรับ ---------- */
  function showDone(res) {
    showingDone = true;
    form.hidden = true;
    setBanner("✓ " + T("ส่งสำเร็จ (Success) · รหัสบทความ ", "Success · Paper ID ") + res.id, true);
    document.getElementById("done-id").textContent = res.id;
    document.getElementById("done-title").textContent = res.title || "";
    document.getElementById("done-time").textContent = res.submittedAt ? fmt(res.submittedAt.slice(0, 16)) : "";
    document.getElementById("done-mail").textContent = res.emailSent
      ? T("ส่งไปที่อีเมลของคุณแล้ว (ถ้าไม่เห็น ลองดูในสแปม)", "Sent to your email (check spam if you do not see it)")
      : T("ส่งอีเมลไม่สำเร็จ กรุณาจดรหัสบทความนี้ไว้", "Could not send the email. Please note down your Paper ID.");
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ behavior: "smooth", block: "center" });
    var sf = document.getElementById("status-form");
    if (sf) { sf.elements.id.value = res.id; }
  }
  document.getElementById("done-again").addEventListener("click", function () {
    showingDone = false; touched = false; done.hidden = true;
    banner.classList.remove("success");
    msgEl.textContent = ""; submitBtn.disabled = false;
    if (window.CPE_LIVE) window.CPE_LIVE.then(applyStatus); // คืนข้อความสถานะเปิด/ปิดรับ
    if (window.CPE_REFRESH) window.CPE_REFRESH().catch(function () {}); // แล้วตรวจค่าล่าสุดจากเซิร์ฟเวอร์อีกครั้ง
    form.hidden = lastStatus !== "open";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var file = form.elements.file.files[0];
    msgEl.className = "form-msg";
    if (!file) { msgEl.textContent = T("กรุณาเลือกไฟล์ PDF", "Please choose a PDF file."); msgEl.classList.add("err"); return; }
    if (file.size > MAX) { msgEl.textContent = ERR.file_too_large[en ? 1 : 0]; msgEl.classList.add("err"); return; }
    sending = true; submitBtn.disabled = true;
    msgEl.textContent = T("กำลังส่ง กรุณาอย่าปิดหน้านี้…", "Sending. Please keep this page open…");
    var reader = new FileReader();
    reader.onload = function () {
      var b64 = String(reader.result).split(",")[1];
      var f = form.elements;
      var body = { action: "submit", title: f.title.value, authors: f.authors.value, email: f.email.value,
        affiliation: f.affiliation.value, type: f.type.value, abstract: f.abstract.value, hp: f.hp.value,
        fileName: file.name, fileBase64: b64 };
      // text/plain = ไม่มี CORS preflight (Apps Script ไม่รับ OPTIONS)
      fetch(cfg.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          sending = false;
          if (res.ok) {
            var email = f.email.value;
            form.reset(); msgEl.textContent = "";
            showDone(res);
            var sf = document.getElementById("status-form"); if (sf) sf.elements.email.value = email;
          } else {
            var m = ERR[res.error];
            msgEl.textContent = m ? m[en ? 1 : 0] : T("ส่งไม่สำเร็จ กรุณาลองใหม่", "Could not submit. Please try again.") + " (" + (res.error || "?") + ")";
            msgEl.classList.add("err"); submitBtn.disabled = res.error === "closed";
            if (res.error === "closed" && window.CPE_REFRESH) window.CPE_REFRESH().catch(function () {});
          }
        })
        .catch(function () { sending = false; msgEl.textContent = T("เชื่อมต่อไม่ได้ กรุณาลองใหม่", "Connection failed. Please try again."); msgEl.classList.add("err"); submitBtn.disabled = false; });
    };
    reader.readAsDataURL(file);
  });

  /* ---------- ตรวจสอบสถานะบทความ ---------- */
  var STATUS = {
    submitted: ["ส่งสำเร็จ (Success)", "Success"],
    under_review: ["กำลังพิจารณา", "Under review"],
    accepted: ["รับบทความแล้ว", "Accepted"],
    rejected: ["ไม่รับบทความ", "Not accepted"],
    camera_ready: ["ส่งฉบับสมบูรณ์แล้ว", "Camera-ready received"],
    withdrawn: ["ถอนบทความ", "Withdrawn"]
  };
  var STATUS_ERR = {
    not_found: ["ไม่พบบทความ กรุณาตรวจรหัสบทความและอีเมลที่ใช้ส่ง", "Paper not found. Check the Paper ID and the email you used."],
    too_many_attempts: ["ลองผิดหลายครั้ง กรุณารอ 15 นาที", "Too many attempts. Please wait 15 minutes."]
  };
  var sform = document.getElementById("status-form"), sres = document.getElementById("status-result");
  function row(k, v) { var d1 = document.createElement("div"); d1.textContent = k; var d2 = document.createElement("div"); d2.textContent = v; return [d1, d2]; }
  sform.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var id = sform.elements.id.value.trim(), email = sform.elements.email.value.trim(), btn = sform.querySelector("button");
    sres.textContent = ""; sres.className = "";
    if (!id || !email) { sres.className = "form-msg err"; sres.textContent = T("กรอกรหัสบทความและอีเมล", "Enter the Paper ID and email."); return; }
    btn.disabled = true; sres.className = "form-msg"; sres.textContent = T("กำลังตรวจสอบ…", "Checking…");
    fetch(cfg.API_URL + "?action=status&id=" + encodeURIComponent(id) + "&email=" + encodeURIComponent(email))
      .then(function (r) { return r.json(); })
      .then(function (r) {
        sres.textContent = "";
        if (!r.ok) { var m = STATUS_ERR[r.error] || STATUS_ERR.not_found; sres.className = "form-msg err"; sres.textContent = m[en ? 1 : 0]; return; }
        var lab = STATUS[r.status] || [r.status, r.status];
        var kv = document.createElement("div"); kv.className = "kv status-kv";
        var pill = document.createElement("span"); pill.className = "status-pill s-" + r.status; pill.textContent = lab[en ? 1 : 0];
        var rows = [row(T("รหัสบทความ", "Paper ID"), r.id), row(T("ชื่อบทความ", "Title"), r.title), row(T("ส่งเมื่อ", "Submitted"), fmt((r.submittedAt || "").slice(0, 16)))];
        rows.forEach(function (p) { kv.appendChild(p[0]); kv.appendChild(p[1]); });
        var d1 = document.createElement("div"); d1.textContent = T("สถานะ", "Status"); var d2 = document.createElement("div"); d2.appendChild(pill);
        kv.appendChild(d1); kv.appendChild(d2);
        if (r.slotDate || r.slotTime || r.room) {
          var when = [r.slotDate ? fmt(r.slotDate) : "", r.slotTime || "", r.room ? T("ห้อง ", "Room ") + r.room : ""].filter(Boolean).join(" · ");
          var p3 = row(T("กำหนดนำเสนอ", "Presentation"), when); kv.appendChild(p3[0]); kv.appendChild(p3[1]);
        }
        sres.appendChild(kv);
      })
      .catch(function () { sres.className = "form-msg err"; sres.textContent = T("เชื่อมต่อไม่ได้ กรุณาลองใหม่", "Connection failed. Please try again."); })
      .then(function () { btn.disabled = false; });
  });
})();
