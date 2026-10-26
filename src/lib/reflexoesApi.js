// Reflexão semanal do paciente.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `reflexoes_semanais`, RLS do paciente + leitura pela Admin.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'
import { paraIso } from './datas'

// Segunda-feira da semana atual, na data local do paciente (AAAA-MM-DD).
export function inicioDaSemana(data = new Date()) {
  const d = new Date(data)
  const diasDesdeSegunda = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diasDesdeSegunda)
  return paraIso(d)
}

export async function buscarReflexaoDaSemana(userId, semanaInicio) {
  await esperar()
  return ler('reflexoes').find((r) => r.userId === userId && r.semanaInicio === semanaInicio) ?? null
}

export async function listarReflexoes(userId, limite = 4) {
  await esperar()
  return ler('reflexoes')
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.semanaInicio.localeCompare(a.semanaInicio))
    .slice(0, limite)
}

// Uma reflexão por semana: se já existir, atualiza.
export async function salvarReflexao(r) {
  await esperar()
  const linha = {
    userId: r.userId,
    semanaInicio: r.semanaInicio,
    objetivo: r.objetivo?.trim() || null,
    percepcaoAvanco: r.percepcaoAvanco,
    avancos: r.avancos?.trim() || null,
    dificuldades: r.dificuldades?.trim() || null,
    updatedAt: agora(),
  }
  let salvo
  gravar((db) => {
    salvo = db.reflexoes.find((x) => x.userId === r.userId && x.semanaInicio === r.semanaInicio)
    if (salvo) Object.assign(salvo, linha)
    else db.reflexoes.push((salvo = { id: novoId(), ...linha }))
  })
  return structuredClone(salvo)
}
