const cacheName = 'v1';

// Call Install Event
self.addEventListener('install', (e) => {
    console.debug('Service Worker: Installed');
});

// Call Activate Event
self.addEventListener('activate', (e) => {
    console.debug('Service Worker: Activated');
});

// Call Fetch Event
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
