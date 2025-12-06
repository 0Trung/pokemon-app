import React, { useState, useMemo } from 'react';
import { X, Info } from 'lucide-react';

// #note: DANH SÁCH 18 HỆ POKEMON
// Đây là danh sách cơ bản để dùng cho vòng lặp
const TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy'
];

// #note: BẢNG MÀU ĐẠI DIỆN CHO CÁC HỆ
// Bạn có thể thay đổi mã màu (hex) nếu muốn đổi giao diện nút bấm
const TYPE_COLORS = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  Grass: '#7AC74C',
  Electric: '#F7D02C',
  Ice: '#96D9D6',
  Fighting: '#C22E28',
  Poison: '#A33EA1',
  Ground: '#E2BF65',
  Flying: '#A98FF3',
  Psychic: '#F95587',
  Bug: '#A6B91A',
  Rock: '#B6A136',
  Ghost: '#735797',
  Dragon: '#6F35FC',
  Steel: '#B7B7CE',
  Dark: '#705746',
  Fairy: '#D685AD',
};

// #note: DỮ LIỆU TƯƠNG KHẮC (TYPE CHART) GEN 6+
// Cấu trúc: { Tên_Hệ_Tấn_Công: { Tên_Hệ_Bị_Đánh: Hệ_Số_Sát_Thương } }
// Nếu không có trong danh sách nghĩa là 1x (sát thương thường)
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

// #note: HÀM HỖ TRỢ LẤY HỆ SỐ SÁT THƯƠNG
// Trả về 1 nếu không tìm thấy trong bảng MATCHUPS
const getMultiplier = (attacker, defender) => {
  if (MATCHUPS[attacker] && MATCHUPS[attacker][defender] !== undefined) {
    return MATCHUPS[attacker][defender];
  }
  return 1;
};

// #note: HÀM TẠO VĂN BẢN MÔ TẢ CHO TOOLTIP
const getEffectivenessText = (multiplier) => {
  if (multiplier === 4) return "does QUADRUPLE (4x) damage against"; // Siêu hiệu quả x4
  if (multiplier === 2) return "does DOUBLE (2x) damage against";    // Siêu hiệu quả
  if (multiplier === 1) return "does REGULAR (1x) damage against";   // Bình thường
  if (multiplier === 0.5) return "does HALF (0.5x) damage against";  // Không hiệu quả lắm
  if (multiplier === 0.25) return "does QUARTER (0.25x) damage against"; // Rất không hiệu quả
  if (multiplier === 0) return "does ZERO (0x) damage against";      // Vô hiệu
  return "does damage against";
};

