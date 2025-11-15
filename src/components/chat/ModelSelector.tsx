'use client';

import { ChevronDown } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  onModelChange: (model: 'gemini-2.5-flash' | 'gemini-2.5-pro') => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const models = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast responses' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning' },
  ];

  return (
    <div className="relative">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as 'gemini-2.5-flash' | 'gemini-2.5-pro')}
        className="appearance-none bg-[#2D2D2D] text-white px-4 py-2 pr-8 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
