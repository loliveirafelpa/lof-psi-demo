// Anotações clínicas e medicações: exclusivas da psicóloga.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabelas `anotacoes_clinicas` e `medicacoes`, RLS só-Admin.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'

export async function listarAnotacoes(userId) {
  await esperar()
  return ler('anotacoes')
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.data.localeCompare(a.data) || b.updatedAt.localeCompare(a.updatedAt))
}

export async function salvarAnotacao(userId, { id, data, texto }) {
  await esperar()
  const linha = { userId, data, texto: texto.trim(), updatedAt: agora() }
  let salva
  gravar((db) => {
    salva = id ? db.anotacoes.find((a) => a.id === id) : null
    if (salva) Object.assign(salva, linha)
    else db.anotacoes.push((salva = { id: novoId(), ...linha }))
  })
  return structuredClone(salva)
}

export async function apagarAnotacao(id) {
  await esperar()
  gravar((db) => {
    db.anotacoes = db.anotacoes.filter((a) => a.id !== id)
  })
}

const vazioParaNulo = (v) => (typeof v === 'string' ? v.trim() || null : v ?? null)

export async function listarMedicacoes(userId) {
  await esperar()
  return ler('medicacoes')
    .filter((m) => m.userId === userId)
    .sort((a, b) => (b.inicio ?? '').localeCompare(a.inicio ?? ''))
}

export async function salvarMedicacao(userId, m) {
  await esperar()
  const linha = {
    userId,
    nome: m.nome.trim(),
    dosagem: vazioParaNulo(m.dosagem),
    posologia: vazioParaNulo(m.posologia),
    prescritoPor: vazioParaNulo(m.prescritoPor),
    inicio: vazioParaNulo(m.inicio),
    fim: vazioParaNulo(m.fim),
    observacoes: vazioParaNulo(m.observacoes),
  }
  let salva
  gravar((db) => {
    salva = m.id ? db.medicacoes.find((x) => x.id === m.id) : null
    if (salva) Object.assign(salva, linha)
    else db.medicacoes.push((salva = { id: novoId(), ...linha }))
  })
  return structuredClone(salva)
}

export async function apagarMedicacao(id) {
  await esperar()
  gravar((db) => {
    db.medicacoes = db.medicacoes.filter((m) => m.id !== id)
  })
}
