# LOF Psi · Demonstração

Versão de demonstração do app de acompanhamento entre sessões de psicoterapia, para apresentar a outras psicólogas. Nasceu de uma cópia do app da Bruna Sartori (`../Bruna Sartori`), **sem nome nem logo de nenhum profissional** e **sem Supabase**. A identidade visual é a da LOF. Visão de negócio em [`docs/visao-do-produto.md`](docs/visao-do-produto.md). As perguntas de cada módulo e protocolo estão em [`docs/protocolos.md`](docs/protocolos.md).

## Stack
React 18 + Vite 6 + Tailwind 3 · react-router-dom 6 · lucide-react · Vercel. Sem banco: os dados ficam no navegador de quem testa.

## Rodar localmente
```bash
npm install
npm run dev -- --port 5190
```
Não precisa de `.env`. Em `/entrar`, escolha um perfil: a psicóloga ou um dos pacientes de exemplo. A faixa escura do topo tem **Trocar perfil** e **Restaurar dados**, que volta tudo ao ponto de partida. Os dados fictícios são gerados de novo a cada dia, sempre até ontem; o check-in de hoje fica livre para quem estiver testando.

## Como funciona a demonstração
- `src/lib/demo/semente.js` gera cerca de 45 dias de registros fictícios para 7 pacientes, cada um mostrando um conjunto de módulos:
  - Marina: puerpério, com EPDS (uma delas com o item 10 marcado, para mostrar o alerta).
  - Rafael: crises de ansiedade e álcool, com GAD-7 e AUDIT-C (o AUDIT-C fica pendente no Início dele).
  - Juliana: tabagismo em redução, sem fumar nos últimos dias, e esgotamento no trabalho.
  - Pedro (14 anos): bullying.
  - Carlos: luto e insônia (diário do sono).
  - Ana: cadastrada ontem, ainda sem consentimento.
  - Beatriz: acompanhamento encerrado.
- `src/lib/demo/banco.js` guarda tudo no `localStorage` (chave `lof-psi-demo-v1`).
- `src/lib/AuthContext.jsx` troca login e senha pela escolha de perfil (chave `lof-psi-demo-sessao`).
- As telas só falam com os arquivos `src/lib/xxxApi.js` (funções assíncronas). Cada um tem no topo a tabela e o RLS previstos para a versão com Supabase.

## Organização
- `src/theme.js`: cores e fontes da LOF (petróleo `#0F5E63`, menta `#3CC4A0`, Plus Jakarta Sans + Inter). Os nomes de token vieram do app da Bruna (`petroleo`, `verdeAgua`…) para não mexer em todas as telas.
- `src/data/modulos.js`: **catálogo dos módulos e protocolos**. Cada módulo declara as perguntas do check-in (tipos `simnao`, `unica`, `multipla`, `escala`, `hora`), as condições para cada pergunta aparecer (`quando`), o rótulo curto das tabelas e o questionário periódico ligado a ele. Para criar um protocolo novo, basta acrescentar um item aqui e uma função em `sinteseModulos.js`.
- `src/data/escalas.js`: questionários periódicos (EPDS, GAD-7, AUDIT-C, Fagerström), com a pontuação de cada opção, o ponto de corte de referência e o intervalo entre aplicações.
- `src/lib/sintese.js`: síntese do check-in básico. `src/lib/sinteseModulos.js`: síntese de cada módulo, alertas (item de risco da EPDS, ameaça ou agressão na escola, pensamentos intrusivos frequentes) e resumo dos questionários. Tudo por regras fixas, sem IA, só descritivo.
- `src/lib/protocolosApi.js`: questionários e crises registradas.
- `src/components/PerguntasModulo.jsx`: desenha as perguntas de um módulo no check-in. `Respiracao.jsx`: respiração guiada (4 s inspira, 2 s segura, 6 s solta).
- `src/pages/app/Crise.jsx`: "Estou em crise agora" (respiração + 5-4-3-2-1 + contatos de crise) e o registro da crise. `Questionario.jsx`: questionário periódico.
- `src/pages/app/admin/Protocolos.jsx`: aba "Protocolos e hábitos", com os interruptores dos módulos, os questionários com histórico, as crises e uma tabela dia a dia por módulo.
- `supabase/`: migrations e Edge Function herdadas do app da Bruna, como ponto de partida para a versão com banco. A demo não usa.

## Telas
**Paciente**:
- Início: atalhos para o check-in, a sequência de dias, "Ansiedade forte agora?" (se o protocolo de crise estiver ligado), os questionários pendentes, o combinado da semana, a reflexão e os pensamentos.
- Check-in: blocos básicos + um cartão por módulo ligado. Ao salvar, mostra os dias sem fumar (tabagismo) e o aviso de crise em destaque se o humor estiver baixo, se houver pensamentos assustadores "muitas vezes" ou se houver ameaça ou agressão na escola.
- Também: Semana, Pensamentos, Crise, Questionário, Meus dados.

**Psicóloga**:
- Lista de pacientes e Novo paciente, já com a escolha dos módulos.
- Página do paciente com as abas Resumo, **Gráficos**, Linha do tempo, **Protocolos e hábitos**, Semana, Pensamentos, Ficha e objetivos e Anotações clínicas.
- O Resumo inclui:
  - o bloco "Para conferir com atenção";
  - o último resultado de cada questionário;
  - as frases e os temas de cada módulo, junto com os do check-in básico.
- A aba Gráficos (períodos de 7, 14, 30 e 60 dias) tem quatro seções:
  - evolução de humor, ansiedade, sono e energia, com média móvel de 7 dias;
  - padrões: mapa do humor, humor por dia da semana e emoções mais marcadas;
  - o que aparece junto: ansiedade por situação, humor conforme o sono e energia com e sem movimento, sempre com o número de dias de cada grupo;
  - protocolos e hábitos: uma série por módulo ligado, crises e o histórico de cada questionário com o ponto de corte.
- Os gráficos são SVG próprios (`src/components/Graficos.jsx`), sem biblioteca. Os cálculos ficam em `src/lib/analises.js` e as cores em `theme.js`, validadas para daltonismo.

## Situação e próximos passos (26/10/2026)
- Pronto e com commit: a demo completa, com módulos, protocolos, questionários e a aba Gráficos.
- Falta publicar:
  1. Criar no GitHub o repositório vazio e privado `lof-psi-demo`.
  2. Enviar o código: `git remote add origin https://github.com/loliveirafelpa/lof-psi-demo.git` e depois `git push -u origin main`.
  3. Importar o repositório na Vercel.
- Depois da validação:
  - revisar com a Bruna as perguntas de `docs/protocolos.md`;
  - levar ao app dela os módulos e a aba Gráficos (migrations, RLS e testes).

## Para virar produto com banco
Para conectar o Supabase:
1. Reescrever o corpo das funções `xxxApi.js`.
2. Voltar o `AuthContext`, o `Login` e as telas de senha do app da Bruna.
3. Criar as migrations: coluna jsonb `modulos` em `profiles` e `checkins`; tabelas `questionarios` e `crises` com RLS `_own` + leitura da Admin; gatilho para só a Admin alterar `modulos`.
4. Remover `src/lib/demo/` e a `BarraDemonstracao`.
