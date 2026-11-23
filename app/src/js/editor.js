/* โหมดแก้ไขเว็บไซต์ (เฉพาะแอดมิน) — โหลดโดย content.js เมื่อแอดมินล็อกอินและกด "แก้ไขเว็บไซต์" จากหน้าแอดมิน
   - คลิกข้อความบนหน้าเพื่อแก้ในที่ แล้วกด "บันทึก"   - แผง "รูปภาพในหน้านี้" ใช้เปลี่ยน/คืนรูป
   สิทธิ์ตรวจที่เซิร์ฟเวอร์ทุกครั้ง (token ของแอดมิน) ไม่ได้อาศัยแค่การซ่อนปุ่ม */
(function () {
  "use strict";
  var C = window.CPE_CONTENT, cfg = window.CPE_CONFIG || {}, doc = document;
  if (!C || !cfg.API_URL) return;
  var TOKEN_KEY = "cpe_admin_token";
  var pending = {}; // key → ข้อความใหม่ | null (คืนค่าเดิม)

  function el(tag, props, kids) {
    var n = doc.createElement(tag);
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
      .then(function (r) { if (!r.ok) { var e = new Error(r.error || "error"); e.code = r.error; throw e; } return r; });
  }
  var ERR = {
    unauthorized: "หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบแอดมินใหม่", bad_file_type: "ชนิดไฟล์ไม่รองรับ (ใช้ JPG, PNG, WebP, GIF หรือ SVG)",
    file_too_large: "ไฟล์ใหญ่เกินไป", empty_text: "ข้อความว่างไม่ได้", too_many_edits: "จำนวนการแก้ไขเต็มแล้ว"
  };
  var errText = function (e) { return ERR[e.code] || "เกิดข้อผิดพลาด กรุณาลองใหม่"; };

  var CSS = [
    ".cpe-t{outline:1px dashed transparent;outline-offset:2px;cursor:text;transition:outline-color .15s,background-color .15s}",
    ".cpe-t:hover{outline-color:#4D79BC;background:rgba(75,120,188,.10)}",
    ".cpe-t:focus{outline:2px solid #4D79BC;background:#fff;color:#1E3A6E}",
    ".cpe-t.cpe-has{box-shadow:inset 0 -3px 0 #2E7D32}",
    ".cpe-t.cpe-changed{background:#FFF3A3;color:#1E3A6E}",
    ".cpe-prompt{cursor:pointer}",
    "#cpe-bar{position:fixed;left:0;right:0;bottom:0;z-index:100000;background:#1F4EAF;color:#fff;display:flex;flex-wrap:wrap;gap:10px 12px;align-items:center;padding:10px 16px;font:500 15px/1.4 Niramit,system-ui,sans-serif;box-shadow:0 -6px 24px rgba(0,0,0,.25)}",
    "#cpe-bar strong{font-size:16px;color:#F3EB1A}",
    "#cpe-bar button,#cpe-bar select,#cpe-bar a{font:inherit;min-height:40px;border-radius:10px;border:1.5px solid rgba(255,255,255,.55);background:transparent;color:#fff;padding:6px 14px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}",
    "#cpe-bar select{background:#1F4EAF;max-width:220px}",
    "#cpe-bar button.cpe-primary{background:#F3EB1A;color:#1E3A6E;border-color:#F3EB1A;font-weight:700}",
    "#cpe-bar button:disabled{opacity:.45;cursor:not-allowed}",
    "#cpe-bar .cpe-hint{flex-basis:100%;font-size:13px;opacity:.85}",
    "#cpe-msg{font-weight:600}#cpe-msg.err{color:#FFB4AB}",
    "#cpe-imgs{position:fixed;right:16px;bottom:120px;z-index:100000;width:min(440px,calc(100vw - 32px));max-height:60vh;overflow:auto;background:#fff;color:#1E3A6E;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.35);padding:14px;font:500 15px/1.4 Niramit,system-ui,sans-serif}",
    "#cpe-imgs h3{margin:0 0 8px;font-size:17px}",
    ".cpe-img-row{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #E1E4E8;flex-wrap:wrap}",
    ".cpe-img-row img{width:64px;height:44px;object-fit:cover;border-radius:6px;background:#EEF3FB;flex-shrink:0}",
    ".cpe-img-row .nm{flex:1;min-width:120px;word-break:break-all}",
    ".cpe-img-row small{display:block;color:#2E7D32}",
    "#cpe-imgs button{font:inherit;min-height:40px;border-radius:10px;border:1.5px solid #2C66E0;background:#fff;color:#1E3A6E;padding:4px 12px;cursor:pointer}",
    "#cpe-imgs button.p{background:#2C66E0;color:#F3EB1A;border-color:#2C66E0}"
  ].join("\n");
  doc.head.appendChild(el("style", { class: "cpe-ui", text: CSS }));

  var bar = el("div", { id: "cpe-bar", class: "cpe-ui", role: "region", "aria-label": "โหมดแก้ไขเว็บไซต์" });
  doc.body.appendChild(bar);
  doc.body.style.paddingBottom = "140px";

  function endEdit(msg) {
    try { sessionStorage.removeItem("cpe_edit"); } catch (e) {}
    if (msg) alert(msg);
    location.reload();
  }

  // ตรวจสิทธิ์ก่อนเปิดโหมดแก้ไข
  api("whoami").then(start).catch(function (e) {
    bar.appendChild(el("strong", { text: "โหมดแก้ไขเว็บไซต์" }));
    bar.appendChild(el("span", { id: "cpe-msg", class: "err", text: errText(e) }));
    var ad = el("a", { href: adminHref(), text: "ไปหน้าแอดมิน" }); bar.appendChild(ad);
    var ex = el("button", { type: "button", text: "ออกจากโหมดแก้ไข" }); ex.addEventListener("click", function () { endEdit(); }); bar.appendChild(ex);
  });

  function adminHref() { return new URL(doc.body.getAttribute("data-admin") || "admin/index.html", location.href).href; }

  function start() {
    // ---------- ห่อข้อความแต่ละก้อนให้แก้ได้ ----------
    var spans = [];
    C.textNodes().forEach(function (n) {
      var p = n.parentElement;
      if (p.classList.contains("cpe-t")) { p._n = n; spans.push(p); return; }
      var sp = el("span", { class: "cpe-t" });
      if (p.closest("button,summary,label")) { sp.classList.add("cpe-prompt"); sp.title = "ดับเบิลคลิกเพื่อแก้ข้อความ"; }
      else {
        sp.contentEditable = "plaintext-only";
        if (sp.contentEditable !== "plaintext-only") sp.contentEditable = "true";
        sp.spellcheck = false;
      }
      p.insertBefore(sp, n); sp.appendChild(n);
      sp._n = n; spans.push(sp);
    });

    function curText(m) { var v = C.getMap()[m.key]; return v !== undefined ? v : m.orig; }
    function mark(sp) {
      var m = C.meta.get(sp._n);
      sp.classList.toggle("cpe-has", C.getMap()[m.key] !== undefined);
      sp.classList.toggle("cpe-changed", pending[m.key] !== undefined);
    }
    function count() { var n = Object.keys(pending).length; save.disabled = n === 0; save.textContent = n ? "บันทึก (" + n + ")" : "บันทึก"; undo.disabled = n === 0; }
    var msgT;
    function msg(t, isErr) { var m = doc.getElementById("cpe-msg"); m.textContent = t; m.className = isErr ? "err" : ""; clearTimeout(msgT); msgT = setTimeout(function () { m.textContent = ""; }, 6000); }

    // เก็บข้อความที่แก้ลง text node เดิม (คีย์ผูกกับ node นี้) แล้วเทียบกับค่าที่บันทึกไว้
    function commit(sp, text) {
      var n = sp._n, m = C.meta.get(n);
      var t = C.norm(text == null ? sp.textContent : text) || m.orig; // ห้ามว่าง
      n.nodeValue = m.lead + t + m.tail;
      if (sp.childNodes.length !== 1 || sp.firstChild !== n) { sp.textContent = ""; sp.appendChild(n); }
      if (t === curText(m)) delete pending[m.key];
      else if (t === m.orig) pending[m.key] = null;   // เท่ากับของเดิม → ลบการแทนที่
      else pending[m.key] = t;
      mark(sp); count();
    }

    doc.addEventListener("focusout", function (e) {
      var sp = e.target.closest && e.target.closest(".cpe-t:not(.cpe-prompt)");
      if (sp) commit(sp);
    });
    doc.addEventListener("keydown", function (e) {
      var sp = e.target.closest && e.target.closest(".cpe-t:not(.cpe-prompt)");
      if (!sp) return;
      if (e.key === "Enter") { e.preventDefault(); sp.blur(); }
      else if (e.key === "Escape") { e.preventDefault(); sp.textContent = C.meta.get(sp._n).orig; commit(sp); sp.blur(); }
    });
    doc.addEventListener("dblclick", function (e) {
      var sp = e.target.closest && e.target.closest(".cpe-prompt");
      if (!sp) return;
      e.preventDefault();
      var m = C.meta.get(sp._n), v = prompt("แก้ข้อความ (เว้นว่าง = คืนค่าเดิม)", C.norm(sp._n.nodeValue));
      if (v === null) return;
      commit(sp, v.trim() ? v : m.orig);
    });
    // ลิงก์ไม่พาออกจากหน้าตอนคลิกเพื่อแก้ (กด Cmd/Ctrl ค้างไว้เพื่อเปิดลิงก์)
    doc.addEventListener("click", function (e) {
      if (e.target.closest(".cpe-ui")) return;
      var a = e.target.closest("a");
      if (a && !e.metaKey && !e.ctrlKey) e.preventDefault();
    }, true);
    window.addEventListener("beforeunload", function (e) { if (Object.keys(pending).length) { e.preventDefault(); e.returnValue = ""; } });

    // ---------- แถบเครื่องมือ ----------
    bar.appendChild(el("strong", { text: "โหมดแก้ไขเว็บไซต์" }));
    var sel = el("select", { "aria-label": "ไปหน้าอื่น" });
    var pages = []; try { pages = JSON.parse(doc.body.getAttribute("data-pages") || "[]"); } catch (e) {}
    pages.forEach(function (p) {
      var o = el("option", { value: new URL(p.href, location.href).href, text: p.label });
      if (p.current) o.selected = true; sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      if (Object.keys(pending).length && !confirm("มีการแก้ไขที่ยังไม่ได้บันทึก ออกจากหน้านี้เลยไหม?")) { pages.forEach(function (p, i) { sel.options[i].selected = !!p.current; }); return; }
      pending = {}; location.href = sel.value;
    });
    bar.appendChild(sel);
    var save = el("button", { type: "button", class: "cpe-primary", text: "บันทึก", disabled: "" });
    var undo = el("button", { type: "button", text: "ยกเลิกที่ยังไม่บันทึก", disabled: "" });
    var imgsBtn = el("button", { type: "button", text: "รูปภาพในหน้านี้" });
    var back = el("a", { href: adminHref(), text: "หลังบ้าน" });
    var exit = el("button", { type: "button", text: "ออกจากโหมดแก้ไข" });
    [save, undo, imgsBtn, back, exit].forEach(function (b) { bar.appendChild(b); });
    bar.appendChild(el("span", { id: "cpe-msg", role: "status", "aria-live": "polite" }));
    bar.appendChild(el("span", { class: "cpe-hint", text: "คลิกข้อความเพื่อแก้ · Enter = จบ · Esc = คืนค่าเดิมของข้อความนั้น · ปุ่ม/หัวข้อพับ: ดับเบิลคลิก · Cmd/Ctrl+คลิก = เปิดลิงก์ · ข้อความในส่วนหัว/ท้ายเว็บแก้ครั้งเดียวมีผลทุกหน้า" }));

    save.addEventListener("click", function () {
      if (doc.activeElement && doc.activeElement.blur) doc.activeElement.blur();
      var keys = Object.keys(pending);
      if (!keys.length) return;
      save.disabled = true; save.textContent = "กำลังบันทึก…";
      api("saveContent", { texts: pending }).then(function (r) {
        pending = {};
        C.setContent(r.content);
        try { sessionStorage.removeItem("cpe_cfg_v1"); } catch (e) {}
        spans.forEach(mark); count(); msg("บันทึกแล้ว ผู้เข้าชมเห็นข้อความใหม่ภายในไม่กี่วินาที");
      }).catch(function (e) { msg(errText(e), true); count(); });
    });
    undo.addEventListener("click", function () {
      pending = {};
      spans.forEach(function (sp) { var m = C.meta.get(sp._n); sp.textContent = curText(m); commit(sp); });
      count();
    });
    exit.addEventListener("click", function () {
      if (Object.keys(pending).length && !confirm("มีการแก้ไขที่ยังไม่ได้บันทึก ออกโดยไม่บันทึกไหม?")) return;
      pending = {}; endEdit();
    });
    spans.forEach(mark);

    // ---------- รูปภาพ ----------
    var panel = el("div", { id: "cpe-imgs", class: "cpe-ui", hidden: "" });
    doc.body.appendChild(panel);
    var picker = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml", class: "cpe-ui", hidden: "" });
    doc.body.appendChild(picker);
    var pickKey = null;

    function renderImgs() {
      panel.textContent = "";
      panel.appendChild(el("h3", { text: "รูปภาพในหน้านี้" }));
      var seen = {}, any = false;
      doc.querySelectorAll("img").forEach(function (img) {
        if (img.closest(".cpe-ui")) return;
        var key = C.imgKey(img);
        if (seen[key]) return; seen[key] = true; any = true;
        var orig = (img.getAttribute("data-orig-src") || img.getAttribute("src") || "").split("?")[0].split("/").pop();
        var over = !!C.getMap()[key];
        var th = el("img", { alt: "" }); th.src = img.currentSrc || img.src;
        var rep = el("button", { type: "button", class: "p", text: over ? "เปลี่ยนอีกครั้ง" : "เปลี่ยนรูป" });
        rep.addEventListener("click", function () { pickKey = key; picker.value = ""; picker.click(); });
        var kids = [th, el("div", { class: "nm" }, [doc.createTextNode(orig), over ? el("small", { text: "ถูกแทนที่แล้ว" }) : doc.createTextNode("")]), rep];
        if (over) {
          var rv = el("button", { type: "button", text: "คืนรูปเดิม" });
          rv.addEventListener("click", function () {
            if (!confirm("คืนรูปเดิม?")) return;
            api("saveContent", { texts: (function () { var o = {}; o[key] = null; return o; })() })
              .then(function (r) { C.setContent(r.content); msg("คืนรูปเดิมแล้ว"); renderImgs(); })
              .catch(function (e) { msg(errText(e), true); });
          });
          kids.push(rv);
        }
        panel.appendChild(el("div", { class: "cpe-img-row" }, kids));
      });
      if (!any) panel.appendChild(el("p", { text: "ไม่มีรูปภาพในหน้านี้" }));
      var close = el("button", { type: "button", text: "ปิด" }); close.addEventListener("click", function () { panel.hidden = true; });
      panel.appendChild(close);
    }
    imgsBtn.addEventListener("click", function () { if (panel.hidden) { renderImgs(); panel.hidden = false; } else panel.hidden = true; });

    // ย่อรูปในเครื่องก่อนอัปโหลด (ด้านยาวสุด 1600px) ให้เร็วและไม่เกินขนาดที่รับ
    var MAX_RAW = 3.8 * 1024 * 1024;
    function readB64(file) {
      return new Promise(function (res, rej) {
        var r = new FileReader();
        r.onload = function () { res(String(r.result).split(",")[1]); };
        r.onerror = rej; r.readAsDataURL(file);
      });
    }
    function prepare(file) {
      var t = file.type;
      if (t === "image/svg+xml") {
        if (file.size > 500 * 1024) return Promise.reject({ code: "file_too_large" });
        return readB64(file).then(function (b) { return { mime: t, base64: b, blob: file }; });
      }
      if (t === "image/gif") {
        if (file.size > MAX_RAW) return Promise.reject({ code: "file_too_large" });
        return readB64(file).then(function (b) { return { mime: t, base64: b, blob: file }; });
      }
      if (!/^image\/(jpeg|png|webp)$/.test(t)) return Promise.reject({ code: "bad_file_type" });
      return new Promise(function (res, rej) {
        var url = URL.createObjectURL(file), im = new Image();
        im.onerror = function () { rej({ code: "bad_file_type" }); };
        im.onload = function () {
          var attempt = function (maxSide, q) {
            var sc = Math.min(1, maxSide / Math.max(im.width, im.height));
            var cv = doc.createElement("canvas"); cv.width = Math.round(im.width * sc); cv.height = Math.round(im.height * sc);
            cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
            var mime = t === "image/png" ? "image/png" : "image/jpeg";
            cv.toBlob(function (blob) {
              if (!blob) return rej({ code: "bad_file_type" });
              if (blob.size > MAX_RAW) { if (maxSide > 800) return attempt(Math.round(maxSide * 0.7), 0.75); return rej({ code: "file_too_large" }); }
              readB64(blob).then(function (b) { URL.revokeObjectURL(url); res({ mime: mime, base64: b, blob: blob }); });
            }, mime, q);
          };
          attempt(1600, 0.85);
        };
        im.src = url;
      });
    }
    picker.addEventListener("change", function () {
      var file = picker.files[0], key = pickKey;
      if (!file || !key) return;
      msg("กำลังอัปโหลดรูป…");
      prepare(file).then(function (p) {
        return api("uploadMedia", { key: key, mime: p.mime, base64: p.base64 }).then(function (r) {
          var id = (r.content.map[key] || "").split("|")[0];
          if (id) C.primeMedia(id, p.blob);
          C.setContent(r.content);
          msg("เปลี่ยนรูปแล้ว"); renderImgs();
        });
      }).catch(function (e) { msg(errText(e), true); });
    });
  }
})();
