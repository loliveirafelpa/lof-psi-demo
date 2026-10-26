// Comentários da psicóloga nos tópicos do Resumo. Só a Admin lê e grava.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `comentarios_resumo`, RLS só-Admin.
import { ler, gravar, novoId, esperar } from './demo/banco'
import { hojeLocal } from './datas'

export async function listarComentarios(userId, desde) {
  await esperar()
  return ler('comentarios').filter((c) => c.userId === userId && c.data >= desde)
}

export async function salvarComentario(userId, { id, topico, texto }) {
  await esperar()
  let salvo
  gravar((db) => {
    if (id) {
      salvo = db.comentarios.find((c) => c.id === id)
      salvo.texto = texto.trim()
    } else {
      salvo = { id: novoId(), userId, topico, texto: texto.trim(), data: hojeLocal() }
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
