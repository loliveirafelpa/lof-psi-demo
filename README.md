# LOF Psi · Demonstração

Versão de demonstração do app de acompanhamento entre sessões de psicoterapia, para apresentar a outras psicólogas. Nasceu de uma cópia do app da Bruna Sartori (`../Bruna Sartori`), **sem nome nem logo de nenhum profissional** e **sem Supabase**. A identidade visual é a da LOF. Visão de negócio em [`docs/visao-do-produto.md`](docs/visao-do-produto.md). As perguntas de cada módulo e protocolo estão em [`docs/protocolos.md`](docs/protocolos.md).

## Stack
React 18 + Vite 6 + Tailwind 3 · react-router-dom 6 · lucide-react · Vercel. Sem banco: os dados ficam no navegador de quem testa.

## Rodar localmente
```bash
npm install
npm run dev -- --port 5190
```
Não precisa de `.env`. Se a porta 5190 estiver ocupada por um servidor antigo, use outra (ex.: `--port 5192`); cada endereço tem os próprios dados no navegador.

Em `/entrar`, escolha um perfil: a psicóloga ou um dos pacientes de exemplo. A faixa escura do topo tem **Trocar perfil** e **Restaurar dados**, que volta tudo ao ponto de partida. Os dados fictícios são gerados de novo a cada dia, sempre até ontem; o check-in de hoje fica livre para quem estiver testando. **Depois de mudar `semente.js`, use "Restaurar dados"** para ver os exemplos novos.

Verificação: `npx eslint src` (0 erros; 2 avisos conhecidos de react-refresh em `AnotacoesTopico.jsx` e `AuthContext.jsx`) e `npx vite build`.

## Como funciona a demonstração
- `src/lib/demo/semente.js` gera cerca de 45 dias de registros fictícios para 7 pacientes, cada um mostrando um conjunto de módulos:
  - **Marina:** puerpério, com EPDS a cada 2 semanas (a aplicação de 12/10 tem o item 10 marcado, para mostrar o alerta). Em alguns dias ela conta o que fez no tempo para si.
  - **Rafael:** crises de ansiedade e álcool, com GAD-7 (a cada 2 semanas; peça pela aba Protocolos para ver a janela no Início dele). Tem diário clínico e anotações espalhadas por 6 semanas, para mostrar a aba Anotações clínicas.
  - **Juliana:** tabagismo em redução, sem fumar nos últimos dias, e esgotamento no trabalho.
  - **Pedro (14 anos):** bullying.
  - **Carlos:** luto e insônia (diário do sono).
  - **Ana:** cadastrada ontem, ainda sem consentimento. Módulo de álcool ligado (só as perguntas extras no check-in).
  - **Beatriz:** acompanhamento encerrado.
- `src/lib/demo/banco.js` guarda tudo no `localStorage` (chave `lof-psi-demo-v5`). Com várias abas abertas, quando uma grava, as outras descartam a cópia em memória e se atualizam (evento `EVENTO_DADOS_ALTERADOS`): dá para pedir um questionário na aba da psicóloga e vê-lo aparecer na aba do paciente, e vice-versa.
- `src/lib/AuthContext.jsx` troca login e senha pela escolha de perfil, guardada **por aba** (`sessionStorage`, chave `lof-psi-demo-sessao`): a psicóloga numa aba e um paciente noutra.
- As telas só falam com os arquivos `src/lib/xxxApi.js` (funções assíncronas). Cada um tem no topo a tabela e o RLS previstos para a versão com Supabase.

## Organização
- `src/theme.js`: cores e fontes da LOF (petróleo `#0F5E63`, menta `#3CC4A0`, Plus Jakarta Sans + Inter). Os nomes de token vieram do app da Bruna (`petroleo`, `verdeAgua`…) para não mexer em todas as telas.
- `src/data/modulos.js`: **catálogo dos módulos e protocolos**. Cada módulo declara:
  - as perguntas do check-in (tipos `simnao`, `unica`, `multipla`, `escala`, `hora` e `texto`, este sempre opcional);
  - as condições para cada pergunta aparecer (`quando`, ex.: "o que você fez" só aparece com "tempo para si = sim");
  - o rótulo curto das tabelas;
  - o questionário ligado a ele (`escala`).

  Para criar um protocolo novo, basta acrescentar um item aqui e uma função em `sinteseModulos.js`. `escalasLigadas(perfil)` diz quais questionários estão ligados.
