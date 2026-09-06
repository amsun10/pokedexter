import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Pokemon } from '../types/pokemon';
import { getPopularToys } from '../data/pokemonList';
import { triggerHaptic } from '../services/soundEffects';

interface QuickToyBarProps {
  onSelectToy: (pokemon: Pokemon) => void;
}

export const QuickToyBar: React.FC<QuickToyBarProps> = ({ onSelectToy }) => {
  const popularToys = getPopularToys();

  return (
    <div className="w-full bg-zinc-900/90 backdrop-blur border-t border-zinc-800 py-2 px-3">
      <div className="flex items-center justify-between pb-1.5 px-1">
        <div className="flex items-center space-x-1.5 text-[11px] font-tech text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>常用毛绒玩具快捷扫描</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono-tech">点击立刻模拟识别</span>
      </div>

      {/* Horizontal Scrollable Toy Avatar Buttons */}
      <div className="flex space-x-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
        {popularToys.map((toy) => (
          <button
            key={toy.id}
            onClick={() => {
              triggerHaptic('click');
              onSelectToy(toy);
            }}
            className="group flex flex-col items-center flex-shrink-0 bg-zinc-800/80 hover:bg-zinc-750 active:bg-zinc-700 p-1.5 rounded-xl border border-zinc-700/80 transition active:scale-95 shadow"
            title={`模拟识别 ${toy.name}`}
          >
            <div className="w-12 h-12 relative flex items-center justify-center rounded-lg bg-zinc-900 overflow-hidden border border-zinc-800">
              <img
                src={toy.artworkUrl}
                alt={toy.name}
                loading="lazy"
                className="w-10 h-10 object-contain group-hover:scale-110 transition duration-200"
              />
            </div>
            <span className="text-[10px] font-tech text-zinc-200 mt-1 max-w-[52px] truncate">
              {toy.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
