// js/script.js

let globalBioData = [];

// モーダル要素の取得
const modal = document.getElementById('bio-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

async function fetchBioData() {
    try {
        const response = await fetch('./data/bio-data.json');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        globalBioData = await response.json();

        // ソート（市のシンボルを先頭にし、他は50音順）
        const priorityIds = ['shijukara','tsutsuji']; 
        
        globalBioData.sort((a, b) => {
            const indexA = priorityIds.indexOf(a.id);
            const indexB = priorityIds.indexOf(b.id);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            
            return a.name.localeCompare(b.name, 'ja');
        });

        renderCards(globalBioData);
        
    } catch (error) {
        console.error('エラー:', error);
        document.getElementById('bio-list').innerHTML = '<p style="text-align:center; padding: 20px;">データの読み込みに失敗しました。</p>';
    }
}

// ==========================================
// スマホ最適化 UI（タイル形式）の描画
// ==========================================
function renderCards(data) {
    const container = document.getElementById('bio-list');
    container.innerHTML = '';

    data.forEach(bio => {
        const card = document.createElement('div');
        // タイルの基本クラスと、危険度に応じた枠色クラス
        card.className = `bio-card ${bio.isDanger ? 'danger' : ''} ${bio.dangerType === 'protect' ? 'protect-border' : ''}`;

        // タイル左上の絵文字バッジ
        let tileBadge = '';
        if (bio.dangerType === 'contact') tileBadge = '<div class="tile-badge">⚠️</div>';
        else if (bio.dangerType === 'eat') tileBadge = '<div class="tile-badge">☠️</div>';
        else if (bio.dangerType === 'protect') tileBadge = '<div class="tile-badge">🐣</div>';
        else if (bio.isDanger) tileBadge = '<div class="tile-badge">⚠️</div>';

        // 画像のURL処理（データがない、あるいは空文字の場合はプレースホルダー）
        let imgUrl = "https://via.placeholder.com/200?text=No+Image";
        if (bio.image && bio.image.url && bio.image.url.trim().length > 5) {
            imgUrl = bio.image.url;
        }

        // タイル用のHTML構築
        card.innerHTML = `
            ${tileBadge}
            <div class="tile-image-wrapper">
                <img src="${imgUrl}" alt="${bio.name}" loading="lazy">
            </div>
            <div class="tile-name">${bio.name}</div>
            <div class="tile-category">${bio.category}</div>
        `;

        // タップでモーダルを表示
        card.addEventListener('click', () => openModal(bio));
        container.appendChild(card);
    });
}

// ==========================================
// 詳細モーダルの制御
// ==========================================
function openModal(bio) {
    // モーダル内に表示するバッジ
    let badgeHtml = '';
    if (bio.dangerType === 'contact') badgeHtml = '<span class="danger-badge contact">⚠️ 触れると危険</span>';
    else if (bio.dangerType === 'eat') badgeHtml = '<span class="danger-badge eat">☠️ 食べると危険</span>';
    else if (bio.dangerType === 'protect') badgeHtml = '<span class="danger-badge protect">🐣 守るため注意</span>';
    else if (bio.isDanger) badgeHtml = '<span class="danger-badge contact">⚠️ 危険</span>';

    // モーダル用画像とクレジット
    let imageHtml = '';
    if (bio.image && bio.image.url && bio.image.url.trim().length > 5) {
        imageHtml = `
            <img src="${bio.image.url}" alt="${bio.name}" class="modal-header-img">
            <div class="image-credit">
                Photo: <a href="${bio.image.sourceUrl}" target="_blank" rel="noopener noreferrer">${bio.image.author || 'Unknown'}</a> (${bio.image.license || 'Copyright'})
            </div>
        `;
    }

    // 各セクションのHTML
    let featuresHtml = (bio.features && bio.features.length > 0) 
        ? `<span class="section-label">FEATURES / 特徴</span><ul class="styled-list">${bio.features.map(f => `<li>${f}</li>`).join('')}</ul>` 
        : '';
        
    let firstAidHtml = (bio.firstAid && bio.firstAid.length > 0) 
        ? `<span class="section-label ${bio.isDanger ? 'alert' : ''}">FIRST AID / 応急処置</span><ul class="styled-list">${bio.firstAid.map(f => `<li>${f}</li>`).join('')}</ul>` 
        : '';
    
    let dontDoHtml = bio.dontDo ? `
        <div class="alert-box">
            <strong>⚠️ やってはいけないこと：</strong><br>
            ${bio.dontDo}
        </div>` : '';

    let referencesHtml = '';
    if (bio.references && bio.references.length > 0) {
        let refsList = bio.references.map(ref => 
            `<li>${ref.title} (${ref.author}, ${ref.year}) <a href="${ref.url}" target="_blank" rel="noopener noreferrer">リンク</a></li>`
        ).join('');
        referencesHtml = `
            <details>
                <summary>出典・参考文献を開く</summary>
                <ul style="padding-left:20px; margin-top:8px;">${refsList}</ul>
            </details>`;
    }

    // 市のシンボル用のアイコン設定
    let symbolIcon = '';
    if (bio.id === 'tsutsuji') {
        const svgFlower = `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M240,144a40,40,0,0,1-40,40A39.88,39.88,0,0,1,183.86,180.58A40,40,0,0,1,136,200v8a40,40,0,0,1-80,0v-8a40,40,0,0,1-47.86-51.42A40,40,0,0,1,56,104a39.88,39.88,0,0,1,16.14,3.42A40,40,0,0,1,120,56V48a40,40,0,0,1,80,0v8a40,40,0,0,1,47.86,51.42A40,40,0,0,1,240,144ZM128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Z"></path></svg>`;
        symbolIcon = `<span class="symbol-icon" title="茅ヶ崎市の花">${svgFlower}</span>`;
    } else if (bio.id === 'shijukara') {
        const svgBird = `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M232,104a32.16,32.16,0,0,0-17.76-28.72l-14.88-7.44a56.16,56.16,0,0,0-25-5.84h0a64,64,0,0,0-64,64v8h-8A40,40,0,0,0,62.36,174l-25.13,10.6a16,16,0,0,0-3.32,27.18,52.28,52.28,0,0,0,32,12.18h8a64,64,0,0,0,64-64v-8h16l14.88,7.44A56.16,56.16,0,0,0,188.64,164h0a32.16,32.16,0,0,0,28.72-17.76A103.58,103.58,0,0,0,232,104ZM120,136v24a48,48,0,0,1-48,48h-8A36.4,36.4,0,0,1,43.25,200L68.61,189.31A24,24,0,0,1,102.36,174,16,16,0,0,0,120,136ZM214.32,138.8a16.08,16.08,0,0,1-14.36,8.88h0A40.12,40.12,0,0,1,182.1,143.5l-20.44-10.22A15.93,15.93,0,0,0,154.5,132H136V126a48,48,0,0,1,48-48h0a40.12,40.12,0,0,1,17.86,4.18L222.3,92.4a16.08,16.08,0,0,1,8.88,14.36A87.65,87.65,0,0,1,214.32,138.8ZM160,116a12,12,0,1,1-12-12A12,12,0,0,1,160,116Z"></path></svg>`;
        symbolIcon = `<span class="symbol-icon" title="茅ヶ崎市の鳥">${svgBird}</span>`;
    }

    // HTML流し込み
    modalBody.innerHTML = `
        ${imageHtml}
        ${badgeHtml ? `<div style="margin-bottom:8px;">${badgeHtml}</div>` : ''}
        <h2 class="modal-title">${bio.name}${symbolIcon}</h2>
        <div class="modal-meta">
            <span class="category-tag">${bio.category}</span>
            <span class="data-value mono">${bio.scientificName}</span>
        </div>
        
        ${featuresHtml}
        ${firstAidHtml}
        ${dontDoHtml}
        ${referencesHtml}
    `;

    // アニメーション表示
    modal.classList.add('active');
    
    // 背景のスクロールを止める
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// モーダルを閉じるイベント
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    // 背景（オーバーレイ）クリック時のみ閉じる
    if (e.target === modal) {
        closeModal();
    }
});

// ==========================================
// 検索とフィルタリング
// ==========================================
document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = globalBioData.filter(bio => 
        bio.name.includes(keyword) || 
        (bio.features && bio.features.some(f => f.includes(keyword)))
    );
    renderCards(filtered);
});

window.filterData = function(type) {
    if(type === 'all') {
        renderCards(globalBioData);
    } else {
        renderCards(globalBioData.filter(bio => bio.category === type));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchBioData();
});
