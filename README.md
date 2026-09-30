# Abant Entegre — web sitesi

Ahşap palet, kablo sevk makarası ve taşıma & ihracat sandığı üreticisi Abant Entegre için statik B2B sitesi.
Tasarım & geliştirme: TCM Global.

## Yapı

```
index.html                         Ana sayfa (Hero → Ürünler → Makara → Üretim → Sektörler → Süreç → Belgeler → Teklif)
urunler/kablo-sevk-makaralari.html Ürün detay şablonu
assets/css/site.css                Tüm stiller (tokenlar dosyanın başında)
assets/js/site.js                  Menü, ürün ön seçimi, teklif formu
assets/img/                        Görseller
.github/workflows/pages.yml        main'e her push'ta GitHub Pages'e deploy
```

Build adımı yok; dosyalar olduğu gibi yayınlanır.

## Yayına alma

1. Repo → Settings → Pages → Source: **GitHub Actions**.
2. `main`'e push → site `https://<kullanici>.github.io/<repo>/` adresinde yayında.
3. Domain alındığında: kök dizine `CNAME` dosyası (tek satır, örn. `www.abantentegre.com`) + DNS'te `CNAME www → <kullanici>.github.io`.

## Teklif formu

GitHub Pages'te sunucu yok. `assets/js/site.js` içindeki `FORM_ENDPOINT` değerine Formspree / Web3Forms ya da bir n8n webhook URL'si yazılınca form çalışır. Boşken önizleme mesajı gösterir.

## Teyit bekleyen içerik

`<span class="tbd">` ile işaretli her alan Abant Entegre'den doğrulama bekliyor (kapasite, tesis alanı, sertifikalar, iletişim bilgileri). Doğrulanmamış rakam veya belge yayınlanmaz.
