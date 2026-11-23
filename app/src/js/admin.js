(function () {
  "use strict";
  var cfg = window.CPE_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  var TOKEN_KEY = "cpe_admin_token";
  var me = null, items = [], statuses = [];

  var STATUS_TH = { submitted: "ส่งแล้ว", under_review: "กำลังพิจารณา", accepted: "รับแล้ว", rejected: "ไม่รับ", camera_ready: "ส่งฉบับสมบูรณ์แล้ว", withdrawn: "ถอนบทความ" };
  var TYPE_TH = { oral: "บรรยาย", poster: "โปสเตอร์", any: "ไม่ระบุ" };
  var ERR_TH = {
    unauthorized: "หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบใหม่", invalid_login: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    too_many_attempts: "ลองผิดหลายครั้ง กรุณารอ 15 นาทีแล้วลองใหม่", weak_password: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร", forbidden: "เฉพาะเจ้าของระบบ",
    bad_date: "รูปแบบวันที่ไม่ถูกต้อง", bad_time: "รูปแบบเวลาไม่ถูกต้อง", bad_status: "สถานะไม่ถูกต้อง",
    invalid_email: "อีเมลไม่ถูกต้อง", already_admin: "อีเมลนี้เป็นแอดมินอยู่แล้ว", cannot_remove_owner: "ลบเจ้าของระบบไม่ได้",
    cannot_remove_self: "ลบตัวเองไม่ได้", not_found: "ไม่พบรายการ"
  };

  function el(tag, props, kids) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") n.textContent = props[k]; else if (k === "class") n.className = props[k]; else n.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  function api(action, data) {
    var body = Object.assign({ action: action, token: sessionStorage.getItem(TOKEN_KEY) || "" }, data || {});
    return fetch(cfg.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          var e = new Error(res.error || "error"); e.code = res.error;
          if (res.error === "unauthorized" && action !== "login") logout(ERR_TH.unauthorized);
          throw e;
        }
        return res;
      });
  }
  function errText(e) { return ERR_TH[e.code] || "เกิดข้อผิดพลาด กรุณาลองใหม่"; }

  var toastTimer;
  function toast(msg, isErr) {
    var t = $("toast");
    t.textContent = msg; t.className = "form-msg" + (isErr ? " err" : " ok");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.textContent = ""; }, 5000);
  }

  /* ---------- login ---------- */
  function showLogin(msg) {
    $("app").hidden = true; $("who").hidden = true; $("login").hidden = false;
    $("login-msg").textContent = msg || "";
  }
  function logout(msg) {
    if (sessionStorage.getItem(TOKEN_KEY)) fetch(cfg.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "logout", token: sessionStorage.getItem(TOKEN_KEY) }) }).catch(function () {});
    sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem("cpe_edit"); me = null;
    showLogin(msg);
  }
  $("login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = $("login-form").elements, btn = $("login-form").querySelector("button");
    btn.disabled = true; $("login-msg").textContent = "กำลังเข้าสู่ระบบ…";
    api("login", { email: f.email.value, password: f.password.value }).then(function (r) {
      sessionStorage.setItem(TOKEN_KEY, r.token); f.password.value = ""; $("login-msg").textContent = ""; start(r);
    }).catch(function (e) { $("login-msg").textContent = errText(e); })
      .then(function () { btn.disabled = false; });
  });

  // ข้อมูลทั้งหมดมาในคำขอเดียว (ตอนล็อกอิน หรือ init ตอนรีเฟรชหน้า) ไม่ต้องยิงขอแยกทีละส่วน
  function applyInit(r) {
    me = { email: r.email, role: r.role };
    $("login").hidden = true; $("app").hidden = false; $("who").hidden = false;
    $("who-email").textContent = r.email + (r.role === "owner" ? " (เจ้าของ)" : "");
    document.querySelector('.admin-tabs button[data-tab="time"]').click(); // เข้าแล้วเปิดหน้ากำหนดเวลาก่อน
    setSubs(r.items, r.statuses);
    fillSettings(r.settings);
    renderAdmins(r.admins);
    renderTemplates(r.templates || {});
  }
  function start(data) {
    if (data) { applyInit(data); return; }
    api("init").then(applyInit).catch(function (e) {
      if (e.code !== "unauthorized") showLogin("เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่");
    });
  }

  /* ---------- tabs ---------- */
  document.querySelectorAll(".admin-tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".admin-tabs button").forEach(function (x) {
        x.setAttribute("aria-selected", String(x === b));
        $("tab-" + x.dataset.tab).hidden = x !== b;
      });
    });
  });

  /* ---------- submissions ---------- */
  function setSubs(list, st) {
    items = list.slice().reverse(); statuses = st;
    var sel = $("f-status"), keep = sel.value;
    sel.textContent = "";
    sel.appendChild(el("option", { value: "", text: "ทุกสถานะ" }));
    statuses.forEach(function (x) { sel.appendChild(el("option", { value: x, text: STATUS_TH[x] || x })); });
    sel.value = keep;
    renderSubs();
  }
  function loadSubs() {
    api("listSubmissions").then(function (r) { setSubs(r.items, r.statuses); }).catch(function (e) { toast(errText(e), true); });
  }

  function renderSubs() {
    var q = $("q").value.trim().toLowerCase(), st = $("f-status").value;
    var list = items.filter(function (i) {
      return (!st || i.status === st) && (!q || (i.id + " " + i.title + " " + i.authors + " " + i.email).toLowerCase().indexOf(q) >= 0);
    });
    $("count").textContent = list.length + " / " + items.length + " รายการ";
    var tb = $("subs"); tb.textContent = "";
    if (!list.length) { tb.appendChild(el("tr", {}, [el("td", { colspan: "7", class: "muted", text: "ยังไม่มีงานที่ส่ง" })])); return; }
    list.forEach(function (i) {
      var status = el("select", { "aria-label": "สถานะ " + i.id });
      statuses.forEach(function (s) { var o = el("option", { value: s, text: STATUS_TH[s] || s }); if (s === i.status) o.selected = true; status.appendChild(o); });
      var date = el("input", { type: "date", value: i.slotDate, "aria-label": "วันที่นำเสนอ " + i.id });
      var time = el("input", { type: "time", value: i.slotTime, "aria-label": "เวลา " + i.id });
      var room = el("input", { type: "text", value: i.room, maxlength: "100", "aria-label": "ห้อง " + i.id, placeholder: "ห้อง" });
      var save = el("button", { type: "button", class: "btn btn-cdti small", text: "บันทึก" });
      save.addEventListener("click", function () {
        save.disabled = true;
        api("updateSubmission", { id: i.id, patch: { status: status.value, slotDate: date.value, slotTime: time.value, room: room.value } })
          .then(function () { i.status = status.value; i.slotDate = date.value; i.slotTime = time.value; i.room = room.value; toast("บันทึก " + i.id + " แล้ว"); })
          .catch(function (e) { toast(errText(e), true); })
          .then(function () { save.disabled = false; });
      });
      var title = el("td", {}, [
        missingIds.indexOf(i.id) >= 0 ? el("div", { class: "form-msg err", text: "ไม่พบไฟล์นี้ใน Drive แล้ว" }) : el("span"),
        el("strong", { text: i.title }),
        el("div", { class: "muted", text: i.authors + " · " + i.email }),
        el("div", { class: "muted", text: "ส่งเมื่อ " + i.submittedAt.replace("T", " ") + " · " + (TYPE_TH[i.type] || "") })
      ]);
      if (i.fileUrl) {
        var dl = el("button", { type: "button", class: "btn-link", text: "ดาวน์โหลดไฟล์ PDF" });
        dl.addEventListener("click", function () {
          dl.disabled = true; dl.textContent = "กำลังโหลด…";
          api("downloadFile", { id: i.id }).then(function (r) {
            var bin = atob(r.base64), arr = new Uint8Array(bin.length);
            for (var k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
            var url = URL.createObjectURL(new Blob([arr], { type: "application/pdf" }));
            var a = el("a", { href: url, download: r.name }); document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
          }).catch(function (e) { toast(errText(e), true); })
            .then(function () { dl.disabled = false; dl.textContent = "ดาวน์โหลดไฟล์ PDF"; });
        });
        title.appendChild(dl);
      }
      if (i.abstract) title.appendChild(el("details", {}, [el("summary", { text: "บทคัดย่อ" }), el("p", { text: i.abstract })]));
      var del = el("button", { type: "button", class: "btn-link danger", text: "ลบ" });
      del.addEventListener("click", function () {
        if (!confirm("ลบบทความ " + i.id + " ?\n" + i.title + "\n\nแถวในรายการจะถูกลบ และไฟล์ PDF ถูกย้ายไปถังขยะของ Google Drive (กู้คืนได้ภายใน 30 วัน)")) return;
        del.disabled = true;
        api("deleteSubmission", { id: i.id }).then(function () {
          items = items.filter(function (x) { return x.id !== i.id; });
          renderSubs(); toast("ลบ " + i.id + " แล้ว");
        }).catch(function (e) { del.disabled = false; toast(errText(e), true); });
      });
      tb.appendChild(el("tr", {}, [el("td", { text: i.id }), title, el("td", {}, [status]), el("td", {}, [date]), el("td", {}, [time]), el("td", {}, [room]), el("td", {}, [save, del])]));
    });
  }
  $("q").addEventListener("input", renderSubs);
  $("f-status").addEventListener("change", renderSubs);
  $("reload").addEventListener("click", loadSubs);
  var missingIds = [];
  $("sync").addEventListener("click", function () {
    var b = $("sync"); b.disabled = true; b.textContent = "กำลังซิงค์…";
    api("syncDrive").then(function (r) {
      missingIds = r.missing;
      toast("ซิงค์แล้ว: เพิ่ม " + r.added.length + " รายการใหม่จาก Drive" + (r.missing.length ? " · ไม่พบไฟล์ใน Drive: " + r.missing.join(", ") : ""), r.missing.length > 0);
      loadSubs();
    }).catch(function (e) { toast(errText(e), true); })
      .then(function () { b.disabled = false; b.textContent = "ซิงค์จาก Drive"; });
  });

  /* ---------- time settings ---------- */
  var TIME_KEYS = ["submission_opens", "submission_deadline", "notification_date", "camera_ready_date", "conference_date"];
  function nowTH() { return new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 16); } // เวลาไทย รูปแบบ YYYY-MM-DDTHH:mm
  function thText(v) { return v.replace("T", " ") + " น."; }

  // บอกสถานะฟอร์มตามค่าในช่อง (ตรรกะเดียวกับเซิร์ฟเวอร์)
  function showStatus() {
    var f = $("time-form").elements, o = f.submission_opens.value, d = f.submission_deadline.value, n = nowTH(), t, cls = "muted";
    if (!o) t = "ยังไม่ได้ตั้งเวลาเปิดรับ — ฟอร์มปิดอยู่";
    else if (n < o) t = "ยังไม่ถึงเวลาเปิดรับ (เปิด " + thText(o) + ") — ฟอร์มปิดอยู่";
    else if (d && n >= d) t = "ปิดรับแล้ว (ปิดเมื่อ " + thText(d) + ")";
    else { t = "กำลังเปิดรับบทความ" + (d ? " · ปิด " + thText(d) : " · ไม่กำหนดเวลาปิด"); cls = "ok"; }
    var el2 = $("time-status"); el2.textContent = "สถานะตอนนี้: " + t; el2.className = "form-msg " + cls;
  }

  function fillSettings(settings) {
    var f = $("time-form").elements;
    Object.keys(settings).forEach(function (k) { if (f[k]) f[k].value = settings[k]; });
    showStatus();
  }

  // บันทึกค่าทั้งหมดในฟอร์ม แล้วแจ้งผลหลังเซิร์ฟเวอร์ตอบกลับจริงเท่านั้น
  function saveTimes(okMsg) {
    var f = $("time-form").elements, s = {};
    TIME_KEYS.forEach(function (k) { s[k] = f[k].value; });
    if (s.submission_opens && s.submission_deadline && s.submission_deadline < s.submission_opens) {
      toast("เวลาปิดรับต้องไม่ก่อนเวลาเปิดรับ", true); return Promise.resolve();
    }
    var btns = $("time-form").querySelectorAll("button");
    btns.forEach(function (b) { b.disabled = true; });
    return api("setSettings", { settings: s }).then(function (r) {
      fillSettings(r.settings);
      try { sessionStorage.removeItem("cpe_cfg_v1"); localStorage.setItem("cpe_cfg_changed", String(Date.now())); } catch (e) {} // แท็บหน้าเว็บอื่นในเบราว์เซอร์นี้รีโหลดสถานะทันที
      toast(okMsg || "บันทึกกำหนดเวลาแล้ว");
    }).catch(function (e) { toast(errText(e), true); })
      .then(function () { btns.forEach(function (b) { b.disabled = false; }); });
  }

  $("time-form").addEventListener("submit", function (ev) { ev.preventDefault(); saveTimes(); });
  $("time-form").addEventListener("input", showStatus);

  // เปิดรับตอนนี้: เวลาเปิด = ตอนนี้ และถ้าเวลาปิดเดิมผ่านไปแล้ว ให้ล้างทิ้ง (ไม่งั้นจะปิดทันที)
  $("open-now").addEventListener("click", function () {
    var f = $("time-form").elements, n = nowTH(), cleared = f.submission_deadline.value && f.submission_deadline.value <= n;
    f.submission_opens.value = n;
    if (cleared) f.submission_deadline.value = "";
    saveTimes("เปิดรับบทความแล้ว" + (cleared ? " (ล้างเวลาปิดเดิมที่ผ่านไปแล้ว ตั้งเวลาปิดใหม่ได้)" : ""));
  });
  // ปิดรับตอนนี้: เวลาปิด = ตอนนี้ และถ้ายังไม่ถึงเวลาเปิด ให้ถือว่าเปิดตั้งแต่ตอนนี้แล้วปิดเลย
  $("close-now").addEventListener("click", function () {
    var f = $("time-form").elements, n = nowTH();
    if (!f.submission_opens.value || f.submission_opens.value > n) f.submission_opens.value = n;
    f.submission_deadline.value = n;
    saveTimes("ปิดรับบทความแล้ว");
  });

  /* ---------- templates ---------- */
  var TPL = [
    { key: "word", label: "เทมเพลต Word", accept: ".docx,.doc,.dotx", hint: "ไฟล์ .docx / .doc / .dotx" },
    { key: "latex", label: "เทมเพลต LaTeX", accept: ".zip,.tex", hint: "ไฟล์ .zip (รวม .tex .cls .bib) หรือ .tex" }
  ];
  function renderTemplates(t) {
    var box = $("tpl-list"); box.textContent = "";
    TPL.forEach(function (d) {
      var cur = t[d.key];
      var input = el("input", { type: "file", accept: d.accept, "aria-label": "เลือกไฟล์ " + d.label });
      var up = el("button", { type: "button", class: "btn btn-cdti small", text: cur ? "แทนที่ไฟล์" : "อัปโหลด" });
      up.addEventListener("click", function () {
        var file = input.files[0];
        if (!file) { toast("กรุณาเลือกไฟล์ก่อน", true); return; }
        if (file.size > 10 * 1024 * 1024) { toast(ERR_TH.file_too_large, true); return; }
        up.disabled = true; up.textContent = "กำลังอัปโหลด…";
        var rd = new FileReader();
        rd.onload = function () {
          api("uploadTemplate", { key: d.key, fileName: file.name, fileBase64: String(rd.result).split(",")[1] })
            .then(function (r) { renderTemplates(r.templates); toast("อัปโหลด" + d.label + "แล้ว"); })
            .catch(function (e) { up.disabled = false; up.textContent = cur ? "แทนที่ไฟล์" : "อัปโหลด"; toast(errText(e), true); });
        };
        rd.readAsDataURL(file);
      });
      var kids = [
        el("h3", { text: d.label }),
        el("p", { class: cur ? "" : "muted", text: cur ? "ไฟล์ปัจจุบัน: " + cur.name + " (อัปเดต " + cur.updatedAt.replace("T", " ") + ")" : "ยังไม่มีไฟล์ — หน้าเว็บแสดง \"เร็ว ๆ นี้\"" }),
        el("p", { class: "muted", text: d.hint }), input, el("div", { class: "form-actions" }, [up])
      ];
      if (cur) {
        var del = el("button", { type: "button", class: "btn-link danger", text: "ลบ" });
        del.addEventListener("click", function () {
          if (!confirm("ลบ" + d.label + "?\nหน้าเว็บจะกลับไปแสดง \"เร็ว ๆ นี้\" (ไฟล์ถูกย้ายไปถังขยะ Drive)")) return;
          del.disabled = true;
          api("deleteTemplate", { key: d.key }).then(function (r) { renderTemplates(r.templates); toast("ลบ" + d.label + "แล้ว"); })
            .catch(function (e) { del.disabled = false; toast(errText(e), true); });
        });
        kids[4].appendChild(del);
      }
      box.appendChild(el("div", { class: "card tpl-card" }, kids));
    });
  }

  /* ---------- admins ---------- */
  function renderAdmins(list) {
    var tb = $("admins"); tb.textContent = "";
    list.forEach(function (a) {
      var del = el("td");
      if (a.role !== "owner" && a.email !== me.email) {
        var b = el("button", { type: "button", class: "btn-link danger", text: "ลบ" });
        b.addEventListener("click", function () {
          if (!confirm("ลบสิทธิ์แอดมินของ " + a.email + " ?")) return;
          api("removeAdmin", { email: a.email }).then(function (r) { renderAdmins(r.admins); toast("ลบแอดมินแล้ว"); }).catch(function (e) { toast(errText(e), true); });
        });
        del.appendChild(b);
      }
      if (me && me.role === "owner" && a.role !== "owner") {
        var rs = el("button", { type: "button", class: "btn-link", text: "ตั้งรหัสใหม่" });
        rs.addEventListener("click", function () {
          var np = prompt("รหัสผ่านใหม่ของ " + a.email + " (8 ตัวขึ้นไป)");
          if (!np) return;
          api("resetPassword", { email: a.email, newPassword: np }).then(function () { toast("ตั้งรหัสผ่านใหม่แล้ว"); }).catch(function (e) { toast(errText(e), true); });
        });
        del.insertBefore(rs, del.firstChild);
      }
      tb.appendChild(el("tr", {}, [el("td", { text: a.email }), el("td", { text: a.role === "owner" ? "เจ้าของ" : "แอดมิน" }), el("td", { text: a.addedBy }), del]));
    });
  }
  $("admin-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = $("admin-form").elements;
    api("addAdmin", { email: f.email.value, password: f.password.value }).then(function (r) {
      $("admin-form").reset(); renderAdmins(r.admins); toast("เพิ่มแอดมินแล้ว กรุณาแจ้งรหัสผ่านให้เขา");
    }).catch(function (e) { toast(errText(e), true); });
  });
  $("pw-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = $("pw-form").elements;
    api("changePassword", { oldPassword: f.oldPassword.value, newPassword: f.newPassword.value }).then(function () {
      $("pw-form").reset(); toast("เปลี่ยนรหัสผ่านแล้ว");
    }).catch(function (e) { toast(errText(e), true); });
  });

  $("logout").addEventListener("click", function () { try { sessionStorage.removeItem("cpe_edit"); } catch (e) {} logout(""); });
  // เข้าโหมดแก้ไขเว็บไซต์: เปิดหน้าแรกในแท็บเดิม (ใช้ token เดียวกัน) แล้วแก้ข้อความ/รูปบนหน้าจริงได้เลย
  $("edit-site").addEventListener("click", function () {
    try { sessionStorage.setItem("cpe_edit", "1"); } catch (e) {}
    location.href = "../index.html";
  });

  /* ---------- boot ---------- */
  if (!cfg.API_URL) { showLogin("ยังไม่ได้ตั้งค่า API_URL ในไฟล์ app/src/js/config.js (ดู backend/SETUP.md)"); return; }
  showLogin("");
  if (sessionStorage.getItem(TOKEN_KEY)) start();
})();
