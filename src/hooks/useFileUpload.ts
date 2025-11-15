import { useState } from 'react';
import { FileAttachment } from '@/lib/firebase/firestore';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function uploadFiles(files: File[]): Promise<FileAttachment[]> {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setProgress(100);
      return data.files;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }

  return {
    uploadFiles,
    uploading,
    progress,
  };
}
