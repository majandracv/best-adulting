import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import UploadForm from './upload-form';

export default async function AssetDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Get the asset by ID
  const { data: asset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', params.id)
    .single();

  // Get photos for this asset
  const { data: photos } = await supabase
    .from('asset_photos')
    .select('*')
    .eq('asset_id', params.id);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{asset?.name}</h1>
      <p>{asset?.brand} – {asset?.model}</p>
      <p>Room: {asset?.room_name}</p>

      <h2 className="text-xl font-semibold">Photos</h2>
      <div className="grid grid-cols-2 gap-4">
        {photos?.map(photo => (
          <Image
            key={photo.id}
            src={photo.url}
            alt={asset?.name ?? 'Asset photo'}
            width={200}
            height={200}
            className="rounded-lg border"
          />
        ))}
      </div>

      {/* Upload form for adding new photos */}
      <UploadForm assetId={params.id} />

      <Link href="/assets" className="text-blue-600 underline">
        ← Back to Assets
      </Link>
    </div>
  );
}

