import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Zap, Shield, Sword, Activity, ChevronRight, BarChart2, ArrowUpDown, ArrowUp, ArrowDown, Database, Filter } from 'lucide-react';

// ==========================================
// PHẦN 1: CẤU HÌNH & DỮ LIỆU CỐ ĐỊNHH
// ==========================================

const TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy'
];

const TYPE_COLORS = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', grass: '#7AC74C',
  electric: '#F7D02C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', steel: '#B7B7CE',
  dark: '#705746', fairy: '#D685AD',
  // Viết hoa cho Calculator
  Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Grass: '#7AC74C',
  Electric: '#F7D02C', Ice: '#96D9D6', Fighting: '#C22E28', Poison: '#A33EA1',
  Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
  Rock: '#B6A136', Ghost: '#735797', Dragon: '#6F35FC', Steel: '#B7B7CE',
  Dark: '#705746', Fairy: '#D685AD',
};

const MATCHUPS = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Steel: 0.5, Dark: 2 },
};

// Map Ability -> Kháng hệ đặc biệt
const ABILITY_IMMUNITIES = {
  'levitate': { type: 'Ground', value: 0 },
  'flash-fire': { type: 'Fire', value: 0 },
  'volt-absorb': { type: 'Electric', value: 0 },
  'lightning-rod': { type: 'Electric', value: 0 },
  'motor-drive': { type: 'Electric', value: 0 },
  'water-absorb': { type: 'Water', value: 0 },
  'dry-skin': { type: 'Water', value: 0 },
  'storm-drain': { type: 'Water', value: 0 },
  'sap-sipper': { type: 'Grass', value: 0 },
  'earth-eater': { type: 'Ground', value: 0 },
  'thick-fat': { type: ['Fire', 'Ice'], value: 0.5 }, // Giảm 50%
  'filter': { value: 0.75 }, // Giảm dmg siêu hiệu quả (xử lý logic riêng)
  'solid-rock': { value: 0.75 },
  'prism-armor': { value: 0.75 },
  'wonder-guard': { special: 'wonder_guard' } // Chỉ nhận siêu hiệu quả
};

const getMultiplier = (attacker, defender) => {
  if (MATCHUPS[attacker] && MATCHUPS[attacker][defender] !== undefined) {
    return MATCHUPS[attacker][defender];
  }
  return 1;
};

// ==========================================
// PHẦN 2: COMPONENTS HỖ TRỢ
// ==========================================

const TypeBadge = ({ type, small = false }) => {
  const color = TYPE_COLORS[type.toLowerCase()] || '#777';
  return (
    <span style={{ backgroundColor: color }} className={`${small ? 'px-1 py-0.5 text-[9px]' : 'px-2 py-1 text-xs'} rounded font-bold text-white uppercase shadow-sm inline-block mr-1 mb-1`}>
      {type}
    </span>
  );
};

