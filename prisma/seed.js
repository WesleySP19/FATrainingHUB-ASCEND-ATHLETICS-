const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exercises = [
    // === FUTEBOL AMERICANO (OL/DL) ===
    {
      name: 'Medicine Ball Chest Pass Explosion against Wall',
      type: 'Futebol Americano',
      location: 'OL/DL',
      mediaUrl: JSON.stringify({
        image: '/exercises/medball_explosion.png',
        vectors: [
          { type: 'line', points: [[20, 20], [80, 80]], color: '#facc15', label: 'Coluna reta' },
          { type: 'circle', center: [50, 50], radius: 10, color: '#22c55e', label: 'Extensão tripla' }
        ]
      }),
      description: 'O atleta inicia em posição de 3-point stance. Ao sinal visual, realiza a extensão tripla (tornozelo, joelho e quadril) disparando a bola contra a parede com as palmas das mãos paralelas. Linha Amarela Neon mapeia a coluna reta do quadril ao pescoço, enfatizando que a força nasce no solo.'
    },
    {
      name: 'Heavy Sled Drive',
      type: 'Futebol Americano',
      location: 'OL/DL',
      mediaUrl: JSON.stringify({
        image: '/exercises/sled_drive.png',
        vectors: [
          { type: 'arrow', from: [10, 90], to: [90, 90], color: '#22c55e', label: 'Empuxo horizontal' }
        ]
      }),
      description: 'Posicione-se contra o trenó pesado com o quadril baixo e execute passadas explosivas curtas, mantendo os braços estendidos e o peito ativo. Enfatize a transferência de força contínua.'
    },
    {
      name: 'Hand Combat Punch Drill',
      type: 'Futebol Americano',
      location: 'OL/DL',
      mediaUrl: JSON.stringify({
        image: '/exercises/hand_combat.png',
        vectors: [
          { type: 'circle', center: [30, 25], radius: 8, color: '#facc15', label: 'Alvo de impacto' }
        ]
      }),
      description: 'Execute socos rápidos e curtos com a palma das mãos (punches) contra o escudo do adversário na linha de scrimmage. Foco na velocidade de reação e fechamento de pegada.'
    },
    {
      name: 'Heavy Farmers Walk',
      type: 'Futebol Americano',
      location: 'OL/DL',
      mediaUrl: JSON.stringify({
        image: '/exercises/farmers_walk.png',
        vectors: [
          { type: 'line', points: [[50, 10], [50, 90]], color: '#22c55e', label: 'Alinhamento do core' }
        ]
      }),
      description: 'Caminhe com halteres pesados ou maletas ao lado do corpo. Mantenha os ombros retraídos para trás e para baixo, abdômen contraído e passos firmes. Treino essencial de pegada e core.'
    },

    // === FUTEBOL AMERICANO (Skills: WR/DB/RB) ===
    {
      name: 'Single-Leg Box Jump with Lateral Stabilization',
      type: 'Futebol Americano',
      location: 'Skills',
      mediaUrl: JSON.stringify({
        image: '/exercises/box_jump_sl.png',
        vectors: [
          { type: 'circle', center: [50, 70], radius: 15, color: '#22c55e', label: 'Estabilização de joelho' }
        ]
      }),
      description: 'Partindo do repouso sobre uma perna, realizar o salto vertical pousando suavemente sobre a caixa com o mesmo pé, sustentando a posição por 2 segundos. Círculos verdes sobre o joelho e o tornozelo monitoram o valgo dinâmico.'
    },
    {
      name: 'Route Running (Cone Drill)',
      type: 'Futebol Americano',
      location: 'Skills',
      mediaUrl: JSON.stringify({
        image: '/exercises/cone_drill.png',
        vectors: [
          { type: 'line', points: [[10, 80], [45, 20], [80, 80]], color: '#22c55e', label: 'Ângulo de corte' }
        ]
      }),
      description: 'Corra em direção ao cone e realize o corte de rota em ângulo agudo com centro de gravidade baixo. Foco na explosão de saída após o corte.'
    },
    {
      name: 'Pro Agility Shuttle (5-10-5)',
      type: 'Futebol Americano',
      location: 'Skills',
      mediaUrl: JSON.stringify({
        image: '/exercises/shuttle_drill.png',
        vectors: [
          { type: 'arrow', from: [50, 50], to: [90, 50], color: '#facc15', label: 'Aceleração lateral' }
        ]
      }),
      description: 'Desloque-se lateralmente por 5 jardas, toque a linha, mude de direção por 10 jardas e finalize com mais 5 jardas. Ideal para agilidade e controle de frenagem.'
    },
    {
      name: '40-Yard Dash Sprint',
      type: 'Futebol Americano',
      location: 'Skills',
      mediaUrl: JSON.stringify({
        image: '/exercises/sprints.png',
        vectors: [
          { type: 'arrow', from: [20, 80], to: [80, 50], color: '#22c55e', label: 'Vetor de aceleração' }
        ]
      }),
      description: 'Sprint puro a partir de postura de 3 pontos focando no ângulo de projeção do tronco e frequência de passadas iniciais.'
    },

    // === FUTEBOL AMERICANO (QB) ===
    {
      name: 'QB 3-Step Drop Footwork',
      type: 'Futebol Americano',
      location: 'QB',
      mediaUrl: JSON.stringify({
        image: '/exercises/qb_drop.png',
        vectors: [
          { type: 'arrow', from: [50, 20], to: [50, 80], color: '#facc15', label: 'Drop vertical' }
        ]
      }),
      description: 'Dropback rápido de 3 passos, mantendo a bola na altura do peito protegida por ambas as mãos e base alargada para arremesso.'
    },
    {
      name: 'Resistance Band Throwing Motion',
      type: 'Futebol Americano',
      location: 'QB',
      mediaUrl: JSON.stringify({
        image: '/exercises/band_throw.png',
        vectors: [
          { type: 'arrow', from: [70, 30], to: [30, 40], color: '#22c55e', label: 'Aceleração rotacional' }
        ]
      }),
      description: 'Treino de arremesso com elástico de resistência preso a um ponto traseiro. Fortalece o manguito rotador e treina a mecânica de quadril no passe.'
    },
    {
      name: 'Rotational Medicine Ball Slam',
      type: 'Futebol Americano',
      location: 'QB',
      mediaUrl: JSON.stringify({
        image: '/exercises/rotational_slam.png',
        vectors: [
          { type: 'circle', center: [50, 50], radius: 20, color: '#22c55e', label: 'Giro torácico' }
        ]
      }),
      description: 'Fique de lado para a parede. Gire o quadril explosivamente e jogue a bola medicinal lateralmente contra a parede com o máximo de força.'
    },

    // === FUTEBOL AMERICANO (DB) ===
    {
      name: 'Hip Flip Transition Drill',
      type: 'Futebol Americano',
      location: 'DB',
      mediaUrl: JSON.stringify({
        image: '/exercises/hip_flip.png',
        vectors: [
          { type: 'arrow', from: [40, 50], to: [60, 50], color: '#22c55e', label: 'Giro de 180°' }
        ]
      }),
      description: 'Corra de costas (backpedal) e, ao sinal visual, gire o quadril rapidamente a 180 graus sem perder velocidade, entrando em corrida frontal.'
    },
    {
      name: 'Backpedal to Cushion Break',
      type: 'Futebol Americano',
      location: 'DB',
      mediaUrl: JSON.stringify({
        image: '/exercises/backpedal_break.png',
        vectors: [
          { type: 'arrow', from: [50, 80], to: [50, 20], color: '#facc15', label: 'Quebra frontal' }
        ]
      }),
      description: 'Backpedal rápido controlando a distância e realize uma quebra agressiva para a frente em direção ao recebedor.'
    },

    // === POWERLIFTING ===
    {
      name: 'Competition Low-Bar Squat with 2-Second Pause',
      type: 'Powerlifting',
      location: 'Força Base',
      mediaUrl: JSON.stringify({
        image: '/exercises/lowbar_squat.png',
        vectors: [
          { type: 'arrow', from: [50, 80], to: [50, 20], color: '#ef4444', label: 'Direção do centro de gravidade' }
        ]
      }),
      description: 'Barra sobre os deltoides posteriores. Descida controlada quebrando a linha paralela. Pausa estrita de 2 segundos no fundo eliminando a energia elástica, seguida de subida explosiva.'
    },
    {
      name: 'Competition Bench Press (Paused)',
      type: 'Powerlifting',
      location: 'Força Base',
      mediaUrl: JSON.stringify({
        image: '/exercises/bench_press.png',
        vectors: [
          { type: 'line', points: [[50, 30], [50, 70]], color: '#ef4444', label: 'Ponto de pausa' }
        ]
      }),
      description: 'Deite-se no banco, monte a ponte escapular, desça a barra até tocar o esterno, pause por 1 segundo e empurre de volta estendendo os braços.'
    },
    {
      name: 'Deadlift (Conventional)',
      type: 'Powerlifting',
      location: 'Força Base',
      mediaUrl: JSON.stringify({
        image: '/exercises/deadlift.png',
        vectors: [
          { type: 'arrow', from: [50, 70], to: [50, 30], color: '#22c55e', label: 'Puxada rente à tíbia' }
        ]
      }),
      description: 'Posicione-se com pés na largura do quadril, segure a barra rente às pernas, ative os dorsais e empurre o chão subindo até o bloqueio completo de quadril.'
    },
    {
      name: 'Overhead Barbell Press',
      type: 'Powerlifting',
      location: 'Força Base',
      mediaUrl: JSON.stringify({
        image: '/exercises/overhead_press.png',
        vectors: [
          { type: 'arrow', from: [50, 60], to: [50, 10], color: '#3b82f6', label: 'Press vertical' }
        ]
      }),
      description: 'Barra na altura das clavículas, cotovelos ligeiramente à frente da barra. Empurre a barra verticalmente até a extensão completa dos cotovelos acima da cabeça.'
    },
    {
      name: 'Romanian Deadlift (RDL)',
      type: 'Powerlifting',
      location: 'Força Base',
      mediaUrl: JSON.stringify({
        image: '/exercises/rdl.png',
        vectors: [
          { type: 'line', points: [[40, 40], [70, 70]], color: '#facc15', label: 'Dobradiça de quadril' }
        ]
      }),
      description: 'Inicie de pé. Flexione ligeiramente os joelhos e empurre o quadril para trás, descendo a barra rente às pernas até sentir o alongamento máximo dos isquiotibiais.'
    },
    {
      name: 'Front Squat',
      type: 'Powerlifting',
      location: 'Força Base',
      mediaUrl: JSON.stringify({
        image: '/exercises/front_squat.png',
        vectors: [
          { type: 'arrow', from: [50, 80], to: [50, 30], color: '#22c55e', label: 'Cotovelos altos' }
        ]
      }),
      description: 'Posicione a barra sobre os ombros frontais na posição de rack limpo. Agache mantendo o tronco o mais vertical possível e os cotovelos apontados para cima.'
    },

    // === RUGBY (Forwards) ===
    {
      name: 'Heavy Hex-Bar Isometric Shrugs with Grip Max',
      type: 'Rugby',
      location: 'Forwards',
      mediaUrl: JSON.stringify({
        image: '/exercises/hexbar_shrug.png',
        vectors: [
          { type: 'circle', center: [50, 30], radius: 15, color: '#ef4444', label: 'Zona de estresse térmico' }
        ]
      }),
      description: 'Segure as alças da barra hexagonal carregada. Encolha os ombros em direção às orelhas e sustente a contração isométrica por 5 segundos antes de descer. Mapeamento térmico em vermelho nos trapézios e antebraço.'
    },
    {
      name: 'Scrummage Drive Against Machine',
      type: 'Rugby',
      location: 'Forwards',
      mediaUrl: JSON.stringify({
        image: '/exercises/scrum_drive.png',
        vectors: [
          { type: 'line', points: [[15, 50], [85, 50]], color: '#facc15', label: 'Espinha neutra' }
        ]
      }),
      description: 'Engaje na máquina de scrummage mantendo o quadril abaixo dos ombros e a espinha perfeitamente alinhada. Transmita potência constante pelas pernas.'
    },
    {
      name: 'Lineout Lift and Hold',
      type: 'Rugby',
      location: 'Forwards',
      mediaUrl: JSON.stringify({
        image: '/exercises/lineout_lift.png',
        vectors: [
          { type: 'circle', center: [50, 40], radius: 10, color: '#22c55e', label: 'Bloqueio articular' }
        ]
      }),
      description: 'Segure o saltador pelas coxas/shorts e eleve-o acima da cabeça estendendo os braços com travamento estático nos cotovelos. Sustente a posição.'
    },
    {
      name: 'Body Position of Ruck Drive',
      type: 'Rugby',
      location: 'Forwards',
      mediaUrl: JSON.stringify({
        image: '/exercises/ruck_drive.png',
        vectors: [
          { type: 'line', points: [[30, 60], [70, 30]], color: '#ef4444', label: 'Ângulo de entrada' }
        ]
      }),
      description: 'Posicione-se em base baixa, quadril flexionado e ombros ativos. Entre no ruck simulando a limpeza de oponentes com empurrão concêntrico de pernas.'
    },

    // === RUGBY (Backs) ===
    {
      name: 'Assault Bike Sprint to Lateral Medicine Ball Toss',
      type: 'Rugby',
      location: 'Backs',
      mediaUrl: JSON.stringify({
        image: '/exercises/assault_slam.png',
        vectors: [
          { type: 'arrow', from: [50, 60], to: [85, 30], color: '#facc15', label: 'Passe rotacional' }
        ]
      }),
      description: 'Realize 10 segundos de sprint máximo na Assault Bike (gerando fadiga central) e imediatamente salte lateralmente arremessando a bola medicinal em rotação tática.'
    },
    {
      name: 'Tackle Bag Wrap Drill',
      type: 'Rugby',
      location: 'Backs',
      mediaUrl: JSON.stringify({
        image: '/exercises/tackle_bag.png',
        vectors: [
          { type: 'arrow', from: [30, 50], to: [70, 50], color: '#22c55e', label: 'Envelopamento' }
        ]
      }),
      description: 'Aproxime-se do saco de tackle em velocidade, faça o contato com o ombro firme na parte central e envolva os braços com força máxima (wrap) derrubando o alvo.'
    }
  ];

  console.log("Semeando Biblioteca Oficial de Exercícios (24 exercícios)...");
  
  for (const ex of exercises) {
    // Verifica se já existe para não duplicar ou atualiza
    const existing = await prisma.exercise.findFirst({ where: { name: ex.name } });
    if (!existing) {
      await prisma.exercise.create({ data: ex });
    } else {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: ex
      });
    }
  }
  
  console.log("Banco populado com sucesso!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
