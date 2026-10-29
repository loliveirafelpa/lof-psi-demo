import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { buscarMeuPerfil } from './perfisApi'
import { temConsentimentoSaudeVigente } from './consentimentosApi'
import { EVENTO_DADOS_ALTERADOS } from './demo/banco'

// DEMONSTRAÇÃO: não há senha nem Supabase Auth. Quem testa escolhe um perfil na tela de entrada
// e a escolha fica guardada nesta aba (sessionStorage): dá para ter a psicóloga numa aba e um
// paciente noutra. A interface do contexto (sessao, perfil, ehAdmin, consentiu, recarregar, sair)
// é a mesma da versão com Supabase.
const CHAVE_SESSAO = 'lof-psi-demo-sessao'
const AuthContext = createContext(null)

function lerSessaoSalva() {
  try {
    const id = sessionStorage.getItem(CHAVE_SESSAO)
    return id ? { user: { id, user_metadata: {} } } : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessaoSalva)
  const [perfil, setPerfil] = useState(null)
  const [consentiu, setConsentiu] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const carregarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null)
      setConsentiu(false)
      return
    }
    const [p, c] = await Promise.all([buscarMeuPerfil(userId), temConsentimentoSaudeVigente(userId)])
    setPerfil(p)
    setConsentiu(c)
  }, [])

  useEffect(() => {
    carregarPerfil(sessao?.user.id)
      // perfil apagado (ex.: dados restaurados): volta para a escolha de perfil
      .catch(() => sair())
      .finally(() => setCarregando(false))
  }, [sessao, carregarPerfil])

  // Outra aba alterou os dados (ex.: a psicóloga pediu um questionário): atualiza o perfil desta aba.
  useEffect(() => {
    const atualizar = () => carregarPerfil(sessao?.user.id).catch(() => {})
    window.addEventListener(EVENTO_DADOS_ALTERADOS, atualizar)
    return () => window.removeEventListener(EVENTO_DADOS_ALTERADOS, atualizar)
  }, [sessao, carregarPerfil])

  function entrarComo(id) {
    try {
      sessionStorage.setItem(CHAVE_SESSAO, id)
    } catch {
      // sem armazenamento: a escolha vale até recarregar a página
    }
    setCarregando(true)
    setSessao({ user: { id, user_metadata: {} } })
  }

  function sair() {
    try {
      sessionStorage.removeItem(CHAVE_SESSAO)
    } catch {
      // idem
    }
    setSessao(null)
  }

  const valor = {
    sessao,
    usuario: sessao?.user ?? null,
    perfil,
    ehAdmin: perfil?.role === 'admin',
    consentiu,
    carregando,
    recarregar: () => carregarPerfil(sessao?.user.id),
    entrarComo,
    sair,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
