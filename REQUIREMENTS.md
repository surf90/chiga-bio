\### ステップ1：要件定義と情報設計



\#### 1. ユーザー体験（UX）の定義

\* \*\*視認性（屋外での利用）：\*\* 強い直射日光下でも読みやすいよう、コントラスト比を最大化（白背景に濃いチャコールグレーや黒の太字）。危険度を示す色は、色覚多様性にも配慮し、赤だけでなく「アイコン＋文字」で表現します。

\* \*\*操作性（片手・濡れた手）：\*\* 画面下部に主要なナビゲーションを配置し、親指の可動範囲で完結させます。タップ領域（ボタンなど）は最低でも48px以上確保し、誤タップを防ぎます。

\* \*\*即時性：\*\* 読み込み速度を最優先し、Vanilla JSとCSSのみの軽量構成で構築。緊急時に「刺されたらどうするか」がファーストビューですぐに分かるようにします。



\#### 2. 掲載すべき項目の整理

生物データは以下のJSONスキーマのような構造で管理します。

\* \*\*基本情報:\*\* 和名、学名、分類、危険度レベル（0〜3など）

\* \*\*ビジュアル:\*\* 権利フリー画像（またはCSS描画/アイコン）

\* \*\*特徴・見分け方:\*\* 簡潔な箇条書き（例：青く透明な浮き袋、青い触手）

\* \*\*遭遇時の対策・応急処置:\*\* 科学的根拠に基づく具体的な手順（※絶対にやってはいけないことも強調）

\* \*\*出典（エビデンス）:\*\* 論文名、著者、発行年、DOIまたはURL（アコーディオン等で隠し、必要な人のみ見られるようにしてUIをスッキリさせる）



\#### 3. 著作権トラブルを避けるための運用スキーム

\* \*\*テキスト:\*\* 論文や公的機関（海上保安庁、日本救急医学会など）の情報をベースに、完全に自分の言葉でリライトして掲載します。「事実・データ」自体に著作権はありませんが、表現には著作権が発生するためです。

\* \*\*画像:\*\* Wikimedia Commonsなどの「パブリックドメイン（CC0）」または「CC BY（要クレジット表記）」の画像を厳選して使用します。写真が手に入らない場合は、CSSによる抽象的な図形表現や、SVGアイコン（例：クラゲのシルエット）で代替します。

\* \*\*出典表記:\*\* 引用元や参考にした論文のDOIは、該当生物のカードの最下部に明確にリンク付きで記載し、科学的誠実さを担保します。



\---



\### ステップ2：最小のファイル構成案



GitHub Pagesでの運用と、GitHub Actionsによる将来的な自動化を想定したディレクトリ構造です。構成を極力シンプルに保ちます。



```text

chiga-bio/

├── .github/

│   └── workflows/

│       └── pages.yml      # GitHub Pages自動デプロイ用（必要に応じて）

├── index.html             # メインとなるHTML

├── css/

│   └── style.css          # モバイルファーストなスタイル定義

├── js/

│   └── script.js          # 生物データの描画と検索・UI制御

└── assets/

&#x20;   └── icons/             # 権利フリーのSVGアイコン等

```



\---



\### ステップ3：プロトタイプコードの記述



茅ヶ崎で特に注意が必要な「カツオノエボシ」をサンプルデータとした、単一ファイルでも動く（今回は分かりやすくHTML内にCSSとJSを記述した）プロトタイプです。ファイルを分割してローカルで確認することも可能です。



\*\*`index.html` (CSSとJSを含む統合版)\*\*



