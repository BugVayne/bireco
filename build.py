# -*- coding: utf-8 -*-
"""
Генератор статических страниц для SEO.

Использует существующие index.html и news.html как шаблоны (ничего не нужно
дублировать), берёт переводы из js/i18n.js, сервисы из js/services-data.js
и новости из Google Apps Script (или демо-данные, если бэкенд не настроен),
и собирает в папку dist/ готовый сайт:

  dist/index.html         главная (EN)
  dist/ru/index.html      главная (RU)
  dist/news.html          все новости (EN)
  dist/ru/news.html       все новости (RU)
  dist/news/<id>.html     отдельная страница новости (EN)
  dist/ru/news/<id>.html  отдельная страница новости (RU)
  dist/sitemap.xml        карта сайта с hreflang
  + копии css/, js/, favicon.svg, og-image.png, robots.txt, admin.html

Запуск:  pip install -r requirements.txt && python build.py
Деплой запускает его автоматически (.github/workflows/deploy.yml).
"""

import html
import json
import re
import shutil
import sys
from pathlib import Path

import json5
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).parent
DIST = ROOT / "dist"

# Базовый URL сайта. При переезде на свой домен поменяйте здесь.
SITE = "https://bugvayne.github.io/bireco/"

LANGS = ("en", "ru")

MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July",
             "August", "September", "October", "November", "December"]
MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля",
             "августа", "сентября", "октября", "ноября", "декабря"]

esc = lambda s: html.escape(str(s), quote=True)


# ---------- Извлечение данных из существующих JS-файлов ----------

def extract_js_value(path, varname):
    """Достаёт литерал `window.<varname> = {...};` или `[...]` из JS-файла."""
    text = (ROOT / path).read_text(encoding="utf-8")
    m = re.search(r"window\.%s\s*=\s*" % re.escape(varname), text)
    if not m:
        raise SystemExit(f"build.py: не нашёл window.{varname} в {path}")
    i = m.end()
    while text[i] not in "{[":
        i += 1
    open_ch, close_ch = text[i], "}" if text[i] == "{" else "]"
    depth, j, in_str, str_ch = 0, i, False, ""
    while j < len(text):
        ch = text[j]
        if in_str:
            if ch == "\\":
                j += 2
                continue
            if ch == str_ch:
                in_str = False
        else:
            if ch in "'\"":
                in_str, str_ch = True, ch
            elif ch == open_ch:
                depth += 1
            elif ch == close_ch:
                depth -= 1
                if depth == 0:
                    return json5.loads(text[i : j + 1])
        j += 1
    raise SystemExit(f"build.py: не смог разобрать window.{varname} в {path}")


I18N = extract_js_value("js/i18n.js", "I18N")
SERVICES = extract_js_value("js/services-data.js", "SERVICES")
SAMPLE_NEWS = extract_js_value("js/services-data.js", "SAMPLE_NEWS")


def t(key, lang):
    return I18N.get(lang, {}).get(key) or I18N["en"].get(key) or key


# ---------- Новости ----------

def fetch_news():
    cfg = (ROOT / "js" / "config.js").read_text(encoding="utf-8")
    m = re.search(r'APPS_SCRIPT_URL:\s*"([^"]*)"', cfg)
    url = m.group(1).strip() if m else ""
    items = None
    if url:
        try:
            r = requests.get(url + "?action=news", timeout=45)
            r.raise_for_status()
            items = r.json().get("items", [])
            print(f"build.py: загружено {len(items)} новостей из Apps Script")
        except Exception as e:
            print(f"build.py: не удалось получить новости ({e}), берём демо-данные")
    if items is None:
        items = SAMPLE_NEWS
        print(f"build.py: использую {len(items)} демо-новостей")
    norm = []
    for it in items:
        item = {k: str(it.get(k, "") or "") for k in
                ("id", "date", "title_en", "title_ru", "summary_en",
                 "summary_ru", "body_en", "body_ru", "image")}
        if item["id"]:
            norm.append(item)
    norm.sort(key=lambda x: x["date"], reverse=True)
    return norm


def loc(item, field, lang):
    other = "ru" if lang == "en" else "en"
    return item.get(f"{field}_{lang}") or item.get(f"{field}_{other}") or ""


def fmt_date(iso, lang):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", iso or "")
    if not m:
        return iso or ""
    y, mo, d = int(m[1]), int(m[2]), int(m[3])
    if lang == "ru":
        return f"{d} {MONTHS_RU[mo - 1]} {y} г."
    return f"{MONTHS_EN[mo - 1]} {d}, {y}"


def safe_id(news_id):
    return re.sub(r"[^A-Za-z0-9_-]", "-", news_id)


# ---------- Готовые куски разметки (зеркалят js/main.js) ----------

