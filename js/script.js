// js/script.js

// ロゴ用Webフォントを非同期注入（レンダーブロッキング回避。CSP: script-src 'self' 準拠）
(function loadLogoFont() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@900&display=swap';
    document.head.appendChild(link);
})();

let globalBioData = [];
let currentEnv = 'all';

// DOM要素の取得
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const skeletonList = document.getElementById('skeleton-list');
const bioList = document.getElementById('bio-list');
const emptyState = document.getElementById('empty-state');
const emptyKeyword = document.getElementById('empty-keyword');
const emptyResetBtn = document.getElementById('emptyResetBtn');

const resultCount = document.getElementById('result-count');
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

// インラインSVGアイコン（Feather Icons (MIT) ベース。Font Awesome CDN 廃止に伴い自前化）
const ICONS = {
    warning: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    skull: '<svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a8 8 0 0 0-8 8c0 2.5 1.16 4.73 3 6.2V19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.8c1.84-1.47 3-3.7 3-6.2a8 8 0 0 0-8-8zM8.5 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM12 12.5l1.5 3h-3l1.5-3z"/></svg>',
    heart: '<svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    calendar: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    location: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    chart: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
};

// CCライセンスマーク（円＋略号のシンプルなインラインSVG）
function ccIcon(label, title) {
    const fontSize = label.length > 1 ? 9 : 12;
    return `<svg class="cc-icon" viewBox="0 0 24 24" role="img" aria-label="${title}"><title>${title}</title>` +
        `<circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.8"/>` +
        `<text x="12" y="12.5" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="bold" fill="currentColor" font-family="Arial, Helvetica, sans-serif">${label}</text></svg>`;
}

// ひらがな→カタカナ変換＋小文字化＋濁点・半濁点の清音化（かな表記の違いを吸収して検索ヒットさせる）
function normalizeKana(str) {
    return String(str ?? '')
        .toLowerCase()
        .replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
        // NFD 分解で濁点(U+3099)・半濁点(U+309A)を結合文字に分け、それらを除去して清音化（カメ≒ガメ等を吸収）
        .normalize('NFD')
        .replace(/[゙゚]/g, '')
        .normalize('NFC');
}

// iNaturalist 画像URLのサイズ変種を返す（square/small/medium/large 形式以外は null）
function getImageVariant(url, size) {
    const m = /^(.*\/)(square|small|medium|large)(\.(?:jpe?g|png|webp))$/i.exec(url);
    return m ? `${m[1]}${size}${m[3]}` : null;
}

// 画像URLを返すヘルパー（プレースホルダーフォールバック付き）
function getImageUrl(bio) {
    if (bio.image && bio.image.url && bio.image.url.trim().length > 5 && !bio.image.url.includes('placeholder.com')) {
        return bio.image.url;
    }
    return placeholderSVG;
}

// 画像読み込み失敗時にプレースホルダーへ差し替えるハンドラを付与
function attachImgFallback(img) {
    if (!img) return;
    img.addEventListener('error', () => {
        if (img.src !== placeholderSVG) img.src = placeholderSVG;
    }, { once: true });
}

