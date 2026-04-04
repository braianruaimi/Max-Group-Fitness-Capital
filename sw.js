const CACHE_NAME = "max-group-fitness-shell-v21";
const APP_SHELL = [
    "./",
    "./index.html",
    "./styles.css",
    "./script.js",
    "./manifest.webmanifest",
    "./background-atmosphere.webp",
    "./og-gold-share.png",
    "./assets/activos/maquinaria-ultima-generacion.jpg",
    "./assets/activos/stock-carniceria-y-tiendas.jpg",
    "./assets/activos/infraestructura-sedes.jpg",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon-180.png",
    "./icon-192.svg",
    "./icon-512.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const cacheKeys = await caches.keys();

        await Promise.all(
            cacheKeys
                .filter((cacheKey) => cacheKey !== CACHE_NAME)
                .map((cacheKey) => caches.delete(cacheKey))
        );

        await self.clients.claim();
    })());
});

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(request);
                const cache = await caches.open(CACHE_NAME);
                cache.put("./index.html", networkResponse.clone());
                return networkResponse;
            } catch {
                return (await caches.match("./index.html")) || caches.match("./");
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            event.waitUntil((async () => {
                try {
                    const refreshResponse = await fetch(request);
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, refreshResponse.clone());
                } catch {
                    return;
                }
            })());

            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    })());
});