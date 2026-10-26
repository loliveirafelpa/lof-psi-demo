# CLAUDE.md — LOF Psi · Demonstração

Demo navegável do app de acompanhamento entre sessões de psicoterapia, para apresentar a outras psicólogas. É uma cópia do app da Bruna Sartori (`../Bruna Sartori`), **sem nome, logo ou CRP de nenhum profissional** e com a identidade da LOF. Contexto de negócio em `docs/visao-do-produto.md`; perguntas dos módulos em `docs/protocolos.md`.

Para decisões maiores, consultar o `playbook-tecnico.md` nesta pasta.

## Inegociáveis
- **Stack fixa:** React 18 + Vite + Tailwind, react-router-dom, lucide-react, Vercel ligado ao GitHub. Sem TypeScript, testes automatizados ou Redux.
- **Ainda sem Supabase.** Os dados vêm de `src/lib/demo/`: `semente.js` gera cerca de 45 dias fictícios relativos a hoje e `banco.js` guarda tudo no localStorage. A entrada é por escolha de perfil, e a `BarraDemonstracao` troca de perfil e restaura os dados.
- As telas **só** falam com `src/lib/xxxApi.js` (funções assíncronas). Cada uma tem no topo a tabela e o RLS previstos. Na hora de conectar o Supabase, só o corpo dessas funções muda (ver README).
- **Nunca** colocar nome, foto, logo ou CRP de profissional real. Dados de exemplo sempre fictícios.
- **Design:** cores e fontes só em `src/theme.js` (identidade LOF). Nunca hex solto em componente.
- **Deploy:** GitHub → Vercel; `vercel.json` com rewrite SPA e cabeçalhos de segurança.

## Princípios do produto
- Linguagem **descritiva, nunca causal**: o app organiza e sugere temas de conversa, não afirma causas nem dá diagnósticos. Questionários mostram pontuação e ponto de corte de referência só para a psicóloga.
- Check-in curto e acolhedor. Cada módulo acrescenta poucas perguntas e algumas só aparecem conforme a resposta anterior.
- O app **não é canal de emergência**: sempre exibir orientação de crise (CVV 188, SAMU 192). Respostas de risco disparam o aviso em destaque e o bloco "Para conferir com atenção" no painel.

## Convenções
- Módulos e protocolos são declarados em `src/data/modulos.js`, questionários em `src/data/escalas.js` e as frases do resumo em `src/lib/sinteseModulos.js`.
- Gráficos da psicóloga:
  - componentes SVG próprios em `src/components/Graficos.jsx`, sem biblioteca;
  - cálculos em `src/lib/analises.js`;
  - a série de cada módulo em `SERIES_MODULOS`;
  - cores `serie1`, `serie2`, `serieSuave`, `grade` e `escala1–5` em `theme.js`, validadas para daltonismo (revalidar se mudar);
  - regras: um eixo por gráfico, comparações sempre com o número de dias de cada grupo, e nunca afirmar causa.
- Telas do paciente usam `Pagina` e `Bloco`. Telas de acesso usam `LayoutAcesso`.
- Ambiente local: `npm run dev -- --port 5190`.
- Commits em português, verbo no imperativo, descrevendo o efeito para quem usa. Sem `feat:`/`fix:`.
- Ao validar uma novidade aqui, levá-la ao app da Bruna com migration, RLS e testes (ver o CLAUDE.md de lá).
