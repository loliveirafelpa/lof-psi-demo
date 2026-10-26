import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ChevronRight, ClipboardList, UserRound } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { listarPerfisDemonstracao } from '../lib/perfisApi'
import { MODULOS } from '../data/modulos'
import LayoutAcesso from '../components/LayoutAcesso'
import { Destaque } from '../components/Pagina'

// DEMONSTRAÇÃO: em vez de e-mail e senha, quem testa escolhe com qual perfil entrar.
// Na versão real, volta o formulário de e-mail e senha.
const NOTAS = {
  'p-ana': 'Cadastrada ontem · primeiro acesso (consentimento)',
  'p-beatriz': 'Acompanhamento encerrado',
}

function notaDoPaciente(p) {
  if (NOTAS[p.id]) return NOTAS[p.id]
  const ligados = MODULOS.filter((m) => p.modulos[m.id]).map((m) => m.nome)
  return ligados.length ? ligados.join(' · ') : 'Só o check-in básico'
}

function Opcao({ onClick, icone, titulo, nota, destaque = false }) {
  const Icone = icone
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors hover:border-petroleo ${
        destaque ? 'border-petroleo/40 bg-nevoa' : 'border-borda bg-branco'
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-petroleo text-verdeAgua">
        <Icone size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-interface text-sm font-semibold text-texto">{titulo}</span>
        {nota && <span className="block text-xs text-textoSecundario">{nota}</span>}
      </span>
      <ChevronRight size={18} className="shrink-0 text-textoSecundario" aria-hidden />
    </button>
  )
}

export default function Login() {
  const { sessao, entrarComo } = useAuth()
  const [perfis, setPerfis] = useState([])

  useEffect(() => {
    listarPerfisDemonstracao().then(setPerfis)
  }, [])

  if (sessao) return <Navigate to="/app" replace />

  const psicologa = perfis.find((p) => p.role === 'admin')
  const pacientes = perfis.filter((p) => p.role === 'paciente')

  return (
    <LayoutAcesso
      titulo={
        <>
          Seu espaço
          <br />
          <Destaque>entre as sessões</Destaque>
        </>
      }
    >
      <div className="space-y-5 rounded-3xl bg-branco p-6 shadow-cartao sm:p-7">
        <div>
          <h2 className="text-2xl">Conheça por dentro</h2>
          <p className="mt-1 text-sm text-textoSecundario">Escolha um perfil para navegar. Todos os dados são fictícios.</p>
        </div>

        {psicologa && (
          <div>
            <p className="mb-2 font-interface text-[11px] font-semibold uppercase tracking-[0.16em] text-petroleo">Visão da psicóloga</p>
            <Opcao
              onClick={() => entrarComo(psicologa.id)}
              icone={ClipboardList}
              titulo="Entrar como psicóloga"
              nota="Pacientes, resumo para a sessão, protocolos e anotações"
              destaque
            />
          </div>
        )}

        <div>
          <p className="mb-2 font-interface text-[11px] font-semibold uppercase tracking-[0.16em] text-petroleo">App do paciente</p>
          <div className="space-y-2">
            {pacientes.map((p) => (
              <Opcao key={p.id} onClick={() => entrarComo(p.id)} icone={UserRound} titulo={p.nome} nota={notaDoPaciente(p)} />
            ))}
          </div>
        </div>
      </div>
    </LayoutAcesso>
  )
}