- `src/data/escalas.js`: questionários (EPDS, GAD-7), com a pontuação de cada opção, o ponto de corte de referência e a frequência sugerida (`intervaloDias`). Cada questionário é **opcional dentro do seu módulo**:
  - a configuração fica em `perfil.escalas[id] = { frequencia: 'unica' | 14 | 30, ativadaEm, pedidoEm }`;
  - `escalaPendente` decide quando ele aparece no Início do paciente: logo ao ser ligado, quando a psicóloga usa "Pedir agora" ou, na frequência periódica, quando passa o intervalo;
  - `proximaAplicacao` calcula a próxima data;
  - quando há questionário pendente, o Início abre uma janela (`AvisoQuestionario.jsx`). "Responder mais tarde" fecha só por hoje: o adiamento fica em `adiamentos` (`{ userId, tipo, dia }`) e no dia seguinte a janela volta, até o paciente responder.
- `src/data/consulta.js`: horário fixo da consulta, guardado na ficha (`ficha.consulta = { diaSemana: 0–6, hora: 'HH:MM', frequencia: 'semanal' | 'quinzenal', referencia }`; no quinzenal, `referencia` é a data de uma sessão, para saber em quais semanas ela cai). `proximaConsulta` calcula a próxima data e hora: a sessão de hoje conta como "a próxima" até 50 min depois do horário. `rotuloConsulta` ("Terças-feiras, às 9h00 · semanal") e `rotuloProxima` ("hoje, às 15h00", "amanhã…", "ter., 03/11…"). Os campos do formulário ficam em `components/CamposConsulta.jsx`, usado no cadastro e na ficha. No app real, coluna `consulta jsonb` em `fichas_pacientes` (RLS só-Admin, como o resto da ficha).
- `src/lib/sintese.js`: síntese do check-in básico. `src/lib/sinteseModulos.js`: síntese de cada módulo, alertas (item de risco da EPDS, ameaça ou agressão na escola, pensamentos intrusivos frequentes) e resumo dos questionários. Tudo por regras fixas, sem IA, só descritivo.
- `src/lib/analises.js`: cálculos dos gráficos (`resumoSerie` = média e tendência; `distribuicaoHumor`; `SERIES_MODULOS`, a série de cada módulo).
- `src/lib/protocolosApi.js`: questionários, crises registradas e adiamentos do aviso de questionário (`listarAdiadosHoje`, `adiarQuestionarios`; no app real, tabela `questionarios_adiados` com RLS do próprio paciente). `src/lib/objetivosApi.js`: objetivos terapêuticos e objetivo da semana (só a psicóloga grava) e `listaDeObjetivos` (um por linha, numerados na tela). `src/lib/comentariosApi.js`: anotações da psicóloga nos tópicos, com a origem.
- Componentes:
  - `BotaoAcao.jsx`: a ação pequena dos cartões (Editar, Adicionar, Novo, Anotar), sempre com a mesma altura, ícone e alinhamento;
  - `AnotacoesTopico.jsx`: o "Anotar" de cada tópico (`useComentarios`, `Comentarios`, `FormComentario`);
  - `Graficos.jsx`: gráficos em SVG próprio, sem biblioteca;
  - `PerguntasModulo.jsx`: as perguntas de um módulo no check-in;
  - `Sequencia.jsx`: dias seguidos de check-in (`embutida` = dentro do cartão do check-in);
  - `Respiracao.jsx`: respiração guiada (4 s inspira, 2 s segura, 6 s solta).
- Telas do paciente em `src/pages/app/`: `Crise.jsx` ("Estou em crise agora" + registro da crise), `Questionario.jsx` (questionário ligado pela psicóloga).
- Abas da psicóloga em `src/pages/app/admin/`: `Paciente.jsx` (cabeçalho, período e abas), `ResumoPaciente.jsx`, `Graficos.jsx`, `Detalhamento.jsx`, `Protocolos.jsx`, `AbasRegistros.jsx` (Objetivo da semana e Registro de pensamentos), `AnotacoesClinicas.jsx` + `FichaEObjetivos.jsx`.
- `supabase/`: migrations e Edge Function herdadas do app da Bruna, como ponto de partida para a versão com banco. A demo não usa.

### Padrão visual
- Títulos de bloco `text-xl sm:text-2xl`; títulos das colunas laterais `text-xl`.
- Nenhum texto abaixo de 12 px (`text-xs`), nem rótulos e datas.
- Cartões `rounded-2xl bg-branco p-5 shadow-sm sm:p-6`.
- Ações pequenas sempre com `BotaoAcao`; ações principais com `Botao`.
- No paciente, um assunto por cartão: o que é complemento (sequência de dias, objetivo da semana) fica dentro do cartão principal (`Atalho` com `children`).

## Telas
**Paciente**:
- **Início:**
  - "Check-in de hoje", com a sequência de dias no rodapé do mesmo cartão;
  - "Ansiedade forte agora?" (se o protocolo de crise estiver ligado);
  - os questionários pendentes. Ao entrar, eles também aparecem numa janela com "Responder agora" e "Responder mais tarde"; adiada, a janela volta no dia seguinte e só some quando o paciente responde;
  - "Objetivo da semana", com o objetivo escrito pela psicóloga dentro do cartão;
  - "Registro de pensamentos".
