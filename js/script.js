// js/script.js

let globalBioData = [];

async function fetchBioData() {
    try {
        const response = await fetch('./data/bio-data.json');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        globalBioData = await response.json();

        // ★追加・修正: 取得直後に名前順でソートする
        globalBioData.sort((a, b) => {
            return a.name.localeCompare(b.name, 'ja');
        });

        renderCards(globalBioData);
        
    } catch (error) {
        console.error('エラー:', error);
        document.getElementById('bio-list').innerHTML = '<p>データの読み込みに失敗しました。</p>';
    }
}

function renderCards(data) {
    const container = document.getElementById('bio-list');
    container.innerHTML = '';

    data.forEach(bio => {
        const card = document.createElement('div');
        // CSSのクラス付与
        card.className = `bio-card ${bio.isDanger ? 'danger' : ''} ${bio.dangerType === 'protect' ? 'protect-border' : ''}`;

        // 危険度・注意バッジの生成（階層化対応）
        let badgeHtml = '';
        if (bio.dangerType === 'contact') {
            badgeHtml = '<span class="danger-badge contact">⚠️ 触れると危険</span>';
        } else if (bio.dangerType === 'eat') {
            badgeHtml = '<span class="danger-badge eat">☠️ 食べると危険</span>';
        } else if (bio.dangerType === 'protect') {
            badgeHtml = '<span class="danger-badge protect">🐣 守るため注意</span>';
        } else if (bio.isDanger) {
            badgeHtml = '<span class="danger-badge">⚠️ 危険</span>';
        }

        // 項目が空の場合はセクションごと非表示にする処理
        let featuresHtml = (bio.features && bio.features.length > 0) 
            ? `<span class="section-label">FEATURES</span><ul class="styled-list">${bio.features.map(f => `<li>${f}</li>`).join('')}</ul>` 
            : '';
            
        let firstAidHtml = (bio.firstAid && bio.firstAid.length > 0) 
            ? `<span class="section-label ${bio.isDanger ? 'alert' : ''}">FIRST_AID / 応急処置</span><ul class="styled-list">${bio.firstAid.map(f => `<li>${f}</li>`).join('')}</ul>` 
            : '';
        
        let dontDoHtml = bio.dontDo ? `
            <div class="alert-box">
                <strong>⚠️ やってはいけないこと：</strong><br>
                ${bio.dontDo}
            </div>` : '';

        let referencesHtml = '';
        if (bio.references && bio.references.length > 0) {
            let refsList = bio.references.map(ref => 
                // ★修正: url プロパティに合わせて修正しました（元のコードは doi でした）
                `<li>${ref.title} (${ref.author}, ${ref.year}) <a href="${ref.url}" target="_blank">リンク</a></li>`
            ).join('');
            referencesHtml = `
                <details>
                    <summary>出典・参考文献を開く</summary>
                    <ul>${refsList}</ul>
                </details>`;
        }
        
        card.innerHTML = `
            ${badgeHtml}
            <div class="bio-header">
                <div>
                    <h2>${bio.name}</h2>
                </div>
                <span class="category-tag">${bio.category}</span>
            </div>
            
            <div class="data-row">
                <span class="data-label">学名</span>
                <span class="data-value mono">${bio.scientificName}</span>
            </div>
            ${featuresHtml}
            ${firstAidHtml}
            ${dontDoHtml}
            ${referencesHtml}
        `;
        container.appendChild(card);
    });
}
/**
 * 生物カードのHTMLを生成する関数
 * @param {Object} bio 生物データ
 */
function createBioCard(bio) {
    const card = document.createElement('div');
    card.className = 'bio-card';

    // 画像URLの最適化（iNaturalistの場合、mediumを指定）
    const imageUrl = bio.image ? bio.image.url : 'assets/placeholder.png';

    card.innerHTML = `
        <div class="bio-image-container">
            <img 
                src="${imageUrl}" 
                alt="${bio.name}" 
                loading="lazy" 
                class="bio-image"
                onload="this.parentElement.classList.add('loaded')"
            >
            <div class="image-credit">
                Photo: ${bio.image ? bio.image.author : '---'} (${bio.image ? bio.image.license : ''})
            </div>
        </div>
        <div class="bio-info">
            <h3>${bio.name}</h3>
            <p class="scientific-name">${bio.scientificName}</p>
            </div>
    `;
    return card;
}
document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = globalBioData.filter(bio => 
        bio.name.includes(keyword) || 
        (bio.features && bio.features.some(f => f.includes(keyword)))
    );
    renderCards(filtered);
});

window.filterData = function(type) {
    if(type === 'danger') {
        // isDangerがtrue、または保護が必要なものをフィルタ
        renderCards(globalBioData.filter(bio => bio.isDanger || bio.dangerType === 'protect'));
    } else {
        renderCards(globalBioData);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchBioData();
});
