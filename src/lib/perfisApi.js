// Perfis (psicóloga e pacientes), com os módulos e protocolos ligados para cada paciente.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `profiles` (coluna jsonb `modulos`);
// um gatilho garante que só a Admin altere módulos e encerramento.
import { ler, gravar, esperar } from './demo/banco'

const doBanco = (p) => ({
  id: p.id,
  role: p.role,
  nome: p.nome,
  email: p.email,
  modulos: p.modulos ?? {},
  escalas: p.escalas ?? {},
  acompanhamentoEncerradoEm: p.acompanhamentoEncerradoEm,
  createdAt: p.createdAt,
})

function buscar(id) {
  const p = ler('perfis').find((x) => x.id === id)
  if (!p) throw new Error('Perfil não encontrado.')
  return doBanco(p)
}

function alterar(id, mudancas) {
  gravar((db) => Object.assign(db.perfis.find((x) => x.id === id), mudancas))
}

// Só na demonstração: todos os perfis, para a tela de escolha de perfil.
export async function listarPerfisDemonstracao() {
  await esperar()
  return ler('perfis').map(doBanco)
}

export async function buscarMeuPerfil(userId) {
  await esperar()
  return buscar(userId)
}

export async function listarPacientes() {
  await esperar()
  return ler('perfis')
    .filter((p) => p.role === 'paciente')
    .map(doBanco)
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

export async function buscarPerfil(id) {
  await esperar()
  return buscar(id)
}

// Liga ou desliga um módulo/protocolo (ver data/modulos.js) para o paciente. Só a Admin.
export async function definirModulo(id, moduloId, ativo) {
  await esperar()
  gravar((db) => {
    const p = db.perfis.find((x) => x.id === id)
    p.modulos = { ...p.modulos, [moduloId]: ativo }
  })
}

// Liga, ajusta ou desliga (`config` null) o questionário de um módulo. Só a Admin.
// `config`: { frequencia: 'unica' | 14 | 30, ativadaEm, pedidoEm }.
export async function definirEscala(id, escalaId, config) {
  await esperar()
  gravar((db) => {
    const p = db.perfis.find((x) => x.id === id)
    const escalas = { ...p.escalas }
    if (config) escalas[escalaId] = config
    else delete escalas[escalaId]
    p.escalas = escalas
  })
}

// Data (AAAA-MM-DD) para encerrar o acompanhamento ou null para reabrir. Só a Admin.
export async function definirEncerramento(id, data) {
  await esperar()
  alterar(id, { acompanhamentoEncerradoEm: data })
}

export async function atualizarMeuNome(userId, nome) {
  await esperar()
  alterar(userId, { nome })
}
