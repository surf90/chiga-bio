## 開発ロードマップ

- **フェーズ1：生物データの拡充** ✅ 進行中 — 遭遇率・危険度の高い生物から優先的にJSONデータを追加。[データ管理スプレッドシート](https://docs.google.com/spreadsheets/d/11n9cdOqSrykqO0FIyUA1I3S-O7i3gc20X8yUd6LYMPQ/edit?gid=554732195#gid=554732195)
- **フェーズ2：ビジュアルアセットの適用** — 権利フリー画像（iNaturalist等）の選定とJSONデータへの組み込み。[iNaturalist 茅ヶ崎周辺の観察記録](https://www.inaturalist.org/observations?place_id=6737&quality_grade=research&subview=map&verifiable=any)
- **フェーズ3：PWA化（オフライン対応）** ✅ 完了 — `sw.js` と `site.webmanifest` 導入済み。Network First / Cache First 戦略実装済み。

### 未対応（要確認）

- `data/bio-data.json` の `localEncounter` フィールドがモーダルで非表示（表示実装は未スコープ）

## 変更履歴

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