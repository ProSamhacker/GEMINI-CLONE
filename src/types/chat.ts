import { Timestamp } from 'firebase/firestore';

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messageCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  files?: FileAttachment[];
  timestamp: Timestamp;
  tokens?: number;
}

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
  mimeType: string;
  analysis?: string;
}
