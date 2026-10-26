// Aba "Protocolos e hábitos" do painel do paciente: liga/desliga módulos, mostra os questionários
// (com o ponto de corte de referência, sem diagnóstico), as crises registradas e as respostas dia a dia.
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { definirModulo } from '../../../lib/perfisApi'
import { formatarDia } from '../../../lib/sintese'
import { CRISE_DURACAO, CRISE_ESTRATEGIAS, CRISE_LUGAR, CRISE_SINTOMAS, GRUPOS, MODULOS, textoResposta } from '../../../data/modulos'

const rotuloDe = (lista, v) => lista.find((o) => o.valor === v)?.rotulo ?? v
const dataCurta = (iso) => formatarDia(iso, { day: '2-digit', month: '2-digit', year: '2-digit' })

function Interruptor({ ligado, onChange, disabled, rotulo }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={disabled}
      onClick={() => onChange(!ligado)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${ligado ? 'bg-petroleo' : 'bg-borda'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-branco shadow transition-all ${ligado ? 'left-[1.375rem]' : 'left-0.5'}`} />
    </button>
  )
}

export function ModulosDoPaciente({ perfil, onAlterado }) {
  const [salvando, setSalvando] = useState(null)
  const [erro, setErro] = useState('')

  async function alternar(m, ativo) {
    setSalvando(m.id)
    setErro('')
    try {
      await definirModulo(perfil.id, m.id, ativo)
      onAlterado({ ...perfil.modulos, [m.id]: ativo })
    } catch {
      setErro('Não foi possível alterar agora.')
    } finally {
      setSalvando(null)
    }
  }

  return (
    <section className="rounded-2xl bg-branco p-6 shadow-sm">
      <h2 className="text-2xl">Módulos e protocolos</h2>
      <p className="mt-1 text-sm text-textoSecundario">
        Ligue o que fizer sentido para o momento do paciente. Cada um acrescenta poucas perguntas ao check-in e aparece no resumo.
        Desligar não apaga o que já foi registrado.
      </p>
      {erro && <p className="mt-2 text-sm text-alerta">{erro}</p>}
      {GRUPOS.map((g) => (
        <div key={g.id} className="mt-5">
          <p className="font-interface text-[11px] font-semibold uppercase tracking-wider text-petroleo">{g.rotulo}</p>
          <ul className="mt-2 divide-y divide-borda">
            {MODULOS.filter((m) => m.grupo === g.id).map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-interface text-sm font-semibold text-texto">{m.nome}</p>
                  <p className="mt-0.5 text-sm text-textoSecundario">{m.resumo}</p>
                  {m.publico && <p className="mt-1 text-xs text-atencao">{m.publico}</p>}
                </div>
                <Interruptor
                  rotulo={m.nome}
                  ligado={Boolean(perfil.modulos[m.id])}
                  disabled={salvando === m.id}
                  onChange={(ativo) => alternar(m, ativo)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

// Questionários: último resultado, o anterior e o histórico, com a referência do instrumento.
function Questionarios({ escalas }) {
  if (!escalas.length) return null
  return (
    <section className="rounded-2xl bg-branco p-6 shadow-sm">
      <h2 className="text-2xl">Questionários</h2>
      <p className="mt-1 text-sm text-textoSecundario">Instrumentos de rastreio respondidos pelo paciente. A pontuação não é diagnóstico e o paciente não a vê.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {escalas.map(({ escala, ultimo, anterior, historico }) => {
          const acima = ultimo.total >= escala.corte
          const risco = escala.itemRisco !== undefined && ultimo.respostas[escala.itemRisco] > 0
          return (
            <div key={escala.id} className="rounded-xl border border-borda p-4">
              <p className="font-interface text-[11px] font-semibold uppercase tracking-wider text-petroleo">{escala.nome}</p>
              <p className="mt-2 font-titulo text-3xl leading-none text-petroleo">
                {ultimo.total}
                <span className="ml-0.5 font-corpo text-sm text-textoSecundario">/{escala.maximo}</span>
              </p>
              <p className="mt-1 text-xs text-textoSecundario">
                em {dataCurta(ultimo.data)}
                {anterior && ` · anterior: ${anterior.total} em ${dataCurta(anterior.data)}`}
              </p>
              {acima && <p className="mt-2 rounded-lg bg-atencaoFundo px-2.5 py-1.5 text-xs text-atencao">Na faixa a partir do ponto de corte de referência ({escala.corte}).</p>}
              {risco && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-alertaFundo px-2.5 py-1.5 text-xs text-alerta">
                  <AlertTriangle size={13} className="mt-px shrink-0" aria-hidden /> Item sobre pensar em se machucar marcado.
                </p>
              )}
              <p className="mt-2 text-xs text-textoSecundario">{escala.referencia}</p>
              {historico.length > 1 && (
                <div className="mt-3 flex items-end gap-1.5" aria-label="Histórico de pontuações">
                  {[...historico].reverse().map((h) => (
                    <div key={h.id} className="flex flex-1 flex-col items-center gap-1">
                      <span className="font-interface text-[10px] font-semibold text-petroleo">{h.total}</span>
                      <span
                        className={`w-full rounded-t ${h.total >= escala.corte ? 'bg-atencao/70' : 'bg-verdeAgua'}`}
                        style={{ height: `${Math.max(4, (h.total / escala.maximo) * 56)}px` }}
                      />
                      <span className="text-[10px] text-textoSecundario">{formatarDia(h.data, { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Crises({ crises }) {
  return (
    <section className="rounded-2xl bg-branco p-6 shadow-sm">
      <h2 className="text-2xl">Crises registradas</h2>
      {!crises.length ? (
        <p className="mt-2 text-textoSecundario">Nenhuma crise registrada neste período.</p>
      ) : (
        <ul className="mt-4 divide-y divide-borda">
          {crises.map((c) => (
            <li key={c.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[10rem,1fr] sm:gap-6">
              <div>
                <p className="font-interface text-xs font-semibold capitalize text-petroleo">
                  {new Date(c.ocorridoEm).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="font-titulo text-2xl text-petroleo">
                  {c.intensidade}
                  <span className="text-sm text-textoSecundario">/10</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <p>
                  {[c.duracao && rotuloDe(CRISE_DURACAO, c.duracao), c.lugar && rotuloDe(CRISE_LUGAR, c.lugar)].filter(Boolean).join(' · ')}
                </p>
                {c.sintomas.length > 0 && <p className="text-textoSecundario">Sentiu: {c.sintomas.map((s) => rotuloDe(CRISE_SINTOMAS, s).toLowerCase()).join(', ')}</p>}
                {c.estrategias.length > 0 && <p className="text-textoSecundario">Fez: {c.estrategias.map((s) => rotuloDe(CRISE_ESTRATEGIAS, s).toLowerCase()).join(', ')}</p>}
                {c.ajudou && <p className="italic">“{c.ajudou}”</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Respostas de um módulo dia a dia: uma linha por dia, uma coluna por pergunta.
function TabelaModulo({ modulo, dias, checkins }) {
  const porDia = Object.fromEntries(checkins.map((c) => [c.data, c.modulos?.[modulo.id]]))
  const comResposta = [...dias].reverse().filter((d) => porDia[d])
  return (
    <section className="space-y-3">
      <h2 className="text-2xl">{modulo.nome}</h2>
      {!comResposta.length ? (
        <p className="text-textoSecundario">Sem respostas neste período.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-branco shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-petroleo font-interface text-[11px] uppercase tracking-wider text-nevoa">
              <tr>
                <th className="px-4 py-3">Dia</th>
                {modulo.perguntas.map((p) => (
                  <th key={p.id} className="px-4 py-3">{p.curto}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comResposta.map((dia) => (
                <tr key={dia} className="border-b border-borda last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-interface text-xs font-semibold capitalize">{formatarDia(dia)}</td>
                  {modulo.perguntas.map((p) => (
                    <td key={p.id} className="px-4 py-3">{textoResposta(p, porDia[dia][p.id]) ?? <span className="text-textoSecundario">—</span>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function Protocolos({ perfil, onModulosAlterados, dias, checkins, crises, escalas }) {
  const visiveis = MODULOS.filter((m) => perfil.modulos[m.id] || checkins.some((c) => c.modulos?.[m.id]))
  return (
    <div className="space-y-8">
      <ModulosDoPaciente perfil={perfil} onAlterado={onModulosAlterados} />
      <Questionarios escalas={escalas} />
      {(perfil.modulos.crise || crises.length > 0) && <Crises crises={crises} />}
      {visiveis.map((m) => (
        <TabelaModulo key={m.id} modulo={m} dias={dias} checkins={checkins} />
      ))}
    </div>
  )
}
