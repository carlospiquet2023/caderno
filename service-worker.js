/**
 * Service Worker - Advanced PWA Implementation
 * Version: 2.0.0
 * @description Enhanced service worker with advanced caching strategies
 */

const VERSION = '2.0.0';
const CACHE_PREFIX = 'caderno-digital';
const CACHE_STATIC = `${CACHE_PREFIX}-static-v${VERSION}`;
const CACHE_DYNAMIC = `${CACHE_PREFIX}-dynamic-v${VERSION}`;
const CACHE_IMAGES = `${CACHE_PREFIX}-images-v${VERSION}`;
const CACHE_FONTS = `${CACHE_PREFIX}-fonts-v${VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

// CDN resources
const CDN_RESOURCES = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&family=Dancing+Script:wght@500&family=Caveat&family=Inter:wght@400;500;600;700&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cadernos') {
    event.waitUntil(syncCadernos());
  }
});

async function syncCadernos() {
  // Função para sincronização futura (pode ser expandida para sync com servidor)
  console.log('Sincronizando cadernos...');
}
