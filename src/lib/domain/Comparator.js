// Helper logic for athlete holographic comparison

export const cx = 130;
export const cy = 130;
export const r = 90;

/**
 * Maps/Normalizes athlete attributes, applying a default value of 70 if missing.
 */
export function getAttributes(athlete) {
  if (!athlete) return { FOR: 70, HAB: 70, VEL: 70, POW: 70, EVO: 70, OVR: 70 };
  return {
    FOR: athlete.forceAttr ?? 70,
    HAB: athlete.skillAttr ?? 70,
    VEL: athlete.speedAttr ?? 70,
    POW: athlete.powerAttr ?? 70,
    EVO: athlete.evolutionAttr ?? 70,
    OVR: athlete.overall ?? 70
  };
}

/**
 * Calculates SVG polygon coordinates for a 5-axis radar chart.
 */
export function getCoordinates(attrs) {
  const keys = ['FOR', 'HAB', 'VEL', 'POW', 'EVO'];
  return keys.map((key, i) => {
    const value = attrs[key] ?? 70;
    const angle = -Math.PI / 2 + (i * 2 * Math.PI / 5);
    const valPct = value / 100;
    return {
      x: cx + r * valPct * Math.cos(angle),
      y: cy + r * valPct * Math.sin(angle)
    };
  });
}

/**
 * Formats coordinates array into a SVG-compatible points string.
 */
export function getPointsString(pts) {
  return pts.map(p => `${p.x.toFixed(4)},${p.y.toFixed(4)}`).join(' ');
}

/**
 * Returns color highlight based on which athlete has the higher rating.
 * Green (#10b981) for the winner, Red (#ef4444) for the loser, Grey (#94a3b8) if equal.
 */
export function getHigherColor(valA, valB, side) {
  if (valA === valB) return '#94a3b8';
  if (side === 'A') {
    return valA > valB ? '#10b981' : '#ef4444';
  } else {
    return valB > valA ? '#10b981' : '#ef4444';
  }
}
