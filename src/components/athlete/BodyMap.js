export default function BodyMap({ activeMuscles }) {
  if (!activeMuscles) {
    activeMuscles = { chest: false, back: false, shoulders: false, arms: false, legs: false, core: false };
  }

  return (
    <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 130 140" style={{ width: '120px', height: '130px', overflow: 'visible' }}>
        {/* FRONT BODY */}
        <g>
          <circle cx="35" cy="15" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="35" y1="22" x2="35" y2="27" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M 20 28 L 50 28 L 46 70 L 24 70 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          
          <path 
            d="M 22 30 L 48 30 L 46 45 L 24 45 Z" 
            fill={activeMuscles.chest ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
            stroke={activeMuscles.chest ? "#00ffff" : "rgba(255,255,255,0.08)"} 
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.chest ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <rect 
            x="25" y="48" width="20" height="18" rx="2"
            fill={activeMuscles.core ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
            stroke={activeMuscles.core ? "#00ffff" : "rgba(255,255,255,0.08)"} 
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.core ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 18 30 L 13 65" 
            stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 52 30 L 57 65" 
            stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 28 73 L 28 130" 
            stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="4" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 42 73 L 42 130" 
            stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="4" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <text x="35" y="138" fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle">FRENTE</text>
        </g>

        {/* BACK BODY */}
        <g>
          <circle cx="95" cy="15" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="95" y1="22" x2="95" y2="27" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M 80 28 L 110 28 L 106 70 L 84 70 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          
          <path 
            d="M 82 30 L 108 30 L 105 52 L 85 52 Z" 
            fill={activeMuscles.back ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
            stroke={activeMuscles.back ? "#00ffff" : "rgba(255,255,255,0.08)"} 
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.back ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 85 55 L 105 55 L 104 68 L 86 68 Z" 
            fill={activeMuscles.legs || activeMuscles.back ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
            stroke={activeMuscles.legs || activeMuscles.back ? "#00ffff" : "rgba(255,255,255,0.08)"} 
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs || activeMuscles.back ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 78 28 Q 95 24 112 28 L 108 34 L 82 34 Z" 
            fill={activeMuscles.shoulders ? "rgba(0, 255, 255, 0.75)" : "rgba(255,255,255,0.03)"} 
            stroke={activeMuscles.shoulders ? "#00ffff" : "rgba(255,255,255,0.08)"} 
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.shoulders ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 78 30 L 73 65" 
            stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 112 30 L 117 65" 
            stroke={activeMuscles.arms ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.arms ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 88 73 L 88 130" 
            stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="4" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <path 
            d="M 102 73 L 102 130" 
            stroke={activeMuscles.legs ? "#00ffff" : "rgba(255,255,255,0.15)"} 
            strokeWidth="4" 
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease', filter: activeMuscles.legs ? 'drop-shadow(0 0 4px #00ffff)' : 'none' }}
          />
          <text x="95" y="138" fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle">VERSO</text>
        </g>
      </svg>
    </div>
  );
}
