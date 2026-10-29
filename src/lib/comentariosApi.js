// Anotações da psicóloga nos tópicos do Resumo e nos gráficos. Só a Admin lê e grava.
// `origem` é o título legível do tópico ("Resumo · Humor", "Gráficos · Humor (1 a 5)"), usado na aba Anotações clínicas.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `comentarios_resumo` (com coluna `origem`), RLS só-Admin.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'
import { hojeLocal } from './datas'

// Sem `desde`, devolve todas as anotações do paciente.
export async function listarComentarios(userId, desde = '') {
  await esperar()
  return ler('comentarios').filter((c) => c.userId === userId && c.data >= desde)
}

export async function salvarComentario(userId, { id, topico, origem, texto }) {
  await esperar()
  let salvo
  gravar((db) => {
    if (id) {
      salvo = db.comentarios.find((c) => c.id === id)
      salvo.texto = texto.trim()
      salvo.updatedAt = agora()
    } else {
      salvo = { id: novoId(), userId, topico, origem: origem ?? null, texto: texto.trim(), data: hojeLocal(), updatedAt: agora() }
      db.comentarios.push(salvo)
    }
  })
  return structuredClone(salvo)
}

export async function apagarComentario(id) {
  await esperar()
  gravar((db) => {
    db.comentarios = db.comentarios.filter((c) => c.id !== id)
  })
}