- **Check-in:** blocos básicos + um cartão por módulo ligado. Ao salvar, mostra:
  - os dias sem fumar (tabagismo);
  - o aviso de crise em destaque, se o humor estiver baixo, se houver pensamentos assustadores "muitas vezes" ou se houver ameaça ou agressão na escola.
- **Semana:** o objetivo da semana (só leitura: quem escreve é a psicóloga), a reflexão (avanço percebido, avanços e o que foi mais difícil), as reflexões anteriores e os objetivos na terapia, numerados.
- **Pensamentos:** disponível para todos os pacientes, sem precisar ligar.
- **Também:** Crise, Questionário, Meus dados.

**Psicóloga**:
- **Lista de pacientes:** busca, filtros (Ativos, Precisam de atenção, Encerrados) e ordenação pela **consulta mais próxima** (padrão ao abrir; quem não tem horário fixo vai para o fim), por nome ou sem check-in há mais tempo. Cada linha: o nome, a semana de check-ins em 7 pontos (cheio = fez check-in; o último é hoje) e as etiquetas, se houver. À direita, alinhada como uma agenda, a coluna "Consulta" (dia em cima, horário embaixo; a de hoje em destaque). Em Encerrados, a coluna mostra a data do encerramento.
  - **Precisam de atenção** (só pacientes ativos, últimos 7 dias). Sinais clínicos, em vermelho e primeiro na lista: 2 ou mais crises registradas (`CRISES_PARA_ATENCAO`), item de risco da EPDS marcado, pensamentos assustadores "muitas vezes" (puerpério), ameaça ou agressão na escola (bullying). São as mesmas regras do "Para conferir com atenção" do Resumo (`sinaisClinicos` em `sinteseModulos.js`), mais as crises. Avisos administrativos, em cinza: sem consentimento vigente, pediu encerramento, sem check-in na semana.
- **Novo paciente:** dados de contato, dia e horário da consulta (semanal ou quinzenal), histórico, objetivos e módulos. Nos módulos que têm questionário, ela escolhe se já liga a escala.
- **Página do paciente:**
  - Período: 7, 14 ou 30 dias, ou "Escolher data": "Um dia" (abre em hoje, com um campo só) ou "Intervalo" (de/até).
  - Abas: Resumo, Gráficos, Detalhamento, Protocolos, Objetivo da semana, Registro de pensamentos e Anotações clínicas.
  - A barra de abas fica presa no topo ao rolar. No celular ela rola de lado.
- **Resumo:**
  - "Para conferir com atenção";
  - os números do período e o último resultado de cada questionário, no mesmo formato;
  - a síntese;
  - os possíveis temas para a sessão.
- **Gráficos**, em quatro seções:
  - evolução de humor, ansiedade, sono e energia: a linha liga os valores reais de cada dia e o tracejado marca a média do período; acima, a média e a tendência (média da 1ª metade dos registros × 2ª metade; diferença menor que 8% da escala = estável);
  - padrões: "Como foram os dias", humor por dia da semana e emoções mais marcadas;
  - o que aparece junto: ansiedade por situação, humor depois de uma noite ruim × nos outros dias (aparece com 3 dias ou mais em cada grupo) e energia com e sem movimento, sempre com o número de dias de cada grupo;
  - protocolos e hábitos: uma série por módulo ligado, crises e o histórico de cada questionário com o ponto de corte.
- **Detalhamento:** tudo o que foi respondido, na íntegra:
  - o check-in dia a dia;
  - uma tabela por módulo, dia a dia;
  - os questionários com todas as aplicações. "Ver respostas item a item" mostra cada pergunta, a resposta marcada, os pontos, a comparação com a aplicação anterior e o item de risco em destaque.
- **Protocolos:** os interruptores dos módulos e, dentro de cada módulo com questionário, a opção "Aplicar …", com a frequência, o "Pedir agora" e a situação ("Última resposta em … · a próxima aparece a partir de …"). Também as crises registradas.
- **Objetivo da semana:**
  - no topo, o objetivo desta semana, que a psicóloga escreve ou edita ali mesmo;
  - abaixo, semana a semana, o objetivo combinado e a reflexão do paciente, incluindo as semanas sem reflexão.
- **Registro de pensamentos:** situação, pensamento, emoção e comportamento.
- **Anotações clínicas** (só a psicóloga vê), em duas sub-abas:
  - **Diário:** um cartão só, com "Escrever no diário clínico", busca (sem diferença de acento) e filtro por origem no topo. Abaixo, a linha do tempo: o diário clínico e as anotações do Resumo e dos Gráficos, com a data na margem (dia e dia da semana) e a origem numa etiqueta (ponto cheio = diário; vazado = Resumo/Gráficos). Agrupada por mês, só o mais recente aberto. No computador, editar e apagar aparecem ao passar o mouse;
  - **Ficha e tratamento:** em grade, os objetivos terapêuticos (numerados) e as medicações à esquerda; os combinados e a ficha à direita. A ficha mostra o dia e horário da consulta e a próxima sessão, editáveis em "Editar";
  - no fim da página: encerrar ou reabrir o acompanhamento.
