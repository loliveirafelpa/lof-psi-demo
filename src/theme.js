// Identidade visual — a mesma da LOF (site lof): petróleo, menta e grafite.
// Os nomes das cores vieram do projeto de origem e foram mantidos para não mexer em todas as telas:
// "petroleo" é o petróleo da LOF e "verdeAgua" é a menta.
// Único lugar com cores e fontes do projeto: nada de hex solto em componentes.

export const cores = {
  petroleo: '#0F5E63', // cor principal — títulos, botões, cabeçalho
  petroleoEscuro: '#0A4649', // hover de botões e textos de maior peso
  verdeAgua: '#3CC4A0', // menta — destaques e detalhes (não usar como cor de texto sobre claro)
  salvia: '#4C8B6B', // verde de apoio — ícones de seção
  nevoa: '#E6EFEE', // fundo claro esverdeado — cartões e áreas suaves
  papel: '#F3F7F6', // fundo geral das telas
  branco: '#FFFFFF',
  texto: '#1F2A30', // texto principal (grafite)
  textoSecundario: '#4A5A60', // legendas, ajuda, rótulos
  borda: '#D5E0DE',
  alerta: '#B5483F', // avisos de crise e erros — terracota, sem vermelho agressivo
  alertaFundo: '#FBECE8',
  atencao: '#8A5A10', // destaques para a psicóloga conferir (não é diagnóstico)
  atencaoFundo: '#FBF1E1',
}

export const fontes = {
  titulo: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], // títulos, como no site da LOF
  corpo: ['Inter', 'system-ui', 'sans-serif'], // leitura confortável
  interface: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], // botões, menus, rótulos
}
// Sombra dos cartões, tingida de petróleo (em vez de cinza neutro).
export const sombras = {
  cartao: '0 1px 2px rgba(15, 94, 99, 0.06), 0 12px 32px -18px rgba(15, 94, 99, 0.28)',
}

// As fontes são carregadas do Google Fonts no index.html — se trocar aqui, trocar lá também.
