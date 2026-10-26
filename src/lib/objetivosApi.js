// Objetivos definidos pela psicóloga. A Admin grava; o paciente só lê.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabelas `objetivos_terapeuticos` e `objetivos_semana`.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'

export async function buscarObjetivosTerapeuticos(userId) {
  await esperar()
  const o = ler('objetivosTerapeuticos').find((x) => x.userId === userId)
  return o ? { texto: o.texto, updatedAt: o.updatedAt } : null
}

// Texto vazio apaga os objetivos.
export async function salvarObjetivosTerapeuticos(userId, texto) {
  await esperar()
  const limpo = texto.trim()
  gravar((db) => {
    db.objetivosTerapeuticos = db.objetivosTerapeuticos.filter((x) => x.userId !== userId)
    if (limpo) db.objetivosTerapeuticos.push({ userId, texto: limpo, updatedAt: agora() })
  })
}

export async function buscarObjetivoSemana(userId, semanaInicio) {
  await esperar()
  return ler('objetivosSemana').find((o) => o.userId === userId && o.semanaInicio === semanaInicio) ?? null
}

export async function listarObjetivosSemana(userId, limite = 12) {
  await esperar()
  return ler('objetivosSemana')
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.semanaInicio.localeCompare(a.semanaInicio))
    .slice(0, limite)
}

// Texto vazio apaga o objetivo daquela semana.
export async function salvarObjetivoSemana(userId, semanaInicio, texto) {
  await esperar()
  const limpo = texto.trim()
  gravar((db) => {
    const anterior = db.objetivosSemana.find((o) => o.userId === userId && o.semanaInicio === semanaInicio)
    db.objetivosSemana = db.objetivosSemana.filter((o) => o !== anterior)
    if (limpo) db.objetivosSemana.push({ id: anterior?.id ?? novoId(), userId, semanaInicio, texto: limpo, updatedAt: agora() })
  })
}
