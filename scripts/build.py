"""ちがビオ SSG ビルドスクリプト。

`data/bio-data.json`（唯一の真実）を入力に、SEO 用の静的成果物を `dist/` へ生成する。

生成物:
    - dist/ ... 配信用の静的ファイル一式（既存ファイルのコピー）
    - dist/list.json ... 一覧・検索用の軽量データ
    - dist/species/{id}.json ... 各種の全項目（詳細描画用）
    - dist/species/{id}/index.html ... 種ごとの固有メタ付き静的 HTML
    - dist/sitemap.xml ... 全個別ページURLを含むサイトマップ

実行: python scripts/build.py
"""

from __future__ import annotations

import html
import json
import re
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path

# 配信定数（本番は GitHub Pages のサブパス配信）
ORIGIN = "https://surf90.github.io"
BASE = "/chiga-bio"
SITE_NAME = "ちがビオ"
FALLBACK_OGP = f"{ORIGIN}{BASE}/ogp.webp"

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "bio-data.json"
TEMPLATE_FILE = ROOT / "index.html"
DIST = ROOT / "dist"

# dist へそのままコピーする配信ファイル（存在するもののみ）
COPY_FILES = [
    "index.html",
    "sw.js",
    "site.webmanifest",
    "robots.txt",
    "favicon.ico",
    "favicon.svg",
    "apple-touch-icon.png",
    "web-app-manifest-192x192.png",
    "web-app-manifest-512x512.png",
    "ogp.webp",
    "googled180bd734463e748.html",
]
COPY_DIRS = ["css", "js"]

# list.json に残す検索・一覧描画用フィールド（詳細項目は含めない）
LIST_FIELDS = [
    "id", "name", "category", "scientificName", "environment",
    "encounterSeason", "rarity", "isDanger", "dangerType", "features",
]


def jst_today() -> str:
    """当日（JST）の YYYY-MM-DD 文字列を返す。"""
    return datetime.now(timezone(timedelta(hours=9))).strftime("%Y-%m-%d")


def thumb_url(image: dict | None) -> str:
    """画像情報からサムネイル用URLを返す。

    iNaturalist の `.../medium.jpg` 形式なら `square` 変種へ寄せる。
    該当しなければ元URL、画像が無ければ空文字。
    """
    if not image or not image.get("url"):
        return ""
    url = image["url"]
    m = re.match(r"^(.*/)(square|small|medium|large)(\.(?:jpe?g|png|webp))$", url, re.I)
    return f"{m.group(1)}square{m.group(3)}" if m else url


def make_description(bio: dict) -> str:
    """種の meta description を生成する（原文転載を避け要約整形、最大約120字）。"""
    name = bio.get("name", "")
    sci = bio.get("scientificName", "")
    local = re.sub(r"\s+", "", bio.get("localEncounter", ""))
    head = f"{name}（{sci}）。" if sci else f"{name}。"
    budget = 118 - len(head)
    if budget > 0 and local:
        snippet = local[:budget]
        # 句点が末尾に来るよう、最後の句点以降の中途半端な文を落とす
        if "。" in snippet and len(local) > budget:
            snippet = snippet[: snippet.rfind("。") + 1]
        head += snippet
    return head


def species_jsonld(bio: dict, page_url: str, desc: str) -> str:
    """種ページ用 JSON-LD（WebSite + BreadcrumbList + 種を表す Thing）を返す。"""
    image = bio.get("image") or {}
    graph = [
        {
            "@type": "WebSite",
            "name": SITE_NAME,
            "url": f"{ORIGIN}{BASE}/",
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": SITE_NAME,
                 "item": f"{ORIGIN}{BASE}/"},
                {"@type": "ListItem", "position": 2, "name": bio.get("name", ""),
                 "item": page_url},
            ],
        },
        {
            "@type": "Thing",
            "name": bio.get("name", ""),
            "alternateName": bio.get("scientificName", ""),
            "description": desc,
            "url": page_url,
            **({"image": image["url"]} if image.get("url") else {}),
        },
    ]
    payload = {"@context": "https://schema.org", "@graph": graph}
    return json.dumps(payload, ensure_ascii=False, indent=2)


