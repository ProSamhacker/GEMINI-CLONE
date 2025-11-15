// src/components/chat/ModelSelector.tsx
'use client';

import { Zap, Brain } from 'lucide-react';

interface ModelSelectorProps {
  selected: 'flash' | 'pro';
  onChange: (model: 'flash' | 'pro') => void;
}

export default function ModelSelector({ selected, onChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-[#2D2D2D] rounded-full p-1">
      <button
        onClick={() => onChange('flash')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
          selected === 'flash'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">2.5 Flash</span>
      </button>
      
      <button
        onClick={() => onChange('pro')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
          selected === 'pro'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">2.5 Pro</span>
      </button>
    </div>
  );
}