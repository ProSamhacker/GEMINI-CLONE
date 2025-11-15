import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string;
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
}

// Chat operations
export async function createChat(userId: string, title: string, model: string): Promise<string> {
  const chatRef = await addDoc(collection(db, 'chats'), {
    userId,
    title,
    model,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 0,
  });
  return chatRef.id;
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  const q = query(
    collection(db, 'chats'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
}

export async function updateChatTitle(chatId: string, title: string) {
  await updateDoc(doc(db, 'chats', chatId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteChat(chatId: string) {
  await deleteDoc(doc(db, 'chats', chatId));
  // Also delete all messages in this chat
  const messagesQuery = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId)
  );
  const messagesSnapshot = await getDocs(messagesQuery);
  const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

// Message operations
export async function addMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  model?: string,
  files?: FileAttachment[]
): Promise<string> {
  const messageRef = await addDoc(collection(db, 'messages'), {
    chatId,
    role,
    content,
    model,
    files: files || [],
    timestamp: serverTimestamp(),
  });

  // Update chat message count and timestamp
  const chatRef = doc(db, 'chats', chatId);
  const chatDoc = await getDoc(chatRef);
  const currentCount = chatDoc.data()?.messageCount || 0;

  await updateDoc(chatRef, {
    messageCount: currentCount + 1,
    updatedAt: serverTimestamp(),
  });

  return messageRef.id;
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
}
