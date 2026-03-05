import React from 'react';

const templates = [
  { id: 'template-1', name: 'Modern Clean' },
  { id: 'template-2', name: 'Executive' },
  { id: 'template-3', name: 'Creative' },
  { id: 'template-4', name: 'Minimalist' },
  { id: 'template-5', name: 'Tech Dark' },
];

export default function TemplateSelector({ currentTemplate, onSelect }) {
  return (
    <div className="bg-white p-4 border-b border-gray-200 overflow-x-auto">
      <div className="flex gap-4 min-w-max mx-auto max-w-7xl">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`flex flex-col items-center gap-2 p-2 rounded border-2 transition-all cursor-pointer ${
              currentTemplate === t.id
                ? 'border-[#f79003] bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-24 h-32 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
              {/* Placeholder for thumbnail */}
              Preview
            </div>
            <span className="text-sm font-medium">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
