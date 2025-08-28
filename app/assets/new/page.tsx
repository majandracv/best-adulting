"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAsset } from "@/lib/actions/assets"

export default function NewAssetPage() {
  const r = useRouter()
  const [form, setForm] = useState({ name: "", room: "", brand: "", model: "" })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    const res = await createAsset(form)
    setLoading(false)
    if (res.ok) {
      r.push("/assets")
    } else {
      setErr(res.error ?? "Failed to create asset")
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Add Asset</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="name"
          placeholder="Name (e.g., Fridge)"
          className="border rounded px-3 py-2 w-full"
          value={form.name}
          onChange={onChange}
          required
        />
        <input
          name="room"
          placeholder="Room (e.g., Kitchen)"
          className="border rounded px-3 py-2 w-full"
          value={form.room}
          onChange={onChange}
        />
        <input
          name="brand"
          placeholder="Brand"
          className="border rounded px-3 py-2 w-full"
          value={form.brand}
          onChange={onChange}
        />
        <input
          name="model"
          placeholder="Model"
          className="border rounded px-3 py-2 w-full"
          value={form.model}
          onChange={onChange}
        />

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 text-white px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  )
}
