import { WorkoutRepository } from '../../infrastructure/WorkoutRepository.js';
import { Athlete } from '../../domain/Athlete.js';

class AthleteController {
  constructor() {
    this.repository = new WorkoutRepository();
    
    // Mock de Sessão do Atleta: Na vida real isso viria de Autenticação/LocalStorage
    // O atleta criado aqui será compartilhado com o Vestiário (Locker Room) via cache.
    const cachedAthlete = localStorage.getItem('athlete_poc_state');
    if (cachedAthlete) {
      const parsed = JSON.parse(cachedAthlete);
      this.currentAthlete = new Athlete(parsed.id, parsed.name, parsed.position);
      this.currentAthlete.personalRecords = parsed.personalRecords;
      this.currentAthlete.attendanceCount = parsed.attendanceCount;
    } else {
      this.currentAthlete = new Athlete("1", "Rafa (Muralha)", "OL");
      // Setup Mock PR para forçar a demonstração de "Quebra de Recorde" e Gamificação
      this.currentAthlete.personalRecords["ex-001"] = 100; // Squat base
      this.currentAthlete.attendanceCount = 20; // Engajamento alto para ter badges
    }

    // Bindings de DOM
    this.loginSection = document.getElementById('loginSection');
    this.workoutExecution = document.getElementById('workoutExecution');
    this.workoutIdInput = document.getElementById('workoutIdInput');
    this.btnStart = document.getElementById('btnStart');
    this.exercisesContainer = document.getElementById('exercisesContainer');
    this.workoutTitle = document.getElementById('workoutTitle');
    this.btnFinish = document.getElementById('btnFinishWorkout');
    
    this.prModal = document.getElementById('prModal');
    this.prMessage = document.getElementById('prMessage');
    this.btnCloseModal = document.getElementById('btnCloseModal');

    this.bindEvents();
  }

  bindEvents() {
    this.btnStart.addEventListener('click', () => this.loadWorkout());
    
    // Adiciona submissão pelo Enter no teclado para acessibilidade pura
    this.workoutIdInput.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') this.loadWorkout();
    });

    this.btnFinish.addEventListener('click', () => this.finishWorkout());
    this.btnCloseModal.addEventListener('click', () => {
      this.prModal.style.display = 'none';
    });
  }

  loadWorkout() {
    const id = this.workoutIdInput.value.trim();
    if (!id) {
      alert("Por favor, digite o ID numérico do treino.");
      return;
    }

    const workout = this.repository.getWorkoutById(id);
    if (!workout) {
      alert("Treino não encontrado! Verifique se o código bate com a lousa do Coach.");
      return;
    }

    // Transição de Interfaces
    this.loginSection.style.display = 'none';
    this.workoutExecution.style.display = 'block';
    this.workoutTitle.textContent = workout.title || "Game Day";

    // Oculta input e botão do leitor de tela
    this.loginSection.setAttribute('aria-hidden', 'true');
    this.workoutExecution.removeAttribute('aria-hidden');

    this.renderExercises(workout.exercises);
  }

  renderExercises(exercises) {
    this.exercisesContainer.innerHTML = '';

    exercises.forEach((ex, index) => {
      const card = document.createElement('div');
      card.className = 'athlete-card';
      card.setAttribute('role', 'listitem');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 15px; padding-bottom: 10px;">
          <h3 aria-label="Exercício ${index + 1}: ${ex.name}">${index + 1}. ${ex.name}</h3>
          <span style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 20px; font-weight: bold; font-family: var(--font-display);">${ex.sets}x${ex.reps}</span>
        </div>
        <div class="sets-container" id="sets-container-${ex.id}">
          <label for="load-${ex.id}" style="display:block; margin-bottom: 10px; color: var(--text-secondary); font-size: 1.1rem;">Top Set Carga (Kg)</label>
          <div style="display: flex; gap: 10px;">
            <!-- O Atributo inputmode=numeric abre o teclado numérico gigante no celular -->
            <input type="number" id="load-${ex.id}" value="${ex.load}" style="font-size: 2rem; width: 100%; text-align: center; padding: 10px; background: #0f172a; border: 2px solid #334155; color: white; border-radius: var(--border-radius);" inputmode="numeric" aria-label="Digite a carga em quilos">
            <button class="btn btn-save-set" data-id="${ex.id}" data-name="${ex.name}" style="white-space: nowrap; font-size: 1.2rem; min-width: 100px;">Salvar</button>
          </div>
        </div>
      `;

      this.exercisesContainer.appendChild(card);
    });

    // Lógica e feedback de gamificação
    document.querySelectorAll('.btn-save-set').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        const inputVal = parseInt(document.getElementById(`load-${id}`).value);

        if (inputVal > 0) {
          // Domínio do atleta avaliando a quebra de recorde
          const isPR = this.currentAthlete.updatePR(id, inputVal);
          
          // Feedback Tátil Visual (Mudança de cor + Texto)
          e.target.style.background = 'var(--accent-green)';
          e.target.style.color = '#fff';
          e.target.textContent = 'Feito!';
          
          if (isPR) {
            this.showPRModal(`Nova marca no ${name}: ${inputVal}kg!`);
          }
        }
      });
    });
  }

  showPRModal(msg) {
    this.prMessage.textContent = msg;
    this.prModal.style.display = 'flex';
    // Foco imediato para o leitor de tela (Acessibilidade Crítica para Notificações)
    this.prModal.focus();
  }

  finishWorkout() {
    this.currentAthlete.incrementAttendance();
    
    // Salva estado para simular persistência entre abas sem backend real.
    localStorage.setItem('athlete_poc_state', JSON.stringify(this.currentAthlete));

    // Feedback final e redirecionamento para o Vestiário (Locker Room) para ver os cards
    const srAlert = document.createElement('div');
    srAlert.setAttribute('aria-live', 'assertive');
    srAlert.className = 'visually-hidden';
    srAlert.textContent = "Treino concluído. Redirecionando para o Vestiário.";
    document.body.appendChild(srAlert);
    
    setTimeout(() => {
      window.location.href = 'locker-room.html';
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AthleteController();
});
