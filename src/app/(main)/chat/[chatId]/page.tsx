'use client';

import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  return <ChatInterface chatId={params.chatId} />;
}
