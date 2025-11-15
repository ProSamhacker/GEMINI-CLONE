'use client';

import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {message.role === 'assistant' && (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}

          <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
            <div className={`p-4 rounded-2xl ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-[#2D2D2D] text-gray-300'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {message.timestamp?.toDate?.()?.toLocaleTimeString() || new Date().toLocaleTimeString()}
            </p>
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 order-2">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
