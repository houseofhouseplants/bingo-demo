import type { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { Button } from './ui/Button';

interface Props {
  onSelect: (id: CategoryId) => void;
  onBack: () => void;
}

export function CategorySelect({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Choose Your Buzzword Pack</h2>
        <p className="text-gray-500 text-center mb-8">Pick the category that matches your meeting</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-blue-400 hover:shadow-md transition-all text-left group"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600">{cat.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{cat.description}</p>
              <p className="text-xs text-gray-400">{cat.words.slice(0, 4).join(', ')}…</p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={onBack}>← Back to Home</Button>
        </div>
      </div>
    </div>
  );
}
