## 開発ロードマップ

- **フェーズ1：生物データの拡充** ✅ 進行中 — 遭遇率・危険度の高い生物から優先的にJSONデータを追加。[データ管理スプレッドシート](https://docs.google.com/spreadsheets/d/11n9cdOqSrykqO0FIyUA1I3S-O7i3gc20X8yUd6LYMPQ/edit?gid=554732195#gid=554732195)
- **フェーズ2：ビジュアルアセットの適用** ✅ 完了 — 全110件に画像情報（url/author/license/sourceUrl）を適用済み。[iNaturalist 茅ヶ崎周辺の観察記録](https://www.inaturalist.org/observations?place_id=6737&quality_grade=research&subview=map&verifiable=any)
- **フェーズ3：PWA化（オフライン対応）** ✅ 完了 — `sw.js` と `site.webmanifest` 導入済み。Network First / Cache First 戦略実装済み。

### 未対応（要確認）

- `data/bio-data.json` の `localEncounter` フィールドがモーダルで非表示（表示実装は未スコープ）

## 変更履歴

### 2026-06-19 — フッタータブを生物分類から環境（どこで見られるか）へ変更

- フッターのタブ軸を生物分類10種 → 環境5区分（`砂浜・海岸`／`磯・岩場`／`茅ヶ崎の海`／`河口・干潟`／`町中・林`）＋「すべて」に変更。茅ヶ崎特化のバイオーム的価値を強化
- `data/bio-data.json` 全110件に `environment` フィールドを追加（既存 `encounterLocation` を集約。`encounterLocation` は残置）
- `index.html`（ナビを `data-env` 化）・`js/script.js`（`currentEnv` で `bio.environment` を絞り込み）を更新。カードの生物分類バッジは継続表示
- `css/style.css` の `.bottom-nav` を `justify-content: safe center` に変更（6タブ。広い画面は中央寄せ、狭い画面は左端からスクロール）
- コバンソウの `encounterLocation` を誤記「上空・海面」→「砂浜・海岸」に修正
- `adding-biology-data.md`・`README.md` に `environment` フィールド定義／有効値一覧を追記
- `sw.js` の `CACHE_VERSION` を `v1.3.3`→`v1.3.4` へbump（HTML/CSS/JS/JSON変更の確実な配信）

### 2026-06-19 — 分類カテゴリの生物学的再整理

- カテゴリを7区分→9区分（＋将来用「菌類」）へ再編。`ほ乳類`→`哺乳類`、`は虫類`→`爬虫類`に漢字正規化
- 旧`無脊椎動物`(33件)を分割: `昆虫・クモ`(3件)、`その他の動物`(陸生甲殻類2件)、`海の無脊椎動物`(28件)
- `data/bio-data.json`・`index.html`(ナビ)・`adding-biology-data.md`(カテゴリ仕様)を更新。`菌類`は該当データ0件のためナビ未追加

### 2026-06-18 — 全生物の画像データ整備完了

- `bio-data.json` 全110件に画像情報（url/author/license/sourceUrl）を反映
- Excelデータから51件を一括適用（2回のExcelファイルに分けて処理）
- id・name・学名の誤りを修正: `umiakaamenbo`→`umiamenbo`（ウミアカアメンボ→ウミアメンボ）、`hamahyoutangomimushi`→`hamahyoutangomimushidamashi`（学名も`Omophron aequale`→`Idisia ornata`）、`marubasharinbai`→`sharinbai`
- 残り6件（araiguma, niseakashia, hamatobimushi他）は個別に画像情報を反映し全件完了

### 2026-06-18 — モバイル品質チェック・高度品質改善

- モバイルレイアウト: `.tile-name` を2行クランプ化（長い和名の途中切れ解消）、`@media (max-width:360px)` でヘッダー横溢れ防止
- perf: `script.js` を `defer` 化、`bio-data.json`(170KB) を `<link rel="preload">` で前倒し取得、Google Fonts をJS注入で非ブロッキング化（CSP `script-src 'self'` 準拠）
- a11y: コンテンツ領域を `<div>` → `<main>` に変更しランドマーク追加、フッター文字色を `#94a3b8` → `#64748b`（WCAG AA 4.5:1達成）
- pwa: `site.webmanifest` アイコンの `purpose` を `"any maskable"` に統一、`theme_color` を HTML meta・manifest・実ヘッダーで `#0e7490` に3者統一
- seo/ogp: `og:image:type=image/webp` 追加、`twitter:title/description/image` 専用タグを明示
- sw: `CACHE_VERSION` を `v1.3.2` へbump（CSS/HTML変更の確実な配信）

### 2026-06-12 — A11y・CSP・パフォーマンス改善とコード整理（[PR #35](https://github.com/surf90/chiga-bio/pull/35)）

- a11y: モーダルの `aria-labelledby` 参照先（`modal-title-anchor`）を `<h2>` に付与、`empty-state` に `role="status"`、画像 `alt` に分類・危険情報を補完、極小フォント拡大
- セキュリティ: Content-Security-Policy メタタグ追加（`self` + Google Fonts + cdnjs + iNaturalist に限定）
- パフォーマンス: Fonts / gstatic / cdnjs への `preconnect` 追加
- UX: データ取得失敗の文言出し分け＋再読み込みボタン、画像読込失敗時のプレースホルダーフォールバック（`attachImgFallback`）
- SEO: JSON-LD（`WebSite` + `SearchAction`）追加、`sitemap.xml` lastmod 更新、lastmod 自動更新の GitHub Actions（`update-sitemap.yml`）追加
- 保守性: 危険バッジ（`DANGER_TYPES`）と市シンボルSVG（`CITY_SYMBOLS`）の重複排除、CSS ハードコード色の変数化、印刷スタイル（`@media print`）追加
- 見送り（別タスク）: PWAアイコン512px圧縮（要画像ツール）、Font Awesome サブセット化（要ビルド）、ユニットテスト導入（要テストランナー）

### 2026-04-30 — PWA対応・UI/UX改善・アイコン統一

- PWA対応 Service Worker 導入（オフライン・キャッシュ戦略）（[PR #20](https://github.com/surf90/chiga-bio/pull/20)）
- READMEのディレクトリ構成・技術要件をPWA実装済みの状態に更新（[PR #21](https://github.com/surf90/chiga-bio/pull/21)）
- タップ領域拡大・スクロールリセット・画像最適化・ダークモード対応（[PR #19](https://github.com/surf90/chiga-bio/pull/19)）
- 絵文字をFontAwesomeアイコンに統一・市のシンボルをタイルにも表示（[PR #18](https://github.com/surf90/chiga-bio/pull/18)）
- グリッドをメディアクエリでレスポンシブ化（スマホ2列固定・600px以上で可変）（[PR #17](https://github.com/surf90/chiga-bio/pull/17)）
- iOSセーフエリア対応・スクロール修正・検索デバウンス・Preconnect追加（[PR #16](https://github.com/surf90/chiga-bio/pull/16)）
- スマートフォン向けUI/UX改善（ズーム解除・グリッド安定化・スケルトンリッチ化・アクセシビリティ向上）（[PR #15](https://github.com/surf90/chiga-bio/pull/15)）

### 2026-04-27 — 市のシンボル生物追加

- ニセアカシアを市の木として先頭固定・SVGアイコンとラベルを追加（[PR #14](https://github.com/surf90/chiga-bio/pull/14)）
- シジュウカラ・ツツジのSVGアイコン横に市の鳥・市の花ラベルを追加（[PR #13](https://github.com/surf90/chiga-bio/pull/13)）

### 2026-04-24 — Web QA: セマンティクス改善・svg-icons削除・references表示追加

- `references` フィールドをモーダルに折り畳み表示として追加（[PR #11](https://github.com/surf90/chiga-bio/pull/11)）
- スクロール時にヘッダーをコンパクト化して表示領域を拡大（[PR #12](https://github.com/surf90/chiga-bio/pull/12)）
- faviconを最適化し不要なPNGサイズ変種を削除（[PR #10](https://github.com/surf90/chiga-bio/pull/10)）

### 2026-04-24 — Web QA: セマンティクス改善・svg-icons削除（[PR #4](https://github.com/surf90/chiga-bio/pull/4)）

- `<span class="section-label">` → `<h3 class="section-label">`（見出し階層・アクセシビリティ改善）
- モーダルの category/scientificName を `<dl><dt><dd>` 構造に変更（意味的マークアップ）
- `css/style.css` のセレクター・スタイルを対応修正
- `index.html` フッター部のインライン `</div><div>` を分割（可読性改善）
- `assets/svg-icons/`（未使用SVG 17ファイル）を削除