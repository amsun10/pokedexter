import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Pokemon } from '../types/pokemon';
import { POKEMON_LIST, POPULAR_TOY_POKEMON_IDS } from '../data/pokemonList';
import { triggerHaptic } from '../services/soundEffects';

interface PokedexBookProps {
  onSelectPokemon: (pokemon: Pokemon) => void;
}

export const PokedexBook: React.FC<PokedexBookProps> = ({
  onSelectPokemon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('全部');

  const types = ['全部', '🔥 常见毛绒玩偶', '火', '水', '草', '电', '超能力', '幽灵', '地面', '岩石', '一般', '飞行', '毒', '妖精', '龙'];

  const filteredList = POKEMON_LIST.filter((p) => {
    const matchSearch =
      p.name.includes(searchTerm) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id).includes(searchTerm);

    let matchType = true;
    if (selectedType === '🔥 常见毛绒玩偶') {
      matchType = POPULAR_TOY_POKEMON_IDS.includes(p.id);
    } else if (selectedType !== '全部') {
      matchType = p.types.includes(selectedType);
    }

    return matchSearch && matchType;
  });

  const handleCardClick = (p: Pokemon) => {
    triggerHaptic('click');
    onSelectPokemon(p);
  };

  return (
    <div className="w-full h-full bg-zinc-950 text-white flex flex-col p-3 rounded-xl border-4 border-zinc-800 overflow-hidden shadow-inner">
      {/* Top Search Bar & Filters */}
      <div className="flex flex-col gap-2 pb-2 border-b border-zinc-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索宝可梦 (例如: 25 或 皮卡丘 / Pikachu)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-4 py-2 text-xs font-tech text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Type Badges Filter Scroll */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 text-[11px] font-tech scrollbar-none">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition active:scale-95 ${
                selectedType === t
                  ? 'bg-red-600 text-white font-bold shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Pokemon */}
      <div className="flex-1 overflow-y-auto pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1 content-start">
        {filteredList.map((pokemon) => {
          const numStr = String(pokemon.id).padStart(3, '0');
          return (
            <div
              key={pokemon.id}
              onClick={() => handleCardClick(pokemon)}
              className="group min-h-[135px] bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 hover:from-zinc-800 hover:to-zinc-850 p-2 rounded-xl border border-zinc-800/90 hover:border-red-500/60 cursor-pointer transition flex flex-col items-center justify-between text-center relative overflow-hidden active:scale-95 shadow-md"
            >
              {/* Number Badge */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-zinc-400">
                <span className="bg-black/60 px-1.5 py-0.5 rounded font-mono text-amber-400">#{numStr}</span>
                <span className="text-[9px] text-zinc-500">{pokemon.genus}</span>
              </div>

              {/* Artwork */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 my-1 flex items-center justify-center relative flex-shrink-0">
                <div
                  className="absolute inset-1 rounded-full opacity-25 filter blur-sm group-hover:opacity-45 transition"
                  style={{ backgroundColor: pokemon.color || '#3b82f6' }}
                />
                <img
                  src={pokemon.artworkUrl}
                  alt={pokemon.name}
                  loading="lazy"
                  className="w-full h-full object-contain filter drop-shadow group-hover:scale-110 transition duration-300 relative z-10"
                />
              </div>

              {/* Name & Type */}
              <div className="w-full mt-auto">
                <h4 className="text-xs sm:text-sm font-tech font-bold text-white group-hover:text-yellow-400 transition truncate">
                  {pokemon.name}
                </h4>
                <div className="flex justify-center gap-1 mt-0.5">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className="text-[9px] font-tech px-1.5 py-0.2 rounded-full text-white font-medium"
                      style={{ backgroundColor: pokemon.color || '#555' }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
