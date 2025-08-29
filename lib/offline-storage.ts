export interface OfflineData {
  id: string
  type: "task" | "asset" | "booking"
  data: any
  timestamp: number
  synced: boolean
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager
  private db: IDBDatabase | null = null
  private readonly DB_NAME = "BestAdultingDB"
  private readonly DB_VERSION = 1

  private constructor() {}

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager()
    }
    return OfflineStorageManager.instance
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores for different data types
        if (!db.objectStoreNames.contains("pendingTasks")) {
          db.createObjectStore("pendingTasks", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("pendingAssets")) {
          db.createObjectStore("pendingAssets", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("pendingBookings")) {
          db.createObjectStore("pendingBookings", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("cachedData")) {
          const store = db.createObjectStore("cachedData", { keyPath: "key" })
          store.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  async storeForSync(type: "task" | "asset" | "booking", data: any): Promise<void> {
    if (!this.db) await this.initialize()

    const storeName = `pending${type.charAt(0).toUpperCase() + type.slice(1)}s`
    const item = {
      id: data.id || crypto.randomUUID(),
      ...data,
      timestamp: Date.now(),
      synced: false,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => {
        console.log(`[OfflineStorage] Stored ${type} for sync:`, item.id)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingSync(type: "task" | "asset" | "booking"): Promise<any[]> {
    if (!this.db) await this.initialize()

    const storeName = `pending${type.charAt(0).toUpperCase() + type.slice(1)}s`

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async cacheData(key: string, data: any, ttl = 3600000): Promise<void> {
    if (!this.db) await this.initialize()

    const item = {
      key,
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readwrite")
      const store = transaction.objectStore("cachedData")
      const request = store.put(item)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readonly")
      const store = transaction.objectStore("cachedData")
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }

        // Check if data has expired
        if (Date.now() > result.expires) {
          this.removeCachedData(key)
          resolve(null)
          return
        }

        resolve(result.data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async removeCachedData(key: string): Promise<void> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readwrite")
      const store = transaction.objectStore("cachedData")
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.initialize()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readwrite")
      const store = transaction.objectStore("cachedData")
      const index = store.index("timestamp")
      const request = index.openCursor()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const item = cursor.value
          if (Date.now() > item.expires) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async requestBackgroundSync(tag: string): Promise<void> {
    if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(tag)
        console.log(`[OfflineStorage] Background sync requested: ${tag}`)
      } catch (error) {
        console.error("[OfflineStorage] Background sync registration failed:", error)
      }
    }
  }
}

export const offlineStorage = OfflineStorageManager.getInstance()
