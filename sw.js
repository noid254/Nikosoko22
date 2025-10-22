const CACHE_NAME = 'niko-soko-cache-v1';
// This list should include all the static assets that make up the app shell.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/services/api.ts',
  '/services/mockData.ts',
  // Components
  '/components/AddServiceCardView.tsx',
  '/components/AuthModal.tsx',
  '/components/BookingModal.tsx',
  '/components/BottomNav.tsx',
  '/components/BusinessAssets.tsx',
  '/components/CatalogueItemDetailModal.tsx',
  '/components/CatalogueView.tsx',
  '/components/DocumentDetailView.tsx',
  '/components/EventsPage.tsx',
  '/components/GatePass.tsx',
  '/components/InboxView.tsx',
  '/components/InvoiceGenerator.tsx',
  '/components/InvoiceHub.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/MyDocumentsView.tsx',
  '/components/MyTicketsView.tsx',
  '/components/NotificationModal.tsx',
  '/components/ProfileView.tsx',
  '/components/QuoteGenerator.tsx',
  '/components/RatingModal.tsx',
  '/components/ReceiptGenerator.tsx',
  '/components/ScanDocumentView.tsx',
  '/components/SearchPage.tsx',
  '/components/ServiceCard.tsx',
  '/components/SuperAdminDashboard.tsx',
  '/components/admin/AnalyticsPage.tsx',
  '/components/admin/AppearancePage.tsx',
  '/components/admin/BroadcastPage.tsx',
  '/components/admin/CategoriesPage.tsx',
  '/components/admin/DashboardPage.tsx',
  '/components/admin/OrganizationsPage.tsx',
  '/components/admin/UsersPage.tsx',
  // External assets - Caching these can be tricky, but we'll try
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Using { cache: 'reload' } to ensure we get fresh versions from the network during installation.
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests).catch(err => {
            console.error('Failed to cache all URLs:', err);
            // Even if some CDN scripts fail, we proceed.
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return response from cache if found.
        const fetchPromise = fetch(event.request).then(networkResponse => {
            // Update the cache with the new version.
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
        });

        // Stale-while-revalidate: return cached version immediately, then update cache.
        return response || fetchPromise;
      });
    })
  );
});
