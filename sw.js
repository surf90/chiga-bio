const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE_NAME = `chiga-bio-static-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `chiga-bio-image-${CACHE_VERSION}`;
const MAX_IMAGE_CACHE = 100;

const PRECACHE_URLS = [
    './',
    './index.html',
    './css/style.css',
    './js/script.js',
    './data/bio-data.json',
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
    const requestUrl = new URL(event.request.url);

    // 画像（Cache First：爆速化＆通信量節約）
    if (
        requestUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif)$/) ||
        requestUrl.hostname.includes('inaturalist')
    ) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(event.request).then((networkResponse) => {
                    if (
                        !networkResponse ||
                        networkResponse.status !== 200 ||
                        (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')
                    ) {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(IMAGE_CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                        limitCacheSize(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE);
                    });
                    return networkResponse;
                }).catch(() => new Response(''));
            })
        );
        return;
    }

    // HTML/CSS/JS/JSON（Network First：常に最新を優先）
    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
            return networkResponse;
        }).catch(() => caches.match(event.request))
    );
});

// キャッシュ容量制限（上限超過時に古いものから削除）
function limitCacheSize(cacheName, maxItems) {
    caches.open(cacheName).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > maxItems) {
                cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems));
            }
        });
    });
}