```html

<!DOCTYPE html>

<html lang="ja">

<head>

&#x20;   <meta charset="UTF-8">

&#x20;   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

&#x20;   <title>ちがビオ | 茅ヶ崎 海の生き物ガイド</title>

&#x20;   <style>

&#x20;       /\* CSS: モバイルファースト \& 屋外での視認性重視 \*/

&#x20;       :root {

&#x20;           --bg-color: #ffffff;

&#x20;           --text-main: #111111;

&#x20;           --danger-color: #d32f2f;

&#x20;           --safe-color: #1976d2;

&#x20;           --card-bg: #f5f5f5;

&#x20;           --border-radius: 12px;

&#x20;       }



&#x20;       \* { box-sizing: border-box; margin: 0; padding: 0; }



&#x20;       body {

&#x20;           font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", "Hiragino Kaku Gothic ProN", sans-serif;

&#x20;           background-color: var(--bg-color);

&#x20;           color: var(--text-main);

&#x20;           line-height: 1.6;

&#x20;           padding-bottom: 80px; /\* 下部ナビゲーションの余白 \*/

&#x20;       }



&#x20;       header {

&#x20;           background-color: var(--safe-color);

&#x20;           color: white;

&#x20;           padding: 16px;

&#x20;           text-align: center;

&#x20;           position: sticky;

&#x20;           top: 0;

&#x20;           z-index: 100;

&#x20;           box-shadow: 0 2px 4px rgba(0,0,0,0.1);

&#x20;       }



&#x20;       h1 { font-size: 1.5rem; letter-spacing: 1px; }



&#x20;       .container {

&#x20;           padding: 16px;

&#x20;           max-width: 600px;

&#x20;           margin: 0 auto;

&#x20;       }



&#x20;       /\* 検索バー \*/

&#x20;       .search-bar {

&#x20;           width: 100%;

&#x20;           padding: 12px 16px;

&#x20;           font-size: 1rem;

&#x20;           border: 2px solid #ccc;

&#x20;           border-radius: var(--border-radius);

&#x20;           margin-bottom: 20px;

&#x20;           -webkit-appearance: none;

&#x20;       }



&#x20;       /\* 生物カード \*/

&#x20;       .bio-card {

&#x20;           background-color: var(--card-bg);

&#x20;           border-radius: var(--border-radius);

&#x20;           padding: 20px;

&#x20;           margin-bottom: 20px;

&#x20;           border-left: 8px solid var(--safe-color);

&#x20;           box-shadow: 0 4px 6px rgba(0,0,0,0.05);

&#x20;       }



&#x20;       .bio-card.danger {

&#x20;           border-left-color: var(--danger-color);

&#x20;       }



&#x20;       .bio-header {

&#x20;           display: flex;

&#x20;           justify-content: space-between;

&#x20;           align-items: baseline;

&#x20;           margin-bottom: 12px;

&#x20;           border-bottom: 2px solid #ddd;

&#x20;           padding-bottom: 8px;

&#x20;       }



&#x20;       .bio-name { font-size: 1.4rem; font-weight: bold; }

&#x20;       .bio-sci-name { font-size: 0.85rem; font-style: italic; color: #555; }

&#x20;       

&#x20;       .danger-badge {

&#x20;           background-color: var(--danger-color);

&#x20;           color: white;

&#x20;           padding: 4px 8px;

&#x20;           border-radius: 4px;

&#x20;           font-size: 0.8rem;

&#x20;           font-weight: bold;

&#x20;       }



&#x20;       .section-title {

&#x20;           font-size: 1.1rem;

&#x20;           font-weight: bold;

&#x20;           margin: 16px 0 8px;

&#x20;           display: flex;

&#x20;           align-items: center;

&#x20;       }

&#x20;       .section-title::before {

&#x20;           content: '■';

&#x20;           color: var(--safe-color);

&#x20;           margin-right: 6px;

&#x20;           font-size: 0.9rem;

&#x20;       }

&#x20;       .bio-card.danger .section-title::before { color: var(--danger-color); }



&#x20;       ul { padding-left: 20px; }

&#x20;       li { margin-bottom: 6px; }



&#x20;       /\* 注意書きハイライト \*/

&#x20;       .alert-box {

&#x20;           background-color: #ffebee;

&#x20;           border: 1px solid #ffcdd2;

&#x20;           padding: 12px;

&#x20;           border-radius: 8px;

&#x20;           margin-top: 12px;

&#x20;       }

&#x20;       .alert-box strong { color: var(--danger-color); }



&#x20;       /\* 出典アコーディオン \*/

&#x20;       details {

&#x20;           margin-top: 20px;

&#x20;           font-size: 0.85rem;

&#x20;           color: #666;

&#x20;           background: #fff;

&#x20;           padding: 8px;

&#x20;           border-radius: 8px;

&#x20;           border: 1px solid #ddd;

&#x20;       }

&#x20;       summary { font-weight: bold; cursor: pointer; padding: 4px; }

&#x20;       details p { margin-top: 8px; word-break: break-all; }

&#x20;       a { color: var(--safe-color); }



&#x20;       /\* ボトムナビゲーション (片手操作用) \*/

&#x20;       .bottom-nav {

&#x20;           position: fixed;

&#x20;           bottom: 0;

&#x20;           left: 0;

&#x20;           width: 100%;

&#x20;           background: white;

&#x20;           display: flex;

&#x20;           justify-content: space-around;

&#x20;           padding: 12px 0;

&#x20;           box-shadow: 0 -2px 10px rgba(0,0,0,0.1);

&#x20;           border-top: 1px solid #eee;

&#x20;       }

&#x20;       .nav-item {

&#x20;           font-size: 0.9rem;

&#x20;           font-weight: bold;

&#x20;           color: var(--text-main);

&#x20;           text-decoration: none;

&#x20;           padding: 8px 16px;

&#x20;       }

&#x20;   </style>

</head>

<body>



<header>

&#x20;   <h1>ちがビオ 🌊</h1>

</header>



<div class="container">

&#x20;   <input type="text" id="searchInput" class="search-bar" placeholder="生き物の名前や特徴で検索...">

&#x20;   

&#x20;   <div id="bio-list">

&#x20;       </div>

</div>



<nav class="bottom-nav">

&#x20;   <a href="#" class="nav-item" onclick="filterData('all')">すべて</a>

&#x20;   <a href="#" class="nav-item" style="color: var(--danger-color);" onclick="filterData('danger')">⚠️ 危険生物</a>

</nav>



<script>

&#x20;   // JS: データ管理とDOMレンダリング

&#x20;   const bioData = \[

&#x20;       {

&#x20;           id: "katsuonoeboshi",

&#x20;           name: "カツオノエボシ",

&#x20;           scientificName: "Physalia physalis",

&#x20;           isDanger: true,

&#x20;           features: \[

&#x20;               "青く透明な餃子のような形の浮き袋（約10cm）",

&#x20;               "長い触手（青色）を持つ",

&#x20;               "砂浜に打ち上げられていることが多い（死んでいても刺胞は発射される）"

&#x20;           ],

&#x20;           firstAid: \[

&#x20;               "絶対に素手で触らない。",

&#x20;               "刺されたら、こすらずに海水で優しく洗い流す（真水はNG）。",

&#x20;               "触手が残っている場合は、ピンセットやプラスチックカード等で剥がす。",

&#x20;               "氷や冷水で冷やし、速やかに医療機関を受診する。"

&#x20;           ],

&#x20;           dontDo: "お酢（ビネガー）をかけるのはNG（ハブクラゲとは異なり、刺胞の発射を促進する恐れがある）。真水で洗うのも浸透圧の変化で毒が注入されるため厳禁。",

&#x20;           references: \[

&#x20;               {

&#x20;                   title: "Jellyfish stings and their management: A review",

&#x20;                   author: "Montgomery, L., et al.",

&#x20;                   year: "2016",

&#x20;                   doi: "https://doi.org/10.3390/md14020027" // ※架空または代表的な例としての記載です

&#x20;               }

&#x20;           ]

&#x20;       }

&#x20;       // 今後ここにアカエイなどを追加していきます

&#x20;   ];



&#x20;   function renderCards(data) {

&#x20;       const container = document.getElementById('bio-list');

&#x20;       container.innerHTML = '';



&#x20;       data.forEach(bio => {

&#x20;           const card = document.createElement('div');

&#x20;           card.className = `bio-card ${bio.isDanger ? 'danger' : ''}`;



&#x20;           let featuresHtml = bio.features.map(f => `<li>${f}</li>`).join('');

&#x20;           let firstAidHtml = bio.firstAid.map(f => `<li>${f}</li>`).join('');

&#x20;           

&#x20;           let refsHtml = bio.references.map(ref => 

&#x20;               `<li>${ref.author} (${ref.year}). <i>${ref.title}</i>. <a href="${ref.doi}" target="\_blank" rel="noopener">DOIリンク</a></li>`

&#x20;           ).join('');



&#x20;           card.innerHTML = `