// 茅ヶ崎市のシンボル定義（市の花・鳥・木）
const CITY_SYMBOLS = {
    tsutsuji: {
        label: '市の花',
        svg: `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M240,144a40,40,0,0,1-40,40A39.88,39.88,0,0,1,183.86,180.58A40,40,0,0,1,136,200v8a40,40,0,0,1-80,0v-8a40,40,0,0,1-47.86-51.42A40,40,0,0,1,56,104a39.88,39.88,0,0,1,16.14,3.42A40,40,0,0,1,120,56V48a40,40,0,0,1,80,0v8a40,40,0,0,1,47.86,51.42A40,40,0,0,1,240,144ZM128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Z"></path></svg>`
    },
    shijukara: {
        label: '市の鳥',
        svg: `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M232,104a32.16,32.16,0,0,0-17.76-28.72l-14.88-7.44a56.16,56.16,0,0,0-25-5.84h0a64,64,0,0,0-64,64v8h-8A40,40,0,0,0,62.36,174l-25.13,10.6a16,16,0,0,0-3.32,27.18,52.28,52.28,0,0,0,32,12.18h8a64,64,0,0,0,64-64v-8h16l14.88,7.44A56.16,56.16,0,0,0,188.64,164h0a32.16,32.16,0,0,0,28.72-17.76A103.58,103.58,0,0,0,232,104ZM120,136v24a48,48,0,0,1-48,48h-8A36.4,36.4,0,0,1,43.25,200L68.61,189.31A24,24,0,0,1,102.36,174,16,16,0,0,0,120,136ZM214.32,138.8a16.08,16.08,0,0,1-14.36,8.88h0A40.12,40.12,0,0,1,182.1,143.5l-20.44-10.22A15.93,15.93,0,0,0,154.5,132H136V126a48,48,0,0,1,48-48h0a40.12,40.12,0,0,1,17.86,4.18L222.3,92.4a16.08,16.08,0,0,1,8.88,14.36A87.65,87.65,0,0,1,214.32,138.8ZM160,116a12,12,0,1,1-12-12A12,12,0,0,1,160,116Z"></path></svg>`
    },
    niseakashia: {
        label: '市の木',
        svg: `<svg class="symbol-svg" width="1.1em" height="1.1em" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,149.66l-36,36A8,8,0,0,1,166,188H136v40a8,8,0,0,1-16,0V188H90.06a8,8,0,0,1-5.72-2.4l-35.72-36.43A48,48,0,0,1,80,64a8,8,0,0,1,0,16,32,32,0,0,0-22.63,54.63L88,165.94V136a8,8,0,0,1,16,0v16h16V120a8,8,0,0,1,16,0v32h16v-8a8,8,0,0,1,16,0v8.06l29.66-29.66a8,8,0,0,1,11.31,11.31ZM176,80a48.05,48.05,0,0,0-48-48,47.58,47.58,0,0,0-19.79,4.27,8,8,0,0,0,6.62,14.56A31.7,31.7,0,0,1,128,48a32,32,0,0,1,32,32,31.7,31.7,0,0,1-2.83,13.17,8,8,0,1,0,14.56,6.62A47.58,47.58,0,0,0,176,80Z"></path></svg>`
    }
};

function getCitySymbol(id, isTile = false) {
    const symbol = CITY_SYMBOLS[id];
    if (!symbol) return '';
    const wrapperClass = isTile ? 'tile-symbol-icon' : 'symbol-icon';
    return `<span class="${wrapperClass}" title="茅ヶ崎${symbol.label}">${symbol.svg}<span class="symbol-label">${symbol.label}</span></span>`;
}

// 危険タイプの定義（カード・モーダル共通）。icon はインラインSVGマークアップ
const DANGER_TYPES = {
    contact: { label: '触れると危険', icon: ICONS.warning, badgeClass: 'contact' },
    eat: { label: '食べると危険', icon: ICONS.skull, badgeClass: 'eat' },
    protect: { label: '守るため注意', icon: ICONS.heart, badgeClass: 'protect' }
};

