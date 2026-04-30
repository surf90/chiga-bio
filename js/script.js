// js/script.js

let globalBioData = [];
let currentCategory = 'all';

// DOM要素の取得
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const skeletonList = document.getElementById('skeleton-list');
const bioList = document.getElementById('bio-list');
const emptyState = document.getElementById('empty-state');
const emptyKeyword = document.getElementById('empty-keyword');
const emptyResetBtn = document.getElementById('emptyResetBtn');

const modal = document.getElementById('bio-modal');
const modalContent = document.getElementById('modal-content');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const navItems = document.querySelectorAll('.nav-item');

// ヘッダー縮小（スクロール時）
(function () {
    const header = document.querySelector('header');
    if (!header) return;
    const SCROLL_THRESHOLD = 30;
    let ticking = false;
    function updateHeader() {
        header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
})();

// SVGプレースホルダー (外部リクエストを減らし、デザインを統一)
const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Cpath d='M0 130 Q 50 160 100 130 T 200 130 L 200 200 L 0 200 Z' fill='%23e2e8f0'/%3E%3Cpath d='M0 150 Q 50 180 100 150 T 200 150 L 200 200 L 0 200 Z' fill='%23cbd5e1' opacity='0.6'/%3E%3Ctext x='100' y='90' font-family='sans-serif' font-size='14' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

// 画像URLを返すヘルパー（プレースホルダーフォールバック付き）
function getImageUrl(bio) {
    if (bio.image && bio.image.url && bio.image.url.trim().length > 5 && !bio.image.url.includes('placeholder.com')) {
        return bio.image.url;
    }
    return placeholderSVG;
}

function getCitySymbol(id, isTile = false) {
    let svg = '';
    let label = '';
    if (id === 'tsutsuji') {
        svg = `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M240,144a40,40,0,0,1-40,40A39.88,39.88,0,0,1,183.86,180.58A40,40,0,0,1,136,200v8a40,40,0,0,1-80,0v-8a40,40,0,0,1-47.86-51.42A40,40,0,0,1,56,104a39.88,39.88,0,0,1,16.14,3.42A40,40,0,0,1,120,56V48a40,40,0,0,1,80,0v8a40,40,0,0,1,47.86,51.42A40,40,0,0,1,240,144ZM128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Z"></path></svg>`;
        label = '市の花';
    } else if (id === 'shijukara') {
        svg = `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M232,104a32.16,32.16,0,0,0-17.76-28.72l-14.88-7.44a56.16,56.16,0,0,0-25-5.84h0a64,64,0,0,0-64,64v8h-8A40,40,0,0,0,62.36,174l-25.13,10.6a16,16,0,0,0-3.32,27.18,52.28,52.28,0,0,0,32,12.18h8a64,64,0,0,0,64-64v-8h16l14.88,7.44A56.16,56.16,0,0,0,188.64,164h0a32.16,32.16,0,0,0,28.72-17.76A103.58,103.58,0,0,0,232,104ZM120,136v24a48,48,0,0,1-48,48h-8A36.4,36.4,0,0,1,43.25,200L68.61,189.31A24,24,0,0,1,102.36,174,16,16,0,0,0,120,136ZM214.32,138.8a16.08,16.08,0,0,1-14.36,8.88h0A40.12,40.12,0,0,1,182.1,143.5l-20.44-10.22A15.93,15.93,0,0,0,154.5,132H136V126a48,48,0,0,1,48-48h0a40.12,40.12,0,0,1,17.86,4.18L222.3,92.4a16.08,16.08,0,0,1,8.88,14.36A87.65,87.65,0,0,1,214.32,138.8ZM160,116a12,12,0,1,1-12-12A12,12,0,0,1,160,116Z"></path></svg>`;
        label = '市の鳥';
    } else if (id === 'niseakashia') {
        svg = `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,149.66l-36,36A8,8,0,0,1,166,188H136v40a8,8,0,0,1-16,0V188H90.06a8,8,0,0,1-5.72-2.4l-35.72-36.43A48,48,0,0,1,80,64a8,8,0,0,1,0,16,32,32,0,0,0-22.63,54.63L88,165.94V136a8,8,0,0,1,16,0v16h16V120a8,8,0,0,1,16,0v32h16v-8a8,8,0,0,1,16,0v8.06l29.66-29.66a8,8,0,0,1,11.31,11.31ZM176,80a48.05,48.05,0,0,0-48-48,47.58,47.58,0,0,0-19.79,4.27,8,8,0,0,0,6.62,14.56A31.7,31.7,0,0,1,128,48a32,32,0,0,1,32,32,31.7,31.7,0,0,1-2.83,13.17,8,8,0,1,0,14.56,6.62A47.58,47.58,0,0,0,176,80Z"></path></svg>`;
        label = '市の木';
    } else {
        return '';
    }
    const wrapperClass = isTile ? 'tile-symbol-icon' : 'symbol-icon';
    return `<span class="${wrapperClass}" title="茅ヶ崎${label}">${svg}<span class="symbol-label">${label}</span></span>`;
}

async function fetchBioData() {
    try {
        const response = await fetch('./data/bio-data.json');
        
        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }
        
        globalBioData = await response.json();

        // ソート（市のシンボルを先頭に）
        const priorityIds = ['shijukara','tsutsuji','niseakashia'];
        globalBioData.sort((a, b) => {
            const indexA = priorityIds.indexOf(a.id);
            const indexB = priorityIds.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name, 'ja');
        });

        // データ取得完了後、スケルトンを消してリストを表示
        skeletonList.style.display = 'none';
        bioList.style.display = 'grid';
        
        renderCards(globalBioData);
        
        // URLパラメータをチェックし、指定の生き物がいたらモーダルを自動で開く
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        if (targetId) {
            const targetBio = globalBioData.find(bio => bio.id === targetId);
            if (targetBio) {
                openModal(targetBio);
            }
        }
        
    } catch (error) {
        console.error('エラー:', error);
        skeletonList.style.display = 'none';
        bioList.style.display = 'block';
        bioList.innerHTML = '<p style="text-align:center; padding: 20px;">データの読み込みに失敗しました。</p>';
    }
}

