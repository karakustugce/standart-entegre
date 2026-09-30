/* Abant Entegre — site script (no dependencies) */
(function () {
  // GitHub Pages has no backend: paste a Formspree / Web3Forms / n8n webhook URL here.
  var FORM_ENDPOINT = "";

  var ids = { makara: "ug-makara", palet: "ug-palet", sandik: "ug-sandik", diger: "ug-diger" };
  function pick(key) { var el = document.getElementById(ids[key]); if (el) el.checked = true; }

  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.textContent = open ? "Kapat" : "Menü";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.textContent = "Menü"; }
    });
  }

  try { var q = new URLSearchParams(location.search).get("urun"); if (q) pick(q); } catch (e) {}

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-rfq]");
    var target = document.getElementById("teklif");
    if (!t || !target) return;
    e.preventDefault();
    pick(t.getAttribute("data-rfq"));
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  var form = document.getElementById("rfqForm");
  var status = document.getElementById("formStatus");
  function say(msg, err) { status.hidden = false; status.textContent = msg; status.classList.toggle("err", !!err); }
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = [].filter.call(form.querySelectorAll("[required]"), function (i) { return !i.value.trim(); });
    if (missing.length) { say("Ad soyad, firma, telefon ve e-posta alanlarını doldurun.", true); missing[0].focus(); return; }
    var mail = document.getElementById("f-mail");
    if (!/^\S+@\S+\.\S+$/.test(mail.value)) { say("E-posta adresini kontrol edin.", true); mail.focus(); return; }
    if (!FORM_ENDPOINT) { say("Önizleme: form henüz bir alıcıya bağlı değil.", false); return; }
    var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
    fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; form.reset(); pick("makara"); say("Talebiniz iletildi. Size kısa sürede dönüş yapacağız.", false); })
      .catch(function () { say("Talep gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.", true); })
      .finally(function () { btn.disabled = false; });
  });

  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