const StatBar = ({ label, value, max = 255 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  let barColor = 'bg-red-500';
  if (value >= 60) barColor = 'bg-orange-500';
  if (value >= 90) barColor = 'bg-yellow-500';
  if (value >= 120) barColor = 'bg-green-500';
  if (value >= 150) barColor = 'bg-cyan-500';

  return (
    <div className="flex items-center gap-2 mb-1 text-xs">
      <span className="w-10 font-bold text-gray-400 uppercase">{label}</span>
      <span className="w-8 text-right font-bold text-gray-200">{value}</span>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

// Component hiển thị Moves trong Modal
const MovesTable = ({ moves }) => {
  const [activeFilter, setActiveFilter] = useState('level-up');
  const [moveDetails, setMoveDetails] = useState({});
  const [loadingMoves, setLoadingMoves] = useState(false);

  // Lọc moves theo method
  const filteredMoves = useMemo(() => {
    return moves.filter(m => {
      const details = m.version_group_details[m.version_group_details.length - 1];
      const method = details.move_learn_method.name;
      if (activeFilter === 'level-up') return method === 'level-up';
      if (activeFilter === 'machine') return method === 'machine'; // TM
      if (activeFilter === 'egg') return method === 'egg';
      return false;
    }).sort((a, b) => {
      if (activeFilter === 'level-up') {
        const lvA = a.version_group_details[a.version_group_details.length - 1].level_learned_at;
        const lvB = b.version_group_details[b.version_group_details.length - 1].level_learned_at;
        return lvA - lvB;
      }
      return a.move.name.localeCompare(b.move.name);
    });
  }, [moves, activeFilter]);

  // Fetch chi tiết moves (Power, Acc, PP) khi hiển thị
  useEffect(() => {
    const fetchMoveData = async () => {
      const movesToFetch = filteredMoves.filter(m => !moveDetails[m.move.name]);
      if (movesToFetch.length === 0) return;

      setLoadingMoves(true);
      const newDetails = { ...moveDetails };
      
      // Fetch song song nhưng giới hạn batch để không overload
      const batchSize = 10;
      for (let i = 0; i < movesToFetch.length; i += batchSize) {
        const batch = movesToFetch.slice(i, i + batchSize);
        await Promise.all(batch.map(async (m) => {
          try {
            const res = await fetch(m.move.url);
            const data = await res.json();
            newDetails[m.move.name] = {
              type: data.type.name,
              power: data.power,
              accuracy: data.accuracy,
              pp: data.pp,
              damage_class: data.damage_class.name
            };
          } catch (e) { console.error(e); }
        }));
      }
      setMoveDetails(newDetails);
      setLoadingMoves(false);
    };

    if (filteredMoves.length > 0) fetchMoveData();
  }, [filteredMoves]);

  return (
    <div className="mt-4">
      <div className="flex gap-2 border-b border-gray-700 mb-2">
        {['level-up', 'machine', 'egg'].map(f => (
          <button 
            key={f} 
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 text-sm font-bold capitalize ${activeFilter === f ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            {f === 'machine' ? 'TM/HM' : f.replace('-', ' ')}
          </button>
        ))}
      </div>
      
      <div className="overflow-x-auto max-h-60 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-800 text-gray-400 text-xs sticky top-0">
            <tr>
              <th className="p-2">Lv</th>
              <th className="p-2">Move</th>
              <th className="p-2">Type</th>
              <th className="p-2">Pow</th>
              <th className="p-2">Acc</th>
              <th className="p-2">PP</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredMoves.map(m => {
              const detail = moveDetails[m.move.name];
              const level = m.version_group_details[m.version_group_details.length - 1].level_learned_at;
              return (
                <tr key={m.move.name} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-2 font-mono text-gray-500">{level === 0 ? '-' : level}</td>
                  <td className="p-2 font-bold capitalize">{m.move.name.replace('-', ' ')}</td>
                  <td className="p-2">
                    {detail ? <TypeBadge type={detail.type} small /> : <span className="animate-pulse">...</span>}
                  </td>
                  <td className="p-2 text-gray-300">{detail ? (detail.power || '-') : '...'}</td>
                  <td className="p-2 text-gray-300">{detail ? (detail.accuracy || '-') : '...'}</td>
                  <td className="p-2 text-gray-300">{detail ? detail.pp : '...'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loadingMoves && <div className="text-center text-xs text-gray-500 py-2">Loading move details...</div>}
      </div>
    </div>
  );
};

// Component tính toán điểm yếu (Type Defenses) trong Modal
const TypeEffectivenessBox = ({ types, abilities }) => {
  const effectiveness = useMemo(() => {
    const results = {};
    const abilityNames = abilities.map(a => a.ability.name);

    TYPES.forEach(attacker => {
      let mult = 1;
      // Tính cơ bản từ hệ
      types.forEach(t => {
        mult *= getMultiplier(attacker, t.type.name); // PokeAPI type name is lowercase
      });

      // Tính Ability
      abilityNames.forEach(abName => {
        const immunity = ABILITY_IMMUNITIES[abName];
        if (immunity) {
          if (immunity.type === attacker || (Array.isArray(immunity.type) && immunity.type.includes(attacker))) {
            mult *= immunity.value;
          }
          if (immunity.special === 'wonder_guard' && mult <= 1) {
            mult = 0;
          }
        }
        // Xử lý Thick Fat (giảm 50% Fire/Ice)
        if (abName === 'thick-fat' && (attacker === 'Fire' || attacker === 'Ice')) {
            mult *= 0.5;
        }
      });

      results[attacker] = mult;
    });
    return results;
  }, [types, abilities]);

  // Group by multiplier
  const grouped = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
  Object.entries(effectiveness).forEach(([type, mult]) => {
    if (grouped[mult]) grouped[mult].push(type);
    else if (mult < 0.25 && mult > 0) grouped[0.25].push(type); // fallback
    else if (grouped[mult] === undefined) {} // ignore weird values
  });

  const renderGroup = (mult, label, colorClass) => {
    if (grouped[mult].length === 0) return null;
    return (
      <div className="mb-2">
        <div className={`text-xs font-bold ${colorClass} mb-1`}>{label}</div>
        <div className="flex flex-wrap gap-1">
          {grouped[mult].map(t => <TypeBadge key={t} type={t} small />)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-4">
      <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
        <Shield size={14} className="text-blue-400" /> Type Defenses (with Ability)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          {renderGroup(4, 'Takes 4x', 'text-red-500')}
          {renderGroup(2, 'Takes 2x', 'text-orange-400')}
        </div>
        <div>
          {renderGroup(0.5, 'Takes 0.5x', 'text-green-400')}
          {renderGroup(0.25, 'Takes 0.25x', 'text-green-600')}
          {renderGroup(0, 'Immune (0x)', 'text-gray-400')}
        </div>
      </div>
    </div>
  );
};


// Component Modal Chi Tiết
const PokemonDetailModal = ({ pokemon, onClose }) => {
  if (!pokemon) return null;
  const artwork = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  
  // Helper lấy stat
  const getStat = (name) => pokemon.stats.find(s => s.stat.name === name)?.base_stat || 0;
  const totalStats = pokemon.stats.reduce((acc, curr) => acc + curr.base_stat, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-gray-700 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono font-bold text-lg">#{String(pokemon.id).padStart(3, '0')}</span>
            <span className="text-white font-bold text-xl capitalize">{pokemon.name.replace('-', ' ')}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Cột 1: Ảnh & Thông tin cơ bản (4/12) */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4">
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl"></div>
                 <img src={artwork} alt={pokemon.name} className="relative w-full h-full object-contain drop-shadow-xl" />
              </div>
              <div className="flex gap-2 mb-4">
                {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} />)}
              </div>
              
              <div className="w-full bg-gray-700/30 rounded p-3 mb-4">
                <div className="flex justify-between mb-1"><span className="text-gray-400 text-xs">Height</span> <span className="font-bold">{pokemon.height/10}m</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-xs">Weight</span> <span className="font-bold">{pokemon.weight/10}kg</span></div>
              </div>

              {/* Abilities */}
              <div className="w-full">
                <h4 className="text-gray-400 text-xs uppercase font-bold mb-2">Abilities</h4>
                <div className="flex flex-col gap-2">
                  {pokemon.abilities.map(a => (
                    <div key={a.ability.name} className={`px-3 py-1.5 rounded border ${a.is_hidden ? 'border-yellow-600 bg-yellow-900/20 text-yellow-200' : 'border-gray-600 bg-gray-700 text-gray-200'} text-xs font-bold capitalize flex justify-between`}>
                      <span>{a.ability.name.replace('-', ' ')}</span>
                      {a.is_hidden && <span className="text-[10px] opacity-70">Hidden</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột 2: Stats & Type Defenses (4/12) */}
            <div className="md:col-span-4">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2 border-b border-gray-700 pb-1">
                <BarChart2 size={18} className="text-blue-400" /> Base Stats
              </h3>
              <div className="space-y-2 mb-4">
                <StatBar label="HP" value={getStat('hp')} />
                <StatBar label="Atk" value={getStat('attack')} />
                <StatBar label="Def" value={getStat('defense')} />
                <StatBar label="SpA" value={getStat('special-attack')} />
                <StatBar label="SpD" value={getStat('special-defense')} />
                <StatBar label="Spe" value={getStat('speed')} />
                <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
                   <span className="font-bold text-gray-400">TOTAL</span>
                   <span className="font-bold text-xl text-blue-300">{totalStats}</span>
                </div>
              </div>

              {/* Box Kháng hệ mới */}
              <TypeEffectivenessBox types={pokemon.types} abilities={pokemon.abilities} />
            </div>

            {/* Cột 3: Moves (4/12) */}
            <div className="md:col-span-4">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2 border-b border-gray-700 pb-1">
                <Sword size={18} className="text-red-400" /> Move Pool
              </h3>
              <MovesTable moves={pokemon.moves} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PHẦN 3: LOGIC CHÍNH APP
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('pokedex');

  // --- States Calculator ---
  const [defensiveTypes, setDefensiveTypes] = useState([]);
  const [offensiveTypes, setOffensiveTypes] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);

  // --- States Pokedex ---
  const [allPokemon, setAllPokemon] = useState([]); // List cơ bản
  const [displayedPokemon, setDisplayedPokemon] = useState([]); // List chi tiết để hiển thị
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Search Logic (Advanced)
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allAbilities, setAllAbilities] = useState([]);
  const [allMoves, setAllMoves] = useState([]);

  // Fetch dữ liệu khởi tạo
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 1. Fetch danh sách Pokemon cơ bản (1025)
        const pRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const pData = await pRes.json();
        setAllPokemon(pData.results);
        
        // Load chi tiết 20 con đầu
        await loadDetailsBatch(pData.results.slice(0, 20));

        // 2. Fetch danh sách Moves & Abilities cho Search (Lightweight names only)
        // Dùng Promise.all để chạy song song
        const [aRes, mRes] = await Promise.all([
          fetch('https://pokeapi.co/api/v2/ability?limit=1000'),
          fetch('https://pokeapi.co/api/v2/move?limit=1000')
        ]);
        const aData = await aRes.json();
        const mData = await mRes.json();
        setAllAbilities(aData.results);
        setAllMoves(mData.results);

      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initData();
  }, []);

  const loadDetailsBatch = async (list) => {
    const details = await Promise.all(
      list.map(async (p) => {
        const res = await fetch(p.url);
        return res.json();
      })
    );
    setDisplayedPokemon(prev => {
        // Tránh duplicate
        const newItems = details.filter(d => !prev.find(existing => existing.id === d.id));
        return [...prev, ...newItems];
    });
  };

  // --- Handle Search Advanced ---
  useEffect(() => {
    if (!searchTerm) {
      setSearchSuggestions([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    
    // Gợi ý: Pokemon, Ability, Move
    const suggestions = [];
    
    // 1. Tìm Ability
    allAbilities.forEach(a => {
      if (a.name.includes(term)) suggestions.push({ type: 'Ability', name: a.name, url: a.url });
    });
    // 2. Tìm Move
    allMoves.forEach(m => {
      if (m.name.includes(term)) suggestions.push({ type: 'Move', name: m.name, url: m.url });
    });
    // 3. Tìm Pokemon
    allPokemon.forEach(p => {
      if (p.name.includes(term)) suggestions.push({ type: 'Pokemon', name: p.name, url: p.url });
    });

    setSearchSuggestions(suggestions.slice(0, 8)); // Lấy 8 gợi ý đầu
    setShowSuggestions(true);
  }, [searchTerm, allAbilities, allMoves, allPokemon]);

  const handleSelectSuggestion = async (item) => {
    setSearchTerm(`${item.type}: ${item.name}`);
    setShowSuggestions(false);
    setLoading(true);
    setDisplayedPokemon([]); // Clear list cũ

    try {
      if (item.type === 'Pokemon') {
        const res = await fetch(item.url);
        const data = await res.json();
        setDisplayedPokemon([data]);
      } else if (item.type === 'Ability' || item.type === 'Move') {
        // Fetch chi tiết Ability/Move để lấy danh sách Pokemon sở hữu nó
        const res = await fetch(item.url);
        const data = await res.json();
        // data.pokemon (cho ability) hoặc data.learned_by_pokemon (cho move)
        const pokemonList = item.type === 'Ability' 
          ? data.pokemon.map(p => p.pokemon)
          : data.learned_by_pokemon;
        
        // Fetch chi tiết 30 con đầu tiên sở hữu ability/move đó
        await loadDetailsBatch(pokemonList.slice(0, 30));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // --- Logic Sort ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedList = useMemo(() => {
    let sortableItems = [...displayedPokemon];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        // Xử lý lấy giá trị sort
        if (['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].includes(sortConfig.key)) {
           aValue = a.stats.find(s => s.stat.name === sortConfig.key)?.base_stat || 0;
           bValue = b.stats.find(s => s.stat.name === sortConfig.key)?.base_stat || 0;
        } else if (sortConfig.key === 'bst') {
           aValue = a.stats.reduce((acc, curr) => acc + curr.base_stat, 0);
           bValue = b.stats.reduce((acc, curr) => acc + curr.base_stat, 0);
        } else {
           aValue = a[sortConfig.key];
           bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [displayedPokemon, sortConfig]);

  // Infinite Scroll logic (giữ nguyên nhưng áp dụng cho allPokemon nếu không search đặc biệt)
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom && !loading && !searchTerm.includes(':') && displayedPokemon.length < allPokemon.length) {
       // Chỉ load thêm nếu đang ở chế độ xem list thường (không phải filter move/ability)
       const currentLen = displayedPokemon.length;
       loadDetailsBatch(allPokemon.slice(currentLen, currentLen + 20));
    }
  };


  // --- Render Calculator Helpers ---
  const toggleDefensiveType = (t) => {
     if(defensiveTypes.includes(t)) setDefensiveTypes(defensiveTypes.filter(x=>x!==t));
     else if(defensiveTypes.length<2) setDefensiveTypes([...defensiveTypes,t]);
     else setDefensiveTypes([defensiveTypes[0],t]);
  };
  const toggleOffensiveType = (t) => {
     if(offensiveTypes.includes(t)) setOffensiveTypes(offensiveTypes.filter(x=>x!==t));
     else setOffensiveTypes([...offensiveTypes,t]);
  };
  
  const defensiveResults = useMemo(() => {
    if (defensiveTypes.length === 0) return null;
    const results = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
    TYPES.forEach(attacker => {
      let mult1 = getMultiplier(attacker, defensiveTypes[0]);
      let mult2 = defensiveTypes[1] ? getMultiplier(attacker, defensiveTypes[1]) : 1;
      let total = mult1 * mult2;
      if (results[total]) results[total].push(attacker);
    });
    return results;
  }, [defensiveTypes]);

  const offensiveResults = useMemo(() => {
    if (offensiveTypes.length === 0) return null;
    const coverage = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
    TYPES.forEach(defender => {
      let maxDamage = 0;
      offensiveTypes.forEach(attacker => {
        const dmg = getMultiplier(attacker, defender);
        if (dmg > maxDamage) maxDamage = dmg;
      });
      if (coverage[maxDamage]) coverage[maxDamage].push(defender);
      else if (coverage[maxDamage] === undefined) coverage[maxDamage] = [defender]; 
      else coverage[maxDamage].push(defender);
    });
    return coverage;
  }, [offensiveTypes]);

  // -- Render Result Row Calc
  const ResultRow = ({ multiplier, typesList, label }) => {
    if (!typesList || typesList.length === 0) return null;
    let colorStyle = { color: '#374151', bg: '#F3F4F6' };
    if (multiplier === 4) colorStyle = { color: '#991B1B', bg: '#FEE2E2' };
    if (multiplier === 2) colorStyle = { color: '#9D174D', bg: '#FCE7F3' };
    if (multiplier === 0.5) colorStyle = { color: '#166534', bg: '#DCFCE7' };
    if (multiplier === 0.25) colorStyle = { color: '#14532D', bg: '#F0FDF4' };
    if (multiplier === 0) colorStyle = { color: '#1F2937', bg: '#E5E7EB' };
    return (
      <div className="mb-2 p-2 rounded border flex flex-col sm:flex-row sm:items-center gap-2" style={{backgroundColor: colorStyle.bg}}>
        <div className="flex items-center gap-2 min-w-[150px]">
          <span className="font-bold" style={{color: colorStyle.color}}>{multiplier}x</span>
          <span className="text-xs font-medium opacity-80">{label}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {typesList.map(t => <span key={t} style={{backgroundColor: TYPE_COLORS[t]}} className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">{t}</span>)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-0 flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <header className="bg-red-700 text-white p-2 shadow-lg z-20 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
             <div className="w-6 h-6 bg-white rounded-full border-4 border-gray-800 flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-pulse"></div>
             </div>
             PokeRogue Dex
          </h1>
          <div className="flex bg-red-800 rounded p-0.5">
            <button onClick={() => setActiveTab('pokedex')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'pokedex' ? 'bg-white text-red-700 shadow' : 'text-red-200 hover:text-white'}`}>Dex</button>
            <button onClick={() => setActiveTab('calc')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'calc' ? 'bg-white text-red-700 shadow' : 'text-red-200 hover:text-white'}`}>Calc</button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative w-full max-w-7xl mx-auto bg-gray-900 sm:border-x sm:border-gray-800">
        
        {/* ================= TAB POKEDEX (TABLE VIEW) ================= */}
        {activeTab === 'pokedex' && (
          <div className="flex flex-col h-full animate-fadeIn">
            {/* Search Bar */}
            <div className="p-3 bg-gray-800 border-b border-gray-700 shrink-0 relative z-30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Pokemon, Move, Ability..." 
                  className="w-full bg-gray-900 text-white pl-9 pr-4 py-2 text-sm rounded border border-gray-700 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {/* Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl max-h-60 overflow-y-auto">
                      {searchSuggestions.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm flex items-center gap-2 border-b border-gray-700/50"
                          onClick={() => handleSelectSuggestion(item)}
                        >
                           <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.type==='Pokemon'?'bg-red-900 text-red-200': item.type==='Ability'?'bg-yellow-900 text-yellow-200':'bg-blue-900 text-blue-200'}`}>
                             {item.type}
                           </span>
                           <span className="capitalize text-white font-medium">{item.name.replace('-', ' ')}</span>
                        </div>
                      ))}
                   </div>
                )}
              </div>
            </div>

            {/* TABLE HEADER & LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" onScroll={handleScroll}>
               <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-800 text-gray-400 text-xs uppercase sticky top-0 z-10 shadow-md">
                   <tr>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('id')}>ID <ArrowUpDown size={10} className="inline"/></th>
                     <th className="p-3">Icon</th>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Name</th>
                     <th className="p-3">Types</th>
                     <th className="p-3 hidden sm:table-cell">Abilities</th>
                     <th className="p-3 cursor-pointer text-yellow-500 hover:text-yellow-300" onClick={() => handleSort('bst')}>BST</th>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('hp')}>HP</th>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('attack')}>Atk</th>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('defense')}>Def</th>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('special-attack')}>SpA</th>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('special-defense')}>SpD</th>
                     <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('speed')}>Spe</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-gray-800">
                   {sortedList.map(p => {
                      const getS = (n) => p.stats.find(s=>s.stat.name===n)?.base_stat || 0;
                      const bst = p.stats.reduce((a,b)=>a+b.base_stat,0);
                      return (
                        <tr key={p.id} onClick={() => setSelectedPokemon(p)} className="hover:bg-gray-800/50 cursor-pointer transition-colors group">
                           <td className="p-3 font-mono text-gray-500">#{String(p.id).padStart(3,'0')}</td>
                           <td className="p-3">
                              <img src={p.sprites.front_default} alt="" className="w-10 h-10 object-contain pixelated group-hover:scale-110 transition-transform"/>
                           </td>
                           <td className="p-3 font-bold capitalize text-white group-hover:text-blue-400">{p.name.replace('-',' ')}</td>
                           <td className="p-3">
                              {p.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} small />)}
                           </td>
                           <td className="p-3 hidden sm:table-cell text-xs text-gray-400">
                              {p.abilities.slice(0,2).map(a => a.ability.name.replace('-',' ')).join(', ')}
                              {p.abilities.length > 2 && '...'}
                           </td>
                           <td className="p-3 font-bold text-yellow-500">{bst}</td>
                           <td className="p-3 text-gray-300">{getS('hp')}</td>
                           <td className="p-3 text-gray-300">{getS('attack')}</td>
                           <td className="p-3 text-gray-300">{getS('defense')}</td>
                           <td className="p-3 text-gray-300">{getS('special-attack')}</td>
                           <td className="p-3 text-gray-300">{getS('special-defense')}</td>
                           <td className="p-3 text-blue-300 font-bold">{getS('speed')}</td>
                        </tr>
                      )
                   })}
                 </tbody>
               </table>
               {loading && <div className="text-center py-4 text-gray-500 text-xs animate-pulse">Loading data...</div>}
               {sortedList.length === 0 && !loading && <div className="text-center py-10 text-gray-500">No pokemon found. Try another search.</div>}
            </div>
          </div>
        )}

        {/* ================= TAB CALCULATOR (Giữ nguyên) ================= */}
        {activeTab === 'calc' && (
          <div className="h-full overflow-y-auto p-4 bg-gray-100 text-gray-800 animate-fadeIn">
            {/* Defensive Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-200">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-700">
                <Shield size={20} className="text-blue-500"/> Defensive Analysis
              </h2>
              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                {defensiveTypes.map(t => (
                  <button key={t} onClick={() => toggleDefensiveType(t)} className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-full text-sm hover:bg-black transition-colors">
                    {t} <X size={12}/>
                  </button>
                ))}
                {defensiveTypes.length === 0 && <span className="text-sm text-gray-400 italic py-1">Select up to 2 types below...</span>}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {TYPES.map(type => (
                  <button key={type} onClick={() => toggleDefensiveType(type)} style={{borderColor: TYPE_COLORS[type], color: defensiveTypes.includes(type) ? 'white' : TYPE_COLORS[type], backgroundColor: defensiveTypes.includes(type) ? TYPE_COLORS[type] : 'transparent'}} className="border-2 font-bold text-xs py-1 px-2 rounded hover:opacity-80 transition-all uppercase">
                    {type}
                  </button>
                ))}
              </div>
              {defensiveResults && (
                <div className="mt-4 border-t pt-4">
                  <ResultRow multiplier={4} typesList={defensiveResults[4]} label="Takes 4x from" />
                  <ResultRow multiplier={2} typesList={defensiveResults[2]} label="Takes 2x from" />
                  <ResultRow multiplier={0.5} typesList={defensiveResults[0.5]} label="Resists (0.5x)" />
                  <ResultRow multiplier={0.25} typesList={defensiveResults[0.25]} label="Resists (0.25x)" />
                  <ResultRow multiplier={0} typesList={defensiveResults[0]} label="Immune to (0x)" />
                </div>
              )}
            </div>

            {/* Offensive Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-200">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-700">
                <Sword size={20} className="text-red-500"/> Offensive Coverage
              </h2>
              <div className="flex justify-between items-center mb-2">
                 <div className="flex flex-wrap gap-2">
                    {offensiveTypes.map(t => (
                      <span key={t} onClick={() => toggleOffensiveType(t)} className="cursor-pointer px-2 py-0.5 text-xs font-bold text-white rounded bg-gray-600 hover:bg-red-500">{t}</span>
                    ))}
                 </div>
                 {offensiveTypes.length > 0 && <button onClick={() => setOffensiveTypes([])} className="text-xs text-red-500 underline">Clear</button>}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {TYPES.map(type => (
                  <button key={type} onClick={() => toggleOffensiveType(type)} style={{backgroundColor: offensiveTypes.includes(type) ? TYPE_COLORS[type] : '#f3f4f6', color: offensiveTypes.includes(type) ? 'white' : '#374151'}} className="border border-transparent font-bold text-xs py-1 px-2 rounded hover:border-gray-300 transition-all uppercase">
                    {type}
                  </button>
                ))}
              </div>
              {offensiveResults && (
                 <div className="mt-4 border-t pt-4">
                    <ResultRow multiplier={4} typesList={offensiveResults[4]} label="Hits 4x against" />
                    <ResultRow multiplier={2} typesList={offensiveResults[2]} label="Hits 2x against" />
                    <ResultRow multiplier={0.5} typesList={offensiveResults[0.5]} label="Not effective (0.5x)" />
                    <ResultRow multiplier={0} typesList={offensiveResults[0]} label="No effect (0x)" />
                 </div>
              )}
            </div>
            
             {/* Type Chart Table */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 overflow-x-auto relative">
               <h2 className="text-lg font-bold mb-3 text-gray-700">Type Chart Reference</h2>
               {hoverInfo && (
                  <div className="fixed z-50 bg-gray-800 text-white text-xs p-2 rounded shadow-lg pointer-events-none" style={{left: hoverInfo.x + 10, top: hoverInfo.y + 10}}>
                     {hoverInfo.attacker} → {hoverInfo.defender}: <span className="font-bold text-yellow-400">{hoverInfo.val}x</span>
                  </div>
               )}
               <div className="inline-block min-w-full">
                  <div className="flex">
                    <div className="w-6 h-6 mr-1"></div>
                    {TYPES.map(t => <div key={t} className="w-6 h-6 mr-1 flex items-center justify-center"><span className="text-[8px] font-bold text-white w-full h-full flex items-center justify-center rounded" style={{backgroundColor: TYPE_COLORS[t]}}>{t.substring(0,3)}</span></div>)}
                  </div>
                  {TYPES.map(atk => (
                    <div key={atk} className="flex mb-1">
                       <div className="w-6 h-6 mr-1 flex items-center justify-center"><span className="text-[8px] font-bold text-white w-full h-full flex items-center justify-center rounded" style={{backgroundColor: TYPE_COLORS[atk]}}>{atk.substring(0,3)}</span></div>
                       {TYPES.map(def => {
                         const val = getMultiplier(atk, def);
                         let bg = '#f3f4f6';
                         if(val === 2) bg = '#4ade80'; if(val === 0.5) bg = '#fca5a5'; if(val === 0) bg = '#1f2937';
                         return (
                           <div key={def} 
                                className="w-6 h-6 mr-1 flex items-center justify-center text-[9px] font-bold cursor-pointer hover:border border-black" 
                                style={{backgroundColor: bg, color: val===0?'white':'black'}}
                                onMouseEnter={(e) => { const rect = e.target.getBoundingClientRect(); setHoverInfo({attacker: atk, defender: def, val, x: rect.right, y: rect.top}); }}
                                onMouseLeave={() => setHoverInfo(null)}
                           >
                             {val === 0.5 ? '½' : val}
                           </div>
                         )
                       })}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedPokemon && <PokemonDetailModal pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />}
    </div>
  );
}