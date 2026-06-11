import { useState, useEffect } from 'react';

export default function useWorkoutBuilder(coach) {
  // States
  const [library, setLibrary] = useState([]);
  const [sportsFilter, setSportsFilter] = useState('ALL');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutPin, setWorkoutPin] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Roster and Assignment target
  const [athletes, setAthletes] = useState([]);
  const [targetType, setTargetType] = useState('ALL');
  const [targetPosition, setTargetPosition] = useState('OL');
  const [targetAthleteId, setTargetAthleteId] = useState('');
  const [mvpAthlete, setMvpAthlete] = useState(null);

  // Override Mode
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [baseWorkoutId, setBaseWorkoutId] = useState('');
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  // Active builder day selection
  const [activeDay, setActiveDay] = useState('monday');
  const [showSelectorModal, setShowSelectorModal] = useState(false);

  // Resolve Exercise Image
  const getExerciseImage = (name) => {
    const lowercase = (name || '').toLowerCase();
    if (lowercase.includes('squat')) return '/exercises/back_squat.png';
    if (lowercase.includes('bench') || lowercase.includes('press')) return '/exercises/bench_press.png';
    if (lowercase.includes('sprint') || lowercase.includes('clean') || lowercase.includes('pull')) return '/exercises/sprints.png';
    return null;
  };

  // Load Session and check for override redirection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOverride = localStorage.getItem('overrideAthlete');
      if (storedOverride) {
        const athlete = JSON.parse(storedOverride);
        setTargetType('INDIVIDUAL');
        setTargetAthleteId(athlete.id);
        setIsOverrideMode(true);
        setBaseWorkoutId('override-direct');
        localStorage.removeItem('overrideAthlete');
      }
    }
  }, []);

  // Fetch Exercises and Roster
  useEffect(() => {
    if (coach) {
      fetch('/api/exercises')
        .then(res => res.json())
        .then(data => {
          if (data.success) setLibrary(data.exercises);
        });

      fetch(`/api/coach/roster?coachId=${coach.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAthletes(data.athletes);
            const mvp = data.athletes.find(a => a.isMVP);
            setMvpAthlete(mvp || null);
          }
        });
    }
  }, [coach]);

  const addExercise = (ex, dayId) => {
    const targetDay = dayId || activeDay;
    if (!selectedExercises.find(e => e.id === ex.id && e.dayOfWeek === targetDay)) {
      setSelectedExercises([...selectedExercises, { 
        ...ex, 
        dayOfWeek: targetDay, 
        targetSets: 3, 
        targetReps: 10, 
        targetLoad: '' 
      }]);
    }
  };

  const removeExercise = (indexToRemove) => {
    setSelectedExercises(selectedExercises.filter((_, idx) => idx !== indexToRemove));
  };

  const updateParam = (index, field, value) => {
    setSelectedExercises(selectedExercises.map((e, idx) => 
      idx === index ? { ...e, [field]: value } : e
    ));
  };

  const generateWorkout = async () => {
    if (selectedExercises.length === 0) return alert("Adicione exercícios da biblioteca!");
    setLoading(true);
    try {
      const payload = {
        exercises: selectedExercises,
        coachId: coach.id,
        isOverride: isOverrideMode,
        baseWorkoutId: isOverrideMode ? baseWorkoutId : null
      };

      if (isOverrideMode) {
        payload.athleteId = targetAthleteId;
      } else {
        if (targetType === 'INDIVIDUAL') {
          payload.athleteId = targetAthleteId || null;
        } else if (targetType === 'GROUP') {
          payload.positionGroup = targetPosition;
        }
      }

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setWorkoutPin(data.workout.pinCode);
        
        if (typeof window !== 'undefined') {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const context = new AudioCtx();
            const notes = [261.63, 329.63, 392.00, 523.25];
            notes.forEach((freq, idx) => {
              const osc = context.createOscillator();
              const gain = context.createGain();
              osc.connect(gain);
              gain.connect(context.destination);
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, context.currentTime + idx * 0.1);
              gain.gain.setValueAtTime(0.06, context.currentTime + idx * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + idx * 0.1 + 0.3);
              osc.start(context.currentTime + idx * 0.1);
              osc.stop(context.currentTime + idx * 0.1 + 0.3);
            });
          }
        }

        setIsOverrideMode(false);
        setBaseWorkoutId('');
      } else {
        alert("Erro ao gerar treino: " + data.error);
      }
    } catch (e) {
      alert("Falha na conexão.");
    }
    setLoading(false);
  };

  return {
    library, setLibrary,
    sportsFilter, setSportsFilter,
    selectedExercises, setSelectedExercises,
    workoutPin, setWorkoutPin,
    loading, setLoading,
    athletes, setAthletes,
    targetType, setTargetType,
    targetPosition, setTargetPosition,
    targetAthleteId, setTargetAthleteId,
    mvpAthlete, setMvpAthlete,
    isOverrideMode, setIsOverrideMode,
    baseWorkoutId, setBaseWorkoutId,
    recentWorkouts, setRecentWorkouts,
    activeDay, setActiveDay,
    showSelectorModal, setShowSelectorModal,
    getExerciseImage,
    addExercise,
    removeExercise,
    updateParam,
    generateWorkout
  };
}
