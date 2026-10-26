// Ficha do paciente: só a Admin lê e grava.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `fichas_pacientes`, RLS só-Admin;
// o cadastro de pacientes passa pela Edge Function `criar-paciente`.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'
import { hojeLocal } from './datas'

export async function buscarFicha(userId) {
  await esperar()
  return ler('fichas').find((f) => f.userId === userId) ?? null
}

export async function salvarFicha(f) {
  await esperar()
  const linha = {
    userId: f.userId,
    email: f.email,
    whatsapp: f.whatsapp?.trim() || null,
    inicioAcompanhamento: f.inicioAcompanhamento,
    historico: f.historico?.trim() || null,
    updatedAt: agora(),
  }
  gravar((db) => {
    db.fichas = [...db.fichas.filter((x) => x.userId !== f.userId), linha]
  })
  return linha
}

// Senha provisória só para a demonstração parecer real (ninguém entra com ela: a entrada é por perfil).
const senhaDeExemplo = () => `demo-${Math.random().toString(36).slice(2, 8)}`

// Cria o perfil, a ficha e os objetivos do paciente. Devolve { id, email, senhaProvisoria }.
export async function criarPaciente(dados) {
  await esperar()
  const email = dados.email.trim().toLowerCase()
  if (ler('perfis').some((p) => p.email === email)) throw new Error('Já existe um paciente com este e-mail.')
  const id = novoId()
  const criadoEm = agora()
  gravar((db) => {
    db.perfis.push({
      id,
      role: 'paciente',
      nome: dados.nome.trim(),
      email,
      modulos: dados.modulos,
      registroPensamentosAtivo: dados.registroPensamentosAtivo,
      acompanhamentoEncerradoEm: null,
      createdAt: criadoEm,
    })
    db.fichas.push({
      userId: id,
      email,
      whatsapp: dados.whatsapp?.trim() || null,
      inicioAcompanhamento: dados.inicioAcompanhamento || hojeLocal(),
      historico: dados.historico?.trim() || null,
      updatedAt: criadoEm,
    })
    if (dados.objetivosTerapeuticos?.trim()) {
      db.objetivosTerapeuticos.push({ userId: id, texto: dados.objetivosTerapeuticos.trim(), updatedAt: criadoEm })
    }
  })
  return { id, email, senhaProvisoria: senhaDeExemplo() }
}