def render_full(blocks):
    """Доп. описание (read more): массив блоков {h}/{p} -> заголовки и абзацы.
    Поддерживает и обычную строку (один абзац)."""
    if isinstance(blocks, str):
        return f"<p>{esc(blocks)}</p>"
    out = []
    for b in blocks or []:
        if b.get("h") is not None:
            out.append(f'<h4>{esc(b["h"])}</h4>')
        elif b.get("list"):
            items = "".join(f"<li>{esc(x)}</li>" for x in b["list"])
            out.append(f"<ul>{items}</ul>")
        else:
            out.append(f'<p>{esc(b.get("p", ""))}</p>')
    return "".join(out)


def service_row_html(s, i, lang):
    num = f"{i + 1:02d}"
    flip = " flip" if i % 2 else ""
    return (
        f'<article class="service-row{flip}" data-id="{esc(s["id"])}" '
        f'style="--tint:{s["tint"]};--tint-dark:{s["tint"]}d9">'
        f'<div class="service-banner">'
        f'<span class="service-num" aria-hidden="true">{num}</span>'
        f'<span class="service-icon">{s["icon"]}</span>'
        f'<h3>{esc(s["title"][lang])}</h3>'
        f'<span class="pulse-bars" aria-hidden="true"><span></span><span></span><span></span><span></span></span>'
        f"</div>"
        f'<div class="service-info">'
        f'<p class="service-short">{esc(s["short"][lang])}</p>'
        f'<div class="service-full-wrap"><div><div class="service-full">{render_full(s["full"][lang])}</div></div></div>'
        f'<div class="service-actions">'
        f'<button class="btn btn-primary" data-open-form data-service="{esc(s["title"]["en"])}">{esc(t("services.interested", lang))}</button>'
        f'<button class="btn-link read-more-btn" data-action="toggle" aria-expanded="false">'
        f'<span class="rm-label">{esc(t("services.readMore", lang))}</span> <span class="arr">›</span></button>'
        f"</div></div></article>"
    )


def news_card_html(n, lang):
    img = f'<img class="news-img" src="{esc(n["image"])}" alt="" loading="lazy">' if n["image"] else ""
    return (
        f'<article class="news-card">{img}'
        f'<span class="news-date">{esc(fmt_date(n["date"], lang))}</span>'
        f"<h3>{esc(loc(n, 'title', lang))}</h3>"
        f"<p>{esc(loc(n, 'summary', lang))}</p>"
        f'<a class="arrow-link" href="news.html#{esc(n["id"])}">{esc(t("insights.readMore", lang))} <span class="arr">›</span></a>'
        f"</article>"
    )


def news_article_html(n, lang):
    img = f'<img class="news-img" src="{esc(n["image"])}" alt="" loading="lazy">' if n["image"] else ""
    return (
        f'<article class="news-article" id="{esc(n["id"])}">'
        f'<span class="news-date">{esc(fmt_date(n["date"], lang))}</span>'
        f"<h2>{esc(loc(n, 'title', lang))}</h2>{img}"
        f'<div class="news-body">{esc(loc(n, "body", lang))}</div>'
        f"</article>"
    )


# ---------- Работа с soup ----------

def set_inner(el, html_str):
    el.clear()
    frag = BeautifulSoup(html_str, "html5lib")
    for child in list(frag.body.children):
        el.append(child.extract())


def translate(soup, lang):
    for el in soup.select("[data-i18n]"):
        el.string = t(el["data-i18n"], lang)
    for el in soup.select("[data-i18n-placeholder]"):
        el["placeholder"] = t(el["data-i18n-placeholder"], lang)


def ensure_meta(soup, attr, key, content):
    el = soup.find("meta", attrs={attr: key})
    if not el:
        el = soup.new_tag("meta")
        el[attr] = key
        soup.head.append(el)
    el["content"] = content


def set_head(soup, lang, title, description, url_en, url_ru, og_type="website"):
    url_self = url_en if lang == "en" else url_ru
    soup.html["lang"] = lang
    soup.html["data-prerender-lang"] = lang
    soup.title.string = title
    ensure_meta(soup, "name", "description", description)
    ensure_meta(soup, "property", "og:type", og_type)
    ensure_meta(soup, "property", "og:title", title)
    ensure_meta(soup, "property", "og:description", description)
    ensure_meta(soup, "property", "og:url", url_self)
    ensure_meta(soup, "property", "og:locale", "ru_RU" if lang == "ru" else "en_US")
    ensure_meta(soup, "property", "og:locale:alternate", "en_US" if lang == "ru" else "ru_RU")
    ensure_meta(soup, "name", "twitter:title", title)
    ensure_meta(soup, "name", "twitter:description", description)

    canonical = soup.find("link", rel="canonical")
    if not canonical:
        canonical = soup.new_tag("link", rel="canonical")
        soup.head.append(canonical)
    canonical["href"] = url_self

    for alt in soup.find_all("link", rel="alternate"):
        alt.decompose()
    for hreflang, href in (("en", url_en), ("ru", url_ru), ("x-default", url_en)):
        link = soup.new_tag("link", rel="alternate", href=href)
        link["hreflang"] = hreflang
        soup.head.append(link)


ASSET_PREFIXES = ("css/", "js/", "favicon.svg", "og-image.png")
PAGE_PREFIXES = ("index.html", "news.html")


