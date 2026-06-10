import {
  getAttributes,
  getCoordinates,
  getPointsString,
  getHigherColor,
  cx,
  cy,
  r
} from './Comparator';

describe('Comparator Domain Logic & Math', () => {
  describe('getAttributes', () => {
    test('should fallback to 70 when athlete is null or undefined', () => {
      const expectedDefaults = { FOR: 70, HAB: 70, VEL: 70, POW: 70, EVO: 70, OVR: 70 };
      expect(getAttributes(null)).toEqual(expectedDefaults);
      expect(getAttributes(undefined)).toEqual(expectedDefaults);
    });

    test('should map attributes correctly if defined', () => {
      const athlete = {
        forceAttr: 85,
        skillAttr: 90,
        speedAttr: 75,
        powerAttr: 80,
        evolutionAttr: 95,
        overall: 88
      };
      expect(getAttributes(athlete)).toEqual({
        FOR: 85,
        HAB: 90,
        VEL: 75,
        POW: 80,
        EVO: 95,
        OVR: 88
      });
    });

    test('should fallback individually to 70 if some attributes are missing', () => {
      const athlete = {
        forceAttr: 90,
        overall: 80
        // other attributes missing
      };
      expect(getAttributes(athlete)).toEqual({
        FOR: 90,
        HAB: 70,
        VEL: 70,
        POW: 70,
        EVO: 70,
        OVR: 80
      });
    });
  });

  describe('getCoordinates', () => {
    test('should place index 0 (FOR) straight up', () => {
      // FOR is index 0. Angle: -Math.PI / 2
      // Cos(-Math.PI / 2) = 0, Sin(-Math.PI / 2) = -1
      // x = cx + r * valPct * 0 = cx = 130
      // y = cy + r * valPct * (-1) = cy - r * valPct
      const attrsMax = { FOR: 100, HAB: 70, VEL: 70, POW: 70, EVO: 70 };
      const coords = getCoordinates(attrsMax);
      
      expect(coords[0].x).toBeCloseTo(130);
      expect(coords[0].y).toBeCloseTo(130 - 90); // 40
    });

    test('should calculate coordinates correctly for 0 value', () => {
      const attrsZero = { FOR: 0, HAB: 0, VEL: 0, POW: 0, EVO: 0 };
      const coords = getCoordinates(attrsZero);
      coords.forEach(pt => {
        expect(pt.x).toBeCloseTo(130);
        expect(pt.y).toBeCloseTo(130);
      });
    });

    test('should calculate coordinates correctly for standard values', () => {
      const attrs = { FOR: 50, HAB: 50, VEL: 50, POW: 50, EVO: 50 };
      const coords = getCoordinates(attrs);
      
      // Since it's all 50, distance from center is exactly r * 0.5 = 45
      coords.forEach((pt, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI / 5);
        const expectedX = cx + (r * 0.5) * Math.cos(angle);
        const expectedY = cy + (r * 0.5) * Math.sin(angle);
        expect(pt.x).toBeCloseTo(expectedX);
        expect(pt.y).toBeCloseTo(expectedY);
      });
    });
  });

  describe('getPointsString', () => {
    test('should format points correctly as a string', () => {
      const pts = [
        { x: 130, y: 40 },
        { x: 215.588, y: 102.18 },
        { x: 182.89, y: 202.82 },
        { x: 77.11, y: 202.82 },
        { x: 44.412, y: 102.18 }
      ];
      
      const str = getPointsString(pts);
      expect(str).toBe("130.0000,40.0000 215.5880,102.1800 182.8900,202.8200 77.1100,202.8200 44.4120,102.1800");
    });
  });

  describe('getHigherColor', () => {
    test('should return grey when values are equal', () => {
      expect(getHigherColor(80, 80, 'A')).toBe('#94a3b8');
      expect(getHigherColor(85, 85, 'B')).toBe('#94a3b8');
    });

    test('should return green for side A if A is greater, red otherwise', () => {
      expect(getHigherColor(90, 80, 'A')).toBe('#10b981');
      expect(getHigherColor(70, 80, 'A')).toBe('#ef4444');
    });

    test('should return green for side B if B is greater, red otherwise', () => {
      expect(getHigherColor(90, 80, 'B')).toBe('#ef4444');
      expect(getHigherColor(70, 80, 'B')).toBe('#10b981');
    });
  });
});
