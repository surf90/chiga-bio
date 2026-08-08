## 開発ロードマップ

- **フェーズ1：生物データの拡充** ✅ 進行中 — 遭遇率・危険度の高い生物から優先的にJSONデータを追加。[データ管理スプレッドシート](https://docs.google.com/spreadsheets/d/11n9cdOqSrykqO0FIyUA1I3S-O7i3gc20X8yUd6LYMPQ/edit?gid=554732195#gid=554732195)
- **フェーズ2：ビジュアルアセットの適用** ✅ 進行中 — 全164件中163件に画像情報（url/author/license/sourceUrl）を適用済み。[iNaturalist 茅ヶ崎周辺の観察記録](https://www.inaturalist.org/observations?place_id=6737&quality_grade=research&subview=map&verifiable=any)
- **フェーズ3：PWA化（オフライン対応）** ✅ 完了 — `sw.js` と `site.webmanifest` 導入済み。Network First / Cache First 戦略実装済み。

### 未対応（要確認）

- **要手動**: ハイブリッドSEO（PR #46）マージ後、GitHub Pages の Source を「Deploy from a branch」→「GitHub Actions」へ切替（切替まで `pages.yml` のデプロイは反映されない）
- 1件が画像未登録（プレースホルダー）。iNaturalistで人力選定後、同手順で反映予定
  - 画像選定TODO（id）: ginanago

## 変更履歴

### 2026-08-08 — モーダル操作とPWAテーマ色の不具合修正

- 詳細モーダルのスワイプ座標を操作開始時に初期化し、過去の座標が残って次のタップで意図せず閉じる不具合を修正
- PWAマニフェストのテーマ色をHTML・実際のブランド色と統一
- `sw.js` のキャッシュバージョンを `v1.5.6` へ更新

### 2026-07-16 — 参考文献リンク・参照先の適合性を再検証

- `data/bio-data.json` の参考文献246件を対象に、重複を除くURLの到達性と参照内容を再検証
- 404・DNSエラーだった旧URLを、茅ヶ崎市・神奈川県・環境省・海上保安庁・国立科学博物館・国立環境研究所などの現行ページへ差し替え
- アオミノウミウシ・アメフラシ・アカウミガメ・カマイルカで、リンク先が別記事または記載タイトルと一致していなかった参照を適切な資料へ差し替え
- WoRMS／MolluscaBaseは受容名の種別レコード、GBIFはSpecies APIで学名照合した永続的な種IDページへ更新。国立科学博物館・日本鳥学会・日本魚類学会などのトップページ参照も、現行データベース・目録・資料ページへ具体化
- 更新後の全163ユニークURLを再確認し、404およびDNSエラーがないことを確認（403はGBIF等の自動アクセス制限であり、ブラウザ向けURLは種IDページとして有効）
- `sw.js` の `CACHE_VERSION` を `v1.5.4`→`v1.5.5` へbump

### 2026-07-16 — スプレッドシートの画像候補をJSONへ反映

- 画像管理スプレッドシート `Reference` シートの候補情報から、画像未登録33件のうち候補がある32件について `url`・`author`・`license`・`sourceUrl` を `data/bio-data.json` へ反映
- ギンアナゴ（`ginanago`）はスプレッドシートに画像候補がないため、プレースホルダーのまま継続
- `sw.js` の `CACHE_VERSION` を `v1.5.3`→`v1.5.4` へbump

### 2026-07-14 — bio-data.json 校正 第3ラウンド（標準和名・分類体系・難読語）

- **標準和名・表示階級を整理**: `トンビ（トビ）`→`トビ`、`カタクチイワシ（シラス）`→`カタクチイワシ`、`シュモクザメ（アカシュモクザメなど）`→`アカシュモクザメ`、`ウミネコ（カモメ類）`→`ウミネコ`、`スズキ（シーバス）`→`スズキ`、科レベルの `Belonidae` を示す `ダツ`→`ダツ類`。俗称・総称は検索できるよう `features` に残した
- **iNaturalist・WoRMS再照合**: ゴンズイを `Plotosus japonicus`、ミズクラゲを `Aurelia coerulea`、ウツボを `Gymnothorax kidako`、マダコを `Octopus sinensis`、ヘビギンポを `Enneapterygius etheostoma` へ更新し、WoRMSの受容名ページを出典に追加
- **誤画像をプレースホルダーへリセット**: カツオノエボシ（画像側 `Physalia utriculus`）、ギンアナゴ（画像側 `Gnathophis longicauda`）、オウギガニ（画像側 `Leptodius affinis`）。いずれもWoRMSでJSON側と画像側が別の受容種であることを確認し、人力再選定待ちとした
- **難読語にルビ付与**: 腎臓形、采配、社叢林、亀甲状、砂礫底、馬蹄形網、扁平、小鱗片、口吻、鋸歯、馬尾毛状、饅頭型
- 茅ヶ崎ローカル記述は、えぼし岩・柳島海岸・小出川等を含む項目を機械検査の誤検出と確認。地域記録の裏付けがない項目へ地名を推測追加する変更は見送った
- `sw.js` の `CACHE_VERSION` を `v1.5.2`→`v1.5.3` へbump

### 2026-07-14 — bio-data.json 校正 第2ラウンド（表記統一・ルビ・iNat学名照合）

- **表記統一**: 嘴→くちばし（和語ひらがな、他鳥カードと統一）＝ハシブトガラス・カルガモ・カワラヒワ・ムクドリ。応急処置の温度「40度以上」→「40℃以上」＝カツオノエボシ・アンドンクラゲ
- **表外漢字にルビ付与**: 橙色（だいだいいろ）＝ナミアゲハ・クマゼミ、橙黄色（とうこうしょく）＝モクセイ・ムクドリ、藍色（あいいろ）＝カツオノエボシ・ヨシキリザメ、藍黒色（あいこくしょく）＝ツバメ、濾過（ろか）＝ダンベイキサゴ、麻痺（まひ）＝ジョロウグモ・ツルニチニチソウ。擬態はハオコゼのみルビ付きだったため他カードに合わせルビ削除
- **iNaturalist 参照先との学名照合**（API で画像あり134件を全件照合）:
  - **誤り修正**: アゴハゼの `scientificName`「Chasmichthys gulosus」（ドロメの学名）→「Chaenogobius annularis」（iNat写真＝アゴハゼと一致）
  - **現行学名へ更新（シノニム）**: アカエイ→Hemitrygon akajei、シロチドリ→Anarhynchus alexandrinus、ハオコゼ→Paracentropogon rubripinnis、トビウオ→Cheilopogon agoo、ヤブガラシ→Causonis japonica、スナビキソウ→Tournefortia sibirica
  - **画像情報をプレースホルダーへリセット**（iNat写真が別属同定で別種の可能性。ユーザーが再登録予定）: バケヌメリ・リュウキュウヨロイアジ・カマイルカ
  - 上位分類での記載（フジツボ類 Balanomorpha・ダツ Belonidae・ハマトビムシ類 Talitridae）は仕様上許容のため現状維持
- `name`（表示名）は全件が正しい和名で iNat写真とも一致（不整合なし）
- `sw.js` の `CACHE_VERSION` を `v1.5.1`→`v1.5.2` へbump

### 2026-07-14 — bio-data.json 校正（adding-biology-data.md 適合）

- **明確な誤り修正**: ミユビシギの `features`「スズキほどの大きさ」（魚と誤比較）→「スズメよりやや大きい」。イチモンジセセリ・カワラヒワの `environment`「河口・干潟」→「町中・林」（陸生種で `encounterLocation` と不整合だった）
- **dangerType ENUM 是正**: シュモクザメ・ヨシキリザメ `contact`→`eat`（サメ類は捕食咬傷）。ウツボ・ザトウクジラ・トンビ `contact`→`protect`（刺胞・毒棘ではなく防御咬傷／引っかき／大型動物への接近注意）
- **アライグマ `contact`→`""`**: 刺胞・毒棘ではないため `contact` は不適。ただし規制対象の外来種のため 2026-06-22 の方針に従い `protect` は付けず、アカミミガメ・クリハラリスと同じ `isDanger:true × dangerType:""` に統一。**アカミミガメ・クリハラリスは変更せず（過去の意図的決定を維持）**
- **民間出典の差し替え**: トンビの唯一の出典が民間サイト（EPARKくらしのレスキュー）で医療記述の根拠として不適 → 環境省（鳥獣保護管理法）＋海上保安庁ウォーターセーフティガイドへ差し替え
- **表記揺れ統一**: カツオノエボシ「浮袋」→「浮き袋」（カード内統一）。クロダイ・メイタガレイ「棘（とげ）」→「トゲ」
- **地名の記載順**: 本ツールはヘッドランドビーチのライフセーバー開発のため、サザンビーチ先行だった `localEncounter` をヘッドランドビーチ先行へ並べ替え（カツオノエボシ・アンドンクラゲ・トンビ・ミユビシギ・ウミネコ・ダンベイキサゴ・ハクセキレイ・ハマトビムシ類）
- 残課題（要確認）: ダツの `dangerType`（毒棘でも捕食でもない物理刺傷で ENUM に一致値なし。`contact` 維持）
- `sw.js` の `CACHE_VERSION` を `v1.5.0`→`v1.5.1` へbump

### 2026-07-10 — デザインのモダン化とメインカラー刷新

- メインカラーを従来のティール `#0e7490` 単色から、茅ヶ崎の「海→里」を象徴する青緑〜緑のグラデ基調へ刷新（`--brand: #0d9488` 海の青緑 → `--brand-strong: #16a34a` 里の緑）。新ブランド変数（`--brand`／`--brand-strong`／`--brand-mid`／`--brand-soft`／`--hairline`）を `:root` に新設し、`--primary-deep` は後方互換で `var(--brand)` を参照
- 姉妹サイト「ちがログ」の同日デザイン改修を参考に以下を移植・適用：背景の多層グラデ（`body::before` の固定光演出）、ヘッダーの海→里グラデ、`.container` 上端の3色アクセントバー、`.bio-card` の多層シャドウ＋hover浮遊（`@media (hover:hover)`）＋ヘアライン枠＋質感グラデ
- ボトムナビ active／トースト／セクションラベル／カテゴリタグ等をブランドグラデ・ソフトカラーへ統一。影トークン（`--shadow-card`／`--shadow-card-hover`）を変数化
- ダークモードはブランドを明るめ（`#2dd4bf`／`#4ade80`）に再定義。`prefers-reduced-motion` でモーション無効化を追加
- 危険度・希少度・外来種の情報色は維持。ロゴ文字グラデと `theme-color` を新カラーへ更新
- `sw.js` の `CACHE_VERSION` を `v1.4.2`→`v1.5.0` へbump

### 2026-06-22 — 外来種の「守るため注意」バッジを除去

- アカミミガメ・クリハラリスの `dangerType` を `protect`→`""` に変更。`protect`（ハート「守るため注意」）は希少種等の保護喚起を示すため、規制対象の外来種に付くと矛盾。外来種は `invasive` ボックスで規制を明示しているため除去
- `isDanger: true` は維持（両種とも咬む危険があり `firstAid` を持つため）
- 他の外来種（ミドリイガイ・アライグマ・ニセアカシア等）は元から `protect` 不使用で問題なし
- `sw.js` の `CACHE_VERSION` を `v1.4.1`→`v1.4.2` へbump

### 2026-06-19 — リンク下線の除去（タイル／撮影者名）

- 一覧タイルの生物名・分類名の下線を除去（`.bio-card` が `<a>` 化された際の既定下線。`text-decoration: none;` を追加）
- 詳細カードの撮影者名（`.image-credit a`）の下線を除去
- `sw.js` の `CACHE_VERSION` を `v1.4.0`→`v1.4.1` へbump

### 2026-06-19 — ハイブリッドSEO（SSG + SPA）改修

- **SSGビルド新設** `scripts/build.py`: `data/bio-data.json`（唯一の真実）から `dist/` へ静的生成。出力は (1) `list.json`（一覧・検索用の軽量データ＋`thumb`）、(2) `species/{id}.json`（全項目・詳細描画用）、(3) `species/{id}/index.html`（種ごとの固有 title/description/OGP/JSON-LD〈WebSite+BreadcrumbList+Thing〉）、(4) `sitemap.xml`（ルート＋全164種URL）。トップ `index.html` は `list.json` プリロード化＋ItemList 付与
- **フロント（`js/script.js`）ルーティング拡張**: サイトルートを動的算出（`SITE_BASE`、ローカル/サブパス両対応）。一覧データ取得を `bio-data.json`→`list.json` に変更。カードを `<a href="…/species/{id}/">` 化しクリックを捕捉→`pushState`→`species/{id}.json` を fetch→既存モーダルで描画（UX不変）。初期URL（`/species/{id}/` 優先、旧 `?id=` 後方互換）解決・`popstate` 同期・`shareBio`/`closeModal` のURLを個別ページ形式へ更新。SW登録を `SITE_BASE` 基準に修正
- **Service Worker（`sw.js`）**: `CACHE_VERSION` を `v1.3.9`→`v1.4.0` へbump。プリキャッシュを `data/bio-data.json`→`list.json` へ。`navigate` リクエストを Network First 化し、オフライン直アクセス時は該当ページ→App Shell（`index.html`）へフォールバック。`species/{id}.json` は既存の same-origin 戦略でランタイムキャッシュ
- **デプロイ**: `.github/workflows/pages.yml` を新設（Python ビルド→`actions/upload-pages-artifact`(dist)→`actions/deploy-pages`）。生成物は非コミット（`.gitignore` に `dist/`）。sitemap をビルド生成へ移管したため `update-sitemap.yml` を廃止。**要手動**: Pages の Source を「GitHub Actions」へ切替

### 2026-06-19 — 外来種（invasive）区分の表示を追加

- 詳細モーダルに外来種の法的区分セクションを追加。`bio.invasive`（`level`／`origin`／`warning`）を持つ種で、区分（`specified`=特定外来生物／`conditional`=条件付特定外来生物／`general`=外来種）に応じた色・アイコン・ラベルの注意喚起ボックスを表示（`js/script.js` の `INVASIVE_LEVELS`／`getInvasiveInfo`／`openModal`）
- `css/style.css` に `.invasive-box` ほか区分別配色（ライト／ダーク両対応）を追加
- `data/bio-data.json` の該当種（ミドリイガイ・コバンソウ・アライグマ・ムラサキイガイ・ニセアカシア・オカダンゴムシ・キマダラカメムシ ほか）に `invasive` を付与

### 2026-06-19 — 環境分類の追加是正（河口・干潟→町中・林）

- 川・池・公園寄りの4件を「河口・干潟」→「町中・林」へ移動（河口・干潟 16→12件／町中・林 60→64件）。対象: アカミミガメ・シオカラトンボ・アキアカネ・カルガモ
- `sw.js` の `CACHE_VERSION` を `v1.3.8`→`v1.3.9` へbump（JSON変更の確実な配信）

### 2026-06-19 — 検索対象の拡張・分類タグのタップ検索・環境分類の是正

- 検索対象フィールドを拡張: 従来の `name`／`scientificName`／`features` に加え、`category`（鳥類・哺乳類など）・危険ラベル（守るため注意 等／`DANGER_TYPES` の表示名）・`environment`（砂浜・海岸など）・`encounterSeason`（夏・通年など）でもヒットするよう `js/script.js` の `filterData()` を更新。検索プレースホルダーを「名前・分類・場所・特徴で検索...」へ変更
- 詳細モーダルの分類タグをタップ可能化: `category-tag` をボタン化し、タップで検索ボックスに分類名を入れて一覧を絞り込む `searchByCategory()` を追加（環境フィルタは「すべて」へリセット・先頭へスクロール）。`css/style.css` に `.category-tag-btn` のホバー・フォーカス様式を追加
- 環境分類の再検証: フッタータブ「砂浜・海岸」に混在していた海中生物17件を「茅ヶ崎の海」へ移動（茅ヶ崎の海 13→30件／砂浜・海岸 43→26件）。クラゲ・浮遊性（カツオノエボシ・アンドンクラゲ・カブトクラゲ・ギンカクラゲ・カツオノカンムリ・アカクラゲ・ミズクラゲ・アオミノウミウシ）、遊泳魚（アカエイ・カタクチイワシ・ダツ・シロギス・ヒラメ・スズキ）、海生哺乳類・爬虫類（スナメリ・アカウミガメ・セグロウミヘビ）が対象。砂に潜る貝・浜のカニなど底生種は砂浜・海岸のまま据え置き
- `sw.js` の `CACHE_VERSION` を `v1.3.7`→`v1.3.8` へbump（JS/CSS/JSON変更の確実な配信）

### 2026-06-19 — データ検証・表記揺れ統一・ふりがな整備

- `data/bio-data.json` 全164件を機械検証（構文・必須17フィールド・enum・id/name/学名の重複・references URL形式）。重大な不整合なしを確認
- 仕様書の実態反映: `adding-biology-data.md` を更新し、非危険生物（`isDanger:false`）でも `firstAid`／`dontDo`／`dangerType:"protect"` を保護・採取マナー・ストランディング対応として記述可と明文化（アプリ実装に追従。データ62件は変更せず）
- 常用外字の修正: `拟態`（中国簡体字）→ `擬態`
- 表記揺れ統一: きわめて→極めて、子供→子ども、付ける→つける、「を持つ」（形質）→「をもつ」、`等`→`など`、`とげ`→`トゲ`、`ただちに`→`直ちに`、`すみやか`→`速やか`、`1年`→`一年`、`ヒレ`→`ひれ`
- ふりがな整備（原則: 訓読み和語＝ひらがな化／専門名詞＝漢字＋ふりがな）:
  - ひらがな化（既存ふりがなも解除）: つかむ・はがす・まれに・とがる・はう・もろい・かゆい・すむ・しびれ、および動詞「かむ／かまれる」（`咬傷`・`麻痺` は維持）
  - ふりがな付与（各カード初出）: `翅（はね）`/`前翅長（ぜんしちょう）`/`後翅（こうし）`/`鞘翅（しょうし）`・`顎（あご）`/`大顎（おおあご）`・`磯（いそ）`・`石鹸（せっけん）`・`嘔吐（おうと）`・`痙攣（けいれん）`
  - `稜鱗（ぜんご）` の注記対象・語順を統一
- 軽微修正: `niseakashia` の `features` を4→3項目に集約（規約の2〜3項目へ）
- 再検証: 熟語の誤置換（`高等植物`/`海棲哺乳類` の巻き込み）を検出し復旧、熟語途中の不自然なふりがな（`前翅（ぜんし）長`）を `前翅長（ぜんしちょう）` へ修正。括弧の開閉数一致・JSON妥当を確認
- `sw.js` の `CACHE_VERSION` を `v1.3.6`→`v1.3.7` へbump（JSON変更の確実な配信）

### 2026-06-19 — 生物データ54件追加（110→164件）と画像27件反映

- `data/bio-data.json` に54件を追加し、全164件に拡充。2つの下書きソース（Gemini=信頼度中／ChatGPT=信頼度低）を `adding-biology-data.md` の規則で精査・統合（Geminiを主データ、ChatGPTをクロスチェックに使用）
- 追加分の内訳: 鳥類11・昆虫・クモ22・植物9・菌類5・その他の動物4・海の無脊椎動物1・爬虫類1・哺乳類1。`菌類`カテゴリに初のデータが入り、町中・林など陸域の身近な生物まで収録範囲を拡張
- スキーマ整合: 旧分類→新10分類へ是正、`environment`（5区分）を付与、`firstAid` の末尾句点を除去、フィールド順を既存に統一
- Web検証: 全件の学名と危険種の毒性を照合。ツルニチニチソウ（Vinca major）は有毒（ビンカアルカロイド）を確認し `isDanger:true/ingestion` を採用、マルカメムシ `Megacopta punctatissima`・ミンミンゼミ `Hyalessa maculaticollis`・タマキクラゲ `Exidia uvapassa` 等を確認。記述の誤り（アカミミガメ「斑門」→「斑紋」、タマキクラゲ「木材腐朽菌」→「腐生菌」）を修正
- `references` を各件2件以上へ補完（専門出典＋GBIF種別出典）
- 画像: Excel（ちがビオ 画像）から54件中27件に画像情報（url/author/license/sourceUrl）を反映。残り27件は画像未登録のためプレースホルダー据え置き
- ライセンス表記を既存慣例へ正規化（`CC-BY-NC`→`CC BY-NC` 等）、`namitentou` の欠落していた著作者を観察ページから補完（`zukka`）
- `sw.js` の `CACHE_VERSION` を `v1.3.5`→`v1.3.6` へbump（JSON変更の確実な配信）

### 2026-06-19 — カード文末の句点ルール統一

- 表記ルールを統一: **箇条書き項目**（`features`・`firstAid`）は末尾句点「。」なし、**箇条書きでない項目**（`localEncounter`・`dontDo`）は末尾句点「。」あり
- `data/bio-data.json` 全110件を正規化（主に `firstAid` 各要素の末尾「。」を除去、`localEncounter`・`dontDo` の未付与分に「。」を付与）
- 立方クラゲ1件の全項目に混入していた引用残骸 `[cite: 1]` を併せて除去
- `adding-biology-data.md` のフィールド定義（`firstAid`/`dontDo`/`localEncounter`）と注意事項に句点ルールを明文化
- `sw.js` の `CACHE_VERSION` を `v1.3.4`→`v1.3.5` へbump（JSON変更の確実な配信）

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