- O "Anotar" aparece em cada frase do Resumo, nos temas e em cada gráfico. Cada anotação guarda a origem (ex.: "Gráficos · Humor (1 a 5)").

## Situação e próximos passos (29/10/2026)
- **Primeira versão:** a demo completa, com módulos, protocolos, questionários e a aba Gráficos (até `a8cff90`).
- **Rodada de revisão (27 a 29/10):**
  - período livre ("Escolher data");
  - gráficos com valores reais, média e tendência;
  - "Anotar" em todos os gráficos e a nova aba Anotações clínicas, que absorveu a "Ficha e objetivos";
  - aba Detalhamento, que substituiu a "Linha do tempo";
  - questionários opcionais com frequência e "Pedir agora", com respostas item a item;
  - puerpério com "o que você fez";
  - objetivo da semana só pela psicóloga;
  - registro de pensamentos para todos;
  - sequência de dias dentro do cartão do check-in;
  - revisão visual de todas as abas;
  - (28/10) janela de questionário pendente no Início do paciente, com "Responder mais tarde" que vale só até o dia seguinte;
  - (28/10) sessão por aba e sincronização entre abas: o pedido feito na aba da psicóloga aparece na aba do paciente sem recarregar;
  - (28/10) AUDIT-C retirado: o módulo de álcool fica só com as perguntas extras no check-in. A chave do `localStorage` passou para `v2`, então os dados da demo recomeçam;
  - (28/10) tabagismo sem a pergunta "O que você usou?" e com "Outro" em "Em que momentos?", que abre um campo para escrever qual;
  - (28/10) Teste de Fagerström retirado: o tabagismo fica só com as perguntas do check-in. Chave do `localStorage` em `v3`;
  - (29/10) gráfico de sono e humor refeito: "Humor depois de uma noite ruim", com frase e duas barras;
  - (29/10) luto com "Outro" em "Algum momento foi mais difícil?", que abre um campo para escrever qual, e "O que você fez?" quando marca que fez algo para lembrar a pessoa;
  - (29/10) Anotações clínicas reorganizada em duas sub-abas: "Diário" (linha do tempo num cartão só) e "Ficha e tratamento" (grade), com os cartões alinhados em linhas;
  - (29/10) "Escolher data" com a opção "Um dia", para ver um dia específico;
  - (29/10) dia e horário da consulta (semanal ou quinzenal) no cadastro e na ficha, e a ordenação "Consulta mais próxima" na lista de pacientes;
  - (29/10) "Precisam de atenção" com sinais clínicos (crises seguidas, item de risco da EPDS, pensamentos assustadores, ameaça na escola), separados dos avisos administrativos. Chave do `localStorage` em `v5`;
  - (29/10) lista de pacientes reorganizada: semana de check-ins em pontos e a coluna "Consulta" alinhada à direita.
- **Decisões em aberto:**
  - mover "Crises registradas" de Protocolos para Detalhamento?
  - numerar também os objetivos no Início do paciente?
  - no menu do paciente, trocar "Semana" por "Objetivo da semana"?
- **Falta publicar:**
  1. Criar no GitHub o repositório vazio e privado `lof-psi-demo`.
  2. Enviar o código: `git remote add origin https://github.com/loliveirafelpa/lof-psi-demo.git` e depois `git push -u origin main`.
  3. Importar o repositório na Vercel.
- **Depois da validação:**
  - revisar com a Bruna as perguntas de `docs/protocolos.md`;
  - levar ao app dela os módulos e as abas novas (migrations, RLS e testes).

## Para virar produto com banco
Para conectar o Supabase:
1. Reescrever o corpo das funções `xxxApi.js`.
2. Voltar o `AuthContext`, o `Login` e as telas de senha do app da Bruna.
3. Criar as migrations:
   - em `profiles`: coluna jsonb `modulos` e coluna jsonb `escalas` (configuração dos questionários), com gatilho para só a Admin alterar as duas;
   - em `checkins`: coluna jsonb `modulos`;
   - tabelas `questionarios` e `crises`, com RLS `_own` + leitura da Admin;
   - em `comentarios`: coluna `origem`;
   - em `objetivos_semana`: escrita só da Admin;
   - em `reflexoes_semanais`: sem a coluna `objetivo`, porque o objetivo da semana agora é só da psicóloga.
4. Remover `src/lib/demo/` e a `BarraDemonstracao`.
