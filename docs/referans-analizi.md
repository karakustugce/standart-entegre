# Referans analizi: kategori, ürün sayfası ve SEO yapısı

Tarih: Ekim 2026 · Hazırlayan: TCM Global

## Ne gördük

| Site | Güçlü yanı | Sitemize aldığımız |
|---|---|---|
| **Sanmak Makara** | Makarayı kablo tipine göre alt kategorilere ayırıyor (enerji, telekom, fiber, iletken halat, kontrplak/MDF). Her alt kategoride çap aralığı tekrar yazılıyor. Hakkımızda; kuruluş + tesis alanı (m²) + yıllık kapasite (m³ kereste, adet makara) + çalışan + ISPM-15'i tek sayfada anlatıyor. Sertifikalar ayrı blok. TR / EN / AR dil seçeneği. | Kablo tipine göre alt bölümler ve her birinde **55 cm – 3,20 m** ölçü bilgisi. Kurumsal sayfasında hikâye + tesis + kapasite + belgeler kurgusu. Arapça dahil çok dilli yapı. |
| **Yeşilyayla Kereste** | Üretimi 4 numaralı aşamada anlatıyor (hammadde → işleme → kurutma → sevkiyat). Kurumsal menüsü alt başlıklara ayrılmış (Hakkımızda, Vizyon & Misyon, Belgeler, Katalog). | Kurumsal sayfasında 5 aşamalı üretim akışı. Belgeler bölümü, belge eklendikçe görünür. |
| **İsmet Acun** | Teknik kapasiteyi rakamla gösteriyor, "Nasıl Başardık?" zaman çizelgesi, **Karton Makara** ayrı ürün. | Kapasite rakamları için alan (veri gelince görünür). Karton makaralar ayrı ürün sayfası. |
| **Çarkıt Makara** | Sade menü (Anasayfa, Hakkımızda, Ürünlerimiz, İletişim). Detaylı kategori yok. | Menü sadeliği. |
| **Abant Entegre (mevcut)** | Ürün omurgası: palet, kablo sevk makarası, taşıma sandığı. | Ürün ailesi omurgası. |

İsmet Acun ve Abant Entegre siteleri otomatik okumaya kapalı; arama sonuçları ve brief üzerinden değerlendirildi.

## Kurduğumuz yapı

```
Ana sayfa
├── Ürünler (kategori sayfası)
│   ├── Makaralar
│   │   ├── Ahşap Kablo Makaraları   → kablo sevk makarası, ahşap makara, ağaç makara, standart makara
│   │   │     (enerji · telekomünikasyon · fiber optik · çelik halat · standart ve özel ölçü)
│   │   └── Karton Makaralar          → karton makara
│   └── Ahşap Ambalaj
│       ├── Ahşap Paletler
│       ├── Taşıma ve İhracat Sandıkları
│       └── Mermer Kasası             → mermer kasası, mermer sandığı
├── Kurumsal (hikâye · tesis · kapasite · üretim süreci · belgeler)
└── Teklif Al
```

## SEO kurgusu

- Her ürün tek bir ana anahtar kelimeyi hedefler; başlık (title), H1, meta açıklama ve URL aynı kelimeyi taşır.
- Hedef kelimeler: **Kablo Sevk Makaraları, Ahşap Makara, Ağaç Makara, Standart Makara, Karton Makaralar, Mermer Kasası.** Metin içinde doğal geçer, liste halinde doldurulmaz.
- Ölçü bilgisi (55 cm – 3,20 m) makara sayfalarında başlık altında, teknik tabloda ve alt kategorilerde tekrar edilir.
- Beş dil: TR (kök), EN, FR, AR (sağdan sola), ES. Her sayfada `hreflang` bağlantıları, dil başına `sitemap.xml` kaydı.
- Yapısal veri (JSON-LD): Organization, BreadcrumbList, Product.
- Temiz URL: `/urunler/ahsap-kablo-makaralari/`, `/en/products/wooden-cable-reels/` vb.

## Firmadan beklenen bilgiler

Bunlar gelmeden sitede gösterilmez (alan boşsa bölüm gizlenir):
kuruluş yılı · tesis alanı (m²) · yıllık kereste ve makara kapasitesi · çalışan sayısı · sertifikalar (ISPM-15, ISO…) · adres, telefon, e-posta · fabrika ve ürün fotoğrafları.

Kaynaklar: sanmakmakara.com, yesilyaylakereste.com.tr, carkitmakara.com, ismetacun.com (arama sonuçları), globalpiyasa.com (İsmet Acun karton makara ilanı).
