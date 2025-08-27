"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-aqua/10 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-indigo/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-indigo font-heading mb-4">You're Offline</h1>
        <p className="text-indigo/70 mb-6">
          Best Adulting needs an internet connection to sync your household data. Please check your connection and try
          again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo hover:bg-indigo/90 text-white px-6 py-2 rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
