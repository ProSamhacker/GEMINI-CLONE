// src/components/chat/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, StopCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Message, FileAttachment } from '@/types/chat';
import MessageList from './MessageList';
import ModelSelector from './ModelSelector';

interface ChatInterfaceProps {
  chatId: string;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'flash' | 'pro'>('flash');
  const [files, setFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  async function loadMessages() {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  async function handleSend() {
    if (!input.trim() && files.length === 0) return;
    
    setIsLoading(true);
    const userMessage = input;
    setInput('');

    try {
      // Upload files if any
      let fileAttachments: FileAttachment[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        fileAttachments = uploadData.files;
        setFiles([]);
      }

      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        chatId,
        role: 'user',
        content: userMessage,
        files: fileAttachments,
        timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      };
      setMessages(prev => [...prev, userMsg]);

      // Stream AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          message: userMessage,
          model: selectedModel,
          files: fileAttachments,
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        chatId,
        role: 'assistant',
        content: '',
        model: selectedModel === 'flash' ? 'gemini-2.5-flash' : 'gemini-2.5-pro',
        timestamp: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      };

      setMessages(prev => [...prev, assistantMsg]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              assistantContent += parsed.text;
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMsg.id 
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function startVoiceRecording() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in your browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
    };

    recognition.start();
  }

  return (
    <div className="flex flex-col h-screen bg-[#1F1F1F]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-semibold text-white">Gemini Clone</h1>
        </div>
        <ModelSelector selected={selectedModel} onChange={setSelectedModel} />
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        {files.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {files.map((file, idx) => (
              <div key={idx} className="px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300">
                {file.name}
              </div>
            ))}
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-[#2D2D2D] rounded-3xl p-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              disabled={isLoading}
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gemini..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none max-h-40 py-2"
              rows={1}
              disabled={isLoading}
            />

            <button
              onClick={startVoiceRecording}
              className={`p-2 rounded-full transition-colors ${
                isRecording ? 'bg-red-500' : 'hover:bg-gray-700'
              }`}
              disabled={isLoading}
            >
              {isRecording ? (
                <StopCircle className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && files.length === 0)}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