def itemlist_jsonld(species: list[dict]) -> str:
    """トップページ用 ItemList JSON-LD を返す。"""
    elements = [
        {"@type": "ListItem", "position": i + 1, "name": bio.get("name", ""),
         "url": f"{ORIGIN}{BASE}/species/{bio['id']}/"}
        for i, bio in enumerate(species)
    ]
    payload = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": f"{SITE_NAME}の生き物一覧",
        "numberOfItems": len(species),
        "itemListElement": elements,
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


def build_species_html(template: str, bio: dict) -> str:
    """テンプレート（index.html）の `<head>` を種固有メタへ差し替えた HTML を返す。

    アセットの相対パスは種ページ階層（species/{id}/）に合わせ `../../` を前置する。
    """
    bid = bio["id"]
    name = bio.get("name", "")
    category = bio.get("category", "")
    page_url = f"{ORIGIN}{BASE}/species/{bid}/"
    title = f"{name}（{category}）| {SITE_NAME}"
    desc = make_description(bio)
    og_image = (bio.get("image") or {}).get("url") or FALLBACK_OGP

    e = html.escape
    out = template

    # アセット相対パスを種ページ階層へ補正（../../）
    out = out.replace('href="css/', 'href="../../css/')
    out = out.replace('src="js/script.js"', 'src="../../js/script.js"')
    out = out.replace('href="favicon.ico"', 'href="../../favicon.ico"')
    out = out.replace('href="favicon.svg"', 'href="../../favicon.svg"')
    out = out.replace('href="apple-touch-icon.png"', 'href="../../apple-touch-icon.png"')
    out = out.replace('href="site.webmanifest"', 'href="../../site.webmanifest"')
    # データプリロードは list.json（種ページでも一覧描画の土台が要る）
    out = re.sub(
        r'<link rel="preload" href="data/bio-data\.json"[^>]*>',
        '<link rel="preload" href="../../list.json" as="fetch" type="application/json" crossorigin>',
        out,
    )

    # 固有メタへ差し替え
    out = out.replace(
        '<title>ちがビオ | 茅ヶ崎の生き物情報</title>',
        f'<title>{e(title)}</title>',
    )
    out = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" content="{e(desc)}">',
        out, count=1,
    )
    out = out.replace(
        '<meta property="og:url" content="https://surf90.github.io/chiga-bio/">',
        f'<meta property="og:url" content="{e(page_url)}">',
    )
    out = out.replace(
        '<meta property="og:type" content="website">',
        '<meta property="og:type" content="article">',
    )
    out = out.replace(
        '<meta property="og:title" content="ちがビオ | 茅ヶ崎の生き物情報">',
        f'<meta property="og:title" content="{e(title)}">',
    )
    out = out.replace(
        '<meta property="og:description" content="魚も鳥も哺乳類も植物も　茅ヶ崎の生き物まとめ">',
        f'<meta property="og:description" content="{e(desc)}">',
    )
    out = out.replace(
        '<meta property="og:image" content="https://surf90.github.io/chiga-bio/ogp.webp">',
        f'<meta property="og:image" content="{e(og_image)}">',
    )
    # 実画像は 1200x630/webp とは限らないため、寸法・型の固定メタを除去
    out = re.sub(r'\s*<meta property="og:image:width"[^>]*>', '', out)
    out = re.sub(r'\s*<meta property="og:image:height"[^>]*>', '', out)
    out = re.sub(r'\s*<meta property="og:image:type"[^>]*>', '', out)
    out = out.replace(
        '<meta property="og:image:alt" content="ちがビオ - 茅ヶ崎の生き物情報">',
        f'<meta property="og:image:alt" content="{e(name)}（{e(category)}）">',
    )
    out = out.replace(
        '<meta name="twitter:title" content="ちがビオ | 茅ヶ崎の生き物情報">',
        f'<meta name="twitter:title" content="{e(title)}">',
    )
    out = out.replace(
        '<meta name="twitter:description" content="魚も鳥も哺乳類も植物も　茅ヶ崎の生き物まとめ">',
        f'<meta name="twitter:description" content="{e(desc)}">',
    )
    out = out.replace(
        '<meta name="twitter:image" content="https://surf90.github.io/chiga-bio/ogp.webp">',
        f'<meta name="twitter:image" content="{e(og_image)}">',
    )
    out = out.replace(
        '<link rel="canonical" href="https://surf90.github.io/chiga-bio/">',
        f'<link rel="canonical" href="{e(page_url)}">',
    )
    # WebSite の JSON-LD ブロックを種用 @graph へ置換
    out = re.sub(
        r'<script type="application/ld\+json">.*?</script>',
        '<script type="application/ld+json">\n'
        + species_jsonld(bio, page_url, desc) + '\n    </script>',
        out, count=1, flags=re.S,
    )
    return out


