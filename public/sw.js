const cacheName = 'v1';

// Call Install Event
self.addEventListener('install', (e) => {
    console.debug('Service Worker: Installed');
});

// Call Activate Event
self.addEventListener('activate', (e) => {
    console.debug('Service Worker: Activated');
});

// 这段代码是从MDN上Copy下来的, 可以工作
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (resp) {
            return resp || fetch(event.request).then(function (response) {
                return caches.open(cacheName).then(function (cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
