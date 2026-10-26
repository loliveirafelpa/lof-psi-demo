// Questionários periódicos (EPDS, GAD-7, AUDIT-C, Fagerström) e crises de ansiedade registradas.
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

// `respostas`: a pontuação de cada item, na ordem do questionário.
export async function salvarQuestionario(userId, tipo, respostas) {
  await esperar()
  const novo = { id: novoId(), userId, tipo, data: hojeLocal(), respostas, total: pontuar(respostas), createdAt: agora() }
  gravar((db) => db.escalas.push(novo))
  return novo
}

// ---------------------------------------------------------------- Crises

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
