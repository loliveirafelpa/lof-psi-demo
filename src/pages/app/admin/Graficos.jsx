// Aba "Gráficos" do painel do paciente: evolução no tempo, padrões e coincidências entre registros,
// e uma série por módulo/protocolo ligado. Tudo descritivo — o rodapé de cada seção lembra isso.
import { BarrasHorizontais, ComparacaoGrupos, GraficoDiario, MapaHumor } from '../../../components/Graficos'
import {
  ansiedadePorSituacao,
  emocoesMaisRegistradas,
  energiaPorMovimento,
  humorPorDiaDaSemana,
  humorPorSono,
  porDia,
  SERIES_MODULOS,
  tendencia,
} from '../../../lib/analises'
import { HUMORES } from '../../../data/checkinOpcoes'
import { MODULOS } from '../../../data/modulos'
import { ESCALAS } from '../../../data/escalas'
import { formatarDia } from '../../../lib/sintese'

const dec = (v) => v.toFixed(1).replace('.', ',')

function Cartao({ titulo, subtitulo, rodape, largo = false, children }) {
  return (
    <section className={`rounded-2xl bg-branco p-5 shadow-sm sm:p-6 ${largo ? 'md:col-span-2' : ''}`}>
      <h3 className="font-interface text-sm font-semibold text-texto">{titulo}</h3>
      {subtitulo && <p className="mt-0.5 text-xs text-textoSecundario">{subtitulo}</p>}
      <div className="mt-4">{children}</div>
      {rodape && <p className="mt-3 text-xs text-textoSecundario">{rodape}</p>}
    </section>
  )
}

