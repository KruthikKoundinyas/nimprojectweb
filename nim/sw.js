var CACHE_NAME = 'nimlab-v1';
var ASSETS = [
  './',
  './index.html',
  './one-player.html',
  './two-player.html',
  './learn.html',
  './compare.html',
  './css/styles.css',
  './js/ai.js',
  './js/game-core.js',
  './js/one-player.js',
  './js/two-player.js',
  './js/bg-animation.js',
  './assets/audio/buttonPressSound.mp3',
  './assets/images/nim-Game.png',
  './assets/images/og-image.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
