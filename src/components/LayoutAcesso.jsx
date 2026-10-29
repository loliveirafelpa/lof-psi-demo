// Telas de acesso. Abre com a marca da LOF Psi (sem nome de nenhum profissional: esta é a
// versão de demonstração). Celular: faixa petróleo no topo e o conteúdo subindo sobre ela.
// Computador: painel petróleo à esquerda, conteúdo à direita.
import Logo from './Logo'

function Marca() {
  return (
    <div className="flex items-center gap-3">
      <Logo tamanho={44} />
      <p className="font-titulo text-2xl font-bold tracking-tight text-branco">
        LOF <span className="text-verdeAgua">Psi</span>
      </p>
    </div>
  )
}

export default function LayoutAcesso({ titulo, children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr),minmax(0,4fr)]">
      <div className="bg-petroleo px-6 pb-20 pt-10 text-branco lg:flex lg:flex-col lg:justify-between lg:p-14">
        <Marca />
        <div className="mt-9 lg:mt-0">
          <p className="font-interface text-xs font-semibold uppercase tracking-[0.14em] text-nevoa">
            Acompanhamento psicológico entre as sessões
          </p>
          <h1 className="mt-3 max-w-md font-titulo text-[2.1rem] leading-tight text-branco lg:text-5xl">{titulo}</h1>
        </div>
        <p className="mt-6 hidden max-w-sm text-lg text-nevoa lg:block">
          O paciente registra como está em menos de um minuto. A psicóloga chega à sessão com um resumo organizado e
          temas para conversar.
        </p>
      </div>
      <div className="-mt-10 flex justify-center px-4 pb-10 lg:mt-0 lg:items-center lg:bg-papel">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
