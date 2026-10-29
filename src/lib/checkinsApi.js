// Check-ins diários. Cada check-in leva junto, em `modulos`, as respostas dos módulos ligados
// (ex.: { tabagismo: { fumou: true, quantidade: 8 } }).
// DEMONSTRAÇÃO: banco do navegador (lib/demo). Na versão com Supabase: tabela `checkins`
// (com coluna jsonb `modulos`), RLS _select_own/_insert_own/_update_own/_delete_own + leitura pela Admin.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'
export { hojeLocal } from './datas'

function normalizar(c) {
  return {
    userId: c.userId,
    data: c.data,
    humor: c.humor,
    emocao: c.emocao,
    emocaoOutra: c.emocao === 'outra' ? c.emocaoOutra?.trim() || null : null,
    ansiedade: c.ansiedade,
    sonoHoras: c.sonoHoras,
    sonoQualidade: c.sonoQualidade,
    energia: c.energia,
    exercicio: c.exercicio ?? null,
    acontecimento: c.acontecimento?.trim() || null,
    situacoes: c.situacoes ?? [],
    situacaoOutra: c.situacoes?.includes('outra') ? c.situacaoOutra?.trim() || null : null,
    modulos: c.modulos ?? {},
  }
}

export async function buscarCheckinDoDia(userId, data) {
  await esperar()
  return ler('checkins').find((c) => c.userId === userId && c.data === data) ?? null
}

// Um check-in por dia: se já existir, atualiza.
export async function salvarCheckin(checkin) {
  await esperar()
  const linha = normalizar(checkin)
  let salvo
  gravar((db) => {
    const existente = db.checkins.find((c) => c.userId === linha.userId && c.data === linha.data)
    if (existente) {
      Object.assign(existente, linha)
      salvo = existente
    } else {
      salvo = { id: novoId(), ...linha, createdAt: agora() }
      db.checkins.push(salvo)
    }
  })
  return structuredClone(salvo)
}

// Para o painel da Admin: check-ins de todos os pacientes desde uma data.
export async function listarCheckinsDeTodos(desde) {
  await esperar()
  return ler('checkins')
    .filter((c) => c.data >= desde)
    .sort((a, b) => b.data.localeCompare(a.data))
    .map((c) => ({ userId: c.userId, data: c.data, humor: c.humor, ansiedade: c.ansiedade, modulos: c.modulos ?? {} }))
}

export async function listarCheckins(userId, desde) {
  await esperar()
  return ler('checkins')
    .filter((c) => c.userId === userId && c.data >= desde)
    .sort((a, b) => b.data.localeCompare(a.data))
}

// Só as datas dos check-ins do paciente, para calcular a sequência de dias.
export async function listarDatasDeCheckin(userId) {
  await esperar()
  return ler('checkins')
    .filter((c) => c.userId === userId)
    .map((c) => c.data)
    .sort()
    .reverse()
}
