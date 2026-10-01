/* Standart Entegre — interface script (no dependencies) */
(function () {
  "use strict";
  // Texts come from the page (content/<lang>.yml → js); the form endpoint from content/site.yml.
  var T = {};
  try { T = JSON.parse(document.getElementById("i18n").textContent); } catch (e) {}
  var LOC = T.locale || "tr-TR";
  if (LOC.indexOf("ar") === 0) LOC = "ar-u-nu-latn";

  var $ = function (id) { return document.getElementById(id); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function pick(key) { var el = $("ug-" + key); if (el) el.checked = true; }
  function go(id) { var el = $(id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }

  /* header: transparent over the dark hero, solid elsewhere */
  var hdr = $("hdr"), hero = document.querySelector("[data-hero]");
  function hdrState() {
    if (!hdr) return;
    var solid = true;
    if (hero) { var r = hero.getBoundingClientRect(); solid = r.bottom <= 80; }
    hdr.classList.toggle("is-solid", solid);
    var pl = document.getElementById("qpill"); if (pl) pl.classList.toggle("in-hero", !solid);
  }
  addEventListener("scroll", hdrState, { passive: true }); hdrState();

  /* mobile menu */
  var burger = $("burger"), nav = $("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.textContent = open ? burger.dataset.close : burger.dataset.open;
      if (open) hdr.classList.add("is-solid"); else hdrState();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.textContent = burger.dataset.open; hdrState(); }
    });
  }

  /* mobile quote pill hides over the form */
  var pill = $("qpill"), rfq = $("teklif");
  if (pill && rfq && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { pill.classList.toggle("hide", en[0].isIntersecting); }, { threshold: 0.05 }).observe(rfq);
  }

  /* product preselect from ?urun= */
  try { var q = new URLSearchParams(location.search).get("urun"); if (q) pick(q); } catch (e) {}

  /* ---------- scale tool ---------- */
  var svg = $("scaleSvg"), range = $("dRange");
  if (svg && range) {
    var NS = "http://www.w3.org/2000/svg";
    var S = 0.12, GY = 440, CX = 668;
    function el(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n); return n;
    }
    // ground
    el("line", { x1: 0, y1: GY, x2: 900, y2: GY, class: "sv-ground" });
    // person, 1.75 m
    var ph = 1750 * S, px = 58, k = ph / 1750;
    var person = el("g", { transform: "translate(" + px + "," + GY + ") scale(" + k + ")" });
    el("circle", { cx: 0, cy: -1640, r: 108, class: "sv-person" }, person);
    el("path", { class: "sv-person", d: "M-62,-1512 L-196,-1452 C-222,-1440 -232,-1410 -234,-1380 L-246,-980 L-190,-980 L-170,-1300 L-160,-900 L-128,0 L-36,0 L0,-800 L36,0 L128,0 L160,-900 L170,-1300 L190,-980 L246,-980 L234,-1380 C232,-1410 222,-1440 196,-1452 L62,-1512 Z" }, person);
    el("text", { x: px, y: GY - ph - 26, "text-anchor": "middle", class: "sv-txt" }).textContent = T.person || "1,75 m";
    // container doors
    var dx = 150, dw = 2340 * S, dh = 2280 * S, hch = 2580 * S;
    el("rect", { x: dx, y: GY - hch, width: dw, height: hch, class: "sv-door hc" });
    el("rect", { x: dx, y: GY - dh, width: dw, height: dh, class: "sv-door" });
    el("text", { x: dx + 10, y: GY - hch - 10, class: "sv-txt" }).textContent = T.door_hc || "";
    el("text", { x: dx + 10, y: GY - dh + 20, class: "sv-txt" }).textContent = T.door_std || "";

    // reel face, unit radius 100
    var reel = el("g", { class: "reelg" });
    var defs = el("defs", {});
    var cp = el("clipPath", { id: "reelClip" }, defs); el("circle", { cx: 0, cy: 0, r: 100 }, cp);
    el("circle", { cx: 0, cy: 0, r: 100, class: "sv-reel-face" }, reel);
    var planks = el("g", { "clip-path": "url(#reelClip)" }, reel);
    for (var i = -100 + 12; i < 100; i += 12.4) el("line", { x1: i, y1: -100, x2: i, y2: 100, class: "sv-reel-plank", "vector-effect": "non-scaling-stroke" }, planks);
    el("circle", { cx: 0, cy: 0, r: 99.5, class: "sv-reel-rim", "vector-effect": "non-scaling-stroke" }, reel);
    el("circle", { cx: 0, cy: 0, r: 50, class: "sv-reel-drum", "vector-effect": "non-scaling-stroke" }, reel);
    el("rect", { x: -9.5, y: -9.5, width: 19, height: 19, class: "sv-reel-plate" }, reel);
    el("circle", { cx: 0, cy: 0, r: 3.4, class: "sv-reel-hole" }, reel);
    for (var b = 0; b < 6; b++) { var a = b / 6 * Math.PI * 2 + Math.PI / 6; el("circle", { cx: Math.cos(a) * 36, cy: Math.sin(a) * 36, r: 2, class: "sv-reel-bolt" }, reel); }
    // dimension
    var dim = el("g", {});
    var dl = el("line", { class: "sv-dim" }, dim), dt = el("line", { class: "sv-dim" }, dim), db = el("line", { class: "sv-dim" }, dim);
    var dtx = el("text", { class: "sv-txt strong", "text-anchor": "start" }, dim);

    var out = $("dOut"), note = $("dNote");
    function fmt(n) { try { return n.toLocaleString(LOC); } catch (e) { return String(n); } }
    function update() {
      var D = +range.value, R = D * S / 2;
      var mn = +range.min, mx = +range.max;
      range.style.setProperty("--fill", ((D - mn) / (mx - mn) * 100) + "%");
      reel.style.transform = "translate(" + CX + "px," + (GY - R) + "px) scale(" + (R / 100) + ")";
      var x = CX + R + 20;
      dl.setAttribute("x1", x); dl.setAttribute("x2", x); dl.setAttribute("y1", GY - 2 * R); dl.setAttribute("y2", GY);
      dt.setAttribute("x1", x - 6); dt.setAttribute("x2", x + 6); dt.setAttribute("y1", GY - 2 * R); dt.setAttribute("y2", GY - 2 * R);
      db.setAttribute("x1", x - 6); db.setAttribute("x2", x + 6); db.setAttribute("y1", GY); db.setAttribute("y2", GY);
      dtx.setAttribute("x", Math.min(x + 10, 846)); dtx.setAttribute("y", GY - 2 * R - 12);
      dtx.setAttribute("text-anchor", x + 10 > 846 ? "end" : "start");
      if (x + 10 > 846) dtx.setAttribute("x", x - 8);
      dtx.textContent = "Ø " + fmt(D);
      out.innerHTML = fmt(D) + "<small>mm</small>";
      if (D <= 2200) note.innerHTML = T.note_std || "";
      else if (D <= 2500) note.innerHTML = T.note_hc || "";
      else note.innerHTML = T.note_open || "";
    }
    range.addEventListener("input", update); update();

    var dq = $("dQuote");
    if (dq) dq.addEventListener("click", function (e) {
      e.preventDefault();
      var c = document.querySelector('input[name="kablo"]:checked');
      var f = $("f-olcu"); if (f) f.value = "Ø " + fmt(+range.value) + " mm · " + (c ? c.value : "");
      pick("makara"); go("teklif");
    });
  }

  /* ---------- RFQ form ---------- */
  var form = $("rfqForm"), status = $("formStatus");
  var file = $("f-dosya"), fileName = $("fileName");
  if (file && fileName) file.addEventListener("change", function () { fileName.textContent = file.files[0] ? file.files[0].name : (T.file_hint || ""); });
  function say(msg, err) { status.hidden = false; status.textContent = msg; status.classList.toggle("err", !!err); }
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = [].filter.call(form.querySelectorAll("[required]"), function (i) { return !i.value.trim(); });
    if (missing.length) { say(T.err_required, true); missing[0].focus(); return; }
    var mail = $("f-mail");
    if (!/^\S+@\S+\.\S+$/.test(mail.value)) { say(T.err_email, true); mail.focus(); return; }
    var FORM_ENDPOINT = form.dataset.endpoint || "";
    if (!FORM_ENDPOINT) { say(T.preview, false); return; }
    var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
    fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; form.reset(); pick("makara"); say(T.sent, false); })
      .catch(function () { say(T.failed, true); })
      .finally(function () { btn.disabled = false; });
  });

  /* ---------- flowing image show (Kurumsal) ---------- */
  [].forEach.call(document.querySelectorAll("[data-show]"), function (show) {
    var items = show.querySelectorAll(".show-item"), dots = show.querySelectorAll(".show-dots button");
    var cap = show.querySelector("[data-show-cap]"), i = 0, timer = null;
    if (items.length < 2) return;
    function set(n) {
      items[i].classList.remove("is-on"); if (dots[i]) dots[i].removeAttribute("aria-current");
      i = (n + items.length) % items.length;
      items[i].classList.add("is-on"); if (dots[i]) dots[i].setAttribute("aria-current", "true");
      if (cap) cap.textContent = items[i].querySelector("img").alt;
    }
    function start() { stop(); timer = setInterval(function () { set(i + 1); }, reduce ? 9000 : 5200); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    [].forEach.call(dots, function (d, n) { d.addEventListener("click", function () { set(n); start(); }); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(show);
    } else start();
  });

  var yr = $("yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
