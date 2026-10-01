# Standart Entegre · web sitesi

Kablo sevk makarası, karton makara, ahşap palet, ihracat sandığı ve mermer kasası üreticisi Standart Entegre için 5 dilli statik B2B site (TR, EN, FR, AR, ES).
Tasarım ve geliştirme: TCM Global.

## Metinleri nereden düzenlerim?

Kod bilmeden, GitHub üzerinden dosyayı açıp kalem simgesiyle düzenleyebilirsiniz. `main`'e kaydettiğiniz her değişiklik 1–2 dakika içinde yayına girer.

| Ne değişecek | Dosya |
|---|---|
| Türkçe metinler | `content/tr.yml` |
| İngilizce / Fransızca / Arapça / İspanyolca | `content/en.yml`, `fr.yml`, `ar.yml`, `es.yml` |
| Şirket bilgileri (kuruluş yılı, m², kapasite, telefon, e-posta, adres, sertifikalar) | `content/site.yml` → `company` |
| Kurumsal bölümündeki akan görseller | `content/site.yml` → `gallery` |
| Makara ölçü aralığı (550–3200 mm) | `content/site.yml` → `reel_min_mm`, `reel_max_mm` |
| Teklif formunun gideceği adres | `content/site.yml` → `form_endpoint` |
| Domain | `content/site.yml` → `base_url` |

`company` altındaki bir alan boşsa sitede görünmez. Doldurduğunuz anda Kurumsal sayfasında belirir.

### Kurumsal görsellerini gerçek fotoğraflarla değiştirmek

1. Fotoğrafları `assets/img/kurumsal/` klasörüne yükleyin (önerilen 1800 × 1200 px, JPG).
2. `content/site.yml` → `gallery` listesinde `src` satırlarını yeni dosya adlarıyla değiştirin.
3. Açıklamaları her dil dosyasındaki `gallery:` bölümünden güncelleyin; temsili görsel notunu kaldırmak için `gallery_note: ""` yazın.

### Yeni dil eklemek

`content/en.yml` dosyasını kopyalayıp (örn. `de.yml`) çevirin, `content/site.yml` → `languages` listesine `de` ekleyin.

## Yapı

```
content/            Metinler (dil başına bir dosya) ve site ayarları
src/templates/      Sayfa şablonları (Jinja2)
assets/css, js      Stil, 3D makara (three.js), ölçü aracı, form
assets/img          Ürün render'ları, Kurumsal görselleri
build.py            content + şablon → _site/ (40 sayfa, sitemap.xml, robots.txt)
docs/               Referans analizi
.github/workflows   main'e her push'ta build + GitHub Pages yayını
```

## Bilgisayarda önizleme

```bash
pip install jinja2 pyyaml
python3 build.py
cd _site && python3 -m http.server 8000   # http://localhost:8000
```

## SEO

- Her sayfada dil başına `hreflang`, `canonical`, Open Graph ve JSON-LD (Organization, Product, BreadcrumbList, FAQPage).
- `sitemap.xml` ve `robots.txt` otomatik üretilir. Domain alınınca `base_url`'i değiştirip Google Search Console'a sitemap'i ekleyin.
- Hedef kelimeler: Kablo Sevk Makaraları, Ahşap Makara, Ağaç Makara, Standart Makara, Karton Makaralar, Mermer Kasası. Ayrıntı: `docs/referans-analizi.md`.

## Domain bağlama

1. `content/site.yml` → `base_url` değerini yeni adresle değiştirin (örn. `https://www.standartentegre.com/`).
2. Repo → Settings → Pages → Custom domain alanına adresi yazın.
3. DNS'te `CNAME www → karakustugce.github.io` kaydını açın.