// ==========================================
// スマホ最適化 UI（タイル形式）の描画
// ==========================================
function renderCards(data) {
    bioList.innerHTML = '';

    if (data.length === 0) {
        bioList.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyKeyword.textContent = searchInput.value;
        return;
    }

    bioList.style.display = 'grid';
    emptyState.style.display = 'none';

    data.forEach(bio => {
        const card = document.createElement('div');
        card.className = `bio-card ${bio.isDanger ? 'danger' : ''} ${bio.dangerType === 'protect' ? 'protect-border' : ''}`;

        let tileBadge = '';
        if (bio.dangerType === 'contact') tileBadge = '<div class="tile-badge contact"><i class="fa-solid fa-triangle-exclamation"></i></div>';
        else if (bio.dangerType === 'eat') tileBadge = '<div class="tile-badge eat"><i class="fa-solid fa-skull-crossbones"></i></div>';
        else if (bio.dangerType === 'protect') tileBadge = '<div class="tile-badge protect"><i class="fa-solid fa-hand-holding-heart"></i></div>';
        else if (bio.isDanger) tileBadge = '<div class="tile-badge contact"><i class="fa-solid fa-triangle-exclamation"></i></div>';

        const imgUrl = getImageUrl(bio);

        card.innerHTML = `
            ${tileBadge}
            <div class="tile-image-wrapper">
                <img src="${imgUrl}" alt="${bio.name}" loading="lazy" decoding="async">
            </div>
            <div class="tile-name">${bio.name}</div>
            <div class="tile-category">${bio.category}${getCitySymbol(bio.id, true)}</div>
        `;

        card.addEventListener('click', () => openModal(bio));
        bioList.appendChild(card);
    });
}

// ==========================================
// ボトムナビ & 検索
// ==========================================
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // アクティブ状態の視覚化
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        currentCategory = item.dataset.category;
        filterData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

let searchTimeout;

