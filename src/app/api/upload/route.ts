// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { analyzeFile } from '../../../lib/utils/file-analyzer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        // Analyze file content
        const analysis = await analyzeFile(file);

        return {
          name: file.name,
          url: blob.url,
          type: file.type,
          size: file.size,
          mimeType: file.type,
          analysis,
        };
      })
    );

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
