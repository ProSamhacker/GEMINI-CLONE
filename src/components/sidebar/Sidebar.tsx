'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Plus, Settings, LogOut, User } from 'lucide-react';
import { Chat } from '@/types/chat';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch chats for the user
      fetchChats();
    }
  }, [user]);

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/chats?userId=${user?.uid}`);
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const handleNewChat = async () => {
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.uid }),
    });
    const data = await response.json();
    router.push(`/chat/${data.chatId}`);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-[#1F1F1F] border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No chats yet</p>
            <p className="text-gray-500 text-xs">Start a new conversation</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="p-2 hover:bg-[#2D2D2D] rounded-lg cursor-pointer">
              <p className="text-gray-300 text-sm truncate">{chat.title || 'New Chat'}</p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.displayName || user?.email?.split('@')[0]}
            </p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2D2D2D] rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2D2D2D] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