// 生き物の危険情報を返す。dangerType 未指定で isDanger のみの場合は汎用「危険」
function getDangerInfo(bio) {
    if (bio.dangerType && DANGER_TYPES[bio.dangerType]) return DANGER_TYPES[bio.dangerType];
    if (bio.isDanger) return { label: '危険', icon: ICONS.warning, badgeClass: 'contact' };
    return null;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    // 絶対URL（http/https）のみ許可。相対パスや javascript: 等は拒否
    if (!/^https?:\/\//i.test(url.trim())) return '';
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
    } catch {
        return '';
    }
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
            return (a.name || '').localeCompare(b.name || '', 'ja');
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
                openModal(targetBio, { skipPushState: true });
            } else {
                showToast('指定の生き物が見つかりませんでした');
            }
        }
        
    } catch (error) {
        console.error('エラー:', error);
        skeletonList.style.display = 'none';
        bioList.style.display = 'block';

        // エラー種別ごとにメッセージを出し分け
        let message;
        if (!navigator.onLine) {
            message = 'インターネットに接続されていません。接続を確認してください。';
        } else if (error instanceof SyntaxError) {
            message = 'データの形式が正しくありません。時間をおいて再度お試しください。';
        } else {
            message = 'データの読み込みに失敗しました。';
        }

        bioList.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'load-error';
        const p = document.createElement('p');
        p.textContent = message;
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'empty-reset-btn';
        retryBtn.textContent = '再読み込み';
        retryBtn.addEventListener('click', () => {
            bioList.style.display = 'none';
            skeletonList.style.display = 'grid';
            fetchBioData();
        });
        wrap.append(p, retryBtn);
        bioList.appendChild(wrap);
    }
}

// ==========================================
// スマホ最適化 UI（タイル形式）の描画
// ==========================================
function renderCards(data) {
    bioList.innerHTML = '';

    if (resultCount) {
        resultCount.textContent = data.length === 0
            ? '一致する生き物は見つかりませんでした'
            : `${data.length}件の生き物を表示中`;
    }

    if (data.length === 0) {
        bioList.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyKeyword.textContent = searchInput.value;
        return;
    }

    bioList.style.display = 'grid';
    emptyState.style.display = 'none';

    const fragment = document.createDocumentFragment();
    data.forEach((bio, idx) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `bio-card ${bio.isDanger ? 'danger' : ''} ${bio.dangerType === 'protect' ? 'protect-border' : ''}`;

        const dangerInfo = getDangerInfo(bio);
        const dangerLabel = dangerInfo ? dangerInfo.label : '';
        const ariaParts = [bio.name, bio.category];
        if (dangerLabel) ariaParts.push(dangerLabel);
        if (bio.rarity) ariaParts.push(`希少度${bio.rarity}`);
        card.setAttribute('aria-label', `${ariaParts.join('、')}の詳細を開く`);

        const tileBadge = dangerInfo
            ? `<div class="tile-badge ${dangerInfo.badgeClass}" aria-hidden="true">${dangerInfo.icon}</div>`
            : '';

        const imgUrl = getImageUrl(bio);
        // 画像のaltに分類・危険情報を含めて文脈を補う
        const imgAlt = `${bio.name}（${bio.category}${dangerLabel ? '・' + dangerLabel : ''}）`;

        const rarityStars = bio.rarity === 3 ? '★★★' : bio.rarity === 2 ? '★★☆' : '★☆☆';
        const rarityClass = `rarity-${bio.rarity || 1}`;
        const rarityBadge = bio.rarity ? `<div class="rarity-badge ${rarityClass}" aria-hidden="true">${rarityStars}</div>` : '';

        // ファーストビューの画像は優先読み込み
        const isAboveFold = idx < 6;
        const loadingAttr = isAboveFold ? 'eager' : 'lazy';
        const fetchAttr = isAboveFold ? ' fetchpriority="high"' : '';

        // iNaturalist の URL ならタイル向けに小さいサイズ変種を使う
        const smallUrl = getImageVariant(imgUrl, 'small');
        const mediumUrl = getImageVariant(imgUrl, 'medium');
        const tileSrc = smallUrl || imgUrl;
        const srcsetAttr = (smallUrl && mediumUrl)
            ? ` srcset="${smallUrl} 240w, ${mediumUrl} 500w" sizes="(min-width: 600px) 140px, 33vw"`
            : '';

        card.innerHTML = `
            ${rarityBadge}
            ${tileBadge}
            <div class="tile-image-wrapper">
                <img src="${tileSrc}"${srcsetAttr} alt="${escapeHtml(imgAlt)}" width="200" height="200" loading="${loadingAttr}" decoding="async"${fetchAttr}>
            </div>
            <div class="tile-name">${escapeHtml(bio.name)}</div>
            <div class="tile-category">${escapeHtml(bio.category)}${getCitySymbol(bio.id, true)}</div>
        `;

        attachImgFallback(card.querySelector('img'));
        card.addEventListener('click', () => openModal(bio));
        fragment.appendChild(card);
    });
    bioList.appendChild(fragment);
}

