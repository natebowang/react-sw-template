// choose policy
export default (request, cacheVersion) => {
    let pathname = new URL(request.url).pathname;
    switch (true) {
        case ['/sw.js'].includes(pathname):
            return networkOnly(request).catch(error => {
                console.error('Policy networkOnly failed. ' + error)
            });
        case ['/', '/pwa-manifest.json'].includes(pathname):
            return networkFirst(request, cacheVersion).catch(error => {
                console.error('Policy networkFirst failed. ' + error)
            });
        case /^\/immutable\//.test(pathname):
            return cacheFirst(request, cacheVersion).catch(error => {
                console.error('Policy cacheFirst failed. ' + error)
            });
        case /^\/api\//.test(pathname):
            return cacheFetchRaceFinallyRenew(request, cacheVersion).catch(error => {
                console.error('Policy cacheFetchRaceFinallyRenew failed. ' + error)
            });
    }
};

// example: /sw.js
// cache-control: no-cache, no-store, max-age=0, must-revalidate
export const networkOnly = (request) => {
    return fetch(request)
        .then(throwIfNot200)
        // If not 200 or failed to fetch, reject promise.
        .catch(error => {
            return Promise.reject(
                new Error(`Fetch failed (${error} for ${request.url}).`)
            );
        });
};

// example: / /pwa-manifest.json
// cache-control: no-cache, no-store, max-age=0, must-revalidate
export const networkFirst = (request, cacheVersion) => {
    // 1. fetch request first
    return fetch(request)
    // 2. if 200, put to cache. if not 200, throw error. try to delete cache.
        .then(putIf200ThrowAndDeleteIfNot200(cacheVersion)(request))
        .catch(error => {
            console.warn(`${error} for ${request.url}. Try offline page instead.`);
            return caches.open(cacheVersion)
            // 3. if failed to fetch, use cached assets
                .then(cache => cache.match(request))
                .then(cachedResp => {
                    // 4. if no cache(undefined), reject promise.
                    if (cachedResp !== undefined) {
                        return cachedResp;
                    } else {
                        return Promise.reject(
                            new Error(`Fetch failed (${error} for ${request.url}). And not cached.`)
                        );
                    }
                })
        });
};

// example: /immutable/*
// Cache-Control: public, max-age=31536000, immutable
export const cacheFirst = (request, cacheVersion) => {
    // 1. search cache first
    return caches.open(cacheVersion)
        .then(cache => cache.match(request))
        .then(cachedResp => {
            if (cachedResp !== undefined) {
                // 2. if found, return response.
                return cachedResp;
            } else {
                // 3. If NOT cached(undefined), fetch request.
                return fetch(request)
                // 4. if 200, return response and put to cache.
                    .then(putIf200ThrowAndDeleteIfNot200(cacheVersion)(request))
                    // 5. If not 200 or failed to fetch, reject promise.
                    .catch(error => {
                        return Promise.reject(
                            new Error(`Not cached and fetch failed (${error} for ${request.url}).`)
                        );
                    })
            }
        })
};

// example: /api/*
// Cache-Control: public, max-age=3600, must-revalidate
export const cacheFetchRaceFinallyRenew = (request, cacheVersion) => {
    let fetchedResp = fetch(request)
    // 2. If fetched response is 200, update cache.
        .then(putIf200ThrowAndDeleteIfNot200(cacheVersion)(request))
        // 3. If fetched response is not 200 or failed to fetch,
        //    reject promise. try to delete cache.
        .catch(error => {
            return Promise.reject(
                new Error(`Not cached and fetch failed (${error} for ${request.url}).`)
            );
        });

    // 1. Return cached of fetched response which is faster(probably cached).
    return caches.open(cacheVersion)
        .then(cache => cache.match(request))
        .then(cachedResp => {
            if (cachedResp !== undefined) {
                return cachedResp;
            } else {
                return fetchedResp;
            }
        });
};

const throwIfNot200 = response => {
    if (response.status === 200) {
        return response;
    } else {
        throw new Error(response.status + ' ' + response.statusText);
    }
};

const putIf200ThrowAndDeleteIfNot200 = cacheVersion => request => response => {
    if (response.status === 200) {
        console.debug(`Put 200 response: ${request.url}`);
        return caches.open(cacheVersion)
            .then(cache => {
                cache.put(request, response.clone());
                return response;
            });
    } else {
        console.debug(`Delete non 200 response: ${response.status} for ${request.url}`);
        caches.open(cacheVersion)
            .then(cache => {
                cache.delete(request);
            });
        throw new Error(response.status + ' ' + response.statusText);
    }
};