def rewrite_paths(soup, asset_depth, page_depth):
    ap, pp = "../" * asset_depth, "../" * page_depth
    for attr in ("href", "src"):
        for el in soup.find_all(attrs={attr: True}):
            v = el[attr]
            if v.startswith(ASSET_PREFIXES):
                el[attr] = ap + v
            elif v.startswith(PAGE_PREFIXES):
                el[attr] = pp + v


def write(path, soup):
    out = DIST / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(str(soup), encoding="utf-8")
    print(f"build.py: + {path}")


# ---------- Сборка страниц ----------

def build_home(src, news, lang):
    soup = BeautifulSoup(src, "html5lib")
    translate(soup, lang)
    set_head(soup, lang, t("meta.title", lang), t("meta.description", lang),
             SITE, SITE + "ru/")
    set_inner(soup.find(id="servicesGrid"),
              "".join(service_row_html(s, i, lang) for i, s in enumerate(SERVICES)))
    set_inner(soup.find(id="newsTrack"),
              "".join(news_card_html(n, lang) for n in news[:10]))
    depth = 0 if lang == "en" else 1
    rewrite_paths(soup, asset_depth=depth, page_depth=0)
    write(("" if lang == "en" else "ru/") + "index.html", soup)


def build_news_list(src, news, lang):
    soup = BeautifulSoup(src, "html5lib")
    translate(soup, lang)
    set_head(soup, lang, t("meta.newsTitle", lang), t("meta.newsDescription", lang),
             SITE + "news.html", SITE + "ru/news.html")
    set_inner(soup.find(id="newsList"),
              "".join(news_article_html(n, lang) for n in news))
    depth = 0 if lang == "en" else 1
    rewrite_paths(soup, asset_depth=depth, page_depth=0)
    write(("" if lang == "en" else "ru/") + "news.html", soup)


def build_article(src, n, lang):
    sid = safe_id(n["id"])
    soup = BeautifulSoup(src, "html5lib")
    translate(soup, lang)
    title = f"{loc(n, 'title', lang)} — Bireco"
    desc = (loc(n, "summary", lang) or loc(n, "body", lang))[:160]
    set_head(soup, lang, title, desc,
             SITE + f"news/{sid}.html", SITE + f"ru/news/{sid}.html",
             og_type="article")

    # Шапка страницы: вместо "Insights & News" — заголовок и дата новости.
    # Атрибуты data-i18n убираем, чтобы клиентский JS не перезаписал текст.
    h1 = soup.select_one(".page-hero h1")
    h1.string = loc(n, "title", lang)
    del h1["data-i18n"]
    sub = soup.select_one(".page-hero p")
    sub.string = fmt_date(n["date"], lang)
    del sub["data-i18n"]

    # Флаг для news-page.js: не перерисовывать список поверх статьи
    soup.body["data-static-article"] = n["id"]
    set_inner(soup.find(id="newsList"), news_article_html(n, lang))

    asset_depth = 1 if lang == "en" else 2
    rewrite_paths(soup, asset_depth=asset_depth, page_depth=1)
    write(("" if lang == "en" else "ru/") + f"news/{sid}.html", soup)


def build_sitemap(news):
    entries = [
        (SITE, SITE + "ru/", None),
        (SITE + "news.html", SITE + "ru/news.html", None),
    ]
    for n in news:
        sid = safe_id(n["id"])
        lastmod = n["date"] if re.match(r"\d{4}-\d{2}-\d{2}", n["date"]) else None
        entries.append((SITE + f"news/{sid}.html", SITE + f"ru/news/{sid}.html", lastmod))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
             'xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for url_en, url_ru, lastmod in entries:
        for url in (url_en, url_ru):
            lines.append("  <url>")
            lines.append(f"    <loc>{esc(url)}</loc>")
            if lastmod:
                lines.append(f"    <lastmod>{lastmod}</lastmod>")
            lines.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{esc(url_en)}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="ru" href="{esc(url_ru)}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{esc(url_en)}"/>')
            lines.append("  </url>")
    lines.append("</urlset>")
    (DIST / "sitemap.xml").write_text("\n".join(lines), encoding="utf-8")
    print("build.py: + sitemap.xml")


def copy_static():
    for d in ("css", "js"):
        shutil.copytree(ROOT / d, DIST / d)
    for f in ("favicon.svg", "og-image.png", "robots.txt", "admin.html"):
        shutil.copy2(ROOT / f, DIST / f)


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    news = fetch_news()
    index_src = (ROOT / "index.html").read_text(encoding="utf-8")
    news_src = (ROOT / "news.html").read_text(encoding="utf-8")

    copy_static()
    for lang in LANGS:
        build_home(index_src, news, lang)
        build_news_list(news_src, news, lang)
        for n in news:
            build_article(news_src, n, lang)
    build_sitemap(news)
    print(f"build.py: готово, {sum(1 for _ in DIST.rglob('*.html'))} html-страниц в dist/")


if __name__ == "__main__":
    sys.exit(main())