// ==========================================
// ボトムナビ & 検索
// ==========================================
function setActiveNav(item) {
    navItems.forEach(nav => {
        nav.classList.remove('active');
        nav.removeAttribute('aria-current');
    });
    if (item) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
    }
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveNav(item);
        currentEnv = item.dataset.env;
        filterData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

let searchTimeout;
let isComposing = false;

searchInput.addEventListener('compositionstart', () => { isComposing = true; });
searchInput.addEventListener('compositionend', () => {
    isComposing = false;
    clearTimeout(searchTimeout);
    filterData(); // IME確定後は待たずに即時反映
});

searchInput.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        clearSearchBtn.classList.add('visible');
    } else {
        clearSearchBtn.classList.remove('visible');
    }
    if (isComposing) return; // IME変換中は検索しない
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterData, 300);
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
    setActiveNav(document.querySelector('.nav-item[data-env="all"]'));
    currentEnv = 'all';
    filterData();
});

function filterData() {
    // ひらがな・カタカナどちらの入力でもヒットするよう正規化して比較
    const keyword = normalizeKana(searchInput.value.trim());
    const filtered = globalBioData.filter(bio => {
        const matchEnv = currentEnv === 'all' || bio.environment === currentEnv;
        if (!matchEnv) return false;
        if (!keyword) return true;
        return normalizeKana(bio.name).includes(keyword) ||
            normalizeKana(bio.scientificName).includes(keyword) ||
            (bio.features && bio.features.some(f => normalizeKana(f).includes(keyword)));
    });
    renderCards(filtered);
}

// ==========================================
// 詳細モーダルとシェア機能
// ==========================================
let lastFocusedElement = null;
let savedScrollY = 0; // モーダル表示中の背景スクロール位置の退避先

