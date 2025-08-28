"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAsset } from "@/lib/actions/assets"

export default function NewAssetPage() {
  const r = useRouter()
  const [form, setForm] = useState({ name: "", room: "", brand: "", model: "" })
  const onChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = async (e: any) => {
    e.preventDefault()
    const ok = await createAsset(form)
    if (ok) r.push("/assets")
    else alert("Failed to create asset")
  }
  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Add Asset</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="name"
          placeholder="Name"
          className="border rounded px-3 py-2 w-full"
          onChange={onChange}
          required
        />
        <input name="room" placeholder="Room" className="border rounded px-3 py-2 w-full" onChange={onChange} />
        <input name="brand" placeholder="Brand" className="border rounded px-3 py-2 w-full" onChange={onChange} />
        <input name="model" placeholder="Model" className="border rounded px-3 py-2 w-full" onChange={onChange} />
        <button type="submit" className="rounded-md bg-indigo-600 text-white px-4 py-2">
          Save
        </button>
      </form>
    </div>
  )
}
