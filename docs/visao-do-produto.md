# Visão do produto — LOF Psi (demonstração)

*Documento de negócio, não técnico.*

## O que é
Uma demonstração navegável do aplicativo de acompanhamento entre sessões que a LOF desenvolveu para a psicóloga Bruna Sartori. Serve para apresentar o produto a outras psicólogas. Não tem nome nem logo de nenhum profissional, e todos os pacientes e registros são fictícios.

## Como apresentar
1. Abrir o link e escolher **"Entrar como psicóloga"**.
2. Mostrar a lista de pacientes.
3. Abrir a **Marina** (puerpério). O Resumo mostra:
   - os pontos para conferir com atenção;
   - a síntese descritiva;
   - a escala de Edimburgo;
   - os temas para a sessão.
4. Abrir o **Rafael** na aba **Protocolos e hábitos**: os interruptores dos módulos, a evolução do GAD-7 e as crises registradas.
5. **Trocar perfil** e entrar como a **Juliana** (tabagismo). Fazer o check-in de hoje e mostrar os "dias sem fumar".
6. Entrar como o **Rafael** e abrir **"Ansiedade forte agora?"** para mostrar a respiração guiada.
7. Entrar como a **Ana** para mostrar o primeiro acesso com consentimento (LGPD).
8. **Restaurar dados** ao final, se quiser começar de novo.

## O que a psicóloga ganha
- Resumo de cada paciente antes da sessão, com temas sugeridos e espaço para as próprias anotações.
- **Módulos que ela liga por paciente:**
  - hábitos: tabagismo e álcool;
  - protocolos: puerpério, crise de ansiedade, bullying, luto, esgotamento no trabalho e insônia.
- Questionários de rastreio aplicados automaticamente no intervalo certo: EPDS, GAD-7, AUDIT-C e Fagerström.
- Ficha, anotações clínicas e medicações só dela.

## O que o paciente ganha
- Check-in em menos de um minuto, com perguntas extras só do que faz sentido para o seu momento.
- Sequência de dias, contador de dias sem fumar e respiração guiada na hora da crise.
- Controle dos próprios dados (baixar, apagar, revogar consentimento).

## Cuidados
- Linguagem descritiva, sem diagnóstico. O app não é canal de emergência e mostra sempre o CVV 188 e o SAMU 192.
- Na versão real, os dados ficam num banco com regras de acesso por pessoa (cada paciente só vê o que é seu) e seguem a LGPD (dado de saúde é dado sensível).

## Estado atual (outubro/2026)
- Demo criada em 26/10/2026, sem banco: os dados ficam só no navegador de quem testa.
- Perguntas dos módulos em `docs/protocolos.md`, para validação clínica.
- Próximo passo: depois de validar com a Bruna e com as psicólogas, levar os módulos ao app da Bruna (com banco, regras de acesso e testes).
