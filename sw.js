const CACHE_NAME = "merge-sekai-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa-icon.svg",
  "./Asset/Black_Tile.png",
  "./Asset/White_Tile.png",
  "./Asset/Black_Tile_Ortho.png",
  "./Asset/White_Tile_Ortho.png",
  "./Asset/Cloud_Lock.png",
  "./Asset/Cloud_Lock_Ortho.png",
  "./Asset/box.png",
  "./Asset/EXP_Note.png",
  "./Asset/timer.png",
  "./Asset/Sparkle.gif"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((response) => {
        const isAsset = url.pathname.includes("/Asset/") || url.pathname.endsWith(".svg");
        if (response.ok && isAsset) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