searchInput.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        clearSearchBtn.classList.add('visible');
    } else {
        clearSearchBtn.classList.remove('visible');
    }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterData();
    }, 300);
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    filterData();
    searchInput.focus();
});

emptyResetBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector('.nav-item[data-category="all"]').classList.add('active');
    currentCategory = 'all';
    filterData();
});

window.filterData = function() {
    const keyword = searchInput.value.toLowerCase();
    const filtered = globalBioData.filter(bio => {
        const matchCategory = currentCategory === 'all' || bio.category === currentCategory;
        const matchKeyword = bio.name.includes(keyword) || (bio.features && bio.features.some(f => f.includes(keyword)));
        return matchCategory && matchKeyword;
    });
    renderCards(filtered);
};

// ==========================================
// 詳細モーダルとシェア機能
// ==========================================
function openModal(bio) {
    let badgeHtml = '';
    if (bio.dangerType === 'contact') badgeHtml = '<span class="danger-badge contact"><i class="fa-solid fa-triangle-exclamation"></i> 触れると危険</span>';
    else if (bio.dangerType === 'eat') badgeHtml = '<span class="danger-badge eat"><i class="fa-solid fa-skull-crossbones"></i> 食べると危険</span>';
    else if (bio.dangerType === 'protect') badgeHtml = '<span class="danger-badge protect"><i class="fa-solid fa-hand-holding-heart"></i> 守るため注意</span>';
    else if (bio.isDanger) badgeHtml = '<span class="danger-badge contact"><i class="fa-solid fa-triangle-exclamation"></i> 危険</span>';

    const imgUrl = getImageUrl(bio);
    let creditHtml = '';
    if (imgUrl !== placeholderSVG) {
        const authorText = bio.image.author || 'Unknown';
        
// CCアイコンの構築処理
        let licenseIcons = '';
        if (bio.image.license) {
            const licenseUpper = bio.image.license.toUpperCase().trim();
            if (licenseUpper === 'CC0') {
                // CC0の場合は、ベースマークとゼロマークを両方表示
                licenseIcons = '<i class="fa-brands fa-creative-commons" aria-label="Creative Commons" title="CC0"></i><i class="fa-brands fa-creative-commons-zero" aria-label="Public Domain" title="Public Domain"></i>';
            } else if (licenseUpper.startsWith('CC')) {
                // ベースとなる「CC」マーク
                licenseIcons += '<i class="fa-brands fa-creative-commons" aria-label="Creative Commons" title="Creative Commons"></i>';

                const typesStr = licenseUpper.substring(2).trim(); // "BY-NC" 等の抽出
                const types = typesStr.split('-');

                // ライセンス条件に応じてアイコンを追加
                types.forEach(type => {
                    const t = type.trim();
                    if (t === 'BY') licenseIcons += '<i class="fa-brands fa-creative-commons-by" aria-label="Attribution" title="Attribution"></i>';
                    else if (t === 'SA') licenseIcons += '<i class="fa-brands fa-creative-commons-sa" aria-label="ShareAlike" title="ShareAlike"></i>';
                    else if (t === 'NC') licenseIcons += '<i class="fa-brands fa-creative-commons-nc" aria-label="NonCommercial" title="NonCommercial"></i>';
                    else if (t === 'ND') licenseIcons += '<i class="fa-brands fa-creative-commons-nd" aria-label="NoDerivatives" title="NoDerivatives"></i>';
                });
            } else {
                licenseIcons = ` <span class="license-text">(${bio.image.license})</span>`;
            }
        }

        // sourceUrlが存在する場合はリンクにする
        if (bio.image.sourceUrl && bio.image.sourceUrl.trim() !== '') {
            creditHtml = `<div class="image-credit"><a href="${bio.image.sourceUrl}" target="_blank" rel="noopener noreferrer">Photo: ${authorText}</a> ${licenseIcons}</div>`;
        } else {
            creditHtml = `<div class="image-credit">Photo: ${authorText} ${licenseIcons}</div>`;
        }
    }

    let featuresHtml = (bio.features && bio.features.length > 0)
        ? `<h3 class="section-label">FEATURES / 特徴</h3><ul class="styled-list">${bio.features.map(f => `<li>${f}</li>`).join('')}</ul>` : '';

    let firstAidHtml = (bio.firstAid && bio.firstAid.length > 0)
        ? `<h3 class="section-label ${bio.isDanger ? 'alert' : ''}">FIRST AID / 応急処置</h3><ul class="styled-list">${bio.firstAid.map(f => `<li>${f}</li>`).join('')}</ul>` : '';
    
    let dontDoHtml = bio.dontDo ? `<div class="alert-box"><strong>⚠️ やってはいけないこと：</strong><br>${bio.dontDo}</div>` : '';

    let referencesHtml = '';
    if (bio.references && bio.references.length > 0) {
        const items = bio.references.map(ref => {
            const link = ref.url
                ? `<a href="${ref.url}" target="_blank" rel="noopener">${ref.title}</a>`
                : ref.title;
            const meta = [ref.author, ref.year].filter(Boolean).join(', ');
            return `<li>${link}${meta ? `<span class="ref-meta"> — ${meta}</span>` : ''}</li>`;
        }).join('');
        referencesHtml = `
        <details class="references-details">
            <summary>参考文献</summary>
            <ul class="references-list">${items}</ul>
        </details>`;
    }

    const symbolIcon = getCitySymbol(bio.id, false);

    modalBody.innerHTML = `
        <img src="${imgUrl}" alt="${bio.name}" class="modal-header-img">
        ${creditHtml}
        ${badgeHtml ? `<div style="margin-bottom:8px;">${badgeHtml}</div>` : ''}
        <h2 class="modal-title">${bio.name}${symbolIcon}</h2>
        <dl class="modal-meta">
            <dt class="sr-only">分類</dt><dd><span class="category-tag">${bio.category}</span></dd>
            <dt class="sr-only">学名</dt><dd class="scientific-name">${bio.scientificName}</dd>
        </dl>
        ${featuresHtml}
        ${firstAidHtml}
        ${dontDoHtml}
        
       <button class="share-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            この生き物をシェアする
        </button>
        ${referencesHtml}
    `;

    modalBody.querySelector('.share-btn').addEventListener('click', () => shareBio(bio.id, bio.name, bio.category));

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalBody.scrollTop = 0; // スクロール位置を一番上に戻す
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ==========================================
// シェアAPI
// ==========================================
window.shareBio = function(id, name, category) {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?id=${id}`;

    if (navigator.share) {
        navigator.share({
            title: `ちがビオ - ${name}`,
            text: `茅ヶ崎の生き物「${name} (${category})」をチェック！`,
            url: shareUrl,
        }).catch(console.error);
    } else {
        const text = `ちがビオ - ${name} ${shareUrl}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => showToast("リンクをコピーしました")).catch(() => showToast("コピーに失敗しました"));
        } else {
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            showToast("リンクをコピーしました");
        }
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// ==========================================
// モーダルのスワイプダウンによるクローズ
// ==========================================
let startY = 0;
let currentY = 0;

modalContent.addEventListener('touchstart', (e) => {
    if (modalBody.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        modalContent.classList.add('dragging');
    } else {
        startY = 0;
    }
}, {passive: true});

modalContent.addEventListener('touchmove', (e) => {
    if (!startY) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0) {
        modalContent.style.transform = `translateY(${diff}px)`;
        e.preventDefault();
    }
}, {passive: false});

modalContent.addEventListener('touchend', (e) => {
    if (!startY) return;
    modalContent.classList.remove('dragging');
    const diff = currentY - startY;
    
    if (diff > 150) {
        closeModal();
        setTimeout(() => { modalContent.style.transform = ''; }, 300);
    } else {
        modalContent.style.transform = '';
    }
    
    startY = 0;
    currentY = 0;
});

// 起動
document.addEventListener('DOMContentLoaded', fetchBioData);

// Service Worker 登録（PWA オフライン対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW 登録成功:', reg.scope))
            .catch(err => console.log('SW 登録失敗:', err));
    });
}
