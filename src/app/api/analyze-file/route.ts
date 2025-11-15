// src/app/api/analyze-file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, MODELS } from '../../../lib/gemini/client';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
  try {
    const { fileUrl, fileType, prompt } = await req.json();

    // Fetch file
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();

    let analysis = '';

    if (fileType.startsWith('image/')) {
      // Image analysis
      const base64 = Buffer.from(buffer).toString('base64');
      analysis = await analyzeImage(base64, prompt || 'Describe this image in detail', MODELS.PRO);
    } else if (fileType === 'application/pdf') {
      // PDF text extraction
      const data = await (pdfParse as any)(Buffer.from(buffer));
      analysis = `PDF Content (${data.numpages} pages):\n\n${data.text.slice(0, 10000)}`;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      // Word document extraction
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      analysis = `Document Content:\n\n${result.value.slice(0, 10000)}`;
    } else {
      // Plain text
      const text = new TextDecoder().decode(buffer);
      analysis = text.slice(0, 10000);
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('File analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    );
  }
}
