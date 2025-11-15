import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function analyzeFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  try {
    if (file.type === 'application/pdf') {
      const data = await (pdfParse as any)(Buffer.from(buffer));
      return `PDF document with ${data.numpages} pages. Preview: ${data.text.slice(0, 500)}...`;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return `Word document. Preview: ${result.value.slice(0, 500)}...`;
    } else if (file.type.startsWith('image/')) {
      return `Image file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    } else if (file.type.startsWith('text/')) {
      const text = new TextDecoder().decode(buffer);
      return `Text file. Preview: ${text.slice(0, 500)}...`;
    }

    return `File: ${file.name} (${file.type})`;
  } catch (error) {
    console.error('File analysis error:', error);
    return `File: ${file.name} (analysis failed)`;
  }
}
