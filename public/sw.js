const CACHE_NAME = "best-adulting-v1"
const STATIC_CACHE = "best-adulting-static-v1"
const DYNAMIC_CACHE = "best-adulting-dynamic-v1"
const API_CACHE = "best-adulting-api-v1"

const urlsToCache = ["/", "/dashboard", "/assets", "/tasks", "/booking", "/price-compare", "/profile", "/manifest.json"]

const staticAssets = [
  "/",
  "/dashboard",
  "/assets",
  "/tasks",
  "/booking",
  "/price-compare",
  "/profile",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
]

const apiEndpoints = ["/api/assets", "/api/tasks", "/api/bookings", "/api/products"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(staticAssets)),
      caches.open(DYNAMIC_CACHE).then(() => console.log("Dynamic cache ready")),
      caches.open(API_CACHE).then(() => console.log("API cache ready")),
    ]),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets with cache-first strategy
  if (staticAssets.some((asset) => url.pathname === asset)) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Handle dynamic content with stale-while-revalidate
  event.respondWith(handleDynamicRequest(request))
})

async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline fallback for critical endpoints
    if (request.url.includes("/api/tasks") || request.url.includes("/api/assets")) {
      return new Response(
        JSON.stringify({
          offline: true,
          data: [],
          message: "Offline - showing cached data",
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    throw error
  }
}

async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/")
    }
    throw error
  }
}

async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => cachedResponse)

  return cachedResponse || fetchPromise
}

self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks())
  } else if (event.tag === "sync-assets") {
    event.waitUntil(syncAssets())
  } else if (event.tag === "sync-bookings") {
    event.waitUntil(syncBookings())
  }
})

async function syncTasks() {
  try {
    const pendingTasks = await getFromIndexedDB("pendingTasks")

    for (const task of pendingTasks) {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        })

        if (response.ok) {
          await removeFromIndexedDB("pendingTasks", task.id)
          console.log("[SW] Task synced successfully:", task.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync task:", task.id, error)
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed for tasks:", error)
  }
}

async function syncAssets() {
  try {
    const pendingAssets = await getFromIndexedDB("pendingAssets")

    for (const asset of pendingAssets) {
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(asset),
        })

        if (response.ok) {
          await removeFromIndexedDB("pendingAssets", asset.id)
          console.log("[SW] Asset synced successfully:", asset.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync asset:", asset.id, error)
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed for assets:", error)
  }
}

async function syncBookings() {
  try {
    const pendingBookings = await getFromIndexedDB("pendingBookings")

    for (const booking of pendingBookings) {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(booking),
        })

        if (response.ok) {
          await removeFromIndexedDB("pendingBookings", booking.id)
          console.log("[SW] Booking synced successfully:", booking.id)
        }
      } catch (error) {
        console.error("[SW] Failed to sync booking:", booking.id, error)
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed for bookings:", error)
  }
}

async function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BestAdultingDB", 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const getAllRequest = store.getAll()

      getAllRequest.onsuccess = () => resolve(getAllRequest.result || [])
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" })
      }
    }
  })
}

async function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BestAdultingDB", 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const deleteRequest = store.delete(id)

      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: "You have new household updates!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icon-192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192.png",
      },
    ],
  }

  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.title = data.title || "Best Adulting"
    options.data = { ...options.data, ...data }
  }

  event.waitUntil(self.registration.showNotification("Best Adulting", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    // Open the app to relevant page
    event.waitUntil(clients.openWindow("/dashboard"))
  } else if (event.action === "close") {
    // Just close the notification
    return
  } else {
    // Default action - open dashboard
    event.waitUntil(clients.openWindow("/dashboard"))
  }
})
