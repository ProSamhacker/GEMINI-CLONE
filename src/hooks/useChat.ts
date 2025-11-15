import { useState, useEffect } from 'react';
import { Message, getChatMessages } from '@/lib/firebase/firestore';

export function useChat(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  async function loadMessages() {
    try {
      setLoading(true);
      const msgs = await getChatMessages(chatId);
      setMessages(msgs);
      setError(null);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function addMessage(message: Message) {
    setMessages(prev => [...prev, message]);
  }

  function updateMessage(id: string, content: string) {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, content } : msg))
    );
  }

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    reload: loadMessages,
  };
}
