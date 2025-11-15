import { put, del } from '@vercel/blob';

export async function uploadToBlob(file: File): Promise<string> {
  const blob = await put(file.name, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

export async function deleteFromBlob(url: string) {
  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}
