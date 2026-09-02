const CACHE_VERSION = 'v1.7.0';
const STATIC_CACHE_NAME = `chiga-bio-static-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `chiga-bio-image-${CACHE_VERSION}`;
const MAX_IMAGE_CACHE = 150;

// App Shell（個別ページ直アクセスのオフラインフォールバック先）
const APP_SHELL = './index.html';

const PRECACHE_URLS = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './list.json',
    './site.webmanifest'
];

// インストール：基本ファイルをプリキャッシュ
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
});

// アクティベート：旧バージョンのキャッシュを削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            )
        ).then(() => self.clients.claim())
    );
});

// フェッチ：リソース種別ごとにキャッシュ戦略を振り分け
self.addEventListener('fetch', (event) => {
    // GET 以外は素通し
    if (event.request.method !== 'GET') return;

    // ページ遷移（HTML文書）：Network First。オフライン時は該当ページ→App Shell の順でフォールバック。
    // これにより /species/{id}/ への直アクセスがオフラインでも App Shell が起動し、
    // クライアントJSが URL から id を判別してキャッシュ済み species/{id}.json で描画できる。
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                }
                return networkResponse;
            }).catch(async () => {
                const cached = await caches.match(event.request);
                return cached || await caches.match(APP_SHELL) || Response.error();
            })
        );
        return;
    }

    const requestUrl = new URL(event.request.url);

    // 画像（Cache First：爆速化＆通信量節約）
    if (
        requestUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i) ||
        requestUrl.hostname.includes('inaturalist')
    ) {
        event.respondWith(
            // 画像は画像キャッシュだけを見る（他キャッシュへの誤ヒットを避ける）
            caches.open(IMAGE_CACHE_NAME).then((cache) => cache.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse) return networkResponse;
                    // iNaturalist の画像は <img> 経由の no-cors 取得となり type='opaque'（status=0）で返る。
                    // opaque を弾くと外部画像が一切キャッシュされないため、明示的に許可する。
                    const isOpaque = networkResponse.type === 'opaque';
                    const isCacheable = isOpaque
                        || ((networkResponse.type === 'basic' || networkResponse.type === 'cors')
                            && networkResponse.status === 200);
                    if (!isCacheable) return networkResponse;
                    const responseToCache = networkResponse.clone();
                    cache.put(event.request, responseToCache)
                        .then(() => limitCacheSize(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE))
                        .catch(() => { /* 容量超過等は無視（表示は継続） */ });
                    return networkResponse;
                }).catch(() => new Response('', { status: 504, statusText: 'offline' }));
            }))
        );
        return;
    }

    // サードパーティ（CDN/フォント）はSWで触らずブラウザ標準キャッシュに任せる
    if (requestUrl.origin !== self.location.origin) return;

    // HTML/CSS/JS/JSON（Network First：常に最新を優先）
    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
                const responseToCache = networkResponse.clone();
                caches.open(STATIC_CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
        }).catch(() => caches.match(event.request))
    );
});

// キャッシュ容量制限（上限超過時に古いものから削除）
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    // 超過分をまとめて古い順（挿入順）に削除する
    for (const key of keys.slice(0, Math.max(0, keys.length - maxItems))) {
        await cache.delete(key);
    }
}