export default function PokemonCalculator() {
  const [activeTab, setActiveTab] = useState('defensive');
  
  // State cho Defensive
  const [defensiveTypes, setDefensiveTypes] = useState([]);

  // State cho Offensive
  const [offensiveTypes, setOffensiveTypes] = useState([]);

  // State cho Chart (Tooltip)
  const [hoverInfo, setHoverInfo] = useState(null);

  // #note: LOGIC XỬ LÝ CHỌN HỆ PHÒNG THỦ (Tối đa 2 hệ)
  const toggleDefensiveType = (type) => {
    if (defensiveTypes.includes(type)) {
      setDefensiveTypes(defensiveTypes.filter(t => t !== type));
    } else {
      if (defensiveTypes.length < 2) {
        setDefensiveTypes([...defensiveTypes, type]);
      } else {
        // Nếu đã chọn 2, thay thế hệ cuối cùng bằng hệ mới (UX phổ biến)
        setDefensiveTypes([defensiveTypes[0], type]);
      }
    }
  };

  // #note: LOGIC XỬ LÝ CHỌN HỆ TẤN CÔNG (Không giới hạn)
  const toggleOffensiveType = (type) => {
    if (offensiveTypes.includes(type)) {
      setOffensiveTypes(offensiveTypes.filter(t => t !== type));
    } else {
      setOffensiveTypes([...offensiveTypes, type]);
    }
  };

  // #note: TÍNH TOÁN KẾT QUẢ PHÒNG THỦ
  // Memoize để không tính lại trừ khi defensiveTypes thay đổi
  const defensiveResults = useMemo(() => {
    if (defensiveTypes.length === 0) return null;
    
    const results = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
    
    TYPES.forEach(attacker => {
      let mult1 = getMultiplier(attacker, defensiveTypes[0]);
      let mult2 = defensiveTypes[1] ? getMultiplier(attacker, defensiveTypes[1]) : 1;
      let total = mult1 * mult2;
      
      if (results[total]) {
        results[total].push(attacker);
      }
    });
    return results;
  }, [defensiveTypes]);

  // #note: TÍNH TOÁN KẾT QUẢ TẤN CÔNG (OFFENSIVE COVERAGE)
  const offensiveResults = useMemo(() => {
    if (offensiveTypes.length === 0) return null;

    // Tìm hệ số cao nhất mà nhóm tấn công gây ra cho từng hệ phòng thủ
    const coverage = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
    
    TYPES.forEach(defender => {
      let maxDamage = 0;
      offensiveTypes.forEach(attacker => {
        const dmg = getMultiplier(attacker, defender);
        if (dmg > maxDamage) maxDamage = dmg;
      });
      
      if (coverage[maxDamage]) {
        coverage[maxDamage].push(defender);
      } else {
        // Trường hợp đặc biệt (vd: maxDamage có thể là 0.25 hoặc 0)
        if (coverage[maxDamage] === undefined) coverage[maxDamage] = []; 
        coverage[maxDamage].push(defender);
      }
    });
    return coverage;
  }, [offensiveTypes]);


  // UI Components
  // #note: Component Nút Bấm Hệ (dùng chung)
  const TypeButton = ({ type, isActive, onClick, isSmall = false }) => (
    <button
      onClick={() => onClick(type)}
      style={{ 
        backgroundColor: isActive ? TYPE_COLORS[type] : '#e5e7eb',
        color: isActive ? 'white' : '#374151',
        borderColor: isActive ? TYPE_COLORS[type] : 'transparent'
      }}
      className={`
        ${isSmall ? 'text-xs py-1 px-2' : 'text-sm py-2 px-4'}
        rounded font-bold uppercase tracking-wider transition-all duration-200
        border-2 hover:opacity-90 shadow-sm
      `}
    >
      {type}
    </button>
  );

  // #note: Component Hiển thị kết quả (các dòng takes X from...)
  const ResultRow = ({ multiplier, typesList, label }) => {
    if (!typesList || typesList.length === 0) return null;
    
    // Màu nền cho từng mức độ nguy hiểm/hiệu quả
    let bgClass = "bg-gray-100";
    if (multiplier >= 2) bgClass = "bg-green-50 border-green-200"; // Tốt cho Offense, Xấu cho Defense?
    // Thực ra logic màu nên dựa trên ngữ cảnh, ở đây để màu trung tính hoặc theo multiplier
    // Sửa lại logic màu dựa trên giá trị multiplier thuần túy
    let colorStyle = {};
    if (multiplier === 4) colorStyle = { color: '#D32F2F', bg: '#FFEBEE' }; // Đỏ đậm
    if (multiplier === 2) colorStyle = { color: '#C2185B', bg: '#FCE4EC' }; // Hồng/Đỏ
    if (multiplier === 1) colorStyle = { color: '#424242', bg: '#F5F5F5' }; // Xám
    if (multiplier === 0.5) colorStyle = { color: '#388E3C', bg: '#E8F5E9' }; // Xanh lá
    if (multiplier === 0.25) colorStyle = { color: '#1B5E20', bg: '#C8E6C9' }; // Xanh lá đậm
    if (multiplier === 0) colorStyle = { color: '#616161', bg: '#E0E0E0' }; // Đen/Xám đậm

    return (
      <div className={`mb-3 p-3 rounded-lg border ${bgClass}`} style={{backgroundColor: colorStyle.bg}}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-lg" style={{color: colorStyle.color}}>
            {label} ({multiplier}x):
          </span>
          <span className="text-sm text-gray-500">({typesList.length} types)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {typesList.map(t => (
            <span 
              key={t} 
              style={{backgroundColor: TYPE_COLORS[t]}}
              className="text-white text-xs font-bold px-2 py-1 rounded uppercase shadow-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      {/* HEADER */}
      <header className="bg-red-600 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full border-4 border-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div>
            Pokemon Type Calculator
          </h1>
          <div className="text-xs opacity-80 hidden sm:block">Personal Edition</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-6 px-4">
        
        {/* #note: THANH ĐIỀU HƯỚNG (TABS) */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg overflow-hidden shadow-sm">
          {['defensive', 'offensive', 'chart'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-center font-bold capitalize transition-colors
                ${activeTab === tab 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ================= TAB DEFENSIVE ================= */}
        {activeTab === 'defensive' && (
          <div className="animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
                1. Select Your Pokemon's Type(s)
              </h2>
              
              {/* Hiển thị hệ đã chọn */}
              <div className="flex gap-4 mb-4 min-h-[3rem] items-center">
                {defensiveTypes.length === 0 && <span className="text-gray-400 italic">Choose up to 2 types below...</span>}
                {defensiveTypes.map(t => (
                  <div key={t} className="relative group">
                    <div 
                      style={{backgroundColor: TYPE_COLORS[t]}} 
                      className="text-white font-bold px-6 py-2 rounded shadow-md uppercase text-lg"
                    >
                      {t}
                    </div>
                    <button 
                      onClick={() => toggleDefensiveType(t)}
                      className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Lưới chọn hệ */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TYPES.map(type => (
                  <TypeButton 
                    key={type} 
                    type={type} 
                    isActive={defensiveTypes.includes(type)}
                    onClick={toggleDefensiveType}
                  />
                ))}
              </div>
            </div>

            {/* Kết quả Defensive */}
            {defensiveResults && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Defensive Effectiveness</h2>
                <p className="text-sm text-gray-500 mb-4">
                  This shows how much damage <b>{defensiveTypes.join(' + ')}</b> takes from other types.
                </p>

                <ResultRow multiplier={4} typesList={defensiveResults[4]} label="Takes QUADRUPLE damage from" />
                <ResultRow multiplier={2} typesList={defensiveResults[2]} label="Takes DOUBLE damage from" />
                <ResultRow multiplier={1} typesList={defensiveResults[1]} label="Takes REGULAR damage from" />
                <ResultRow multiplier={0.5} typesList={defensiveResults[0.5]} label="Takes HALF damage from" />
                <ResultRow multiplier={0.25} typesList={defensiveResults[0.25]} label="Takes QUARTER damage from" />
                <ResultRow multiplier={0} typesList={defensiveResults[0]} label="Takes ZERO damage from (Immune)" />
              </div>
            )}
          </div>
        )}

        {/* ================= TAB OFFENSIVE ================= */}
        {activeTab === 'offensive' && (
          <div className="animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-bold text-gray-700">
                  2. Select Attack Types (Unlimited)
                </h2>
                {offensiveTypes.length > 0 && (
                   <button onClick={() => setOffensiveTypes([])} className="text-xs text-red-500 hover:underline font-bold">Clear All</button>
                )}
              </div>

              {/* Lưới chọn hệ */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {TYPES.map(type => (
                  <TypeButton 
                    key={type} 
                    type={type} 
                    isActive={offensiveTypes.includes(type)}
                    onClick={toggleOffensiveType}
                  />
                ))}
              </div>
            </div>

            {/* Kết quả Offensive */}
            {offensiveResults && (
               <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Weakness Coverage</h2>
                <p className="text-sm text-gray-500 mb-4">
                   These are the types you can hit for X damage using your selected arsenal.
                </p>

                {/* Hiển thị đảo ngược so với Defensive: Ở đây 4x/2x là TỐT cho người dùng */}
                <ResultRow multiplier={4} typesList={offensiveResults[4]} label="Hits for QUADRUPLE damage against" />
                <ResultRow multiplier={2} typesList={offensiveResults[2]} label="Hits for DOUBLE damage against" />
                <ResultRow multiplier={1} typesList={offensiveResults[1]} label="Hits for REGULAR damage against" />
                <ResultRow multiplier={0.5} typesList={offensiveResults[0.5]} label="Hits for HALF damage against" />
                <ResultRow multiplier={0.25} typesList={offensiveResults[0.25]} label="Hits for QUARTER damage against" />
                <ResultRow multiplier={0} typesList={offensiveResults[0]} label="Hits for ZERO damage against" />
               </div>
            )}
          </div>
        )}

        {/* ================= TAB CHART ================= */}
        {activeTab === 'chart' && (
          <div className="animate-fadeIn bg-white p-4 rounded-lg shadow-md overflow-x-auto relative">
             <h2 className="text-lg font-bold mb-4 text-gray-700">Full Type Effectiveness Chart</h2>
             <p className="text-xs text-gray-500 mb-4">Rows are Attacking Types. Columns are Defending Types.</p>
             
             {/* #note: TOOLTIP CUSTOM */}
             {/* Tooltip hiển thị khi hover vào ô trong bảng */}
             {hoverInfo && (
                <div 
                  className="fixed z-50 bg-gray-900 text-white p-3 rounded shadow-xl pointer-events-none border border-gray-700 max-w-xs"
                  style={{ 
                    left: hoverInfo.x + 15, 
                    top: hoverInfo.y + 15,
                  }}
                >
                  <div className="font-bold flex items-center gap-2 mb-1">
                     <span style={{color: TYPE_COLORS[hoverInfo.attacker]}}>{hoverInfo.attacker}</span>
                     <span>→</span>
                     <span style={{color: TYPE_COLORS[hoverInfo.defender]}}>{hoverInfo.defender}</span>
                     <span>= {hoverInfo.val}x</span>
                  </div>
                  <div className="text-xs text-gray-300 italic">
                    {hoverInfo.attacker} {getEffectivenessText(hoverInfo.val)} {hoverInfo.defender}
                  </div>
                </div>
             )}

             {/* BẢNG GRID 19x19 */}
             <div className="inline-block min-w-full">
                {/* Header Row (Defenders) */}
                <div className="flex">
                  <div className="w-8 h-8 shrink-0 mr-1"></div> {/* Góc trống */}
                  {TYPES.map(type => (
                    <div key={type} className="w-8 h-8 shrink-0 flex items-center justify-center mb-1 mr-1">
                       {/* Viết tắt tên hệ để vừa ô vuông */}
                       <span 
                          className="text-[10px] font-bold text-white w-full h-full flex items-center justify-center rounded"
                          style={{backgroundColor: TYPE_COLORS[type]}}
                          title={type} // Tooltip native của trình duyệt
                       >
                         {type.substring(0,3)}
                       </span>
                    </div>
                  ))}
                </div>

                {/* Body Rows (Attackers) */}
                {TYPES.map(attacker => (
                  <div key={attacker} className="flex mb-1">
                    {/* Row Header (Attacker) */}
                    <div className="w-8 h-8 shrink-0 mr-1 flex items-center justify-center">
                       <span 
                          className="text-[10px] font-bold text-white w-full h-full flex items-center justify-center rounded"
                          style={{backgroundColor: TYPE_COLORS[attacker]}}
                          title={attacker}
                       >
                         {attacker.substring(0,3)}
                       </span>
                    </div>

                    {/* Cells */}
                    {TYPES.map(defender => {
                      const val = getMultiplier(attacker, defender);
                      // Style màu nền cho ô dựa trên giá trị
                      let cellBg = "#f3f4f6"; // Mặc định x1
                      let cellText = "";
                      if (val === 2) { cellBg = "#4ade80"; cellText = "2"; } // Xanh lá
                      if (val === 0.5) { cellBg = "#f87171"; cellText = "½"; } // Đỏ nhạt
                      if (val === 0) { cellBg = "#1f2937"; cellText = "0"; } // Đen

                      return (
                        <div 
                          key={`${attacker}-${defender}`}
                          className="w-8 h-8 shrink-0 mr-1 cursor-pointer border border-white hover:border-black transition-colors flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: cellBg,
                            color: val === 0 ? 'white' : 'black'
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            // Lưu vị trí chuột để hiện tooltip
                            setHoverInfo({
                              attacker,
                              defender,
                              val,
                              x: rect.right,
                              y: rect.top
                            })
                          }}
                          onMouseLeave={() => setHoverInfo(null)}
                        >
                          {cellText}
                        </div>
                      )
                    })}
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>
      
      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm mt-10 pb-4">
        Built for Personal Training • Data based on Gen 6+ Mechanics
      </footer>
    </div>
  );
}