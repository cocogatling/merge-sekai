const CACHE_NAME = "merge-sekai-v2";
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
  "./Asset/Sparkle.gif",
  "./Asset/Kanade_1.png",
  "./Asset/Kanade_2.png",
  "./Asset/Kanade_3.png",
  "./Asset/Kanade_4.png",
  "./Asset/Kanade_4_Sleep.png",
  "./Asset/Mafuyu_1.png",
  "./Asset/Mafuyu_2.png",
  "./Asset/Mafuyu_3.png",
  "./Asset/Mafuyu_4.png",
  "./Asset/Mafuyu_4_Sleep.png",
  "./Asset/Ena_1.png",
  "./Asset/Ena_2.png",
  "./Asset/Ena_3.png",
  "./Asset/Ena_4.png",
  "./Asset/Ena_4_Sleep.png",
  "./Asset/Mizuki_1.png",
  "./Asset/Mizuki_2.png",
  "./Asset/Mizuki_3.png",
  "./Asset/Mizuki_4.png",
  "./Asset/Mizuki_4_Sleep.png",
  "./Asset/Coin_1.png",
  "./Asset/Coin_2.png",
  "./Asset/Coin_3.png",
  "./Asset/Coin_4.png",
  "./Asset/Coin_5.png",
  "./Asset/Coin_6.png",
  "./Asset/chr_il/chr_il_17.png",
  "./Asset/chr_il/chr_il_18.png",
  "./Asset/chr_il/chr_il_19.png",
  "./Asset/chr_il/chr_il_20.png"
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
