# Visão do produto — LOF Psi (demonstração)

*Documento de negócio, não técnico.*

## O que é
Uma demonstração navegável do aplicativo de acompanhamento entre sessões que a LOF desenvolveu para a psicóloga Bruna Sartori. Serve para apresentar o produto a outras psicólogas. Não tem nome nem logo de nenhum profissional, e todos os pacientes e registros são fictícios.

## Como apresentar
1. Abrir o link e escolher **"Entrar como psicóloga"**.
2. Mostrar a lista de pacientes.
3. Abrir a **Marina** (puerpério). O Resumo mostra:
   - os pontos para conferir com atenção;
   - os números do período e o último resultado da escala de Edimburgo;
   - a síntese descritiva;
   - os temas para a sessão.

   Na aba **Detalhamento**, as respostas do puerpério dia a dia (inclusive o que ela fez no tempo para si) e a Edimburgo **item a item**. A aplicação de 12/10 tem o item 10 em destaque.
4. Abrir o **Rafael** na aba **Gráficos**, com o período de 30 dias: a evolução do humor e da ansiedade (com média e tendência), quantos dias com cada humor e o que aparece junto (ansiedade por situação, energia com e sem movimento). Anotar um insight em um gráfico e mostrar que ele aparece em **Anotações clínicas**, no dia de hoje, junto com as demais anotações.
5. Ainda no Rafael, aba **Protocolos**: os interruptores dos módulos, o GAD-7 ligado dentro do protocolo de crise (frequência e "Pedir agora"), e as crises registradas. Depois, na aba **Detalhamento**, as respostas dia a dia e o GAD-7 item a item.
6. **Trocar perfil** e entrar como a **Juliana** (tabagismo). Fazer o check-in de hoje e mostrar os "dias sem fumar".
7. Entrar como o **Rafael** e abrir **"Ansiedade forte agora?"** para mostrar a respiração guiada.
8. Entrar como a **Ana** para mostrar o primeiro acesso com consentimento (LGPD).
9. **Restaurar dados** ao final, se quiser começar de novo.

## O que a psicóloga ganha
- Resumo de cada paciente antes da sessão, com temas sugeridos e espaço para as próprias anotações.
- Aba de gráficos com a evolução (valores reais, média e tendência), os padrões da semana e o que costuma aparecer junto nos registros. A linguagem é sempre descritiva, nunca de causa.
- Período livre: 7, 14 ou 30 dias, ou as datas que ela escolher.
- Aba Detalhamento, com tudo o que o paciente respondeu, na íntegra.
- Um campo "Anotar" em cada frase do Resumo e em cada gráfico. Todas as anotações se juntam em **Anotações clínicas**, por dia e com a origem, junto com o diário clínico. Há busca e filtro, para não lotar com meses de acompanhamento.
- O objetivo da semana fica no painel para ela lembrar, e só ela escreve.
- **Módulos que ela liga por paciente:**
  - hábitos: tabagismo e álcool;
  - protocolos: puerpério, crise de ansiedade, bullying, luto, esgotamento no trabalho e insônia.
- Questionários de rastreio opcionais dentro de cada módulo (EPDS e GAD-7): ela escolhe se aplica, com que frequência (só uma vez, a cada 2 semanas ou a cada mês) e pode pedir na hora. Vê a pontuação, o histórico e as respostas item a item.
- Ficha, anotações clínicas e medicações só dela.
- Dia e horário fixo da consulta de cada paciente (semanal ou quinzenal): a lista de pacientes pode ser ordenada pela consulta mais próxima, para abrir o paciente certo antes de cada sessão.
- Filtro "Precisam de atenção" na lista de pacientes: sinais clínicos da semana (crises seguidas, item de risco da EPDS, pensamentos assustadores frequentes no puerpério, ameaça ou agressão na escola) em destaque, separados dos avisos administrativos (consentimento, pedido de encerramento, falta de check-in).

## O que o paciente ganha
- Check-in em menos de um minuto, com perguntas extras só do que faz sentido para o seu momento.
- Registro de pensamentos para todos, sequência de dias junto do check-in, contador de dias sem fumar e respiração guiada na hora da crise.
- O objetivo da semana combinado na sessão, sempre à vista no Início e na aba Semana.
- Controle dos próprios dados (baixar, apagar, revogar consentimento).

## Cuidados
- Linguagem descritiva, sem diagnóstico. O app não é canal de emergência e mostra sempre o CVV 188 e o SAMU 192.
- Na versão real, os dados ficam num banco com regras de acesso por pessoa (cada paciente só vê o que é seu) e seguem a LGPD (dado de saúde é dado sensível).

## Estado atual (29/10/2026)
- Demo criada em 26/10/2026, sem banco: os dados ficam só no navegador de quem testa.
- De 27 a 29/10, rodadas de ajustes pedidos na revisão:
  - o painel da psicóloga foi reorganizado (Resumo, Gráficos, Detalhamento, Protocolos, Objetivo da semana, Registro de pensamentos e Anotações clínicas);
  - os questionários ficaram opcionais;
  - o visual de todas as telas foi revisado;
  - AUDIT-C e Fagerström retirados; tabagismo e luto com a opção "Outro";
  - Anotações clínicas em duas sub-abas;
  - dia e horário da consulta, com a lista de pacientes ordenada pela consulta mais próxima;
  - "Precisam de atenção" com sinais clínicos.
- Ainda não publicada (falta criar o repositório no GitHub e importar na Vercel).
- Perguntas dos módulos em `docs/protocolos.md`, para validação clínica.
- Próximo passo: depois de validar com a Bruna e com as psicólogas, levar os módulos ao app da Bruna (com banco, regras de acesso e testes).
