// Dados fictícios da demonstração. Gerados sempre relativos a hoje (os últimos ~45 dias),
// com sorteio de semente fixa — a mesma demonstração toda vez que os dados são restaurados.
// O dia de hoje fica sem check-in, para quem testar poder fazer o seu.
// Cada paciente mostra um conjunto de módulos e protocolos.
import { deslocar, diasAtras, diaDaSemana, hojeLocal } from '../datas'
import { pontuar } from '../../data/escalas'

export const ID_PSICOLOGA = 'psicologa-demo'
const DIAS = 45

function sorteador(semente) {
  let a = semente
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const p2 = (n) => String(n).padStart(2, '0')
const instante = (d, hora, minuto = 0) => new Date(`${diasAtras(d)}T${p2(hora)}:${p2(minuto)}:00`).toISOString()
const limitar = (v, min, max) => Math.max(min, Math.min(max, v))

// Sorteios auxiliares, sempre com o mesmo gerador.
function ferramentas(sortear) {
  const ruido = (amplitude) => (sortear() - 0.5) * 2 * amplitude
  const chance = (p) => sortear() < p
  const um = (lista) => lista[Math.floor(sortear() * lista.length)]
  const alguns = (lista, p) => lista.filter(() => chance(p))
  return { ruido, chance, um, alguns }
}

const SEM_MODULOS = { tabagismo: false, alcool: false, puerperio: false, crise: false, bullying: false, luto: false, burnout: false, insonia: false }
const modulos = (ligados) => ({ ...SEM_MODULOS, ...Object.fromEntries(ligados.map((m) => [m, true])) })

// Gera os check-ins de um paciente a partir de um "jeito de ser" (médias, hábitos e o que cada módulo responde).
function gerarCheckins(userId, j, sortear) {
  const { ruido, chance, um, alguns } = ferramentas(sortear)
  const lista = []
  for (let d = DIAS; d >= j.ultimoRegistro; d--) {
    if (chance(j.faltas)) continue
    const data = diasAtras(d)
    const dia = { d, data, fimDeSemana: [0, 6].includes(diaDaSemana(data)), progresso: (DIAS - d) / DIAS }
    const extra = j.dia?.(dia, { ruido, chance, um, alguns }) ?? {}
    const humor = limitar(Math.round(j.humor + ruido(1.3) + (extra.ajusteHumor ?? 0)), 1, 5)
    const ansiedade = limitar(Math.round(j.ansiedade + ruido(2.2) + (extra.ajusteAnsiedade ?? 0)), 0, 10)
    const sonoQualidade = limitar(Math.round(j.sonoQualidade + ruido(1.2)), 1, 5)
    lista.push({
      id: `${userId}-ci-${d}`,
      userId,
      data,
      humor,
      emocao: humor >= 4 ? um(['alegria', 'tranquilidade']) : ansiedade >= 7 ? 'ansiedade' : um(j.emocoes),
      emocaoOutra: null,
      ansiedade,
      sonoHoras: limitar(Math.round((j.sonoHoras + ruido(1.1)) * 2) / 2, 3, 10),
      sonoQualidade,
      energia: limitar(Math.round(j.energia + ruido(1.1) + (humor - 3) * 0.4), 1, 5),
      exercicio: chance(j.exercicio),
      acontecimento: j.acontecimentos?.[d] ?? null,
      situacoes: ansiedade >= 6 || humor <= 2 ? alguns(j.situacoes, 0.55) : alguns(j.situacoes, 0.15),
      situacaoOutra: null,
      modulos: extra.modulos ?? {},
      createdAt: instante(d, 21, 15),
    })
  }
  return lista
}

// Monta um questionário respondido a partir da pontuação de cada item.
const escala = (id, userId, tipo, d, respostas) => ({ id, userId, tipo, data: diasAtras(d), respostas, total: pontuar(respostas), createdAt: instante(d, 20) })

const TEMPO_PARA_SI = [
  'Tomei um banho demorado.',
  'Li um pouco do meu livro.',
  'Caminhei no quarteirão.',
  'Dormi uma hora a mais.',
  'Vi um episódio de série.',
  'Tomei um café com calma.',
  'Liguei para uma amiga.',
]

const GESTOS_DE_MEMORIA = [
  'Fiz o café do jeito que meu pai fazia.',
  'Olhei as fotos da pescaria com calma.',
  'Acendi uma vela e rezei.',
  'Contei para minha filha uma história dele.',
  'Reguei as plantas que ele cuidava.',
]

const JEITOS = {
  // Puerpério: bebê de 2 meses, sono picado, pouca rede de apoio nos dias de semana.
  'p-marina': {
    humor: 2.9, ansiedade: 5.5, sonoHoras: 5, sonoQualidade: 2.2, energia: 2, exercicio: 0.15, faltas: 0.1, ultimoRegistro: 1,
    emocoes: ['ansiedade', 'tristeza', 'irritacao'],
    situacoes: ['familia', 'sobrecarga', 'saude', 'solidao'],
    acontecimentos: {
      33: 'Primeira consulta do pediatra. Ele disse que o bebê está ótimo, fiquei aliviada.',
      19: 'Minha mãe voltou para a casa dela. Senti um vazio enorme à noite.',
      12: 'Chorei no banho sem saber por quê. Depois passou.',
      4: 'Consegui sair para caminhar 20 minutos sozinha enquanto meu marido ficou com o bebê.',
    },
    dia: ({ d, fimDeSemana }, { chance, um, alguns }) => {
      const comApoio = fimDeSemana || d > 19
      const apoio = comApoio ? alguns(['parceiro', 'familia'], 0.8) : chance(0.4) ? ['parceiro'] : ['ninguem']
      const descanso = comApoio ? um([2, 3, 3]) : um([1, 1, 2])
      const vinculo = comApoio ? um(['conectada', 'cansada_bem', 'cansada_bem']) : um(['cansada_bem', 'sobrecarregada', 'preocupada', 'sobrecarregada'])
      const tempoSi = chance(comApoio ? 0.5 : 0.1)
      // O que ela fez no tempo para si: nem todo dia ela escreve (o campo é opcional).
      const tempoSiQue = tempoSi && d % 5 !== 0 ? TEMPO_PARA_SI[d % TEMPO_PARA_SI.length] : undefined
      return {
        ajusteHumor: comApoio ? 0.4 : -0.3,
        modulos: {
          puerperio: {
            descanso,
            vinculo,
            apoio: apoio.length ? apoio : ['ninguem'],
            tempoSi,
            ...(tempoSiQue && { tempoSiQue }),
            intrusivos: d < 20 && chance(0.35) ? um([1, 1, 2]) : 0,
          },
        },
      }
    },
  },

  // Crises de ansiedade e consumo de álcool, mais concentrado em fins de semana.
  'p-rafael': {
    humor: 3.2, ansiedade: 6.2, sonoHoras: 6.5, sonoQualidade: 2.8, energia: 3, exercicio: 0.35, faltas: 0.12, ultimoRegistro: 1,
    emocoes: ['ansiedade', 'medo', 'irritacao'],
    situacoes: ['trabalho', 'financas', 'vida_social', 'saude'],
    acontecimentos: {
      38: 'Tive uma crise dentro do metrô. Desci duas estações antes e fui a pé.',
      24: 'Apresentação para a diretoria. Fui mesmo com medo e deu certo.',
      9: 'Festa de aniversário de um amigo, bebi mais do que queria.',
      3: 'Voltei a pegar o metrô no horário de pico. Fiquei tenso, mas fiquei.',
    },
    dia: ({ d, fimDeSemana, progresso }, { chance, um, alguns, ruido }) => {
      const bebeu = chance(fimDeSemana ? 0.7 : 0.18)
      const alcool = bebeu
        ? {
            bebeu: true,
            doses: fimDeSemana ? um([3.5, 5.5, 5.5, 8]) : um([1, 2, 2, 3.5]),
            companhia: fimDeSemana ? alguns(['amigos', 'parceiro'], 0.7).concat(['amigos']).filter((v, i, a) => a.indexOf(v) === i) : ['sozinho'],
            motivos: fimDeSemana ? alguns(['socializar', 'relaxar', 'comemorar'], 0.6).concat(['socializar']).filter((v, i, a) => a.indexOf(v) === i) : um([['aliviar'], ['relaxar', 'aliviar'], ['dormir']]),
            vontade: limitar(Math.round(5 + ruido(2)), 0, 10),
          }
        : { bebeu: false, vontade: limitar(Math.round(3 + ruido(2)), 0, 10) }
      return {
        modulos: {
          alcool,
          crise: {
            evitou: chance(0.45 - progresso * 0.3),
            medoCrise: limitar(Math.round(6.5 - progresso * 3 + ruido(2)), 0, 10),
          },
        },
        ajusteAnsiedade: d === 38 || d === 21 || d === 11 ? 3 : 0,
      }
    },
  },

  // Tabagismo em redução (últimos dias sem fumar) e esgotamento no trabalho.
  'p-juliana': {
    humor: 3, ansiedade: 6, sonoHoras: 6, sonoQualidade: 2.7, energia: 2.3, exercicio: 0.2, faltas: 0.08, ultimoRegistro: 1,
    emocoes: ['ansiedade', 'irritacao', 'tristeza'],
    situacoes: ['trabalho', 'sobrecarga', 'relacionamento'],
    acontecimentos: {
      30: 'Fechamento do trimestre. Fiquei até as 23h no escritório.',
      15: 'Combinei com a minha chefe de não responder mensagem depois das 19h.',
      5: 'Decidi parar de fumar de vez. Joguei fora o maço que estava na bolsa.',
    },
    dia: ({ d, fimDeSemana, progresso }, { chance, um, alguns, ruido }) => {
      const parou = d <= 5
      const cigarros = parou ? 0 : limitar(Math.round(15 - progresso * 9 + ruido(3)), 1, 30)
      const quantidade = cigarros === 0 ? null : cigarros <= 5 ? 3 : cigarros <= 10 ? 8 : cigarros <= 20 ? 15 : 25
      const horas = fimDeSemana ? um([0, 0, 5]) : d > 15 ? um([9, 11, 11]) : um([7, 9, 9])
      return {
        modulos: {
          tabagismo: parou
            ? { fumou: false, vontade: limitar(Math.round(8 - (5 - d) * 0.6 + ruido(1)), 0, 10) }
            : {
                fumou: true,
                quantidade,
                momentos: alguns(['acordar', 'cafe', 'refeicoes', 'estresse', 'trabalho'], 0.55).concat(['estresse']).filter((v, i, a) => a.indexOf(v) === i),
                ...(d % 6 === 0 && { momentos: ['estresse', 'outro'], momentoOutro: 'No trânsito, voltando do trabalho' }),
                vontade: limitar(Math.round(7 + ruido(2)), 0, 10),
              },
          burnout:
            horas === 0
              ? { horas: 0 }
              : {
                  horas,
                  pausas: chance(d > 15 ? 0.25 : 0.55),
                  desligar: d > 15 ? um(['nao', 'nao', 'parte']) : um(['parte', 'sim', 'nao']),
                  sentimento: d > 15 ? um(['esgotado', 'cansado', 'distante']) : um(['cansado', 'neutro', 'motivado', 'cansado']),
                },
        },
        ajusteHumor: fimDeSemana ? 0.6 : 0,
      }
    },
  },

  // Adolescente com situações de bullying na escola.
  'p-pedro': {
    humor: 3.1, ansiedade: 4.5, sonoHoras: 8, sonoQualidade: 3.4, energia: 3.2, exercicio: 0.5, faltas: 0.15, ultimoRegistro: 1,
    emocoes: ['tristeza', 'irritacao', 'medo'],
    situacoes: ['estudos', 'vida_social', 'familia', 'solidao'],
    acontecimentos: {
      26: 'Criaram um grupo no WhatsApp da sala para zoar comigo.',
      13: 'Contei para minha mãe sobre o grupo. Ela vai falar com a coordenação.',
      6: 'Um colega novo sentou comigo no intervalo.',
    },
    dia: ({ d, fimDeSemana }, { chance, um, alguns, ruido }) => {
      if (fimDeSemana) return { modulos: { bullying: { escola: 0, vontade: limitar(Math.round(4 + ruido(2)), 0, 10) } }, ajusteHumor: 0.7 }
      const episodio = chance(d > 13 ? 0.5 : 0.2)
      const aconteceu = episodio ? alguns(['apelidos', 'exclusao', 'internet', 'coisas'], 0.45) : []
      const houve = aconteceu.length ? aconteceu : episodio ? ['apelidos'] : ['nada']
      const algo = houve[0] !== 'nada'
      return {
        ajusteHumor: algo ? -1 : 0.3,
        modulos: {
          bullying: {
            escola: algo ? um([1, 2, 2]) : um([3, 4, 4, 5]),
            aconteceu: houve,
            ...(algo
              ? {
                  onde: houve.includes('internet') ? ['internet', ...alguns(['intervalo'], 0.5)] : alguns(['intervalo', 'sala', 'entrada'], 0.5).concat(['intervalo']).filter((v, i, a) => a.indexOf(v) === i),
                  contou: d > 13 ? ['ninguem'] : um([['responsaveis'], ['responsaveis', 'escola'], ['amigo']]),
                }
              : {}),
            vontade: limitar(Math.round((algo ? 2 : 6) + ruido(2)), 0, 10),
          },
        },
      }
    },
  },

  // Luto recente (pai) e dificuldade para dormir.
  'p-carlos': {
    humor: 2.7, ansiedade: 4, sonoHoras: 5.5, sonoQualidade: 2.2, energia: 2.4, exercicio: 0.3, faltas: 0.1, ultimoRegistro: 1,
    emocoes: ['tristeza', 'tristeza', 'outra'],
    situacoes: ['familia', 'solidao', 'saude', 'mudanca_rotina'],
    acontecimentos: {
      35: 'Missa de um mês do meu pai.',
      22: 'Fui à casa dele separar as roupas com minha irmã. Foi muito difícil.',
      8: 'Aniversário dele. Almoçamos todos juntos e contamos histórias.',
    },
    dia: ({ d, progresso }, { chance, um, alguns, ruido }) => {
      const dataDificil = d === 35 || d === 22 || d === 8
      const deitou = um(['22:30', '23:00', '23:30', '00:00', '00:30'])
      // Dia 2 sempre com gesto de memória, para ter um exemplo no período de 7 dias.
      const memoria = chance(dataDificil ? 0.9 : 0.3) || d === 2
      const memoriaQue = memoria && d % 4 !== 0 ? GESTOS_DE_MEMORIA[d % GESTOS_DE_MEMORIA.length] : undefined
      return {
        ajusteHumor: dataDificil ? -1 : progresso * 0.6,
        modulos: {
          luto: {
            saudade: limitar(Math.round((dataDificil ? 9 : 7 - progresso * 2) + ruido(1.5)), 0, 10),
            momentos: dataDificil ? ['data', ...alguns(['conversas', 'objetos'], 0.6)] : alguns(['noite', 'acordar', 'objetos', 'lugar'], 0.35).length ? alguns(['noite', 'acordar', 'objetos'], 0.45) : ['nenhum'],
            ...(d === 13 && { momentos: ['outro'], momentoOutro: 'Ouvi a música que a gente cantava no carro' }),
            ...(d === 3 && { momentos: ['noite', 'outro'], momentoOutro: 'Arrumando o armário, achei um bilhete dele' }),
            rotina: limitar(Math.round(2 + progresso * 1.3 + ruido(0.8)), 1, 4),
            memoria,
            memoriaQue,
          },
          insonia: {
            deitou,
            latencia: progresso > 0.6 ? um([10, 22, 22, 45]) : um([22, 45, 45, 75]),
            despertares: progresso > 0.6 ? um([0, 1, 1, 2]) : um([1, 2, 2, 3]),
            levantou: um(['06:00', '06:30', '07:00']),
            cochilo: chance(progresso > 0.6 ? 0.2 : 0.5),
            cafeina: chance(progresso > 0.5 ? 0.15 : 0.5),
          },
        },
      }
    },
  },

  // Acompanhamento encerrado: registros param há um mês.
  'p-beatriz': {
    humor: 3.8, ansiedade: 3.5, sonoHoras: 7.5, sonoQualidade: 3.8, energia: 3.6, exercicio: 0.55, faltas: 0.25, ultimoRegistro: 30,
    emocoes: ['tranquilidade', 'ansiedade'],
    situacoes: ['estudos', 'familia'],
  },
}

export function gerarSemente() {
  const sortear = sorteador(20261026)
  const criadoEm = instante(DIAS + 3, 10)

  // Questionários ligados desde o cadastro: { escala: frequência em dias }.
  const escalas = (lista) => Object.fromEntries(Object.entries(lista).map(([id, frequencia]) => [id, { frequencia, ativadaEm: criadoEm, pedidoEm: null }]))

  const perfis = [
    { id: ID_PSICOLOGA, role: 'admin', nome: 'Psicóloga (demonstração)', email: 'psicologa@exemplo.com', modulos: SEM_MODULOS, acompanhamentoEncerradoEm: null, createdAt: criadoEm },
    { id: 'p-marina', role: 'paciente', nome: 'Marina Costa', email: 'marina@exemplo.com', modulos: modulos(['puerperio']), escalas: escalas({ epds: 14 }), acompanhamentoEncerradoEm: null, createdAt: criadoEm },
    { id: 'p-rafael', role: 'paciente', nome: 'Rafael Lima', email: 'rafael@exemplo.com', modulos: modulos(['crise', 'alcool']), escalas: escalas({ gad7: 14 }), acompanhamentoEncerradoEm: null, createdAt: criadoEm },
    { id: 'p-juliana', role: 'paciente', nome: 'Juliana Alves', email: 'juliana@exemplo.com', modulos: modulos(['tabagismo', 'burnout']), escalas: {}, acompanhamentoEncerradoEm: null, createdAt: criadoEm },
    { id: 'p-pedro', role: 'paciente', nome: 'Pedro Henrique Souza', email: 'pedro.resp@exemplo.com', modulos: modulos(['bullying']), acompanhamentoEncerradoEm: null, createdAt: criadoEm },
    { id: 'p-carlos', role: 'paciente', nome: 'Carlos Mendes', email: 'carlos@exemplo.com', modulos: modulos(['luto', 'insonia']), acompanhamentoEncerradoEm: null, createdAt: criadoEm },
    { id: 'p-ana', role: 'paciente', nome: 'Ana Ribeiro', email: 'ana@exemplo.com', modulos: modulos(['alcool']), escalas: {}, acompanhamentoEncerradoEm: null, createdAt: instante(1, 16) },
    { id: 'p-beatriz', role: 'paciente', nome: 'Beatriz Nunes', email: 'beatriz@exemplo.com', modulos: SEM_MODULOS, acompanhamentoEncerradoEm: diasAtras(28), createdAt: criadoEm },
  ]

  const checkins = Object.entries(JEITOS).flatMap(([id, jeito]) => gerarCheckins(id, jeito, sortear))

  // Ana foi cadastrada ontem e ainda não fez o primeiro acesso: sem consentimento.
  const consentimentos = perfis
    .filter((p) => p.role === 'paciente' && p.id !== 'p-ana')
    .flatMap((p) => [
      { id: `${p.id}-termos`, userId: p.id, tipo: 'termos_de_uso', versao: '2026-10-26', aceitoEm: criadoEm, revogadoEm: null },
      { id: `${p.id}-saude`, userId: p.id, tipo: 'dado_saude', versao: '2026-10-26', aceitoEm: criadoEm, revogadoEm: null },
    ])

  const questionarios = [
    // EPDS a cada 2 semanas. Na segunda, o item 10 (pensar em se machucar) aparece marcado — o painel destaca.
    escala('e1', 'p-marina', 'epds', 29, [1, 1, 2, 2, 1, 2, 1, 1, 1, 0]),
    escala('e2', 'p-marina', 'epds', 15, [2, 2, 2, 2, 2, 2, 2, 2, 1, 1]),
    escala('e3', 'p-marina', 'epds', 1, [1, 1, 2, 2, 1, 2, 1, 1, 1, 0]),
    escala('e4', 'p-rafael', 'gad7', 30, [2, 2, 3, 2, 1, 2, 2]),
    escala('e5', 'p-rafael', 'gad7', 16, [2, 2, 2, 2, 1, 1, 2]),
    escala('e6', 'p-rafael', 'gad7', 2, [1, 1, 2, 1, 1, 1, 1]),
  ]

  const crises = [
    { id: 'c1', userId: 'p-rafael', ocorridoEm: instante(38, 8, 20), intensidade: 9, duracao: 20, lugar: 'transporte', sintomas: ['coracao', 'ar', 'tontura', 'controle'], estrategias: ['saiu'], ajudou: 'Sair do vagão e sentar num banco da estação.', createdAt: instante(38, 9) },
    { id: 'c2', userId: 'p-rafael', ocorridoEm: instante(21, 14, 5), intensidade: 7, duracao: 20, lugar: 'trabalho', sintomas: ['coracao', 'peito', 'suor'], estrategias: ['respiracao', 'agua'], ajudou: 'A respiração do app e lavar o rosto.', createdAt: instante(21, 15) },
    { id: 'c3', userId: 'p-rafael', ocorridoEm: instante(11, 23, 40), intensidade: 6, duracao: 45, lugar: 'casa', sintomas: ['coracao', 'irrealidade', 'morrer'], estrategias: ['respiracao', 'ligou'], ajudou: 'Liguei para minha irmã e fiquei conversando até passar.', createdAt: instante(11, 23, 59) },
    { id: 'c4', userId: 'p-rafael', ocorridoEm: instante(4, 18, 30), intensidade: 4, duracao: 5, lugar: 'lugar_cheio', sintomas: ['coracao', 'tremor'], estrategias: ['aterramento'], ajudou: 'O 5-4-3-2-1. Passou rápido.', createdAt: instante(4, 19) },
    // Segunda crise na semana: Rafael aparece em "Precisam de atenção" na lista de pacientes.
    { id: 'c5', userId: 'p-rafael', ocorridoEm: instante(1, 7, 50), intensidade: 6, duracao: 10, lugar: 'transporte', sintomas: ['coracao', 'ar'], estrategias: ['respiracao'], ajudou: 'A respiração do app até a minha estação.', createdAt: instante(1, 8, 10) },
  ]

  const pensamentos = [
    { id: 'r1', userId: 'p-rafael', ocorridoEm: instante(20, 9), situacao: 'Ia pegar o metrô para o trabalho', pensamento: 'Vou passar mal lá dentro e não vou conseguir sair', emocao: 'Medo', intensidade: 8, comportamento: 'Pedi um carro de aplicativo' },
    { id: 'r2', userId: 'p-rafael', ocorridoEm: instante(6, 21), situacao: 'Meu chefe pediu para conversar amanhã', pensamento: 'Vou ser demitido', emocao: 'Ansiedade', intensidade: 7, comportamento: 'Fiquei revendo e-mails até tarde' },
    { id: 'r3', userId: 'p-juliana', ocorridoEm: instante(12, 22), situacao: 'Recebi mensagem da chefe às 22h', pensamento: 'Se eu não responder agora, vão achar que não me importo', emocao: 'Culpa', intensidade: 7, comportamento: 'Respondi e fui fumar na varanda' },
    { id: 'r4', userId: 'p-juliana', ocorridoEm: instante(3, 19), situacao: 'Vontade forte de fumar depois do jantar', pensamento: 'Só um não vai fazer diferença', emocao: 'Ansiedade', intensidade: 6, comportamento: 'Fui lavar a louça e tomei água' },
  ]

  const semana = (d) => {
    const data = diasAtras(d)
    const dow = (diaDaSemana(data) + 6) % 7
    return diasAtras(d + dow)
  }

  const reflexoes = [
    { id: 'rf1', userId: 'p-marina', semanaInicio: semana(14), percepcaoAvanco: 2, avancos: 'Pedi para minha vizinha ficar com o bebê 1 hora.', dificuldades: 'As noites sozinha quando meu marido viaja.', updatedAt: instante(10, 20) },
    { id: 'rf2', userId: 'p-marina', semanaInicio: semana(7), percepcaoAvanco: 3, avancos: 'Caminhei duas vezes.', dificuldades: 'Ainda sinto culpa quando deixo o bebê com alguém.', updatedAt: instante(3, 20) },
    { id: 'rf3', userId: 'p-rafael', semanaInicio: semana(7), percepcaoAvanco: 4, avancos: 'Peguei o metrô três vezes.', dificuldades: 'Beber menos no fim de semana.', updatedAt: instante(2, 21) },
    { id: 'rf4', userId: 'p-juliana', semanaInicio: semana(7), percepcaoAvanco: 3, avancos: 'Parei de fumar!', dificuldades: 'A vontade depois do almoço e do café.', updatedAt: instante(2, 20) },
    { id: 'rf5', userId: 'p-carlos', semanaInicio: semana(7), percepcaoAvanco: 2, avancos: 'Voltei a dormir antes da meia-noite.', dificuldades: 'O aniversário do meu pai.', updatedAt: instante(3, 22) },
  ]

  const objetivosTerapeuticos = [
    { userId: 'p-marina', texto: 'Construir uma rede de apoio nos cuidados com o bebê.\nReconhecer e acolher os próprios limites.\nRetomar pequenos momentos para si.', updatedAt: criadoEm },
    { userId: 'p-rafael', texto: 'Voltar a usar o transporte público com mais tranquilidade.\nReconhecer os sinais do corpo antes de uma crise.\nPerceber a relação entre o álcool e a ansiedade.', updatedAt: criadoEm },
    { userId: 'p-juliana', texto: 'Parar de fumar.\nEstabelecer limites entre trabalho e vida pessoal.', updatedAt: criadoEm },
    { userId: 'p-pedro', texto: 'Sentir-se mais seguro na escola.\nFortalecer amizades.\nSaber a quem pedir ajuda.', updatedAt: criadoEm },
    { userId: 'p-carlos', texto: 'Atravessar o luto com espaço para a saudade.\nRegularizar o sono.', updatedAt: criadoEm },
  ]

  const objetivosSemana = [
    { id: 'os5', userId: 'p-marina', semanaInicio: semana(14), texto: 'Pedir ajuda para alguém em pelo menos um dia.', updatedAt: instante(16, 18) },
    { id: 'os6', userId: 'p-marina', semanaInicio: semana(7), texto: 'Sair para caminhar duas vezes, mesmo que por 15 minutos.', updatedAt: instante(9, 18) },
    { id: 'os7', userId: 'p-rafael', semanaInicio: semana(7), texto: 'Pegar o metrô três vezes, fora do horário de pico.', updatedAt: instante(9, 18) },
    { id: 'os1', userId: 'p-marina', semanaInicio: semana(0), texto: 'Aceitar ajuda da sogra na quarta e usar a hora livre só para você.', updatedAt: instante(2, 18) },
    { id: 'os2', userId: 'p-rafael', semanaInicio: semana(0), texto: 'Pegar o metrô duas vezes no horário de pico, sem sair antes da sua estação.', updatedAt: instante(2, 18) },
    { id: 'os3', userId: 'p-juliana', semanaInicio: semana(0), texto: 'Quando vier a vontade de fumar, esperar 10 minutos e beber um copo de água.', updatedAt: instante(2, 18) },
    { id: 'os4', userId: 'p-pedro', semanaInicio: semana(0), texto: 'Sentar com o colega novo no intervalo pelo menos dois dias.', updatedAt: instante(2, 18) },
  ]

  const fichas = perfis
    .filter((p) => p.role === 'paciente')
    .map((p) => ({ userId: p.id, email: p.email, whatsapp: null, inicioAcompanhamento: p.id === 'p-ana' ? diasAtras(1) : diasAtras(60), historico: null, updatedAt: criadoEm }))
  // Horário fixo das consultas (fictício). Juliana é quinzenal: a referência é a próxima quarta-feira.
  const proximaQuarta = deslocar(hojeLocal(), (3 - new Date().getDay() + 7) % 7)
  const CONSULTAS = {
    'p-marina': { diaSemana: 1, hora: '10:00', frequencia: 'semanal', referencia: null },
    'p-rafael': { diaSemana: 2, hora: '19:00', frequencia: 'semanal', referencia: null },
    'p-juliana': { diaSemana: 3, hora: '08:00', frequencia: 'quinzenal', referencia: proximaQuarta },
    'p-carlos': { diaSemana: 4, hora: '15:00', frequencia: 'semanal', referencia: null },
    'p-pedro': { diaSemana: 5, hora: '16:30', frequencia: 'semanal', referencia: null },
  }
  fichas.forEach((f) => (f.consulta = CONSULTAS[f.userId] ?? null))
  fichas.find((f) => f.userId === 'p-marina').historico = 'Primeira gestação. Parto cesárea há 2 meses. Mãe morou com ela nas primeiras 4 semanas. Marido viaja a trabalho com frequência.'
  fichas.find((f) => f.userId === 'p-pedro').historico = '14 anos, 9º ano. Atendimento solicitado pela mãe (responsável legal, que assinou o consentimento).'

  const anotacoes = [
    { id: 'a1', userId: 'p-marina', data: diasAtras(14), texto: 'EPDS de hoje com item 10 marcado. Conversamos na sessão: pensamentos passageiros, sem plano. Combinado plano de segurança e contato com o marido.', updatedAt: instante(14, 19) },
    // Rafael: uma sessão por semana nas últimas 6 semanas (fictício).
    { id: 'a3', userId: 'p-rafael', data: diasAtras(37), texto: 'Primeira sessão após a avaliação. Relata duas crises no metrô no último mês e passou a ir de carro de aplicativo. Psicoeducação sobre ansiedade e o ciclo da evitação. Combinado: começar o check-in diário.', updatedAt: instante(37, 19) },
    { id: 'a4', userId: 'p-rafael', data: diasAtras(30), texto: 'Montamos juntos a hierarquia de exposição (de olhar o metrô na estação até viajar no horário de pico). GAD-7 de hoje: 14. Treinamos a respiração diafragmática na sessão.', updatedAt: instante(30, 19) },
    { id: 'a5', userId: 'p-rafael', data: diasAtras(23), texto: 'Fez os dois primeiros degraus da hierarquia. Ansiedade antecipatória alta na véspera, mas a de durante ficou abaixo do esperado por ele. Introduzido o registro de pensamentos.', updatedAt: instante(23, 19) },
    { id: 'a6', userId: 'p-rafael', data: diasAtras(16), texto: 'Uma crise na semana, em lugar cheio, que ele conseguiu manejar com o 5-4-3-2-1. GAD-7: 12. Começou a trazer o tema do trabalho: medo de errar e de ser avaliado.', updatedAt: instante(16, 19) },
    { id: 'a2', userId: 'p-rafael', data: diasAtras(9), texto: 'Exposição gradual ao metrô seguindo bem. Investigar o uso de álcool nos fins de semana como possível evitação.', updatedAt: instante(9, 19) },
    { id: 'a7', userId: 'p-rafael', data: diasAtras(2), texto: 'GAD-7 de hoje: 8, a menor pontuação desde o início. Pegou o metrô três vezes na semana. Trabalhamos o pensamento “vou ser demitido” (evidências a favor e contra). Próximo passo: horário de pico.', updatedAt: instante(2, 19) },
  ]

  // Anotações nos tópicos do Resumo e nos gráficos (aparecem também, reunidas por dia, em Anotações clínicas).
  const comentarios = [
    { id: 'co4', userId: 'p-rafael', topico: 'grafico-humor', origem: 'Gráficos · Humor (1 a 5)', data: diasAtras(37), texto: 'Humor oscilando entre neutro e mal na primeira semana de registros. Ainda pouco dado para ver padrão.', updatedAt: instante(37, 18) },
    { id: 'co5', userId: 'p-rafael', topico: 'grafico-sono', origem: 'Gráficos · Horas de sono', data: diasAtras(30), texto: 'Dorme menos de 6h nas noites antes de dias com reunião. Perguntar sobre a rotina da noite.', updatedAt: instante(30, 18) },
    { id: 'co6', userId: 'p-rafael', topico: 'grafico-escala-gad7', origem: 'Gráficos · GAD-7 · todas as aplicações', data: diasAtras(30), texto: 'Linha de base: 14 (moderada). Reaplicar a cada duas semanas.', updatedAt: instante(30, 18) },
    { id: 'co7', userId: 'p-rafael', topico: 'grafico-situacoes', origem: 'Gráficos · Ansiedade média por situação marcada', data: diasAtras(23), texto: '“Trabalho” aparece com a ansiedade média mais alta, acima até do transporte. Tema a explorar além do metrô.', updatedAt: instante(23, 18) },
    { id: 'co8', userId: 'p-rafael', topico: 'evitacao', origem: 'Resumo · Evitação', data: diasAtras(23), texto: 'Evitação diminuindo nas semanas em que fez a exposição.', updatedAt: instante(23, 18) },
    { id: 'co9', userId: 'p-rafael', topico: 'grafico-crises', origem: 'Gráficos · Crises registradas · intensidade (0 a 10)', data: diasAtras(16), texto: 'Uma crise só no período, de intensidade menor que as relatadas na avaliação.', updatedAt: instante(16, 18) },
    { id: 'co10', userId: 'p-rafael', topico: 'grafico-movimento', origem: 'Gráficos · Energia média com e sem movimento', data: diasAtras(16), texto: 'Energia um pouco mais alta nos dias em que caminhou. Conversar sobre retomar a corrida que ele mencionou.', updatedAt: instante(16, 18) },
    { id: 'co1', userId: 'p-rafael', topico: 'grafico-ansiedade', origem: 'Gráficos · Ansiedade ou estresse (0 a 10)', data: diasAtras(9), texto: 'Picos de ansiedade nos dias de metrô no horário de pico. Retomar a hierarquia de exposição.', updatedAt: instante(9, 19) },
    { id: 'co11', userId: 'p-rafael', topico: 'alcool', origem: 'Resumo · Álcool', data: diasAtras(9), texto: 'Bebe mais quando está sozinho e marca “relaxar” como motivo. Pode ser uma forma de aliviar a ansiedade da semana.', updatedAt: instante(9, 18) },
    { id: 'co2', userId: 'p-rafael', topico: 'temas', origem: 'Resumo · Possíveis temas para a sessão', data: diasAtras(2), texto: 'Levar para a sessão a conversa com o chefe e o pensamento “vou ser demitido”.', updatedAt: instante(2, 18) },
    { id: 'co3', userId: 'p-rafael', topico: 'grafico-alcool', origem: 'Gráficos · Álcool · Doses por dia', data: diasAtras(2), texto: 'Doses concentradas no fim de semana, como ele relatou. Seguir investigando.', updatedAt: instante(2, 18) },
    { id: 'co12', userId: 'p-rafael', topico: 'grafico-dia-semana', origem: 'Gráficos · Humor médio por dia da semana', data: diasAtras(2), texto: 'Domingo segue sendo o dia de humor mais baixo. Antecipação da semana de trabalho?', updatedAt: instante(2, 18) },
  ]

  const medicacoes = [
    { id: 'm1', userId: 'p-rafael', nome: 'Escitalopram', dosagem: '10 mg', posologia: '1 comprimido pela manhã', prescritoPor: 'Psiquiatra', inicio: diasAtras(50), fim: null, observacoes: null },
  ]

  return {
    perfis,
    consentimentos,
    checkins,
    escalas: questionarios,
    adiamentos: [],
    crises,
    pensamentos,
    reflexoes,
    objetivosTerapeuticos,
    objetivosSemana,
    fichas,
    anotacoes,
    medicacoes,
    comentarios,
    solicitacoes: [],
  }
}
