const cacheName = 'v1';

// 2st option for service worker
// console.log(serviceWorkerOption);

// Call Install Event
self.addEventListener('install', (e) => {
    console.debug('Service Worker: Installed');
});

// Call Activate Event
self.addEventListener('activate', (e) => {
    console.debug('Service Worker: Activated');
});

// Call Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(response => caches.open(cacheName).then((cache) => {
        cache.put(event.request, response.clone());
return response;
}))),
);
});
