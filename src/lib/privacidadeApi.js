// Direitos do paciente sobre os próprios dados (LGPD, art. 18): acesso/portabilidade,
// eliminação do que ele registrou e pedido de encerramento da conta.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `solicitacoes_privacidade` e exclusões com RLS.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'

// Tabelas com o que o próprio paciente registra (apagáveis por ele).
const REGISTROS_DO_PACIENTE = ['checkins', 'reflexoes', 'pensamentos', 'escalas', 'crises']

const doPaciente = (tabela, userId) => ler(tabela).filter((l) => l.userId === userId)

// Tudo o que o paciente pode ver sobre si, num objeto pronto para virar arquivo.
export async function exportarMeusDados(userId) {
  await esperar()
  const perfil = ler('perfis').find((p) => p.id === userId) ?? null
  return {
    gerado_em: agora(),
    perfil,
    consentimentos: doPaciente('consentimentos', userId),
    checkins: doPaciente('checkins', userId),
    questionarios: doPaciente('escalas', userId),
    crises: doPaciente('crises', userId),
    reflexoes_semanais: doPaciente('reflexoes', userId),
    registros_de_pensamento: doPaciente('pensamentos', userId),
    objetivos_terapeuticos: doPaciente('objetivosTerapeuticos', userId)[0] ?? null,
    combinados_na_sessao: doPaciente('objetivosSemana', userId),
    solicitacoes: doPaciente('solicitacoes', userId),
  }
}

// Apaga o que o próprio paciente registrou. Anotações e ficha da psicóloga não são afetadas.
export async function apagarMeusRegistros(userId) {
  await esperar()
  gravar((db) => {
    for (const tabela of REGISTROS_DO_PACIENTE) db[tabela] = db[tabela].filter((l) => l.userId !== userId)
  })
}

export async function listarMinhasSolicitacoes(userId) {
  await esperar()
  return doPaciente('solicitacoes', userId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

export async function pedirEncerramentoDaConta(userId, mensagem) {
  await esperar()
  const nova = { id: novoId(), userId, tipo: 'encerrar_conta', mensagem: mensagem?.trim() || null, criadoEm: agora(), resolvidoEm: null }
  gravar((db) => db.solicitacoes.push(nova))
  return nova
}

// --- Admin -----------------------------------------------------------------

export async function listarSolicitacoesAbertas() {
  await esperar()
  return ler('solicitacoes')
    .filter((s) => !s.resolvidoEm)
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
}

export async function marcarSolicitacaoResolvida(id) {
  await esperar()
  gravar((db) => {
    db.solicitacoes.find((s) => s.id === id).resolvidoEm = agora()
  })
}

// Pacientes cujo consentimento para dados de saúde não está vigente (revogado ou nunca dado).
export async function listarSemConsentimentoVigente(idsPacientes) {
  await esperar()
  const comConsentimento = new Set(
    ler('consentimentos')
      .filter((c) => c.tipo === 'dado_saude' && !c.revogadoEm)
      .map((c) => c.userId),
  )
  return new Set(idsPacientes.filter((id) => !comConsentimento.has(id)))
}
