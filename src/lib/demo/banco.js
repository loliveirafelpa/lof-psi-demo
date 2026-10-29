// "Banco" da demonstração: um objeto guardado no navegador (localStorage) de quem está testando.
// Nada sai do computador. As funções dos arquivos xxxApi.js leem e gravam aqui;
// quando o Supabase entrar, só o corpo dessas funções muda — as telas continuam iguais.
import { gerarSemente } from './semente'
import { hojeLocal } from '../datas'

const CHAVE = 'lof-psi-demo-v5'
let memoria = null

// Várias abas abertas (ex.: a psicóloga numa, o paciente noutra): quando outra aba grava,
// esta descarta a cópia em memória e avisa as telas, para não mostrar nem regravar dados velhos.
export const EVENTO_DADOS_ALTERADOS = 'lof-psi-demo-dados-alterados'
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== CHAVE) return
    memoria = null
    window.dispatchEvent(new Event(EVENTO_DADOS_ALTERADOS))
  })
}

function carregar() {
  if (memoria) return memoria
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo) memoria = JSON.parse(salvo)
  } catch {
    // navegador sem armazenamento (aba anônima, bloqueio): segue só em memória
  }
  // Em outro dia, os dados de exemplo são gerados de novo: quem volta à demonstração sempre encontra
  // registros até ontem (o que foi testado no dia anterior é descartado).
  if (!memoria || memoria.geradoEm !== hojeLocal()) restaurarDemonstracao()
  return memoria
}

function persistir() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(memoria))
  } catch {
    // idem: sem armazenamento, os dados duram até recarregar a página
  }
}

// Leitura: devolve uma cópia, para nenhuma tela alterar o banco sem passar por `gravar`.
export function ler(tabela) {
  return structuredClone(carregar()[tabela])
}

export function gravar(alterar) {
  alterar(carregar())
  persistir()
}

export function restaurarDemonstracao() {
  memoria = { ...gerarSemente(), geradoEm: hojeLocal() }
  persistir()
}

export const novoId = () => crypto.randomUUID()
export const agora = () => new Date().toISOString()

// Simula a ida e volta da rede, para as telas continuarem lidando com "carregando".
export const esperar = () => new Promise((r) => setTimeout(r, 120))
