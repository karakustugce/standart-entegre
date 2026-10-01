#!/usr/bin/env python3
"""Standart Entegre static site builder.

Reads content/*.yml + src/templates/*.html and writes the site to _site/.
Usage:
  python3 build.py            # build to _site/
  python3 build.py --preview  # links point at index.html files (for local file viewing)
Requires: pip install jinja2 pyyaml
"""
import json, shutil, sys
from pathlib import Path
import yaml
from jinja2 import Environment, FileSystemLoader

ROOT = Path(__file__).parent
OUT = ROOT / (sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "_site")
PREVIEW = "--preview" in sys.argv

site = yaml.safe_load((ROOT / "content/site.yml").read_text(encoding="utf-8"))
if "--only" in sys.argv:
    site["languages"] = sys.argv[sys.argv.index("--only") + 1].split(",")
langs = {code: yaml.safe_load((ROOT / f"content/{code}.yml").read_text(encoding="utf-8")) for code in site["languages"]}
default = site["languages"][0]
base = site["base_url"].rstrip("/") + "/"

env = Environment(loader=FileSystemLoader(str(ROOT / "src/templates")), autoescape=True,
                  trim_blocks=True, lstrip_blocks=True)


def prefix(code):
    return "" if code == default else f"{code}/"


def page_paths(code):
    """Logical pages → path (relative to site root, ending in / or empty)."""
    L = langs[code]
    pre = prefix(code)
    paths = {("home", None): pre,
             ("products", None): f"{pre}{L['slugs']['products']}/",
             ("about", None): f"{pre}{L['slugs']['about']}/"}
    for p in site["products"]:
        paths[("product", p["key"])] = f"{pre}{L['slugs']['products']}/{L['products'][p['key']]['slug']}/"
    return paths


ALL = {code: page_paths(code) for code in site["languages"]}

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
shutil.copytree(ROOT / "assets", OUT / "assets")
(OUT / ".nojekyll").write_text("")

sitemap = []
for code in site["languages"]:
    L = langs[code]
    paths = ALL[code]
    for (kind, key), path in paths.items():
        depth = path.count("/")
        root = "../" * depth

        def link(target, root=root):
            if PREVIEW:
                return root + target + "index.html"
            return root + target if (root + target) else "./"

        products = []
        for p in site["products"]:
            products.append(dict(p, t=L["products"][p["key"]], path=paths[("product", p["key"])]))
        alternates = [dict(lang=c, label=langs[c]["label"], name=langs[c]["name"], abs=base + ALL[c][(kind, key)],
                           rel=link(ALL[c][(kind, key)])) for c in site["languages"]]

        brand = site["brand"]
        org = {"@type": "Organization", "name": brand, "url": base,
               "address": {"@type": "PostalAddress", "addressLocality": site["company"]["city"], "addressCountry": "TR"}}
        if site["company"].get("phone"):
            org["telephone"] = site["company"]["phone"]
        if site["company"].get("email"):
            org["email"] = site["company"]["email"]
        graph = [org]
        crumbs = [(L["nav"]["home"], base + paths[("home", None)])]
        prod = None
        if kind == "home":
            title, desc, og = L["meta"]["home_title"], L["meta"]["home_desc"], "assets/img/render-makara.webp"
        elif kind == "products":
            title, desc, og = L["meta"]["products_title"], L["meta"]["products_desc"], "assets/img/render-makara.webp"
            crumbs.append((L["products_page_h"], base + path))
        elif kind == "about":
            title, desc, og = L["meta"]["about_title"], L["meta"]["about_desc"], site["gallery"][0]["src"]
            crumbs.append((L["nav"]["about"], base + path))
        else:
            prod = next(p for p in products if p["key"] == key)
            t = prod["t"]
            title, desc, og = t["title"], t["desc"], prod["image"]
            crumbs += [(L["nav"]["products"], base + paths[("products", None)]), (t["name"], base + path)]
            graph.append({"@type": "Product", "name": t["name"], "description": t["desc"], "image": base + prod["image"],
                          "brand": {"@type": "Brand", "name": brand}, "manufacturer": {"@type": "Organization", "name": brand}})
            if t.get("faq"):
                graph.append({"@type": "FAQPage", "mainEntity": [
                    {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in t["faq"]]})
        if len(crumbs) > 1:
            graph.append({"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]})

        page = dict(kind=kind, key=key, title=title, desc=desc, abs=base + path, og_image=og,
                    alternates=alternates, x_default=base + ALL[default][(kind, key)],
                    jsonld=json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False).replace("</", "<\\/"))
        js = dict(L["js"], locale=L["locale"])
        tpl = {"home": "home.html", "products": "products.html", "about": "about.html", "product": "product.html"}[kind]
        html = env.get_template(tpl).render(
            S=site, L=L, page=page, root=root, link=link, products=products, prod=prod,
            home_path=paths[("home", None)], products_path=paths[("products", None)], about_path=paths[("about", None)],
            js_strings=json.dumps(js, ensure_ascii=False).replace("</", "<\\/"))
        dest = OUT / path / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        sitemap.append((base + path, [(a["lang"], a["abs"]) for a in alternates]))

xml = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for loc, alts in sitemap:
    xml.append(f"  <url><loc>{loc}</loc>")
    xml += [f'    <xhtml:link rel="alternate" hreflang="{l}" href="{u}"/>' for l, u in alts]
    xml.append("  </url>")
xml.append("</urlset>")
(OUT / "sitemap.xml").write_text("\n".join(xml), encoding="utf-8")
(OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {base}sitemap.xml\n", encoding="utf-8")
print(f"Built {len(sitemap)} pages in {len(site['languages'])} languages → {OUT}")
