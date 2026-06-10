import { WorkoutRepository } from '../../infrastructure/WorkoutRepository.js';
import { GenerateWorkoutId } from '../../usecases/GenerateWorkoutId.js';

class CoachController {
  constructor() {
    this.repository = new WorkoutRepository();
    this.generateWorkoutUseCase = new GenerateWorkoutId(this.repository);
    this.library = [];
    this.selectedExercises = [];

    // Elementos do DOM
    this.elLibrary = document.getElementById('exerciseLibrary');
    this.elWorkoutList = document.getElementById('workoutList');
    this.elEmptyMsg = document.getElementById('emptyWorkoutMsg');
    this.btnGenerate = document.getElementById('btnGenerateId');
    this.elSuccessFeedback = document.getElementById('successFeedback');
    this.elGeneratedId = document.getElementById('generatedWorkoutId');
    this.searchInput = document.getElementById('searchInput');

    this.init();
  }

  async init() {
    // Carrega JSON de exercícios da infra
    this.library = await this.repository.getExerciseLibrary();
    this.renderLibrary();
    this.bindEvents();
  }

  bindEvents() {
    this.btnGenerate.addEventListener('click', () => this.handleGenerateWorkout());
    this.searchInput.addEventListener('input', (e) => this.renderLibrary(e.target.value));
  }

  renderLibrary(filter = '') {
    this.elLibrary.innerHTML = '';
    
    // Filtragem em tempo real
    const filtered = this.library.filter(ex => 
      ex.name.toLowerCase().includes(filter.toLowerCase()) || 
      ex.category.toLowerCase().includes(filter.toLowerCase()) ||
      ex.focus.toLowerCase().includes(filter.toLowerCase())
    );

    if(filtered.length === 0) {
       this.elLibrary.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">Nenhum exercício encontrado.</p>';
       return;
    }

    filtered.forEach(ex => {
      const div = document.createElement('div');
      div.className = 'exercise-item';
      div.setAttribute('role', 'listitem');
      div.setAttribute('tabindex', '0'); // Garante que o elemento seja focável via Tab (Acessibilidade)
      div.setAttribute('aria-label', `Adicionar ${ex.name} ao treino`);
      
      div.innerHTML = `
        <strong>${ex.name}</strong><br>
        <small style="color: var(--text-secondary);">${ex.focus} - Pos: ${ex.recommendedPositions.join(', ')}</small>
      `;
      
      const addHandler = () => this.addExerciseToWorkout(ex);
      
      // Suporte para Mouse/Touch e Teclado (Enter ou Espaço)
      div.addEventListener('click', addHandler);
      div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { 
          e.preventDefault(); 
          addHandler(); 
        }
      });

      this.elLibrary.appendChild(div);
    });
  }

  addExerciseToWorkout(exercise) {
    if (this.selectedExercises.find(ex => ex.id === exercise.id)) {
      alert(`O exercício ${exercise.name} já está no treino!`);
      return;
    }

    // Configuração base de repetições/séries
    this.selectedExercises.push({
      id: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 10,
      load: 0
    });

    this.renderWorkoutBuilder();
    
    // Anuncia de forma silenciosa para leitores de tela que o exercício foi adicionado
    const srAlert = document.createElement('div');
    srAlert.setAttribute('aria-live', 'polite');
    srAlert.className = 'visually-hidden';
    srAlert.textContent = `${exercise.name} adicionado ao treino.`;
    document.body.appendChild(srAlert);
    setTimeout(() => srAlert.remove(), 2000);
  }

  removeExercise(id) {
    this.selectedExercises = this.selectedExercises.filter(ex => ex.id !== id);
    this.renderWorkoutBuilder();
  }

  renderWorkoutBuilder() {
    if (this.selectedExercises.length === 0) {
      this.elEmptyMsg.style.display = 'block';
      this.elWorkoutList.innerHTML = '';
      this.elWorkoutList.appendChild(this.elEmptyMsg);
      return;
    }

    this.elEmptyMsg.style.display = 'none';
    this.elWorkoutList.innerHTML = '';

    this.selectedExercises.forEach((ex, index) => {
      const div = document.createElement('div');
      div.className = 'prescribed-exercise';
      div.setAttribute('role', 'listitem');
      
      // Labels ocultas (via display:none ou css .visually-hidden) garantem leitura correta por VoiceOver/NVDA
      div.innerHTML = `
        <div style="font-weight: bold; padding-right: 10px;">${index + 1}. ${ex.name}</div>
        <div>
          <input type="number" id="sets-${ex.id}" value="${ex.sets}" min="1" aria-label="Número de Séries para ${ex.name}" title="Séries">
        </div>
        <div>
          <input type="number" id="reps-${ex.id}" value="${ex.reps}" min="1" aria-label="Número de Repetições para ${ex.name}" title="Reps">
        </div>
        <div>
          <input type="number" id="load-${ex.id}" value="${ex.load}" min="0" aria-label="Carga em kilos para ${ex.name}" title="Kg (Base)">
        </div>
        <button class="btn-remove" aria-label="Remover ${ex.name} do treino">X</button>
      `;

      // Liga os inputs aos dados de estado do controller
      div.querySelector(`#sets-${ex.id}`).addEventListener('change', e => ex.sets = parseInt(e.target.value) || 0);
      div.querySelector(`#reps-${ex.id}`).addEventListener('change', e => ex.reps = parseInt(e.target.value) || 0);
      div.querySelector(`#load-${ex.id}`).addEventListener('change', e => ex.load = parseInt(e.target.value) || 0);
      
      div.querySelector('.btn-remove').addEventListener('click', () => this.removeExercise(ex.id));

      this.elWorkoutList.appendChild(div);
    });
  }

  async handleGenerateWorkout() {
    if (this.selectedExercises.length === 0) {
      alert("Por favor, selecione pelo menos um exercício na biblioteca ao lado.");
      return;
    }

    try {
      // Orquestra a criação passando a responsabilidade para o Use Case e o Domínio
      const coachLogado = "coach_1"; // Fixo para POC
      const workout = await this.generateWorkoutUseCase.execute(coachLogado, "Game Day Workout", this.selectedExercises);
      
      // Exibe sucesso
      this.elSuccessFeedback.style.display = 'block';
      this.elGeneratedId.textContent = workout.id;
      
      // Oculta os formulários para prevenir duplicação de clique e guiar o foco
      this.elWorkoutList.style.display = 'none';
      this.btnGenerate.style.display = 'none';
      this.elLibrary.parentElement.style.opacity = '0.3';
      this.elLibrary.parentElement.style.pointerEvents = 'none';

      // Move o foco de acessibilidade para o feedback de sucesso (Leitura imediata do ID)
      this.elSuccessFeedback.focus();

    } catch(err) {
      console.error(err);
      alert("Houve um erro ao gerar o ID. Tente novamente.");
    }
  }
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
  new CoachController();
});
