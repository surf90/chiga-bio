// js/script.js

let globalBioData = [];

async function fetchBioData() {
    try {
        const response = await fetch('./data/bio-data.json');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
globalBioData = await response.json();

        // ★取得直後にソートする（市のシンボルを先頭にし、他は50音順）
        const priorityIds = ['tsutsuji', 'shijukara']; // 先頭にしたい生物のID
        
        globalBioData.sort((a, b) => {
            const indexA = priorityIds.indexOf(a.id);
            const indexB = priorityIds.indexOf(b.id);
            
            // 両方とも特別指定の場合（IDリストの順序に従う）
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // Aだけ特別指定ならAを前に
            if (indexA !== -1) return -1;
            // Bだけ特別指定ならBを前に
            if (indexB !== -1) return 1;
            
            // それ以外は通常の50音順
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

        // ★画像のHTML生成（ここで画像と出典の表示を行います）
        let imageHtml = '';
        if (bio.image && bio.image.url && bio.image.url !== "https://via.placeholder.com/400x300?text=No+Image+Available") {
            imageHtml = `
            <div class="bio-image-container" style="margin-bottom: 16px;">
                <img 
                    src="${bio.image.url}" 
                    alt="${bio.name}" 
                    loading="lazy" 
                    class="bio-image"
                    onload="this.parentElement.classList.add('loaded')"
                >
                <div class="image-credit">
                    Photo: <a href="${bio.image.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:#fff; text-decoration:underline;">${bio.image.author}</a> (${bio.image.license})
                </div>
            </div>`;
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
                `<li>${ref.title} (${ref.author}, ${ref.year}) <a href="${ref.url}" target="_blank" rel="noopener noreferrer">リンク</a></li>`
            ).join('');
            referencesHtml = `
                <details>
                    <summary>出典・参考文献を開く</summary>
                    <ul>${refsList}</ul>
                </details>`;
        }
        
        // カード全体のHTML組み立て
        card.innerHTML = `
            ${badgeHtml}
            <div class="bio-header">
                <div>
                    <h2>${bio.name}</h2>
                </div>
                <span class="category-tag">${bio.category}</span>
            </div>
            
            ${imageHtml} <div class="data-row">
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
        // 「すべて」が選択された場合は全データを表示
        renderCards(globalBioData);
    } else {
        // 選択されたカテゴリ（分類）に一致するものだけをフィルタリング
        renderCards(globalBioData.filter(bio => bio.category === type));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchBioData();
});
