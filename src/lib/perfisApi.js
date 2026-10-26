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
  registroPensamentosAtivo: p.registroPensamentosAtivo,
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

export async function definirRegistroPensamentos(id, ativo) {
  await esperar()
  alterar(id, { registroPensamentosAtivo: ativo })
}

// Liga ou desliga um módulo/protocolo (ver data/modulos.js) para o paciente. Só a Admin.
export async function definirModulo(id, moduloId, ativo) {
  await esperar()
  gravar((db) => {
    const p = db.perfis.find((x) => x.id === id)
    p.modulos = { ...p.modulos, [moduloId]: ativo }
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