function openModal(bio, options = {}) {
    lastFocusedElement = document.activeElement;
    const dangerInfo = getDangerInfo(bio);
    const badgeHtml = dangerInfo
        ? `<span class="danger-badge ${dangerInfo.badgeClass}">${dangerInfo.icon} ${dangerInfo.label}</span>`
        : '';

    const imgUrl = getImageUrl(bio);
    const dangerLabel = dangerInfo ? dangerInfo.label : '';
    const imgAlt = `${bio.name}（${bio.category}${dangerLabel ? '・' + dangerLabel : ''}）`;
    let creditHtml = '';
    if (imgUrl !== placeholderSVG && bio.image && bio.image.author) {
        const authorText = escapeHtml(bio.image.author);
        
// CCアイコンの構築処理
        let licenseIcons = '';
        if (bio.image.license) {
            const licenseUpper = bio.image.license.toUpperCase().trim();
            if (licenseUpper === 'CC0') {
                // CC0の場合は、ベースマークとゼロマークを両方表示
                licenseIcons = ccIcon('CC', 'Creative Commons') + ccIcon('0', 'Public Domain');
            } else if (licenseUpper.startsWith('CC')) {
                // ベースとなる「CC」マーク
                licenseIcons += ccIcon('CC', 'Creative Commons');

                const typesStr = licenseUpper.substring(2).trim(); // "BY-NC" 等の抽出
                const types = typesStr.split('-');

                // ライセンス条件に応じてアイコンを追加
                types.forEach(type => {
                    const t = type.trim();
                    if (t === 'BY') licenseIcons += ccIcon('BY', 'Attribution');
                    else if (t === 'SA') licenseIcons += ccIcon('SA', 'ShareAlike');
                    else if (t === 'NC') licenseIcons += ccIcon('NC', 'NonCommercial');
                    else if (t === 'ND') licenseIcons += ccIcon('ND', 'NoDerivatives');
                });
            } else {
                licenseIcons = ` <span class="license-text">(${escapeHtml(bio.image.license)})</span>`;
            }
        }

        // sourceUrlが存在する場合はリンクにする
        const sourceUrl = sanitizeUrl(bio.image.sourceUrl);
        if (sourceUrl) {
            creditHtml = `<div class="image-credit"><a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Photo: ${authorText}</a> ${licenseIcons}</div>`;
        } else {
            creditHtml = `<div class="image-credit">Photo: ${authorText} ${licenseIcons}</div>`;
        }
    }

    let encounterHtml = '';
    if (bio.encounterSeason || bio.encounterLocation || bio.encounterProbability) {
        const tags = [];
        if (bio.encounterSeason) tags.push(`<span class="encounter-tag">${ICONS.calendar}${escapeHtml(bio.encounterSeason)}</span>`);
        if (bio.encounterLocation) tags.push(`<span class="encounter-tag">${ICONS.location}${escapeHtml(bio.encounterLocation)}</span>`);
        if (bio.encounterProbability) tags.push(`<span class="encounter-tag">${ICONS.chart}遭遇確率: ${escapeHtml(bio.encounterProbability)}</span>`);
        encounterHtml = `<div class="encounter-tags">${tags.join('')}</div>`;
    }

    let localEncounterHtml = bio.localEncounter
        ? `<h3 class="section-label">FIND / 見つけ方・遭遇場所</h3><p class="local-encounter">${escapeHtml(bio.localEncounter)}</p>`
        : '';

    let featuresHtml = (bio.features && bio.features.length > 0)
        ? `<h3 class="section-label">FEATURES / 特徴</h3><ul class="styled-list">${bio.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : '';

    let firstAidHtml = (bio.firstAid && bio.firstAid.length > 0)
        ? `<h3 class="section-label ${bio.isDanger ? 'alert' : ''}">FIRST AID / 応急処置</h3><ul class="styled-list">${bio.firstAid.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : '';
    
    let dontDoHtml = bio.dontDo ? `<div class="alert-box"><strong>⚠️ やってはいけないこと：</strong><br>${escapeHtml(bio.dontDo)}</div>` : '';

    let referencesHtml = '';
    if (bio.references && bio.references.length > 0) {
        const items = bio.references.map(ref => {
            const safeRefUrl = sanitizeUrl(ref.url);
            const safeTitle = escapeHtml(ref.title);
            const link = safeRefUrl
                ? `<a href="${safeRefUrl}" target="_blank" rel="noopener">${safeTitle}</a>`
                : safeTitle;
            const meta = [ref.author, ref.year].filter(Boolean).map(escapeHtml).join(', ');
            return `<li>${link}${meta ? `<span class="ref-meta"> — ${meta}</span>` : ''}</li>`;
        }).join('');
        referencesHtml = `
        <details class="references-details">
            <summary>参考文献</summary>
            <ul class="references-list">${items}</ul>
        </details>`;
    }

    const symbolIcon = getCitySymbol(bio.id, false);

    // iNaturalist の URL なら表示幅に応じたサイズ変種を使う
    const modalMediumUrl = getImageVariant(imgUrl, 'medium');
    const modalLargeUrl = getImageVariant(imgUrl, 'large');
    const modalSrc = modalMediumUrl || imgUrl;
    const modalSrcset = (modalMediumUrl && modalLargeUrl)
        ? ` srcset="${modalMediumUrl} 500w, ${modalLargeUrl} 1024w" sizes="(min-width: 800px) 760px, 100vw"`
        : '';

    modalBody.innerHTML = `
        <button type="button" class="modal-header-img-wrap" aria-expanded="false" aria-label="写真を全体表示に切り替え">
            <img src="${modalSrc}"${modalSrcset} alt="${escapeHtml(imgAlt)}" class="modal-header-img" width="600" height="400" decoding="async">
            <span class="zoom-hint">🔍 タップで全体表示</span>
        </button>
        ${creditHtml}
        ${badgeHtml ? `<div class="modal-badge-wrap">${badgeHtml}</div>` : ''}
        <h2 class="modal-title" id="modal-title-anchor">${escapeHtml(bio.name)}${symbolIcon}</h2>
        <dl class="modal-meta">
            <dt class="sr-only">分類</dt><dd><span class="category-tag">${escapeHtml(bio.category)}</span></dd>
            <dt class="sr-only">学名</dt><dd class="scientific-name">${escapeHtml(bio.scientificName)}</dd>
        </dl>
        ${encounterHtml}
        ${localEncounterHtml}
        ${featuresHtml}
        ${firstAidHtml}
        ${dontDoHtml}
        
       <button class="share-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            この生き物をシェアする
        </button>
        ${referencesHtml}
    `;

    attachImgFallback(modalBody.querySelector('.modal-header-img'));
    modalBody.querySelector('.share-btn').addEventListener('click', () => shareBio(bio.id, bio.name, bio.category));

    // ヘッダー写真タップで横長(cover)⇔全体表示(contain)をトグル
    const imgWrap = modalBody.querySelector('.modal-header-img-wrap');
    imgWrap.addEventListener('click', () => {
        const expanded = imgWrap.classList.toggle('expanded');
        imgWrap.setAttribute('aria-expanded', String(expanded));
        const hint = imgWrap.querySelector('.zoom-hint');
        if (hint) hint.textContent = expanded ? '🔍 タップで横長に戻す' : '🔍 タップで全体表示';
    });

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    // 背景スクロールを完全にロック（iOS Safari は overflow:hidden だけでは背面が動くため position:fixed 方式）
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    modalBody.scrollTop = 0;

    // 履歴に積んで「戻る」でモーダルを閉じられるようにする
    if (!options.skipPushState) {
        const url = `${window.location.pathname}?id=${encodeURIComponent(bio.id)}`;
        window.history.pushState({ modal: true, id: bio.id }, '', url);
    }

    // フォーカスをモーダル内へ
    setTimeout(() => { modalClose.focus(); }, 50);
}

function closeModal(options = {}) {
    if (!modal.classList.contains('active')) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    // 背景スクロールロックを解除し、退避していたスクロール位置を復元
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
    // history からモーダル状態を取り除く
    if (!options.skipHistory && window.history.state && window.history.state.modal) {
        window.history.back();
    } else if (!options.skipHistory) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
}

// 「戻る」でモーダルが開いていれば閉じる
window.addEventListener('popstate', () => {
    if (modal.classList.contains('active')) {
        closeModal({ skipHistory: true });
    }
});

// Esc キーで閉じる + 簡易フォーカストラップ
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
    }
    if (e.key === 'Tab') {
        const focusables = modalContent.querySelectorAll(
            'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ==========================================
// シェアAPI
// ==========================================
function shareBio(id, name, category) {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?id=${encodeURIComponent(id)}`;

    if (navigator.share) {
        navigator.share({
            title: `ちがビオ - ${name}`,
            text: `茅ヶ崎の生き物「${name} (${category})」をチェック！`,
            url: shareUrl,
        }).catch(() => { /* ユーザーキャンセル等は無視 */ });
    } else if (navigator.clipboard) {
        const text = `ちがビオ - ${name} ${shareUrl}`;
        navigator.clipboard.writeText(text)
            .then(() => showToast("リンクをコピーしました"))
            .catch(() => showToast("コピーに失敗しました"));
    } else {
        showToast("シェア機能に対応していません");
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
        navigator.serviceWorker.register('./sw.js').catch(() => { /* 失敗時は静かに無視 */ });
    });
}
