'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Zap, Brain, Image, FileText, Code } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  async function handleNewChat() {
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.uid }),
    });
    const data = await response.json();
    router.push(`/chat/${data.chatId}`);
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Hello, {user?.displayName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-xl text-gray-400">
              How can I help you today?
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            <button
              onClick={handleNewChat}
              className="p-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-2xl transition-colors text-left group"
            >
              <Image className="w-8 h-8 text-orange-500 mb-3" />
              <h3 className="text-white font-medium mb-1">Create Image</h3>
              <p className="text-gray-400 text-sm">Generate images from text descriptions</p>
            </button>

            <button
              onClick={handleNewChat}
              className="p-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-2xl transition-colors text-left group"
            >
              <FileText className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="text-white font-medium mb-1">Write</h3>
              <p className="text-gray-400 text-sm">Create content, articles, and stories</p>
            </button>

            <button
              onClick={handleNewChat}
              className="p-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-2xl transition-colors text-left group"
            >
              <Code className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="text-white font-medium mb-1">Build</h3>
              <p className="text-gray-400 text-sm">Generate code and solve problems</p>
            </button>

            <button
              onClick={handleNewChat}
              className="p-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-2xl transition-colors text-left group"
            >
              <Brain className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="text-white font-medium mb-1">Deep Research</h3>
              <p className="text-gray-400 text-sm">In-depth analysis and research</p>
            </button>

            <button
              onClick={handleNewChat}
              className="p-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-2xl transition-colors text-left group"
            >
              <Zap className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="text-white font-medium mb-1">Quick Answer</h3>
              <p className="text-gray-400 text-sm">Fast responses for simple queries</p>
            </button>

            <button
              onClick={handleNewChat}
              className="p-6 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-2xl transition-colors text-left group"
            >
              <Sparkles className="w-8 h-8 text-pink-500 mb-3" />
              <h3 className="text-white font-medium mb-1">Learn</h3>
              <p className="text-gray-400 text-sm">Explore topics and expand knowledge</p>
            </button>
          </div>

          {/* Features */}
          <div className="text-center">
            <div className="inline-flex items-center gap-6 px-6 py-3 bg-[#2D2D2D] rounded-full">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-300">Gemini 2.5 Flash</span>
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-300">Gemini 2.5 Pro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