function Secao({ titulo, descricao, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl">{titulo}</h2>
        {descricao && <p className="mt-1 text-sm text-textoSecundario">{descricao}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  )
}

const SemDados = () => <p className="text-sm text-textoSecundario">Poucos registros neste período para montar o gráfico.</p>

export default function Graficos({ perfil, dias, checkins, crises, escalas }) {
  if (!checkins.length) return <p className="text-textoSecundario">Nenhum check-in neste período.</p>

  const series = {
    humor: porDia(checkins, (c) => c.humor),
    ansiedade: porDia(checkins, (c) => c.ansiedade),
    sono: porDia(checkins, (c) => c.sonoHoras),
    energia: porDia(checkins, (c) => c.energia),
  }
  const situacoes = ansiedadePorSituacao(checkins)
  const sono = humorPorSono(checkins)
  const movimento = energiaPorMovimento(checkins)
  const semana = humorPorDiaDaSemana(checkins)
  const emocoes = emocoesMaisRegistradas(checkins)
  const modulos = MODULOS.filter((m) => checkins.some((c) => c.modulos?.[m.id]))
  const intensidadeCrises = Object.fromEntries(
    crises.map((c) => [c.ocorridoEm.slice(0, 10), c.intensidade]),
  )

  return (
    <div className="space-y-10">
      <Secao titulo="Evolução no período" descricao="Pontos claros: o registro de cada dia. Linha: média dos últimos 7 dias, para ver a tendência sem a oscilação diária.">
        <Cartao titulo="Humor (1 a 5)" rodape={tendencia(dias, series.humor)}>
          <GraficoDiario dias={dias} valores={series.humor} min={1} max={5} rotuloValor="Humor" />
        </Cartao>
        <Cartao titulo="Ansiedade ou estresse (0 a 10)" rodape={tendencia(dias, series.ansiedade)}>
          <GraficoDiario dias={dias} valores={series.ansiedade} max={10} rotuloValor="Ansiedade" />
        </Cartao>
        <Cartao titulo="Horas de sono" rodape={tendencia(dias, series.sono, 'h')}>
          <GraficoDiario dias={dias} valores={series.sono} max={10} unidade="h" rotuloValor="Sono" />
        </Cartao>
        <Cartao titulo="Energia (1 a 5)" rodape={tendencia(dias, series.energia)}>
          <GraficoDiario dias={dias} valores={series.energia} min={1} max={5} rotuloValor="Energia" />
        </Cartao>
      </Secao>

      <Secao titulo="Padrões">
        <Cartao titulo="Mapa do humor" subtitulo="Cada quadrado é um dia. Quanto mais escuro, melhor o humor registrado.">
          <MapaHumor dias={dias} humorPorDia={series.humor} rotulos={[...HUMORES].reverse().map((h) => h.rotulo)} />
        </Cartao>
        <Cartao titulo="Humor médio por dia da semana" subtitulo="Ajuda a ver rotinas: fins de semana, dias de trabalho, dia da sessão.">
          {semana.length ? <BarrasHorizontais itens={semana} max={5} formatar={(v) => `${dec(v)}/5`} /> : <SemDados />}
        </Cartao>
        <Cartao titulo="Emoções mais presentes" subtitulo="Número de dias em que cada emoção foi a mais marcada.">
          <BarrasHorizontais itens={emocoes} formatar={(v) => String(v)} />
        </Cartao>
      </Secao>

      <Secao
        titulo="O que aparece junto"
        descricao="Coincidências entre registros do mesmo dia. Grupos com poucos dias pedem cautela: não indicam causa e não substituem a avaliação clínica."
      >
        <Cartao titulo="Ansiedade média por situação marcada" subtitulo="Só situações marcadas em 2 dias ou mais.">
          {situacoes.itens.length ? (
            <BarrasHorizontais
              itens={situacoes.itens}
              max={10}
              formatar={(v) => `${dec(v)}/10`}
              referencia={situacoes.geral !== null ? { valor: situacoes.geral, rotulo: `Média geral do período: ${dec(situacoes.geral)}/10` } : null}
            />
          ) : (
            <SemDados />
          )}
        </Cartao>
        <Cartao titulo="Humor do dia conforme o sono da noite anterior" subtitulo="Dias agrupados pela qualidade do sono registrada.">
          {sono.length ? <BarrasHorizontais itens={sono} max={5} formatar={(v) => `${dec(v)}/5`} /> : <SemDados />}
        </Cartao>
        {movimento && (
          <Cartao titulo="Energia média com e sem movimento">
            <ComparacaoGrupos grupos={movimento} max={5} formatar={(v) => `${dec(v)}/5`} />
          </Cartao>
        )}
      </Secao>

      {(modulos.length > 0 || escalas.length > 0 || crises.length > 0) && (
        <Secao titulo="Protocolos e hábitos">
          {modulos.map((m) => {
            const s = SERIES_MODULOS[m.id]
            const valores = porDia(
              checkins.filter((c) => c.modulos?.[m.id]),
              (c) => s.ler(c.modulos[m.id]),
            )
            return (
              <Cartao key={m.id} titulo={`${m.nome} · ${s.titulo}`} rodape={s.tipo === 'linha' ? tendencia(dias, valores, s.unidade ?? '') : null}>
                <GraficoDiario
                  dias={dias}
                  valores={valores}
                  tipo={s.tipo}
                  min={s.min ?? 0}
                  max={s.max}
                  unidade={s.unidade ?? ''}
                  referencia={s.referencia}
                  rotuloValor={s.rotuloValor}
                />
              </Cartao>
            )
          })}
          {(perfil.modulos.crise || crises.length > 0) && (
            <Cartao titulo="Crises registradas · intensidade (0–10)" subtitulo={`${crises.length} ${crises.length === 1 ? 'crise' : 'crises'} no período.`}>
              <GraficoDiario dias={dias} valores={intensidadeCrises} tipo="colunas" max={10} rotuloValor="Intensidade" />
            </Cartao>
          )}
          {escalas.map(({ escala, historico }) => {
            const ordem = [...historico].reverse()
            return (
              <Cartao key={escala.id} titulo={`${escala.nome} · todas as aplicações`} rodape={escala.referencia}>
                <BarrasHorizontais
                  itens={ordem.map((h) => ({
                    rotulo: formatarDia(h.data, { day: '2-digit', month: '2-digit', year: '2-digit' }),
                    valor: h.total,
                    detalhe: `${h.total} de ${ESCALAS[escala.id].maximo} pontos`,
                  }))}
                  max={escala.maximo}
                  formatar={(v) => `${v}/${escala.maximo}`}
                  referencia={{ valor: escala.corte, rotulo: `Ponto de corte de referência: ${escala.corte}` }}
                />
              </Cartao>
            )
          })}
        </Secao>
      )}

      <p className="border-t border-borda pt-4 text-xs italic text-textoSecundario">
        Os gráficos mostram só o que o paciente registrou. Coincidências entre dias não indicam causa e não substituem a avaliação clínica. Os mesmos dados, dia a dia, estão nas abas “Linha do tempo” e “Protocolos e hábitos”.
      </p>
    </div>
  )
}
