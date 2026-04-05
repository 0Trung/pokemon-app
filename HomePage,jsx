import React, { useState, useEffect } from 'react';

const POKEBALL_SVG = (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="50" cy="50" r="48" fill="white" stroke="#1a1a1a" strokeWidth="3"/>
    <path d="M2 50 Q2 2 50 2 Q98 2 98 50Z" fill="#b91c1c"/>
    <rect x="2" y="46" width="96" height="8" fill="#1a1a1a"/>
    <circle cx="50" cy="50" r="14" fill="white" stroke="#1a1a1a" strokeWidth="3"/>
    <circle cx="50" cy="50" r="7" fill="white" stroke="#1a1a1a" strokeWidth="2"/>
    <circle cx="44" cy="44" r="2.5" fill="white" opacity="0.6"/>
  </svg>
);

const NAV_CARDS = [
  {
    id: 'pokedex',
    label: 'DEX',
    sub: 'Pokédex',
    desc: '2000+ Pokémon',
    icon: '📖',
    accent: '#dc2626',
  },
  {
    id: 'moves',
    label: 'MOVES',
    sub: 'Move Dex',
    desc: '900+ Moves',
    icon: '⚡',
    accent: '#b91c1c',
  },
  {
    id: 'abilities',
    label: 'ABILITY',
    sub: 'Ability Dex',
    desc: '300+ Abilities',
    icon: '✨',
    accent: '#991b1b',
  },
  {
    id: 'calc',
    label: 'CALC',
    sub: 'Type Calc',
    desc: 'Type Matchups',
    icon: '🛡️',
    accent: '#7f1d1d',
  },
];

export default function HomePage({ onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [pokeball, setPokeball] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setPokeball(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleNav = (id) => {
    setVisible(false);
    setTimeout(() => onNavigate(id), 280);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 60% 0%, #7f1d1d 0%, #1a0505 55%, #0a0a0a 100%)',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      {/* Decorative top border stripe */}
      <div className="w-full h-1 shrink-0 z-10" style={{ background: 'linear-gradient(90deg, transparent, #dc2626, #ef4444, #dc2626, transparent)' }} />

      {/* ── HEADER ── */}
      <div className="z-10 flex flex-col items-center pt-10 pb-2 px-6 text-center">
        <p
          className="text-xs font-bold tracking-[0.35em] uppercase mb-3"
          style={{ color: '#ef4444', letterSpacing: '0.3em' }}
        >
          Welcome to
        </p>
        <h1
          className="text-5xl sm:text-6xl font-bold leading-tight"
          style={{
            color: 'white',
            textShadow: '0 2px 30px rgba(220,38,38,0.5), 0 0 60px rgba(220,38,38,0.15)',
            letterSpacing: '-0.01em',
          }}
        >
          Trung's Pokémon
        </h1>
        <h1
          className="text-5xl sm:text-6xl font-bold"
          style={{
            color: '#ef4444',
            textShadow: '0 2px 30px rgba(220,38,38,0.7)',
            letterSpacing: '-0.01em',
          }}
        >
          Dex
        </h1>
        <div className="mt-4 w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, #dc2626, transparent)' }} />
        <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
          Your complete Pokémon companion
        </p>
      </div>

      {/* ── POKEBALL ── */}
      <div
        className="z-10 my-4"
        style={{
          width: 110,
          height: 110,
          transform: pokeball ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(-180deg)',
          opacity: pokeball ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
          filter: 'drop-shadow(0 0 24px rgba(220,38,38,0.5)) drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
          animation: pokeball ? 'spin-slow 8s linear infinite' : 'none',
        }}
      >
        {POKEBALL_SVG}
      </div>

      {/* ── NAV CARDS ── */}
      <div className="z-10 w-full max-w-2xl px-5 pb-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {NAV_CARDS.map((card, i) => (
            <button
              key={card.id}
              onClick={() => handleNav(card.id)}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: hoveredCard === card.id
                  ? `linear-gradient(135deg, ${card.accent} 0%, #2d0a0a 100%)`
                  : 'linear-gradient(135deg, rgba(30,5,5,0.9) 0%, rgba(10,3,3,0.95) 100%)',
                border: hoveredCard === card.id
                  ? `1.5px solid ${card.accent}`
                  : '1.5px solid rgba(220,38,38,0.2)',
                borderRadius: 12,
                padding: '18px 10px',
                cursor: 'pointer',
                transform: hoveredCard === card.id ? 'translateY(-4px) scale(1.04)' : 'translateY(0) scale(1)',
                boxShadow: hoveredCard === card.id
                  ? `0 12px 32px rgba(0,0,0,0.5), 0 0 20px ${card.accent}55`
                  : '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.2s cubic-bezier(0.34,1.3,0.64,1)',
                opacity: visible ? 1 : 0,
                transitionDelay: `${0.1 + i * 0.07}s`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>{card.icon}</span>
              <span
                style={{
                  color: hoveredCard === card.id ? 'white' : 'rgba(255,255,255,0.85)',
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: '0.05em',
                }}
              >
                {card.label}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {card.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="z-10 pb-6 text-center">
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, letterSpacing: '0.15em' }}>
          POWERED BY POKÉAPI &nbsp;·&nbsp; MADE WITH ❤️ BY TRUNG
        </p>
      </div>

      {/* Decorative bottom border */}
      <div className="w-full h-px shrink-0 z-10" style={{ background: 'linear-gradient(90deg, transparent, #dc262633, transparent)' }} />

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}