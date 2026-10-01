# Standart Entegre — web sitesi

Ahşap palet, kablo sevk makarası ve taşıma & ihracat sandığı üreticisi Standart Entegre için statik B2B sitesi.
Tasarım & geliştirme: TCM Global.

## Yapı

```
index.html                           Ana sayfa: 3D hero → ürünler → makara ölçü aracı → kurumsal → teklif
urunler/*.html                       Ürün sayfaları (makara, palet, sandık)
assets/css/site.css                  Tüm stiller; renk ve yazı tokenları dosyanın başında
assets/js/models.js                  Makara, palet ve sandığın prosedürel 3D modelleri (three.js)
assets/js/hero.js                    Scroll ile parçalarına ayrılan makara (hero)
assets/js/main.js                    Menü, ölçü aracı, teklif formu
assets/img/render-*.webp             models.js ile üretilmiş stüdyo render'ları
.github/workflows/pages.yml          main'e her push'ta GitHub Pages'e deploy
```

Build adımı yok. three.js jsDelivr'dan importmap ile yüklenir; WebGL yoksa hero statik render'a düşer.

## Yayına alma

1. Repo → Settings → Pages → Source: **GitHub Actions**.
2. `main`'e push → site `https://<kullanici>.github.io/<repo>/` adresinde yayında.
3. Domain alındığında: kök dizine `CNAME` dosyası (tek satır, örn. `www.standartentegre.com`) + DNS'te `CNAME www → <kullanici>.github.io`.

## Teklif formu

GitHub Pages'te sunucu yok. `assets/js/site.js` içindeki `FORM_ENDPOINT` değerine Formspree / Web3Forms ya da bir n8n webhook URL'si yazılınca form çalışır. Boşken önizleme mesajı gösterir.

## İçerik kuralı

Sitede yalnızca doğrulanmış bilgi var: Ø 500–3200 mm makara aralığı, kullanım alanları, Gebze tesisi, hammadde tedariki.
Kapasite, tesis alanı, sertifikalar (ISPM-15, ISO) ve iletişim bilgileri Standart Entegre'den teyit gelince eklenecek.
