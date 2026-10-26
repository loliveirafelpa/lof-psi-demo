// Dados e frases da aba "Gráficos" do painel da psicóloga.
// Mesma regra da síntese: só descreve o que foi registrado. Comparações entre grupos de dias
// mostram coincidências e o número de dias de cada grupo — nunca causa.
import { SITUACOES, EMOCOES } from '../data/checkinOpcoes'
import { diaDaSemana } from './datas'

const media = (valores) => {
  const v = valores.filter((x) => x !== null && x !== undefined)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}
const dec = (v) => (v === null ? '—' : v.toFixed(1).replace('.', ','))

// { dia: valor } a partir dos check-ins, para uma série do gráfico diário.
export const porDia = (checkins, ler) => Object.fromEntries(checkins.map((c) => [c.data, ler(c) ?? null]))

// Compara a média dos primeiros e dos últimos 7 dias com registro do período.
export function tendencia(dias, valores, unidade = '') {
  const comValor = dias.filter((d) => valores[d] !== null && valores[d] !== undefined)
  if (comValor.length < 10) return null
  const inicio = media(comValor.slice(0, 7).map((d) => valores[d]))
  const fim = media(comValor.slice(-7).map((d) => valores[d]))
  return `Média dos últimos 7 registros: ${dec(fim)}${unidade} · dos 7 primeiros do período: ${dec(inicio)}${unidade}.`
}

// Ansiedade média nos dias em que cada situação foi marcada (só situações com 2 dias ou mais).
export function ansiedadePorSituacao(checkins) {
  const comAnsiedade = checkins.filter((c) => c.ansiedade !== null)
  const geral = media(comAnsiedade.map((c) => c.ansiedade))
  const itens = SITUACOES.filter((s) => s.valor !== 'outra')
    .map((s) => {
      const dias = comAnsiedade.filter((c) => c.situacoes.includes(s.valor))
      return { rotulo: s.rotulo, valor: media(dias.map((c) => c.ansiedade)), n: dias.length }
    })
    .filter((i) => i.n >= 2)
    .sort((a, b) => b.valor - a.valor)
    .map((i) => ({ ...i, detalhe: `${i.n} dias com “${i.rotulo.toLowerCase()}” · ansiedade média ${dec(i.valor)}/10` }))
  return { itens, geral }
}

// Humor médio do dia conforme a qualidade do sono da noite anterior, em três grupos.
export function humorPorSono(checkins) {
  const grupos = [
    { rotulo: 'Ruim ou muito ruim', teste: (q) => q <= 2 },
    { rotulo: 'Regular', teste: (q) => q === 3 },
    { rotulo: 'Bom ou muito bom', teste: (q) => q >= 4 },
  ]
  return grupos
    .map((g) => {
      const dias = checkins.filter((c) => c.sonoQualidade && g.teste(c.sonoQualidade))
      return { rotulo: g.rotulo, valor: media(dias.map((c) => c.humor)), n: dias.length }
    })
    .filter((g) => g.n > 0)
    .map((g) => ({ ...g, detalhe: `${g.n} dias · humor médio ${dec(g.valor)}/5` }))
}

// Energia média nos dias com e sem movimento (só quando os dois grupos têm 3 dias ou mais).
export function energiaPorMovimento(checkins) {
  const com = checkins.filter((c) => c.exercicio === true)
  const sem = checkins.filter((c) => c.exercicio === false)
  if (com.length < 3 || sem.length < 3) return null
  return [
    { rotulo: 'Dias com movimento', valor: media(com.map((c) => c.energia)), n: com.length },
    { rotulo: 'Dias sem movimento', valor: media(sem.map((c) => c.energia)), n: sem.length },
  ]
}

// Humor médio por dia da semana (padrões de rotina: fins de semana, dias de trabalho…).
export function humorPorDiaDaSemana(checkins) {
  const nomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
  return nomes
    .map((rotulo, i) => {
      const dias = checkins.filter((c) => (diaDaSemana(c.data) + 6) % 7 === i)
      return { rotulo, valor: media(dias.map((c) => c.humor)), n: dias.length }
    })
    .filter((d) => d.n > 0)
    .map((d) => ({ ...d, detalhe: `${d.n} ${d.n === 1 ? 'registro' : 'registros'} · humor médio ${dec(d.valor)}/5` }))
}

export function emocoesMaisRegistradas(checkins) {
  return EMOCOES.map((e) => {
    const n = checkins.filter((c) => c.emocao === e.valor).length
    return { rotulo: e.rotulo, valor: n, detalhe: `${n} ${n === 1 ? 'dia' : 'dias'}` }
  })
    .filter((e) => e.valor > 0)
    .sort((a, b) => b.valor - a.valor)
}

// Série principal de cada módulo no gráfico diário.
export const SERIES_MODULOS = {
  tabagismo: { titulo: 'Cigarros por dia (estimativa)', tipo: 'colunas', ler: (r) => (r.fumou === false ? 0 : r.quantidade), rotuloValor: 'Cigarros' },
  alcool: { titulo: 'Doses por dia', tipo: 'colunas', ler: (r) => (r.bebeu === false ? 0 : r.doses), rotuloValor: 'Doses', referencia: { valor: 5, rotulo: '5 doses' } },
  puerperio: { titulo: 'Descanso (1 = quase nada · 4 = bem)', tipo: 'linha', ler: (r) => r.descanso, min: 1, max: 4, rotuloValor: 'Descanso' },
  crise: { titulo: 'Preocupação com ter uma crise (0–10)', tipo: 'linha', ler: (r) => r.medoCrise, max: 10, rotuloValor: 'Preocupação' },
  bullying: { titulo: 'Vontade de ir à escola (0–10)', tipo: 'linha', ler: (r) => r.vontade, max: 10, rotuloValor: 'Vontade' },
  luto: { titulo: 'Saudade (0–10)', tipo: 'linha', ler: (r) => r.saudade, max: 10, rotuloValor: 'Saudade' },
  burnout: { titulo: 'Horas trabalhadas (estimativa)', tipo: 'colunas', ler: (r) => r.horas, rotuloValor: 'Horas', referencia: { valor: 8, rotulo: '8 horas' }, unidade: 'h' },
  insonia: { titulo: 'Minutos para pegar no sono (estimativa)', tipo: 'linha', ler: (r) => r.latencia, rotuloValor: 'Minutos', unidade: ' min' },
}