&#x20;               <div class="bio-header">

&#x20;                   <div>

&#x20;                       <div class="bio-name">${bio.name}</div>

&#x20;                       <div class="bio-sci-name">${bio.scientificName}</div>

&#x20;                   </div>

&#x20;                   ${bio.isDanger ? '<div class="danger-badge">⚠️ 危険</div>' : ''}

&#x20;               </div>

&#x20;               

&#x20;               <div class="section-title">特徴・見分け方</div>

&#x20;               <ul>${featuresHtml}</ul>



&#x20;               <div class="section-title">遭遇時・刺された時の対策</div>

&#x20;               <ul>${firstAidHtml}</ul>

&#x20;               

&#x20;               ${bio.dontDo ? `

&#x20;               <div class="alert-box">

&#x20;                   <strong>⚠️ 絶対にやらないで！</strong><br>

&#x20;                   ${bio.dontDo}

&#x20;               </div>

&#x20;               ` : ''}



&#x20;               <details>

&#x20;                   <summary>科学的根拠・出典を表示</summary>

&#x20;                   <ul>${refsHtml}</ul>

&#x20;               </details>

&#x20;           `;

&#x20;           container.appendChild(card);

&#x20;       });

&#x20;   }



&#x20;   // 初期表示

&#x20;   renderCards(bioData);



&#x20;   // 検索機能

&#x20;   document.getElementById('searchInput').addEventListener('input', (e) => {

&#x20;       const keyword = e.target.value.toLowerCase();

&#x20;       const filtered = bioData.filter(bio => 

&#x20;           bio.name.includes(keyword) || 

&#x20;           bio.features.some(f => f.includes(keyword))

&#x20;       );

&#x20;       renderCards(filtered);

&#x20;   });



&#x20;   // フィルター機能 (ボトムナビゲーション用)

&#x20;   window.filterData = function(type) {

&#x20;       if(type === 'danger') {

&#x20;           renderCards(bioData.filter(bio => bio.isDanger));

&#x20;       } else {

&#x20;           renderCards(bioData);

&#x20;       }

&#x20;   };

</script>



</body>

</html>

```



