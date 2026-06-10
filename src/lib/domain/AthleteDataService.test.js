import { AthleteDataService } from './AthleteDataService';

describe('AthleteDataService', () => {
  let service;
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = {
      athlete: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      workout: {
        findMany: jest.fn(),
      },
      pRRecord: {
        create: jest.fn(),
      },
    };
    service = new AthleteDataService(mockPrisma);
  });

  describe('getSportByPosition', () => {
    test('should map FORÇA BASE to Powerlifting', () => {
      expect(service.getSportByPosition('Força Base')).toBe('Powerlifting');
      expect(service.getSportByPosition('FORÇA BASE')).toBe('Powerlifting');
    });

    test('should map ALUNO to Powerlifting', () => {
      expect(service.getSportByPosition('ALUNO')).toBe('Powerlifting');
    });

    test('should map FORWARDS and BACKS to Rugby', () => {
      expect(service.getSportByPosition('Forwards')).toBe('Rugby');
      expect(service.getSportByPosition('backs')).toBe('Rugby');
    });

    test('should map other positions to Futebol Americano', () => {
      expect(service.getSportByPosition('QB')).toBe('Futebol Americano');
      expect(service.getSportByPosition('OL')).toBe('Futebol Americano');
      expect(service.getSportByPosition('DL')).toBe('Futebol Americano');
    });
  });

  describe('calculateTacticalStats', () => {
    test('should calculate correct stats for Powerlifting position', () => {
      const athlete = {
        name: 'Rafael Squat',
        position: 'Força Base',
        overall: 80,
        attendanceCount: 10,
        prCount: 2,
        personalRecords: [{ maxLoad: 220 }],
        coach: { teamName: 'Iron Gym' },
      };

      const stats = service.calculateTacticalStats(athlete);

      expect(stats.sport).toBe('Powerlifting');
      expect(stats.athleteName).toBe('Rafael Squat');
      expect(stats.teamName).toBe('Iron Gym');
      expect(stats.summary).toContainEqual({ label: 'SQUAT PR (KG)', value: '220 KG' });
      expect(stats.summary).toContainEqual({ label: 'SESSÕES TOTAIS', value: 10 });
      expect(stats.svgBody).toBe('powerlifting');
    });

    test('should estimate PR for Powerlifting when personalRecords is empty', () => {
      const athlete = {
        name: 'John Doe',
        position: 'Aluno',
        overall: 70,
        attendanceCount: 4,
        personalRecords: [],
      };

      const stats = service.calculateTacticalStats(athlete);
      expect(stats.summary).toContainEqual({ label: 'SQUAT PR (KG)', value: '175 KG' }); // 70 * 2.5
    });

    test('should calculate correct stats for Rugby', () => {
      const athlete = {
        name: 'Jack Rugby',
        position: 'Forwards',
        overall: 80,
        attendanceCount: 6,
        coach: { teamName: 'London RC' },
      };

      const stats = service.calculateTacticalStats(athlete);

      expect(stats.sport).toBe('Rugby');
      expect(stats.summary).toContainEqual({ label: 'TACKLES', value: 33 }); // 6 * 5 + 3
      expect(stats.summary).toContainEqual({ label: 'METROS CORRIDOS', value: '750m' }); // 6 * 85 + 240
      expect(stats.svgBody).toBe('rugby');
    });

    test('should calculate correct stats for Football QB', () => {
      const athlete = {
        name: 'Tom Brady',
        position: 'QB',
        overall: 90,
        attendanceCount: 12,
        prCount: 1,
        coach: { teamName: 'Patriots' },
      };

      const stats = service.calculateTacticalStats(athlete);

      expect(stats.sport).toBe('Futebol Americano');
      expect(stats.summary).toContainEqual({ label: 'PASS TOUCHDOWNS', value: 19 }); // 12 * 1.5 + 1 * 0.5 = 18.5 -> round to 19
      expect(stats.summary).toContainEqual({ label: 'PASS YARDS', value: '2655 YDS' }); // 12 * 220 + 1 * 15 = 2655
      expect(stats.svgBody).toBe('football');
    });

    test('should calculate correct stats for Football OL', () => {
      const athlete = {
        name: 'Joe Thomas',
        position: 'OL',
        overall: 85,
        attendanceCount: 10,
        prCount: 3,
        coach: { teamName: 'Browns' },
      };

      const stats = service.calculateTacticalStats(athlete);

      expect(stats.sport).toBe('Futebol Americano');
      expect(stats.summary).toContainEqual({ label: 'PANCAKES', value: 24 }); // 10 * 2.2 + 3 * 0.6 = 23.8 -> 24
      expect(stats.svgBody).toBe('football');
    });
  });

  describe('getAthleteFullProfile', () => {
    test('should return profile, mvp, and workouts', async () => {
      const mockAthlete = { id: 'athlete-1', name: 'Athlete One', coachId: 'coach-1' };
      const mockMvp = { id: 'athlete-2', name: 'Athlete Two', isMVP: true };
      const mockWorkouts = [{ id: 'workout-1', date: new Date() }];

      mockPrisma.athlete.findUnique.mockResolvedValue(mockAthlete);
      mockPrisma.athlete.findFirst.mockResolvedValue(mockMvp);
      mockPrisma.workout.findMany.mockResolvedValue(mockWorkouts);

      const result = await service.getAthleteFullProfile('athlete-1');

      expect(mockPrisma.athlete.findUnique).toHaveBeenCalledWith({
        where: { id: 'athlete-1' },
        include: {
          coach: true,
          personalRecords: { orderBy: { dateAchieved: 'desc' } }
        }
      });
      expect(mockPrisma.athlete.findFirst).toHaveBeenCalledWith({
        where: { coachId: 'coach-1', isMVP: true }
      });
      expect(mockPrisma.workout.findMany).toHaveBeenCalledWith({
        where: { athleteId: 'athlete-1' },
        include: { sets: true, coach: true },
        orderBy: { date: 'desc' }
      });

      expect(result).toEqual({
        athlete: mockAthlete,
        mvp: mockMvp,
        workouts: mockWorkouts
      });
    });

    test('should return null if athlete is not found', async () => {
      mockPrisma.athlete.findUnique.mockResolvedValue(null);

      const result = await service.getAthleteFullProfile('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('updateAthleteCustomization', () => {
    test('should update customizations and return updated athlete', async () => {
      const updatedAthlete = { id: 'athlete-1', themeColor: '#ff0000', profilePhoto: 'pic.png', cardBorder: 'glow' };
      mockPrisma.athlete.update.mockResolvedValue(updatedAthlete);

      const result = await service.updateAthleteCustomization('athlete-1', {
        themeColor: '#ff0000',
        profilePhoto: 'pic.png',
        cardBorder: 'glow'
      });

      expect(mockPrisma.athlete.update).toHaveBeenCalledWith({
        where: { id: 'athlete-1' },
        data: {
          themeColor: '#ff0000',
          profilePhoto: 'pic.png',
          cardBorder: 'glow'
        },
        include: {
          personalRecords: { orderBy: { dateAchieved: 'desc' } }
        }
      });
      expect(result).toEqual(updatedAthlete);
    });
  });

  describe('addAthletePR', () => {
    test('should create PRRecord and update athlete prCount', async () => {
      const updatedAthlete = { id: 'athlete-1', prCount: 5 };
      mockPrisma.pRRecord.create.mockResolvedValue({});
      mockPrisma.athlete.update.mockResolvedValue(updatedAthlete);

      const result = await service.addAthletePR('athlete-1', {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        maxLoad: '120.5'
      });

      expect(mockPrisma.pRRecord.create).toHaveBeenCalledWith({
        data: {
          athleteId: 'athlete-1',
          exerciseId: 'bench-press',
          exerciseName: 'Bench Press',
          maxLoad: 120.5
        }
      });
      expect(mockPrisma.athlete.update).toHaveBeenCalledWith({
        where: { id: 'athlete-1' },
        data: {
          prCount: { increment: 1 }
        },
        include: {
          personalRecords: { orderBy: { dateAchieved: 'desc' } }
        }
      });
      expect(result).toEqual(updatedAthlete);
    });

    test('should use default exerciseId if none provided', async () => {
      mockPrisma.pRRecord.create.mockResolvedValue({});
      mockPrisma.athlete.update.mockResolvedValue({});

      await service.addAthletePR('athlete-1', {
        exerciseName: 'Custom Lift',
        maxLoad: 100
      });

      expect(mockPrisma.pRRecord.create).toHaveBeenCalledWith({
        data: {
          athleteId: 'athlete-1',
          exerciseId: 'custom-pr',
          exerciseName: 'Custom Lift',
          maxLoad: 100
        }
      });
    });
  });

  describe('getAthletePhysioData', () => {
    test('should return physiological data and correct calculations', async () => {
      const mockWorkouts = [
        {
          id: 'w-1',
          date: new Date(),
          rpeScore: 8,
          sleepScore: 5,
          painScore: 1,
          sets: [{ actualLoad: 100, targetReps: 5 }]
        }
      ];
      const mockAthlete = {
        id: 'athlete-1',
        name: 'Physio Athlete',
        position: 'QB',
        overall: 80,
        workouts: mockWorkouts
      };

      mockPrisma.athlete.findUnique.mockResolvedValue(mockAthlete);
      mockPrisma.workout.findMany.mockResolvedValue(mockWorkouts);

      const result = await service.getAthletePhysioData('athlete-1');

      expect(mockPrisma.athlete.findUnique).toHaveBeenCalledWith({
        where: { id: 'athlete-1' },
        include: {
          workouts: {
            include: { sets: true },
            orderBy: { date: 'desc' },
            take: 15
          }
        }
      });

      expect(result.athleteName).toBe('Physio Athlete');
      expect(result.acwr).toBe(4.0);
      expect(result.history).toHaveLength(1);
      expect(result.history[0]).toEqual({
        date: mockWorkouts[0].date.toISOString().split('T')[0],
        rpe: 8,
        sleep: 5,
        pain: 1,
        workload: 500
      });
    });

    test('should return null if athlete not found', async () => {
      mockPrisma.athlete.findUnique.mockResolvedValue(null);

      const result = await service.getAthletePhysioData('invalid-athlete');

      expect(result).toBeNull();
    });
  });
});
