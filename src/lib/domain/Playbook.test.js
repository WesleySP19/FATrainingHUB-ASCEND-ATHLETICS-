describe('Playbook Logic', () => {
  test('should validate JSON play format', () => {
    const playJSON = {
      players: [
        { id: 'p1', number: '88', position: 'WR', start: [100, 200], route: [[200, 200]] }
      ]
    };
    
    expect(playJSON.players).toHaveLength(1);
    expect(playJSON.players[0].number).toBe('88');
    expect(playJSON.players[0].route).toEqual([[200, 200]]);
  });

  test('should interpolate paths correctly', () => {
    const start = [100, 200];
    const route = [[200, 200]];
    const nodes = [start, ...route];
    
    const interpolate = (time) => {
      if (time <= 0) return { x: start[0], y: start[1] };
      if (time >= 1) return { x: route[0][0], y: route[0][1] };
      const scaled = time * (nodes.length - 1);
      const idx = Math.floor(scaled);
      const t = scaled - idx;
      const pA = nodes[idx];
      const pB = nodes[idx + 1];
      return {
        x: pA[0] + (pB[0] - pA[0]) * t,
        y: pA[1] + (pB[1] - pA[1]) * t
      };
    };

    expect(interpolate(0)).toEqual({ x: 100, y: 200 });
    expect(interpolate(0.5)).toEqual({ x: 150, y: 200 });
    expect(interpolate(1)).toEqual({ x: 200, y: 200 });
  });

  test('should calculate camera translation correct offset', () => {
    const canvasWidth = 600;
    const canvasHeight = 400;
    const playerPos = { x: 150, y: 250 };
    
    const dx = canvasWidth / 2 - playerPos.x;
    const dy = canvasHeight / 2 - playerPos.y;

    expect(dx).toBe(150);
    expect(dy).toBe(-50);
    
    const clickX = 300;
    const clickY = 200;
    const worldX = clickX - dx;
    const worldY = clickY - dy;

    expect(worldX).toBe(150);
    expect(worldY).toBe(250);
  });

  test('should validate quiz click accuracy within threshold', () => {
    const endPoint = [200, 200];
    const threshold = 28;
    
    const isCorrectClick = (x, y) => {
      const dist = Math.hypot(x - endPoint[0], y - endPoint[1]);
      return dist <= threshold;
    };

    expect(isCorrectClick(210, 210)).toBe(true);
    expect(isCorrectClick(200, 200)).toBe(true);
    expect(isCorrectClick(230, 200)).toBe(false);
  });
});
