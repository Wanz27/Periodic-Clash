const CACHE_NAME = 'periodic-clash-v1';
const ASSETS = ['/', '/index.html', '/src/main.jsx', '/src/MainMenu.css'];


self.addEventListener('install', (e) => {
e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});


self.addEventListener('fetch', (e) => {
e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});