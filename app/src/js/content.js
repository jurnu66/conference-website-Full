/* นำการแก้ไขเนื้อหาที่แอดมินบันทึกไว้ (ข้อความ + รูปภาพ) ไปทับหน้าเว็บ
   - เก็บสำเนาล่าสุดไว้ใน localStorage แล้วใช้ทันทีตอนโหลด (หน้าเว็บไม่กระพริบสำหรับผู้ที่เคยเข้ามาแล้ว)
   - จากนั้นเทียบเวอร์ชันกับเซิร์ฟเวอร์ ถ้าเปลี่ยนจึงปรับหน้าเว็บให้ตรงกัน
   - ถ้าแอดมินล็อกอินอยู่และเปิด "โหมดแก้ไข" จะโหลด editor.js ให้ */
(function () {
  "use strict";
  var cfg = window.CPE_CONFIG || {};
  if (!cfg.API_URL) return;
  var doc = document;
  var LANG = doc.documentElement.lang === "en" ? "en" : "th";
  var PAGE = doc.body.getAttribute("data-page") || "home";
  var LS = "cpe_content_v1";
  var base = (doc.currentScript && doc.currentScript.src) ? doc.currentScript.src.replace(/content\.js.*$/, "") : "";

  // ส่วนที่ไม่แก้/ไม่ทับ: ข้อความที่สคริปต์เติมเอง (วันที่ สถานะ ผลตรวจ) และตัวแก้ไขเอง
  var SKIP = "script,style,noscript,textarea,svg,select,option,[data-date],[data-template],#submit-status,#submit-msg,#status-result,#done-id,#done-title,#done-time,#done-mail,.cpe-ui";
  var GLOBAL = ".topbar,header,footer,.skip-link,.to-top"; // ส่วนที่ซ้ำทุกหน้า: แก้ครั้งเดียวมีผลทั้งเว็บ

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }
  function h8(s) { // FNV-1a 32 บิต
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ("00000000" + h.toString(16)).slice(-8);
  }
  function imgKey(img) {
    var src = img.getAttribute("data-orig-src") || img.getAttribute("src") || "";
    return "i|" + h8(src.split("?")[0].split("/").pop());
  }

  var meta = new WeakMap(); // text node → { key, orig, lead, tail }
  var map = {}, ver = "0";
  var C = window.CPE_CONTENT = { LANG: LANG, PAGE: PAGE, norm: norm, h8: h8, imgKey: imgKey, meta: meta, SKIP: SKIP, textNodes: textNodes, getMap: function () { return map; } };

  // รวบรวม text node ที่แก้ได้ แล้วตั้งคีย์จาก "ข้อความเดิม" + ขอบเขต + ลำดับที่ซ้ำในขอบเขตนั้น
  function textNodes() {
    var nodes = [], counts = {};
    var w = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        return (!p || p.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) {
      var m = meta.get(n);
      if (!m) { m = { orig: norm(n.nodeValue), lead: /^\s*/.exec(n.nodeValue)[0], tail: /\s*$/.exec(n.nodeValue)[0] }; }
      var scope = n.parentElement.closest(GLOBAL) ? "g" : PAGE;
      var ck = scope + "|" + m.orig;
      counts[ck] = (counts[ck] || 0) + 1;
      m.key = "t|" + LANG + "|" + scope + "|" + h8(m.orig) + "|" + counts[ck];
      meta.set(n, m);
    });
    return nodes;
  }

  /* ---------- รูปภาพ: โหลดผ่าน API แล้วเก็บใน Cache API (ครั้งต่อไปไม่ต้องโหลดซ้ำ) ---------- */
  var mediaP = {};
  function b64Blob(b64, mime) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  function ckey(id) { return "https://cpe.invalid/media/" + encodeURIComponent(id); }
  function loadMedia(id) {
    if (mediaP[id]) return mediaP[id];
    var net = function () {
      return fetch(cfg.API_URL + "?action=media&id=" + encodeURIComponent(id)).then(function (r) { return r.json(); }).then(function (r) {
        if (!r.ok) throw new Error(r.error);
        var blob = b64Blob(r.base64, r.mime);
        if (window.caches) caches.open("cpe-media-v1").then(function (c) { c.put(ckey(id), new Response(blob, { headers: { "Content-Type": r.mime } })); }).catch(function () {});
        return URL.createObjectURL(blob);
      });
    };
    var p = window.caches
      ? caches.open("cpe-media-v1").then(function (c) { return c.match(ckey(id)); })
          .then(function (hit) { return hit ? hit.blob().then(function (b) { return URL.createObjectURL(b); }) : net(); })
          .catch(net)
      : net();
    mediaP[id] = p;
    p.catch(function () { delete mediaP[id]; });
    return p;
  }
  // ใช้ตอนแอดมินเพิ่งอัปโหลด (ไม่ต้องโหลดกลับจากเซิร์ฟเวอร์)
  C.primeMedia = function (id, blob) {
    mediaP[id] = Promise.resolve(URL.createObjectURL(blob));
    if (window.caches) caches.open("cpe-media-v1").then(function (c) { c.put(ckey(id), new Response(blob, { headers: { "Content-Type": blob.type } })); }).catch(function () {});
  };

  /* ---------- ใช้ค่าที่บันทึกไว้กับหน้า (ทำซ้ำได้ ใช้ทั้งตอนโหลดและหลังแอดมินบันทึก) ---------- */
  function applyAll() {
    textNodes().forEach(function (n) {
      var m = meta.get(n), want = map[m.key];
      var text = want !== undefined ? m.lead + want + m.tail : m.lead + m.orig + m.tail;
      if (n.nodeValue !== text) n.nodeValue = text;
    });
    doc.querySelectorAll("img").forEach(function (img) {
      if (img.closest(".cpe-ui")) return;
      var key = imgKey(img), v = map[key];
      if (v) {
        var id = v.split("|")[0];
        if (img.getAttribute("data-cpe-id") === id) return;
        if (!img.hasAttribute("data-orig-src")) img.setAttribute("data-orig-src", img.getAttribute("src"));
        loadMedia(id).then(function (url) {
          img.removeAttribute("srcset"); img.removeAttribute("width"); img.removeAttribute("height"); img.removeAttribute("loading");
          img.src = url; img.setAttribute("data-cpe-id", id);
        }).catch(function () {});
      } else if (img.hasAttribute("data-orig-src")) { // เอาการแทนที่ออก → กลับเป็นรูปเดิม
        img.src = img.getAttribute("data-orig-src"); img.removeAttribute("data-orig-src"); img.removeAttribute("data-cpe-id");
      }
    });
  }
  C.applyAll = applyAll;
  C.setContent = function (content) {
    map = content.map || {}; ver = content.ver || "0";
    try { localStorage.setItem(LS, JSON.stringify({ ver: ver, map: map })); } catch (e) {}
    applyAll();
  };

  // 1) ใช้สำเนาเดิมทันที  2) ตรวจกับเซิร์ฟเวอร์
  try { var c0 = JSON.parse(localStorage.getItem(LS) || "null"); if (c0 && c0.map) { map = c0.map; ver = c0.ver || "0"; } } catch (e) {}
  applyAll();
  var go = function (c) {
    if (!c || !c.content) return;
    if (Number(c.content.ver) > Number(ver)) C.setContent(c.content); // ใหม่กว่าเท่านั้น (กันค่าแคชเก่ามาทับ)
  };
  if (window.CPE_LIVE) window.CPE_LIVE.then(go).catch(function () {});
  if (window.CPE_ONCHANGE) window.CPE_ONCHANGE(go);

  /* ---------- โหมดแก้ไข (เฉพาะแอดมินที่ล็อกอินและกดเข้าโหมดแก้ไขจากหน้าแอดมิน) ---------- */
  var token = ""; try { token = sessionStorage.getItem("cpe_admin_token") || ""; } catch (e) {}
  var editing = false; try { editing = sessionStorage.getItem("cpe_edit") === "1"; } catch (e) {}
  if (token && editing && base) {
    var s = doc.createElement("script");
    s.src = base + "editor.js";
    doc.body.appendChild(s);
  }
})();
