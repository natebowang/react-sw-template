// if this version changed, all previous cache in user's computer will be deleted
// equivalent to reinstall the whole website, html, js, api data ...
const cacheVersion = 'v1';

// Callback after sw installed
self.addEventListener('install', (event) => {
    console.debug('SW installed');

    // cache all static assets manually,
    // since these files were download before sw get installed
    event.waitUntil(
        caches.open(cacheVersion).then(
            (cache) => {
                // 1st option for service worker,
                // webpackGeneratedAssets will be defined during webpack process
                console.debug('Generated Assets: ' + webpackGeneratedAssets);
                // 2nd option for service worker
                // console.debug(serviceWorkerOption);
                return cache.addAll(webpackGeneratedAssets);
                // todo: delete old file
            }
        )
    );
});

// Callback after sw activated, and before your first fetch event,
// so delete caches here.
self.addEventListener('activate', (event) => {
    console.debug('SW Activated');
    event.waitUntil(
        caches.keys().then(
            (keyList) => {
                return Promise.all(keyList.map(
                    (key) => {
                        // only keep cacheVersion, delete all other caches
                        if (key !== cacheVersion) {
                            return caches.delete(key);
                        }
                    }
                ));
            }
        )
    );
});

// Callback on each fetch Event
self.addEventListener('fetch', (event) => {
    // todo: filter sw.js
    event.respondWith(
        caches.match(event.request)
            .then(resp => resp || fetch(event.request)
                .then(response => caches.open(cacheVersion)
                    .then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    }))),
    );
});
