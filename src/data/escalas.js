// Questionários periódicos ligados a alguns módulos. São instrumentos de RASTREIO, de uso livre:
// a pontuação aparece só para a psicóloga, com o ponto de corte de referência do instrumento,
// e nunca como diagnóstico. O paciente vê apenas um agradecimento.
//
// VALIDAR com a psicóloga a redação final de cada item com a versão brasileira publicada.
// Referências: EPDS — Cox, Holden & Sagovsky (1987), versão brasileira de Santos et al.;
// GAD-7 — Spitzer et al. (2006), domínio público; AUDIT-C — OMS / Bush et al. (1998);
// Fagerström (FTND) — Heatherton et al. (1991), versão brasileira de Carmo & Pueyo (2002).

const FREQ_GAD = [
  { pontos: 0, rotulo: 'Nenhuma vez' },
  { pontos: 1, rotulo: 'Vários dias' },
  { pontos: 2, rotulo: 'Mais da metade dos dias' },
  { pontos: 3, rotulo: 'Quase todos os dias' },
]

const SIM_NAO = [
  { pontos: 1, rotulo: 'Sim' },
  { pontos: 0, rotulo: 'Não' },
]

export const ESCALAS = {
  epds: {
    id: 'epds',
    nome: 'Escala de Edimburgo (EPDS)',
    tituloPaciente: 'Como você tem se sentido',
    intervaloDias: 14,
    instrucao: 'Pensando nos últimos 7 dias, marque a resposta que mais se aproxima de como você tem se sentido.',
    referencia: 'Ponto de corte de rastreio usado no Brasil: 12 ou mais.',
    corte: 12,
    maximo: 30,
    // Item 10 (pensar em se machucar): qualquer resposta diferente de "nenhuma vez" aciona o aviso de crise.
    itemRisco: 9,
    itens: [
      {
        texto: 'Eu tenho sido capaz de rir e de achar graça das coisas',
        opcoes: [
          { pontos: 0, rotulo: 'Como eu sempre fiz' },
          { pontos: 1, rotulo: 'Não tanto quanto antes' },
          { pontos: 2, rotulo: 'Sem dúvida, menos que antes' },
          { pontos: 3, rotulo: 'De jeito nenhum' },
        ],
      },
      {
        texto: 'Eu tenho pensado no futuro com alegria',
        opcoes: [
          { pontos: 0, rotulo: 'Sim, como de costume' },
          { pontos: 1, rotulo: 'Um pouco menos que de costume' },
          { pontos: 2, rotulo: 'Bem menos que de costume' },
          { pontos: 3, rotulo: 'Praticamente não' },
        ],
      },
      {
        texto: 'Eu tenho me culpado sem necessidade quando as coisas dão errado',
        opcoes: [
          { pontos: 3, rotulo: 'Sim, na maioria das vezes' },
          { pontos: 2, rotulo: 'Sim, algumas vezes' },
          { pontos: 1, rotulo: 'Não muitas vezes' },
          { pontos: 0, rotulo: 'Não, nenhuma vez' },
        ],
      },
      {
        texto: 'Eu tenho ficado ansiosa ou preocupada sem uma boa razão',
        opcoes: [
          { pontos: 0, rotulo: 'Não, de maneira alguma' },
          { pontos: 1, rotulo: 'Pouquíssimas vezes' },
          { pontos: 2, rotulo: 'Sim, algumas vezes' },
          { pontos: 3, rotulo: 'Sim, muitas vezes' },
        ],
      },
      {
        texto: 'Eu tenho me sentido assustada ou em pânico sem um bom motivo',
        opcoes: [
          { pontos: 3, rotulo: 'Sim, muitas vezes' },
          { pontos: 2, rotulo: 'Sim, algumas vezes' },
          { pontos: 1, rotulo: 'Não muitas vezes' },
          { pontos: 0, rotulo: 'Não, nenhuma vez' },
        ],
      },
      {
        texto: 'Eu tenho me sentido sobrecarregada pelas tarefas e acontecimentos do dia a dia',
        opcoes: [
          { pontos: 3, rotulo: 'Sim, na maioria das vezes não consigo lidar' },
          { pontos: 2, rotulo: 'Sim, algumas vezes não consigo lidar como antes' },
          { pontos: 1, rotulo: 'Não, na maioria das vezes consigo lidar bem' },
          { pontos: 0, rotulo: 'Não, consigo lidar tão bem quanto antes' },
        ],
      },
      {
        texto: 'Eu tenho me sentido tão infeliz que tenho tido dificuldade para dormir',
        opcoes: [
          { pontos: 3, rotulo: 'Sim, na maioria das vezes' },
          { pontos: 2, rotulo: 'Sim, algumas vezes' },
          { pontos: 1, rotulo: 'Não muitas vezes' },
          { pontos: 0, rotulo: 'Não, nenhuma vez' },
        ],
      },
      {
        texto: 'Eu tenho me sentido triste ou arrasada',
        opcoes: [
          { pontos: 3, rotulo: 'Sim, na maioria das vezes' },
          { pontos: 2, rotulo: 'Sim, muitas vezes' },
          { pontos: 1, rotulo: 'Não muitas vezes' },
          { pontos: 0, rotulo: 'Não, de jeito nenhum' },
        ],
      },
      {
        texto: 'Eu tenho me sentido tão infeliz que tenho chorado',
        opcoes: [
          { pontos: 3, rotulo: 'Sim, quase todo o tempo' },
          { pontos: 2, rotulo: 'Sim, muitas vezes' },
          { pontos: 1, rotulo: 'De vez em quando' },
          { pontos: 0, rotulo: 'Não, nenhuma vez' },
        ],
      },
      {
        texto: 'A ideia de fazer mal a mim mesma passou pela minha cabeça',
        opcoes: [
          { pontos: 3, rotulo: 'Sim, muitas vezes, ultimamente' },
          { pontos: 2, rotulo: 'Algumas vezes nos últimos dias' },
          { pontos: 1, rotulo: 'Pouquíssimas vezes, ultimamente' },
          { pontos: 0, rotulo: 'Nenhuma vez' },
        ],
      },
    ],
  },
  gad7: {
    id: 'gad7',
    nome: 'GAD-7',
    tituloPaciente: 'Sua ansiedade nas últimas semanas',
    intervaloDias: 14,
    instrucao: 'Nas últimas 2 semanas, com que frequência você se sentiu incomodado(a) por:',
    referencia: 'Faixas de referência: 5 leve · 10 moderada · 15 grave.',
    corte: 10,
    maximo: 21,
    itens: [
      'Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)',
      'Não conseguir impedir ou controlar as preocupações',
      'Preocupar-se muito com diversas coisas',
      'Dificuldade para relaxar',
      'Ficar tão agitado(a) que fica difícil permanecer sentado(a)',
      'Ficar facilmente aborrecido(a) ou irritado(a)',
      'Sentir medo, como se algo horrível fosse acontecer',
    ].map((texto) => ({ texto, opcoes: FREQ_GAD })),
  },
  auditc: {
    id: 'auditc',
    nome: 'AUDIT-C',
    tituloPaciente: 'Seu consumo de bebida no último mês',
    intervaloDias: 30,
    instrucao: 'Pense no seu consumo de bebidas alcoólicas no último ano. 1 dose = 1 lata de cerveja, 1 taça de vinho ou 1 dose de destilado.',
    referencia: 'Rastreio positivo: 4 ou mais (homens) · 3 ou mais (mulheres).',
    corte: 4,
    maximo: 12,
    itens: [
      {
        texto: 'Com que frequência você toma bebidas alcoólicas?',
        opcoes: [
          { pontos: 0, rotulo: 'Nunca' },
          { pontos: 1, rotulo: 'Uma vez por mês ou menos' },
          { pontos: 2, rotulo: '2 a 4 vezes por mês' },
          { pontos: 3, rotulo: '2 a 3 vezes por semana' },
          { pontos: 4, rotulo: '4 ou mais vezes por semana' },
        ],
      },
      {
        texto: 'Nos dias em que bebe, quantas doses você costuma tomar?',
        opcoes: [
          { pontos: 0, rotulo: '1 ou 2' },
          { pontos: 1, rotulo: '3 ou 4' },
          { pontos: 2, rotulo: '5 ou 6' },
          { pontos: 3, rotulo: '7 a 9' },
          { pontos: 4, rotulo: '10 ou mais' },
        ],
      },
      {
        texto: 'Com que frequência você toma 6 ou mais doses numa mesma ocasião?',
        opcoes: [
          { pontos: 0, rotulo: 'Nunca' },
          { pontos: 1, rotulo: 'Menos de uma vez por mês' },
          { pontos: 2, rotulo: 'Uma vez por mês' },
          { pontos: 3, rotulo: 'Uma vez por semana' },
          { pontos: 4, rotulo: 'Todos ou quase todos os dias' },
        ],
      },
    ],
  },
  fagerstrom: {
    id: 'fagerstrom',
    nome: 'Teste de Fagerström',
    tituloPaciente: 'Sua relação com o cigarro',
    intervaloDias: 30,
    instrucao: 'Responda pensando no seu hábito atual.',
    referencia: 'Grau de dependência: 0–2 muito baixo · 3–4 baixo · 5 médio · 6–7 elevado · 8–10 muito elevado.',
    corte: 6,
    maximo: 10,
    itens: [
      {
        texto: 'Quanto tempo depois de acordar você fuma o primeiro cigarro?',
        opcoes: [
          { pontos: 3, rotulo: 'Nos primeiros 5 minutos' },
          { pontos: 2, rotulo: 'Entre 6 e 30 minutos' },
          { pontos: 1, rotulo: 'Entre 31 e 60 minutos' },
          { pontos: 0, rotulo: 'Depois de 60 minutos' },
        ],
      },
      { texto: 'Você acha difícil não fumar em lugares proibidos?', opcoes: SIM_NAO },
      {
        texto: 'Qual cigarro do dia traz mais satisfação?',
        opcoes: [
          { pontos: 1, rotulo: 'O primeiro da manhã' },
          { pontos: 0, rotulo: 'Outros' },
        ],
      },
      {
        texto: 'Quantos cigarros você fuma por dia?',
        opcoes: [
          { pontos: 0, rotulo: '10 ou menos' },
          { pontos: 1, rotulo: '11 a 20' },
          { pontos: 2, rotulo: '21 a 30' },
          { pontos: 3, rotulo: '31 ou mais' },
        ],
      },
      { texto: 'Você fuma mais nas primeiras horas da manhã do que no resto do dia?', opcoes: SIM_NAO },
      { texto: 'Você fuma mesmo quando está doente, a ponto de ficar de cama a maior parte do dia?', opcoes: SIM_NAO },
    ],
  },
}

// As respostas são guardadas como a pontuação de cada item (dentro de um item, cada opção tem pontos diferentes).
export const pontuar = (respostas) => respostas.reduce((total, pontos) => total + (pontos ?? 0), 0)

// Questionário de um módulo ligado está "pendente" se nunca foi respondido ou se já passou o intervalo.
export function escalaPendente(escala, ultimaData, hoje) {
  if (!ultimaData) return true
  const dias = (new Date(`${hoje}T12:00`) - new Date(`${ultimaData}T12:00`)) / 86400000
  return dias >= escala.intervaloDias
}
