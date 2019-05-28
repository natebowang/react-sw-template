import {not200} from "../srcUtil/not200";

// 1. search cache first
// 2. if found, return response.
// 3. If NOT cached(undefined), fetch request.
// 4. if 200, return response and put to cache.
// 5. If not 200 or failed to fetch, throw error.
// example: /immutable/*
export const cacheFirst = () => {
};

// 1. fetch request first
// 2. todo: if 200, put to cache. if not 200, throw error. try to delete cache.
// 3. if failed to fetch, use cached assets
// 4. if no cache(undefined), throw error.
// example: / /index.html /sw.js /pwa-manifest.json
export const networkFirst = (request, cacheVersion) => {
    return fetch(request)
        .catch(error => {
            console.warn(error + '. returning offline page ' + request.url + ' instead.');
            return caches
                .open(cacheVersion)
                .then(cache => cache.match(request))
                .then(resp => {
                    if (resp === undefined) {
                        throw new Error('Failed to fetch, and no cache');
                    } else {
                        return resp;
                    }
                })
        })
};

// 1. search cache and fetch simultaneously
// 2. return cached of fetched response which is faster(probably cached).
// 3. If cached, and fetched response
// 3a. is 200, update cache.
// 3b. is not 200, throw error. try to delete cache.
// 3c. if failed to fetch, do nothing.
// 4. If NOT cached, and fetched response
// 4a. is 200, update cache.
// 4b. is not 200 or failed to fetch, throw error.
// example: /api/*
export const cacheFirstAndRevalidate = () => {
};



