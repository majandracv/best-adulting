"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function UploadForm({ assetId }: { assetId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Create a unique path for the file
    const filePath = `${assetId}/${Date.now()}-${file.name}`;

    // Upload file to Supabase Storage bucket called "assets"
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(filePath, file);

    if (uploadError) {
      alert("Error uploading file: " + uploadError.message);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    // Save photo record in asset_photos table
    const { error: insertError } = await supabase
      .from("asset_photos")
      .insert({
        asset_id: assetId,
        url: publicUrl,
      });

    if (insertError) {
      alert("Error saving photo record: " + insertError.message);
    } else {
      alert("Photo uploaded successfully!");
      window.location.reload(); // reload page to show new photo
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-3 mt-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Upload Photo
      </button>
    </form>
  );
}
