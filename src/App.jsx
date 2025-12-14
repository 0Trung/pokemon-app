import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Zap, Shield, Sword, Activity, ChevronRight, BarChart2, ArrowUpDown, ArrowUp, ArrowDown, Loader2, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

// ==========================================
// PHẦN 1: CẤU HÌNH & DỮ LIỆU CỐ ĐỊNH
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
  'thick-fat': { type: ['Fire', 'Ice'], value: 0.5 }, 
  'filter': { value: 0.75 }, 
  'solid-rock': { value: 0.75 },
  'prism-armor': { value: 0.75 },
  'wonder-guard': { special: 'wonder_guard' } 
};

// Helper: Viết hoa chữ cái đầu (quan trọng để khớp key trong bảng Type)
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// Hàm tính tương khắc thường
const getMultiplier = (attacker, defender) => {
  // Đảm bảo defender được viết hoa đúng chuẩn (ví dụ: 'fire' -> 'Fire')
  const def = capitalize(defender);
  if (MATCHUPS[attacker] && MATCHUPS[attacker][def] !== undefined) {
    return MATCHUPS[attacker][def];
  }
  return 1;
};

// Hàm tính tương khắc Inverse (Đảo ngược)
const getInverseMultiplier = (attacker, defender) => {
  const normal = getMultiplier(attacker, defender);
  if (normal === 0) return 2;    // Immune -> Super Effective
  if (normal === 0.5) return 2;  // Not very -> Super Effective
  if (normal === 2) return 0.5;  // Super -> Not very
  return 1;                      // Neutral -> Neutral
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
      <div className="flex-1 h-2 bg-gray-700 rounded-sm overflow-hidden border border-gray-600">
        <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

// Component Moves trong Modal
const MovesTable = ({ moves }) => {
  const [activeFilter, setActiveFilter] = useState('level-up');
  const [moveDetails, setMoveDetails] = useState({});
  const [loadingMoves, setLoadingMoves] = useState(false);

  const filteredMoves = useMemo(() => {
    return moves.filter(m => {
      const details = m.version_group_details[m.version_group_details.length - 1];
      const method = details.move_learn_method.name;
      if (activeFilter === 'level-up') return method === 'level-up';
      if (activeFilter === 'machine') return method === 'machine';
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

  useEffect(() => {
    const fetchMoveData = async () => {
      const movesToFetch = filteredMoves.filter(m => !moveDetails[m.move.name]);
      if (movesToFetch.length === 0) return;

      setLoadingMoves(true);
      const newDetails = { ...moveDetails };
      
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
              pp: data.pp
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
            className={`px-4 py-2 text-sm font-bold capitalize transition-colors ${activeFilter === f ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            {f === 'machine' ? 'TM/HM' : f.replace('-', ' ')}
          </button>
        ))}
      </div>
      
      <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-800 text-gray-400 text-xs sticky top-0 shadow-sm">
            <tr>
              <th className="p-3">Lv</th>
              <th className="p-3">Move</th>
              <th className="p-3">Type</th>
              <th className="p-3">Pow</th>
              <th className="p-3">Acc</th>
              <th className="p-3">PP</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredMoves.map(m => {
              const detail = moveDetails[m.move.name];
              const level = m.version_group_details[m.version_group_details.length - 1].level_learned_at;
              return (
                <tr key={m.move.name} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono text-gray-500 font-bold">{level === 0 ? '-' : level}</td>
                  <td className="p-3 font-bold capitalize">{m.move.name.replace('-', ' ')}</td>
                  <td className="p-3">
                    {detail ? <TypeBadge type={detail.type} small /> : <span className="animate-pulse">...</span>}
                  </td>
                  <td className={`p-3 font-mono ${detail?.power ? 'text-white' : 'text-gray-600'}`}>{detail ? (detail.power || '-') : '...'}</td>
                  <td className="p-3 text-gray-400">{detail ? (detail.accuracy || '-') : '...'}</td>
                  <td className="p-3 text-gray-400">{detail ? detail.pp : '...'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loadingMoves && <div className="text-center text-xs text-gray-500 py-2 flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={12}/> Loading moves...</div>}
      </div>
    </div>
  );
};

// Component Type Defenses Box
const TypeEffectivenessBox = ({ types, abilities }) => {
  const effectiveness = useMemo(() => {
    const results = {};
    const abilityNames = abilities.map(a => a.ability.name);

    TYPES.forEach(attacker => {
      let mult = 1;
      types.forEach(t => {
        // FIX: Viết hoa tên hệ để khớp với bảng MATCHUPS
        mult *= getMultiplier(attacker, t.type.name); 
      });

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
        if (abName === 'thick-fat' && (attacker === 'Fire' || attacker === 'Ice')) {
            mult *= 0.5;
        }
      });
      results[attacker] = mult;
    });
    return results;
  }, [types, abilities]);

  const grouped = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
  Object.entries(effectiveness).forEach(([type, mult]) => {
    if (grouped[mult]) grouped[mult].push(type);
    else if (mult < 0.25 && mult > 0) grouped[0.25].push(type); 
    else if (grouped[mult] === undefined) {}
  });

  const renderGroup = (mult, label, colorClass, bgClass) => {
    if (grouped[mult].length === 0) return null;
    return (
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-12 text-center text-xs font-bold ${colorClass} ${bgClass} rounded py-1 shrink-0`}>{mult}x</div>
        <div className="flex flex-wrap gap-1">
          {grouped[mult].map(t => <TypeBadge key={t} type={t} small />)}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      {/* 4x & 2x */}
      <div className="space-y-1 mb-3">
        {renderGroup(4, '4x', 'text-white', 'bg-red-600')}
        {renderGroup(2, '2x', 'text-white', 'bg-red-500')}
      </div>
      
      {/* Resistance */}
      <div className="space-y-1">
        {renderGroup(0.5, '0.5x', 'text-white', 'bg-green-600')}
        {renderGroup(0.25, '0.25x', 'text-white', 'bg-green-700')}
        {renderGroup(0, '0x', 'text-gray-300', 'bg-gray-700')}
      </div>
      
      {Object.values(grouped).flat().length === 0 && <div className="text-gray-500 text-sm italic">No special effectiveness data.</div>}
    </div>
  );
};

// Modal Chi Tiết
const PokemonDetailModal = ({ pokemon, onClose }) => {
  const [viewMode, setViewMode] = useState('stats'); // 'stats' | 'defenses'

  if (!pokemon) return null;
  const artwork = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  const getStat = (name) => pokemon.stats.find(s => s.stat.name === name)?.base_stat || 0;
  const totalStats = pokemon.stats.reduce((acc, curr) => acc + curr.base_stat, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-gray-700 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono font-bold text-lg">
              #{String(pokemon.displayId || pokemon.id).padStart(3, '0')}
            </span>
            <span className="text-white font-bold text-xl capitalize">{pokemon.name.replace(/-/g, ' ')}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"><X size={24} /></button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar flex-1">
          <div className="flex flex-col gap-6">
            
            {/* Top Section: Info & Toggleable Stats Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image, Info, Abilities */}
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl"></div>
                   <img src={artwork} alt={pokemon.name} className="relative w-full h-full object-contain drop-shadow-xl" />
                </div>
                <div className="flex gap-2 mb-4">
                  {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} />)}
                </div>
                
                <div className="grid grid-cols-2 gap-2 w-full mb-4">
                   <div className="bg-gray-700/30 rounded p-2 text-center border border-gray-700">
                      <div className="text-gray-400 text-[10px] uppercase font-bold">Height</div>
                      <div className="font-bold text-sm text-white">{pokemon.height/10}m</div>
                   </div>
                   <div className="bg-gray-700/30 rounded p-2 text-center border border-gray-700">
                      <div className="text-gray-400 text-[10px] uppercase font-bold">Weight</div>
                      <div className="font-bold text-sm text-white">{pokemon.weight/10}kg</div>
                   </div>
                </div>

                <div className="w-full">
                  <h4 className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-1"><Zap size={12}/> Abilities</h4>
                  <div className="flex flex-col gap-2">
                    {pokemon.abilities.map(a => (
                      <div key={a.ability.name} className={`px-3 py-2 rounded border ${a.is_hidden ? 'border-yellow-600/50 bg-yellow-900/10 text-yellow-100' : 'border-gray-600 bg-gray-700/50 text-gray-200'} text-xs font-bold capitalize flex justify-between items-center shadow-sm`}>
                        <span>{a.ability.name.replace('-', ' ')}</span>
                        {a.is_hidden && <span className="text-[10px] bg-yellow-600/20 text-yellow-200 px-1.5 py-0.5 rounded border border-yellow-600/50">Hidden</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Toggleable Stats / Defenses Box */}
              <div 
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 cursor-pointer hover:bg-gray-900 transition-all shadow-inner relative group h-fit"
                onClick={() => setViewMode(prev => prev === 'stats' ? 'defenses' : 'stats')}
              >
                {/* Header with Switch Icon */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    {viewMode === 'stats' ? <><BarChart2 size={20} className="text-blue-400" /> Base Stats</> : <><Shield size={20} className="text-green-400" /> Type Defenses</>}
                  </h3>
                  <div className="text-xs text-gray-500 group-hover:text-white transition-colors flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-full">
                    <RefreshCw size={12} /> Click to switch
                  </div>
                </div>

                {/* Content */}
                <div className="min-h-[220px]">
                  {viewMode === 'stats' ? (
                    <div className="animate-fadeIn space-y-3">
                      <StatBar label="HP" value={getStat('hp')} />
                      <StatBar label="Atk" value={getStat('attack')} />
                      <StatBar label="Def" value={getStat('defense')} />
                      <StatBar label="SpA" value={getStat('special-attack')} />
                      <StatBar label="SpD" value={getStat('special-defense')} />
                      <StatBar label="Spe" value={getStat('speed')} />
                      <div className="flex justify-between items-center pt-3 border-t border-gray-700 mt-2">
                         <span className="font-bold text-gray-400 text-sm">TOTAL</span>
                         <span className="font-bold text-2xl text-blue-300">{totalStats}</span>
                      </div>
                    </div>
                  ) : (
                    <TypeEffectivenessBox types={pokemon.types} abilities={pokemon.abilities} />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Moves */}
            <div>
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2 border-b border-gray-700 pb-2">
                <Sword size={20} className="text-red-400" /> Move Pool
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
// PHẦN 3: LOGIC CHÍNH APP (UPDATED)
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('pokedex');

  // --- States Calculator ---
  const [defensiveTypes, setDefensiveTypes] = useState([]);
  const [offensiveTypes, setOffensiveTypes] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);

  // --- States Pokedex ---
  const [fullPokemonData, setFullPokemonData] = useState([]); 
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [allAbilities, setAllAbilities] = useState([]);
  const [allMoves, setAllMoves] = useState([]);

  // Fetch Data (Updated for Mega/Gmax/Forms)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Tăng giới hạn lên 2000 để lấy hết Forms, Megas, Gmax (hiện tại có khoảng 1300 mục)
        const listRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
        const listData = await listRes.json();
        const rawList = listData.results;

        // Phân loại: Base (<= 10000) và Forms (> 10000)
        const bases = [];
        const forms = [];
        
        rawList.forEach(p => {
           // Lấy ID từ URL (vd: .../pokemon/1/)
           const id = parseInt(p.url.split('/').filter(Boolean).pop());
           if (id <= 10000) {
             bases.push({ ...p, id, variations: [] });
           } else {
             forms.push({ ...p, id });
           }
        });

        // Sắp xếp Base theo ID
        bases.sort((a,b) => a.id - b.id);

        // Gom nhóm Forms vào Bases
        // Logic: Tìm Base có tên dài nhất mà là prefix của tên Form
        forms.forEach(f => {
           // Tìm các base khớp tên (form name bắt đầu bằng base name)
           const matches = bases.filter(b => f.name.startsWith(b.name));
           // Chọn base có tên dài nhất để chính xác nhất
           matches.sort((a,b) => b.name.length - a.name.length);
           
           if (matches.length > 0) {
              const match = matches[0];
              // Thêm thuộc tính displayId để hiển thị giống base
              match.variations.push({ ...f, displayId: match.id }); 
           } else {
              // Trường hợp hiếm (form độc lập), thêm vào cuối danh sách base
              bases.push({ ...f, variations: [], displayId: f.id }); 
           }
        });

        // NEW STEP: Sắp xếp variations trước khi flatten
        bases.forEach(b => {
            if (b.variations && b.variations.length > 0) {
                b.variations.sort((v1, v2) => {
                    const getScore = (n) => {
                        // Priority 1: Regional Forms
                        if (n.includes('-alola') || n.includes('-galar') || n.includes('-hisui') || n.includes('-paldea')) return 1;
                        // Priority 2: Mega Forms
                        if (n.includes('-mega')) return 2;
                        // Priority 3: Others (Cosplay, Cap, etc.)
                        if (n.includes('-partner') || n.includes('-cap') || n.includes('-cosplay') || n.includes('-origin') || n.includes('-diancie') || n.includes('-eternal')) return 3;
                        // Priority 4: G-Max (Last)
                        if (n.includes('-gmax')) return 4; 
                        return 5; // Fallback
                    };
                    const s1 = getScore(v1.name);
                    const s2 = getScore(v2.name);
                    if (s1 !== s2) return s1 - s2;
                    return v1.name.localeCompare(v2.name); // Tie breaker
                });
            }
        });

        // Làm phẳng danh sách để fetch
        const sortedList = [];
        bases.forEach(b => {
           sortedList.push(b);
           // Thêm các biến thể ngay sau base
           if (b.variations) {
             b.variations.forEach(v => sortedList.push(v));
           }
        });

        // Batch Fetch Details
        const BATCH_SIZE = 50;
        let loadedCount = 0;
        let finalData = [];

        // Fetch Search Helpers (nhẹ)
        fetch('https://pokeapi.co/api/v2/ability?limit=1000').then(r=>r.json()).then(d=>setAllAbilities(d.results));
        fetch('https://pokeapi.co/api/v2/move?limit=1000').then(r=>r.json()).then(d=>setAllMoves(d.results));

        for (let i = 0; i < sortedList.length; i += BATCH_SIZE) {
          const batch = sortedList.slice(i, i + BATCH_SIZE);
          const batchDetails = await Promise.all(
            batch.map(async (p) => {
              try {
                const res = await fetch(p.url);
                const data = await res.json();
                // Gán displayId nếu có (từ logic form ở trên)
                if (p.displayId) data.displayId = p.displayId;
                return data;
              } catch { return null; }
            })
          );
          
          const validDetails = batchDetails.filter(d => d !== null);
          finalData = [...finalData, ...validDetails];
          loadedCount += validDetails.length;
          setLoadingProgress(Math.floor((loadedCount / sortedList.length) * 100));
          setFullPokemonData(prev => [...prev, ...validDetails]);
        }
        
        setIsDataReady(true);
      } catch (e) { console.error(e); }
    };
    fetchAllData();
  }, []);

  // New Suggestion Logic: show suggestions only when input changes
  useEffect(() => {
    if (!searchTerm || searchTerm.startsWith('Related to:')) {
      setSearchSuggestions([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const suggestions = [];
    
    // 1. Check for Pokemon match
    const pokemonMatch = fullPokemonData.find(p => p.name.toLowerCase() === term);
    
    // Suggest "Related to" only if the name is an exact base match
    if (pokemonMatch && pokemonMatch.id <= 10000) {
      suggestions.push({ type: 'Related to', name: pokemonMatch.name });
    }

    // 2. Ability and Move Suggestions
    allAbilities.forEach(a => { if (a.name.includes(term)) suggestions.push({ type: 'Ability', name: a.name, url: a.url }); });
    allMoves.forEach(m => { if (m.name.includes(term)) suggestions.push({ type: 'Move', name: m.name, url: m.url }); });
    
    // 3. Pokemon Name Suggestions
    fullPokemonData.forEach(p => { 
      // Only suggest base forms for name search unless it's a specific form search
      if ((p.name.includes(term) && p.id <= 10000) || (p.name.includes(term) && term.includes('-'))) {
        if (!suggestions.some(s => s.name === p.name)) {
          suggestions.push({ type: 'Pokemon', name: p.name });
        }
      }
    });

    setSearchSuggestions(suggestions.slice(0, 8));
  }, [searchTerm, fullPokemonData, allAbilities, allMoves]);

  const handleSelectSuggestion = (item) => {
    if (item.type === 'Related to') {
      setSearchTerm(`Related to: ${item.name.replace('-', ' ')}`);
    } else {
      setSearchTerm(`${item.type}: ${item.name.replace('-', ' ')}`);
    }
    setCurrentPage(1);
    // Suggestions will clear via the useEffect hook when searchTerm changes to a tagged format
  };

  const processedList = useMemo(() => {
    let result = [...fullPokemonData];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      // NEW LOGIC FOR "Related to: [PokemonName]"
      if (term.startsWith('related to:')) {
        const baseName = term.split(':')[1].trim().toLowerCase().replace(/ /g, '-');
        
        // 1. Find the base Pokemon
        const basePokemon = fullPokemonData.find(p => p.name.toLowerCase() === baseName && p.id <= 10000);
        
        if (basePokemon) {
            const baseId = basePokemon.id;
            // 2. Filter all variations that share the same displayId (which is the baseId)
            result = result.filter(p => (p.displayId || p.id) === baseId);
        } else {
            // If the base Pokemon is not found (e.g., misspelled), show empty list
            result = []; 
        }
      } 
      // EXISTING TAG LOGIC
      else if (term.startsWith('ability:')) {
         const abilityName = term.split(':')[1].trim().toLowerCase().replace(/ /g, '-');
         result = result.filter(p => p.abilities.some(a => a.ability.name === abilityName));
      } else if (term.startsWith('move:')) {
         const moveName = term.split(':')[1].trim().toLowerCase().replace(/ /g, '-');
         result = result.filter(p => p.moves.some(m => m.move.name === moveName));
      } 
      // REGULAR NAME/ID SEARCH
      else {
         result = result.filter(p => p.name.includes(term) || String(p.id).includes(term));
      }
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue, bValue;
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
    return result;
  }, [fullPokemonData, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedList.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedList.slice(start, start + itemsPerPage);
  }, [processedList, currentPage]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="inline opacity-30 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={12} className="inline text-yellow-400 ml-1" />
      : <ArrowDown size={12} className="inline text-yellow-400 ml-1" />;
  };

  // Calc Logic Fixes: 
  const toggleDefensiveType = (t) => {
     if(defensiveTypes.includes(t)) {
        setDefensiveTypes(defensiveTypes.filter(x=>x!==t));
     } else {
        setDefensiveTypes([...defensiveTypes, t]);
     }
  };
  const toggleOffensiveType = (t) => {
     if(offensiveTypes.includes(t)) setOffensiveTypes(offensiveTypes.filter(x=>x!==t));
     else setOffensiveTypes([...offensiveTypes,t]);
  };
  
  // Defensive Calculation for N types
  const defensiveResults = useMemo(() => {
    if (defensiveTypes.length === 0) return null;
    const results = {}; 
    
    TYPES.forEach(attacker => {
      let total = 1;
      defensiveTypes.forEach(def => {
         total *= getMultiplier(attacker, def);
      });
      
      // Group by multiplier
      if (!results[total]) results[total] = [];
      results[total].push(attacker);
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

  const ResultRow = ({ multiplier, typesList, label }) => {
    if (!typesList || typesList.length === 0) return null;
    let colorStyle = { color: '#374151', bg: '#F3F4F6' };
    
    // Logic màu sắc linh hoạt hơn cho nhiều hệ số
    if (multiplier >= 4) colorStyle = { color: '#991B1B', bg: '#FEE2E2' }; // Đỏ đậm (Nguy hiểm/Mạnh)
    else if (multiplier >= 2) colorStyle = { color: '#9D174D', bg: '#FCE7F3' };
    else if (multiplier === 1) colorStyle = { color: '#374151', bg: '#F3F4F6' };
    else if (multiplier === 0) colorStyle = { color: '#1F2937', bg: '#E5E7EB' };
    else if (multiplier <= 0.25) colorStyle = { color: '#14532D', bg: '#F0FDF4' }; // Xanh đậm (Kháng tốt)
    else if (multiplier <= 0.5) colorStyle = { color: '#166534', bg: '#DCFCE7' };

    return (
      <div className="mb-2 p-2 rounded border flex flex-col sm:flex-row sm:items-center gap-2" style={{backgroundColor: colorStyle.bg}}>
        <div className="flex items-center gap-2 min-w-[200px]"> 
          <span className="font-bold text-lg" style={{color: colorStyle.color}}>{multiplier}x</span>
          <span className="text-xs font-medium opacity-80">{label}</span>
          
          <span className="ml-1 text-[11px] text-gray-500/80 font-normal">
            ({typesList.length} types)
          </span>

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
        
        {/* ================= TAB POKEDEX (TABLE LIST) ================= */}
        {activeTab === 'pokedex' && (
          <div className="flex flex-col h-full animate-fadeIn">
            {/* Search Bar & Suggestions (UPDATED) */}
            <div className="p-3 bg-gray-800 border-b border-gray-700 shrink-0 relative z-30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Pokemon, Move, Ability..." 
                  className="w-full bg-gray-900 text-white pl-9 pr-4 py-2 text-sm rounded border border-gray-700 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!isDataReady && (
                   <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2 text-xs text-blue-400">
                      <Loader2 className="animate-spin" size={14} />
                      {loadingProgress}% Loaded
                   </div>
                )}
              </div>
              
              {/* Horizontal Suggestions Display (UPDATED) */}
              {(searchTerm && searchSuggestions.length > 0 && !searchTerm.startsWith('Related to:')) && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-700/50">
                  {searchSuggestions.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="cursor-pointer text-xs font-medium px-2 py-1 rounded-full border transition-all flex items-center gap-1 shadow-md"
                      style={{
                        backgroundColor: item.type === 'Related to' ? '#F87171' : item.type === 'Pokemon' ? '#6D28D9' : item.type === 'Ability' ? '#FBBF24' : '#3B82F6',
                        color: 'white'
                      }}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      {item.type}: <span className="capitalize font-bold">{item.name.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Active Filter Display (UPDATED) */}
              {searchTerm.startsWith('Related to:') || searchTerm.startsWith('Ability:') || searchTerm.startsWith('Move:') ? (
                 <div className="mt-2 text-sm text-gray-400 pt-2 border-t border-gray-700/50">
                   <span className="font-bold text-red-400">Filter Active:</span> <span className="text-white">{searchTerm}</span>
                   <button onClick={() => setSearchTerm('')} className="ml-2 text-blue-400 hover:text-blue-300 underline text-xs">Clear Filter</button>
                 </div>
              ) : null}
            </div>

            {/* TABLE LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
               <div className="flex-1 overflow-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-800 text-gray-400 text-xs uppercase sticky top-0 z-10 shadow-md">
                     <tr>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('id')}>ID {renderSortIcon('id')}</th>
                       <th className="p-3">Icon</th>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Name {renderSortIcon('name')}</th>
                       <th className="p-3">Types</th>
                       <th className="p-3 hidden sm:table-cell">Abilities</th>
                       <th className="p-3 cursor-pointer text-yellow-500 hover:text-yellow-300" onClick={() => handleSort('bst')}>BST {renderSortIcon('bst')}</th>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('hp')}>HP {renderSortIcon('hp')}</th>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('attack')}>Atk {renderSortIcon('attack')}</th>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('defense')}>Def {renderSortIcon('defense')}</th>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('special-attack')}>SpA {renderSortIcon('special-attack')}</th>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('special-defense')}>SpD {renderSortIcon('special-defense')}</th>
                       <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort('speed')}>Spe {renderSortIcon('speed')}</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm divide-y divide-gray-800">
                     {currentData.map(p => {
                        const getS = (n) => p.stats.find(s=>s.stat.name === n)?.base_stat || 0;
                        const bst = p.stats.reduce((a,b)=>a+b.base_stat,0);
                        return (
                          <tr key={p.name} onClick={() => setSelectedPokemon(p)} className="hover:bg-gray-800/50 cursor-pointer transition-colors group">
                             <td className="p-3 font-mono text-gray-500">#{String(p.displayId || p.id).padStart(3,'0')}</td>
                             <td className="p-3">
                                <img src={p.sprites.front_default} alt="" className="w-10 h-10 object-contain pixelated group-hover:scale-110 transition-transform"/>
                             </td>
                             <td className="p-3 font-bold capitalize text-white group-hover:text-blue-400">{p.name.replace(/-/g,' ')}</td>
                             <td className="p-3">
                                {p.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} small />)}
                             </td>
                             <td className="p-3 hidden sm:table-cell text-xs">
                                <div className="flex flex-col gap-0.5">
                                   {p.abilities.filter(a=>!a.is_hidden).map((a, i) => (
                                      <span key={i} className="font-bold text-gray-200 capitalize">{a.ability.name.replace('-',' ')}</span>
                                   ))}
                                   {p.abilities.filter(a=>a.is_hidden).map((a, i) => (
                                      <span key={i} className="text-gray-400 capitalize">{a.ability.name.replace('-',' ')}</span> 
                                   ))}
                                </div>
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
               </div>
               
               {/* Pagination */}
               <div className="bg-gray-800 p-2 border-t border-gray-700 flex items-center justify-between text-xs sm:text-sm shrink-0">
                  <span className="text-gray-400">
                     Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, processedList.length)} of {processedList.length}
                  </span>
                  <div className="flex gap-1">
                     <button 
                       disabled={currentPage === 1}
                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                       className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <ArrowLeft size={16} />
                     </button>
                     <span className="px-3 py-1.5 bg-gray-900 rounded border border-gray-700 font-mono">
                        Page {currentPage} / {totalPages || 1}
                     </span>
                     <button 
                       disabled={currentPage === totalPages || totalPages === 0}
                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                       className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <ArrowRight size={16} />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* ================= TAB CALCULATOR ================= */}
        {activeTab === 'calc' && (
          <div className="h-full overflow-y-auto p-4 bg-gray-100 text-gray-800 animate-fadeIn">
            
            {/* 1. Defensive Analysis (Unlimited Types) */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-200">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-700">
                <Shield size={20} className="text-blue-500"/> Defensive Analysis (Multi-Type)
              </h2>
              
              {/* Selected Types */}
              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                {defensiveTypes.map(t => (
                  <button key={t} onClick={() => toggleDefensiveType(t)} className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-full text-sm hover:bg-black transition-colors animate-fadeIn">
                    {t} <X size={12}/>
                  </button>
                ))}
                {defensiveTypes.length === 0 && <span className="text-sm text-gray-400 italic py-1">Select types below (Unlimited)...</span>}
              </div>

              {/* Type Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {TYPES.map(type => (
                  <button key={type} onClick={() => toggleDefensiveType(type)} style={{borderColor: TYPE_COLORS[type], color: defensiveTypes.includes(type) ? 'white' : TYPE_COLORS[type], backgroundColor: defensiveTypes.includes(type) ? TYPE_COLORS[type] : 'transparent'}} className="border-2 font-bold text-xs py-1 px-2 rounded hover:opacity-80 transition-all uppercase">
                    {type}
                  </button>
                ))}
              </div>

              {/* Results */}
              {defensiveResults && (
                <div className="mt-4 border-t pt-4">
                  {Object.keys(defensiveResults).sort((a,b) => parseFloat(b) - parseFloat(a)).map(multKey => {
                     const mult = parseFloat(multKey);
                     if (mult === 1) return null; // Hide 1x for cleaner view
                     return (
                        <ResultRow 
                           key={multKey}
                           multiplier={mult} 
                           typesList={defensiveResults[multKey]} 
                           label={mult > 1 ? `Takes ${mult}x from` : (mult === 0 ? "Immune to" : `Resists (${mult}x)`)} 
                        />
                     )
                  })}
                </div>
              )}
            </div>

            {/* 2. Offensive Coverage */}
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
              
              {/* Detailed Breakdown 4x, 2x, 1x... */}
              {offensiveResults && (
                 <div className="mt-4 border-t pt-4">
                    <ResultRow multiplier={4} typesList={offensiveResults[4]} label="Super Effective (4x)" />
                    <ResultRow multiplier={2} typesList={offensiveResults[2]} label="Super Effective (2x)" />
                    <ResultRow multiplier={1} typesList={offensiveResults[1]} label="Neutral (1x)" />
                    <ResultRow multiplier={0.5} typesList={offensiveResults[0.5]} label="Not Effective (0.5x)" />
                    <ResultRow multiplier={0.25} typesList={offensiveResults[0.25]} label="Not Effective (0.25x)" />
                    <ResultRow multiplier={0} typesList={offensiveResults[0]} label="No Effect (0x)" />
                 </div>
              )}
            </div>
            
            {/* 3. Type Chart Reference (Larger & Centered) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-x-auto relative mb-4 flex flex-col items-center">
               <h2 className="text-xl font-bold mb-4 text-gray-700 w-full text-left max-w-4xl">Type Chart Reference</h2>
               
               {/* Tooltip */}
               {hoverInfo && (
                  <div className="fixed z-50 bg-gray-800 text-white text-xs p-2 rounded shadow-lg pointer-events-none" style={{left: hoverInfo.x + 10, top: hoverInfo.y + 10}}>
                     {hoverInfo.attacker} → {hoverInfo.defender}: <span className="font-bold text-yellow-400">{hoverInfo.val}x</span>
                  </div>
               )}

               <div className="inline-block">
                  <div className="flex">
                    <div className="w-9 h-9 mr-1"></div>
                    {TYPES.map(t => <div key={t} className="w-9 h-9 mr-1 flex items-center justify-center"><span className="text-[10px] font-bold text-white w-full h-full flex items-center justify-center rounded" style={{backgroundColor: TYPE_COLORS[t]}}>{t.substring(0,3)}</span></div>)}
                  </div>
                  {TYPES.map(atk => (
                    <div key={atk} className="flex mb-1">
                       <div className="w-9 h-9 mr-1 flex items-center justify-center"><span className="text-[10px] font-bold text-white w-full h-full flex items-center justify-center rounded" style={{backgroundColor: TYPE_COLORS[atk]}}>{atk.substring(0,3)}</span></div>
                       {TYPES.map(def => {
                         const val = getMultiplier(atk, def);
                         let bg = '#f3f4f6';
                         if(val === 2) bg = '#4ade80'; if(val === 0.5) bg = '#fca5a5'; if(val === 0) bg = '#1f2937';
                         return (
                           <div key={def} 
                                className="w-9 h-9 mr-1 flex items-center justify-center text-[11px] font-bold cursor-pointer hover:border border-black transition-colors" 
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

            {/* 4. Inverse Type Chart (New Feature) */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 overflow-x-auto relative flex flex-col items-center">
               <h2 className="text-xl font-bold mb-2 text-white w-full text-left max-w-4xl flex items-center gap-2">
                 <RefreshCw size={24} className="text-purple-400"/> Inverse Battle Chart
               </h2>
               <p className="text-gray-400 text-sm mb-4 w-full text-left max-w-4xl">
                 In Inverse Battles: 0x & 0.5x becomes 2x. 2x becomes 0.5x. 1x stays 1x.
               </p>

               <div className="inline-block">
                  <div className="flex">
                    <div className="w-9 h-9 mr-1"></div>
                    {TYPES.map(t => <div key={t} className="w-9 h-9 mr-1 flex items-center justify-center"><span className="text-[10px] font-bold text-white w-full h-full flex items-center justify-center rounded" style={{backgroundColor: TYPE_COLORS[t]}}>{t.substring(0,3)}</span></div>)}
                  </div>
                  {TYPES.map(atk => (
                    <div key={atk} className="flex mb-1">
                       <div className="w-9 h-9 mr-1 flex items-center justify-center"><span className="text-[10px] font-bold text-white w-full h-full flex items-center justify-center rounded" style={{backgroundColor: TYPE_COLORS[atk]}}>{atk.substring(0,3)}</span></div>
                       {TYPES.map(def => {
                         const val = getInverseMultiplier(atk, def);
                         let bg = '#374151'; // Default gray for 1x
                         let text = '1';
                         if(val === 2) { bg = '#4ade80'; text = '2'; } // Green for Super Effective
                         if(val === 0.5) { bg = '#f87171'; text = '½'; } // Red for Not Very Effective
                         
                         return (
                           <div key={def} 
                                className="w-9 h-9 mr-1 flex items-center justify-center text-[11px] font-bold cursor-pointer hover:border border-white transition-colors" 
                                style={{backgroundColor: bg, color: 'white'}}
                                onMouseEnter={(e) => { const rect = e.target.getBoundingClientRect(); setHoverInfo({attacker: atk, defender: def, val, x: rect.right, y: rect.top}); }}
                                onMouseLeave={() => setHoverInfo(null)}
                           >
                             {text}
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
      {selectedPokemon && <PokemonDetailModal pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />}
    </div>
  );
}