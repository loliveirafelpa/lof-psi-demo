// Consentimentos (LGPD, art. 11): cada aceite com data, hora e versão do texto.
// DEMONSTRAÇÃO: banco do navegador. Com Supabase: tabela `consentimentos`, RLS do próprio paciente.
import { ler, gravar, novoId, agora, esperar } from './demo/banco'
import { VERSAO_TERMOS } from '../data/textosLegais'

const deSaude = (userId) => ler('consentimentos').filter((c) => c.userId === userId && c.tipo === 'dado_saude')

export async function temConsentimentoSaudeVigente(userId) {
  await esperar()
  return deSaude(userId).some((c) => !c.revogadoEm)
}

// Último consentimento de dado de saúde (vigente ou revogado), para mostrar ao paciente.
export async function buscarConsentimentoSaude(userId) {
  await esperar()
  const [ultimo] = deSaude(userId).sort((a, b) => b.aceitoEm.localeCompare(a.aceitoEm))
  return ultimo ? { aceitoEm: ultimo.aceitoEm, revogadoEm: ultimo.revogadoEm } : null
}

// Grava os dois aceites separadamente, cada um com data e hora.
export async function registrarConsentimentos(userId) {
  await esperar()
  const aceitoEm = agora()
  gravar((db) => {
    db.consentimentos.push(
      { id: novoId(), userId, tipo: 'termos_de_uso', versao: VERSAO_TERMOS, aceitoEm, revogadoEm: null },
      { id: novoId(), userId, tipo: 'dado_saude', versao: VERSAO_TERMOS, aceitoEm, revogadoEm: null },
    )
  })
}

export async function revogarConsentimentoSaude(userId) {
  await esperar()
  gravar((db) => {
    for (const c of db.consentimentos) {
      if (c.userId === userId && c.tipo === 'dado_saude' && !c.revogadoEm) c.revogadoEm = agora()
    }
  })
}
