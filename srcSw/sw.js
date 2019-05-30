// cacheVersion will be defined during webpack process
// if this version changed, all previous cache in user's computer will be deleted
// equivalent to reinstall the whole website, html, js, api data ...
// const cacheVersion = '20190427-101228';

// webpackGeneratedAssets will be defined during webpack process
// webpackGeneratedAssets = [
//     "index.html",
//     "main.42699f25ca777acba31c.js",
//     "node_modules.96d8210722c3f2675ea9.js",
//     "static/icon/16x16.c92b85a5b907c70211f4.ico",
//     "pwa-manifest.json"
// ];

// Support import your own module
// import util from './util';
import choosePolicy from "./swPolicy";

// *DO NOT* support import module from node, may be because
// the generation of webpackGeneratedAssets and cacheVersion.
// If you accidentally import module from node, this sw.js will
// not run, means all listeners will not be attached.
// import * as R from 'ramda';

// Callback after sw installed
self.addEventListener('install', (event) => {
    console.debug('SW installed');

    // 1st option for service worker,
    console.debug('Generated Assets: ' + webpackGeneratedAssets);
    // 2nd option for service worker
    // console.debug(serviceWorkerOption);

    // cache all static assets manually,
    // since these files were download before sw get installed
    event.waitUntil(
        caches.open(cacheVersion).then(
            (cache) => {
                return cache.addAll(webpackGeneratedAssets);
            }
        )
    );
    // try to delete stale asset, but would be too complicated.
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
    if (event.request.method !== 'GET') return;
    event.respondWith(
        choosePolicy(event.request, cacheVersion)
    );
});
