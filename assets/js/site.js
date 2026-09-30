/* Abant Entegre — site script (no dependencies) */
(function () {
  // Form endpoint: GitHub Pages has no backend. Paste a Formspree / Web3Forms / n8n webhook URL here.
  var FORM_ENDPOINT = "";

  var map = { makara: "ug-makara", palet: "ug-palet", sandik: "ug-sandik", diger: "ug-diger" };

  // mobile nav
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "KAPAT" : "MENÜ";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.textContent = "MENÜ"; }
    });
  }

  function pick(key) {
    var id = map[key];
    var el = id && document.getElementById(id);
    if (el) el.checked = true;
  }

  // preselect product from ?urun= (product pages link here)
  try {
    var q = new URLSearchParams(location.search).get("urun");
    if (q) pick(q);
  } catch (e) {}

  // "Teklif Al" inside product cards: select product, jump to form
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-rfq]");
    var card = e.target.closest("[data-product]");
    var key = t ? t.getAttribute("data-rfq") : card ? card.getAttribute("data-product") : null;
    if (!key) return;
    var form = document.getElementById("teklif");
    if (!form) return;
    e.preventDefault();
    pick(key);
    form.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    var first = document.getElementById("f-olcu");
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450);
  });

  // RFQ form
  var formEl = document.getElementById("rfqForm");
  var status = document.getElementById("formStatus");
  function say(msg, err) { status.hidden = false; status.textContent = msg; status.classList.toggle("err", !!err); }
  if (formEl) {
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var missing = Array.prototype.filter.call(formEl.querySelectorAll("[required]"), function (i) { return !i.value.trim(); });
      if (missing.length) {
        say("Teklif hazırlayabilmemiz için ad soyad, firma, telefon ve e-posta alanlarını doldurun.", true);
        missing[0].focus();
        return;
      }
      var mail = document.getElementById("f-mail");
      if (mail && !/^\S+@\S+\.\S+$/.test(mail.value)) { say("E-posta adresini kontrol edin (örnek: ad@firma.com).", true); mail.focus(); return; }
      if (!FORM_ENDPOINT) {
        say("Önizleme: form henüz bir alıcıya bağlı değil. Yayına almadan önce teklif e-posta adresi tanımlanacak.", false);
        return;
      }
      var btn = formEl.querySelector("button[type=submit]");
      btn.disabled = true;
      fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(formEl), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          formEl.reset(); pick("makara");
          say("Talebiniz iletildi. Satış ekibimiz sizinle iletişime geçecek.", false);
        })
        .catch(function () { say("Talep gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.", true); })
        .finally(function () { btn.disabled = false; });
    });
  }

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
