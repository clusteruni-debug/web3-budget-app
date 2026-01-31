const CACHE_NAME = 'web3-budget-v1';
const OFFLINE_URL = '/offline.html';

// 캐시할 정적 자산
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html'
];

// 설치 시 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('캐시 열기');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 시 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  // API 요청은 항상 네트워크로
  if (event.request.url.includes('/rest/') ||
      event.request.url.includes('supabase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 캐시에 있으면 캐시 반환, 동시에 네트워크에서 업데이트
      if (cachedResponse) {
        // 백그라운드에서 캐시 업데이트
        event.waitUntil(
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // 캐시에 없으면 네트워크 요청
      return fetch(event.request).then((response) => {
        // 유효한 응답이면 캐시에 저장
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // 오프라인이고 HTML 요청이면 오프라인 페이지 표시
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
