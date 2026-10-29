// Questionários periódicos (EPDS, GAD-7) e crises de ansiedade registradas.
// DEMONSTRAÇÃO: banco do navegador. Na versão com Supabase: tabelas `questionarios` e `crises`,
// ambas com RLS _select_own/_insert_own/_update_own/_delete_own + leitura pela Admin.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'
import { hojeLocal } from './datas'
import { pontuar } from '../data/escalas'

// ---------------------------------------------------------------- Questionários

export async function listarQuestionarios(userId) {
  await esperar()
  return ler('escalas')
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.data.localeCompare(a.data))
}

// Questionários de todos os pacientes a partir de uma data (lista de pacientes: sinais de atenção). Só a Admin.
export async function listarQuestionariosDeTodos(desde) {
  await esperar()
  return ler('escalas').filter((e) => e.data >= desde)
}

// `respostas`: a pontuação de cada item, na ordem do questionário.
export async function salvarQuestionario(userId, tipo, respostas) {
  await esperar()
  const novo = { id: novoId(), userId, tipo, data: hojeLocal(), respostas, total: pontuar(respostas), createdAt: agora() }
  gravar((db) => db.escalas.push(novo))
  return novo
}

// "Responder mais tarde": o aviso do questionário pendente some só até o dia seguinte.
// Com Supabase: tabela `questionarios_adiados` (user_id, tipo, dia), RLS _own.
export async function listarAdiadosHoje(userId) {
  await esperar()
  const hoje = hojeLocal()
  return (ler('adiamentos') ?? []).filter((a) => a.userId === userId && a.dia === hoje).map((a) => a.tipo)
}

export async function adiarQuestionarios(userId, tipos) {
  await esperar()
  const dia = hojeLocal()
  gravar((db) => {
    const outros = (db.adiamentos ?? []).filter((a) => !(a.userId === userId && tipos.includes(a.tipo)))
    db.adiamentos = [...outros, ...tipos.map((tipo) => ({ userId, tipo, dia }))]
  })
}

// ---------------------------------------------------------------- Crises

// Crises de todos os pacientes a partir de uma data (lista de pacientes: sinais de atenção). Só a Admin.
export async function listarCrisesDeTodos(desde) {
  await esperar()
  return ler('crises').filter((c) => c.ocorridoEm.slice(0, 10) >= desde)
}

export async function listarCrises(userId, desde = null) {
  await esperar()
  return ler('crises')
    .filter((c) => c.userId === userId && (!desde || c.ocorridoEm >= desde))
    .sort((a, b) => b.ocorridoEm.localeCompare(a.ocorridoEm))
}

export async function registrarCrise(userId, crise) {
  await esperar()
  const nova = {
    id: novoId(),
    userId,
    ocorridoEm: crise.ocorridoEm,
    intensidade: crise.intensidade,
    duracao: crise.duracao,
    lugar: crise.lugar,
    sintomas: crise.sintomas,
    estrategias: crise.estrategias,
    ajudou: crise.ajudou?.trim() || null,
    createdAt: agora(),
  }
  gravar((db) => db.crises.push(nova))
  return nova
}

export async function apagarCrise(id) {
  await esperar()
  gravar((db) => {
    db.crises = db.crises.filter((c) => c.id !== id)
  })
}
