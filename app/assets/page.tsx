import Link from "next/link"
import { getAssetsForCurrentUser } from "@/lib/supabase/queries"

export default async function AssetsPage() {
  const assets = await getAssetsForCurrentUser()
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assets</h1>
        <Link href="/assets/new" className="rounded-md bg-indigo-600 text-white px-4 py-2">
          Add Asset
        </Link>
      </div>
      <ul className="divide-y">
        {assets?.map((a) => (
          <li key={a.id} className="py-3">
            <div className="font-medium">{a.name}</div>
            <div className="text-sm text-gray-500">
              {a.room} · {a.brand} {a.model}
            </div>
          </li>
        )) ?? <li>No assets yet.</li>}
      </ul>
    </div>
  )
}
