
// 1. search cache first
// 2. if found, return response.
// 3. If NOT cached(undefined), fetch request.
// 4. if 200, return response and put to cache.
// 5. If not 200 or failed to fetch, throw error.
// example: /immutable/*
export const cacheFirst = () => {
};

// example: / /index.html /sw.js /pwa-manifest.json
export const networkFirst = (request, cacheVersion) => {
    const putIf200ThrowAndDeleteIfNot200 = cacheVersion => request => response => {
        if (response.status === 200) {
            console.debug(`Put 200 resp: ${request.url}`);
            return caches.open(cacheVersion)
                .then(cache => {
                    cache.put(request, response.clone());
                    return response;
                });
        } else {
            console.debug(`Delete non 200 resp: ${response.status} for ${request.url}`);
            caches.open(cacheVersion)
                .then(cache => {
                    cache.delete(request);
                });
            throw new Error(response.status + response.statusText);
        }
    };

    // 1. fetch request first
    return fetch(request)
    // 2. if 200, put to cache. if not 200, throw error. try to delete cache.
        .then(putIf200ThrowAndDeleteIfNot200(cacheVersion)(request))
        .catch(error => {
            console.warn(`${error} for ${request.url}. Try offline page instead.`);
            return caches
                .open(cacheVersion)
                // 3. if failed to fetch, use cached assets
                .then(cache => cache.match(request))
                .then(resp => {
                    // 4. if no cache(undefined), throw error.
                    if (resp === undefined) {
                        // todo: return a rejected promise
                        throw new Error(`${error} for ${request.url}. And not cached.`);
                    } else {
                        return resp;
                    }
                })
        });
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



