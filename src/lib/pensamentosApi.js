// Registro de pensamentos (TCC).
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `registros_pensamento`, RLS do paciente + leitura pela Admin.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'

const campos = (r) => ({
  situacao: r.situacao.trim(),
  pensamento: r.pensamento.trim(),
  emocao: r.emocao.trim(),
  intensidade: r.intensidade,
  comportamento: r.comportamento?.trim() || null,
})

export async function listarRegistrosPensamento(userId, desde = null) {
  await esperar()
  return ler('pensamentos')
    .filter((r) => r.userId === userId && (!desde || r.ocorridoEm >= desde))
    .sort((a, b) => b.ocorridoEm.localeCompare(a.ocorridoEm))
    .slice(0, 50)
}

export async function criarRegistroPensamento(r) {
  await esperar()
  const novo = { id: novoId(), userId: r.userId, ocorridoEm: agora(), ...campos(r) }
  gravar((db) => db.pensamentos.push(novo))
  return novo
}

export async function atualizarRegistroPensamento(id, r) {
  await esperar()
  let salvo
  gravar((db) => {
    salvo = db.pensamentos.find((x) => x.id === id)
    Object.assign(salvo, campos(r))
  })
  return structuredClone(salvo)
}

export async function apagarRegistroPensamento(id) {
  await esperar()
  gravar((db) => {
    db.pensamentos = db.pensamentos.filter((x) => x.id !== id)
  })
}
