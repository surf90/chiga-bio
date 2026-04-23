// js/script.js

// グローバルにデータを保持するための変数
let globalBioData = [];

// データベース（JSON）を取得する関数
async function fetchBioData() {
    try {
        // JSONファイルのパス（GitHub Pagesの環境に合わせて調整してください）
        const response = await fetch('./data/bio-data.json');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        globalBioData = await response.json();
        
        // データ取得後に初回レンダリングを実行
        renderCards(globalBioData);
        
    } catch (error) {
        console.error('エラー:', error);
        document.getElementById('bio-list').innerHTML = '<p>データの読み込みに失敗しました。</p>';
    }
}

// カードの描画関数
function renderCards(data) {
    const container = document.getElementById('bio-list');
    container.innerHTML = '';

    data.forEach(bio => {
        const card = document.createElement('div');
        card.className = `bio-card ${bio.isDanger ? 'danger' : ''}`;

        // リストデータの組み立て
        let featuresHtml = bio.features.map(f => `<li>${f}</li>`).join('');
        let firstAidHtml = bio.firstAid.map(f => `<li>${f}</li>`).join('');
        
        // 禁忌事項（やってはいけないこと）のHTML生成
        let dontDoHtml = bio.dontDo ? `
            <div class="alert-box">
                <strong>⚠️ やってはいけないこと：</strong><br>
                ${bio.dontDo}
            </div>` : '';

        // 出典アコーディオンのHTML生成
        let referencesHtml = '';
        if (bio.references && bio.references.length > 0) {
            let refsList = bio.references.map(ref => 
                `<li>${ref.title} (${ref.author}, ${ref.year}) <a href="${ref.doi}" target="_blank">リンク</a></li>`
            ).join('');
            referencesHtml = `
                <details>
                    <summary>出典・参考文献を開く</summary>
                    <ul>${refsList}</ul>
                </details>`;
        }
        
        card.innerHTML = `
            ${bio.isDanger ? '<span class="danger-badge">WARNING / 高度危険</span>' : ''}
            <h2>${bio.name}</h2>
            <div class="data-row">
                <span class="data-label">学名</span>
                <span class="data-value mono">${bio.scientificName}</span>
            </div>
            <span class="section-label">FEATURES</span>
            <ul class="styled-list">${featuresHtml}</ul>
            <span class="section-label ${bio.isDanger ? 'alert' : ''}">FIRST_AID</span>
            <ul class="styled-list">${firstAidHtml}</ul>
            ${dontDoHtml}
            ${referencesHtml}
        `;
        container.appendChild(card);
    });
}

// 検索機能のイベントリスナー
document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = globalBioData.filter(bio => 
        bio.name.includes(keyword) || 
        bio.features.some(f => f.includes(keyword))
    );
    renderCards(filtered);
});

// フィルター機能 (ボトムナビゲーション用)
window.filterData = function(type) {
    if(type === 'danger') {
        renderCards(globalBioData.filter(bio => bio.isDanger));
    } else {
        renderCards(globalBioData);
    }
};

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    fetchBioData();
});
