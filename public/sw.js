// Service Worker for Portfolio Caching
const CACHE_NAME = 'portfolio-cache-v1';
const STATIC_CACHE = 'portfolio-static-v1';
const DYNAMIC_CACHE = 'portfolio-dynamic-v1';
const API_CACHE = 'portfolio-api-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/fonts/jetbrains-mono.woff2',
  '/fonts/space-mono.woff2'
];

// API endpoints to cache with different strategies
const API_ENDPOINTS = [
  'https://api.github.com/users',
  'https://api.github.com/repos'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Configuration
const CONFIG = {
  maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
  maxApiCacheAge: 10 * 60 * 1000,   // 10 minutes
  maxCacheSize: 50,                  // Maximum number of cached items
  enableOfflineMode: true,
  enableBackgroundSync: true
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - intercept network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;
  
  // Determine caching strategy based on request type
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PRELOAD_RESOURCES':
      preloadResources(payload.urls).then(() => {
        event.ports[0].postMessage({ type: 'RESOURCES_PRELOADED' });
      });
      break;
  }
});

// Helper Functions

function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.css', '.js', '.woff2', '.woff', '.png', '.jpg', '.svg', '.webp', '.avif'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

function isApiRequest(request) {
  return API_ENDPOINTS.some(endpoint => request.url.includes(endpoint));
}

function isPageRequest(request) {
  const url = new URL(request.url);
  return request.headers.get('Accept')?.includes('text/html') || 
         url.pathname === '/' || 
         url.pathname.endsWith('/');
}

async function handleStaticAsset(request) {
  try {
    // Cache first strategy for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[SW] Static asset request failed:', error);
    
    // Try to serve from cache even if expired
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('Accept')?.includes('text/html')) {
      return createOfflinePage();
    }
    
    throw error;
  }
}

async function handleApiRequest(request) {
  try {
    // Stale-while-revalidate strategy for API requests
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(async response => {
      if (response.ok) {
        const cache = await caches.open(API_CACHE);
        await cache.put(request, response.clone());
        await cleanupCache(API_CACHE, CONFIG.maxCacheSize);
      }
      return response;
    });
    
    // Return cached version immediately if available
    if (cachedResponse && !isApiExpired(cachedResponse)) {
      // Update cache in background
      fetchPromise.catch(error => {
        console.warn('[SW] Background API update failed:', error);
      });
      
      return cachedResponse;
    }
    
    // Wait for network response
    return await fetchPromise;
    
  } catch (error) {
    console.error('[SW] API request failed:', error);
    
    // Return cached version as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePageRequest(request) {
  try {
    // Network first strategy for pages
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
      await cleanupCache(DYNAMIC_CACHE, CONFIG.maxCacheSize);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[SW] Page request failed:', error);
    
    // Try cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return createOfflinePage();
  }
}

async function handleDynamicRequest(request) {
  try {
    // Network first with cache fallback
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

function isExpired(response) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const date = new Date(dateHeader);
  const now = new Date();
  return (now - date) > CONFIG.maxCacheAge;
}

function isApiExpired(response) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const date = new Date(dateHeader);
  const now = new Date();
  return (now - date) > CONFIG.maxApiCacheAge;
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  return Promise.all(
    cacheNames
      .filter(cacheName => !validCaches.includes(cacheName))
      .map(cacheName => {
        console.log('[SW] Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      })
  );
}

async function cleanupCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  if (requests.length <= maxSize) return;
  
  // Remove oldest entries
  const sortedRequests = await Promise.all(
    requests.map(async request => {
      const response = await cache.match(request);
      const date = response.headers.get('date');
      return { request, date: date ? new Date(date) : new Date(0) };
    })
  );
  
  sortedRequests
    .sort((a, b) => a.date - b.date)
    .slice(0, requests.length - maxSize)
    .forEach(({ request }) => cache.delete(request));
}

function createOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - Portfolio</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'JetBrains Mono', monospace;
          background: #0a0a0a;
          color: #00ff41;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 2rem;
        }
        h1 { color: #ff4444; }
        .ascii {
          font-size: 12px;
          line-height: 1;
          margin: 1rem 0;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Connection Lost</h1>
        <div class="ascii">
          ┌─────────────────┐<br>
          │ [!] OFFLINE     │<br>
          │                 │<br>
          │ Please check    │<br>
          │ your network    │<br>
          └─────────────────┘
        </div>
        <p>You're currently offline. Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()" style="
          background: transparent;
          border: 1px solid #00ff41;
          color: #00ff41;
          padding: 0.5rem 1rem;
          font-family: inherit;
          cursor: pointer;
        ">Retry</button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function preloadResources(urls) {
  const cache = await caches.open(STATIC_CACHE);
  return Promise.all(
    urls.map(async url => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn('[SW] Failed to preload resource:', url, error);
      }
    })
  );
}

async function doBackgroundSync() {
  // Handle any queued requests from when the user was offline
  console.log('[SW] Performing background sync');
  
  // This would typically retry failed requests stored in IndexedDB
  // For now, just log that sync is happening
}

console.log('[SW] Service Worker script loaded');