def build_home_html(template: str, species: list[dict]) -> str:
    """トップページ HTML を生成する（list.json プリロード化 + ItemList 追加）。"""
    out = template.replace(
        '<link rel="preload" href="data/bio-data.json" as="fetch" type="application/json" crossorigin>',
        '<link rel="preload" href="list.json" as="fetch" type="application/json" crossorigin>',
    )
    # 既存 WebSite JSON-LD の直後に ItemList を追加
    item_block = (
        '<script type="application/ld+json">\n'
        + itemlist_jsonld(species) + '\n    </script>'
    )
    out = re.sub(
        r'(<script type="application/ld\+json">.*?</script>)',
        r'\1\n    ' + item_block.replace('\\', '\\\\'),
        out, count=1, flags=re.S,
    )
    return out


def copy_static() -> None:
    """配信用の静的ファイルを dist へコピーする。"""
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    for name in COPY_FILES:
        src = ROOT / name
        if src.exists():
            shutil.copy2(src, DIST / name)
    for d in COPY_DIRS:
        src = ROOT / d
        if src.exists():
            shutil.copytree(src, DIST / d)


def main() -> None:
    """ビルド本体。"""
    species = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    template = TEMPLATE_FILE.read_text(encoding="utf-8")

    # id 一意性チェック
    ids = [b["id"] for b in species]
    dup = {x for x in ids if ids.count(x) > 1}
    if dup:
        raise SystemExit(f"重複 id を検出: {sorted(dup)}")

    copy_static()

    # list.json（軽量データ）
    light = []
    for bio in species:
        item = {k: bio.get(k) for k in LIST_FIELDS if bio.get(k) is not None}
        item["thumb"] = thumb_url(bio.get("image"))
        light.append(item)
    (DIST / "list.json").write_text(
        json.dumps(light, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    # species/{id}.json と species/{id}/index.html
    sp_dir = DIST / "species"
    sp_dir.mkdir(exist_ok=True)
    for bio in species:
        bid = bio["id"]
        (sp_dir / f"{bid}.json").write_text(
            json.dumps(bio, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        page_dir = sp_dir / bid
        page_dir.mkdir(exist_ok=True)
        (page_dir / "index.html").write_text(
            build_species_html(template, bio), encoding="utf-8",
        )

    # トップページ（list.json プリロード + ItemList）
    (DIST / "index.html").write_text(
        build_home_html(template, species), encoding="utf-8",
    )

    # sitemap.xml
    today = jst_today()
    urls = [(f"{ORIGIN}{BASE}/", "1.0", "weekly")]
    urls += [(f"{ORIGIN}{BASE}/species/{b['id']}/", "0.7", "monthly") for b in species]
    body = "\n".join(
        f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{today}</lastmod>\n"
        f"    <changefreq>{cf}</changefreq>\n    <priority>{pr}</priority>\n  </url>"
        for loc, pr, cf in urls
    )
    (DIST / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n</urlset>\n",
        encoding="utf-8",
    )

    print(f"ビルド完了: {len(species)}種 / dist={DIST}")


if __name__ == "__main__":
    main()
