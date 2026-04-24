## 開発ロードマップ

- **フェーズ1：生物データの拡充** — 遭遇率・危険度の高い生物から優先的にJSONデータを追加。[データ管理スプレッドシート](https://docs.google.com/spreadsheets/d/11n9cdOqSrykqO0FIyUA1I3S-O7i3gc20X8yUd6LYMPQ/edit?gid=554732195#gid=554732195)
- **フェーズ2：ビジュアルアセットの適用** — 権利フリー画像（iNaturalist等）の選定とJSONデータへの組み込み。[iNaturalist 茅ヶ崎周辺の観察記録](https://www.inaturalist.org/observations?place_id=6737&quality_grade=research&subview=map&verifiable=any)
- **フェーズ3：PWA化（オフライン対応）** — `manifest.json` と Service Worker の導入による、電波不要での閲覧とホーム画面への追加機能実装。

### 未対応（要確認）

- `data/bio-data.json` の `localEncounter`・`references` フィールドがモーダルで非表示（表示実装は未スコープ）

## 変更履歴

### 2026-04-24 — Web QA: セマンティクス改善・svg-icons削除（[PR #4](https://github.com/surf90/chiga-bio/pull/4)）

- `<span class="section-label">` → `<h3 class="section-label">`（見出し階層・アクセシビリティ改善）
- モーダルの category/scientificName を `<dl><dt><dd>` 構造に変更（意味的マークアップ）
- `css/style.css` のセレクター・スタイルを対応修正
- `index.html` フッター部のインライン `</div><div>` を分割（可読性改善）
- `assets/svg-icons/`（未使用SVG 17ファイル）を削除