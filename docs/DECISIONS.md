# Registro Canônico de Decisões — Mercado de Previsões Digitais

Status: Canônico
Última atualização: 2026-09-26

Este arquivo registra decisões que não devem ser perdidas durante novas rodadas de desenvolvimento ou uso de agentes.

## D-001 — GitHub é a fonte de verdade

O repositório Tokenizaa/Mercado_de_Previsoes_Digitais é a fonte de verdade do produto, arquitetura, documentação e histórico de implementação.

## D-002 — MVP usa somente Créditos virtuais

O MVP não possui dinheiro real, depósitos, saques, PIX, criptomoedas, blockchain ou KYC financeiro. O saldo inicial de demonstração é de 10.000 Créditos.

## D-003 — O produto é sobre palpites de acontecimentos digitais

O foco são acontecimentos populares da internet e do entretenimento, incluindo creators, vídeos, música, esportes, lutas, cultura digital e eventos mensuráveis.

Popularidade ajuda a escolher o tema. Auditabilidade é obrigatória para publicar o palpite.

## D-004 — Resultado precisa ser verificável

Todo palpite publicado precisa ter pergunta objetiva, prazo, regra clara, fonte verificável, identificador ou método de consulta e evidência de resolução.

## D-005 — Usuário comum não cria palpites no MVP

A criação e publicação de palpites ficam exclusivamente com administradores. O usuário comum pode descobrir, participar, acompanhar, compartilhar e consultar resultados.

Criação por creators ou comunidade será avaliada em versão futura.

## D-006 — Linguagem pública será simples

A interface pública não deve exigir conhecimento de mercados, finanças ou apostas. O termo público principal é palpite.

## D-007 — Não imitar linguagem de cassino/bet

O produto pode aprender com a simplicidade e rapidez de produtos consumidos pelo público de bets e jogos sociais, mas não deve adotar sua linguagem ou identidade.

Não usar como vocabulário de produto: aposta, bet, odd, banca, green, red, all in, forrar ou cassino.

## D-008 — Frontend público prioriza ação

A experiência pública deve seguir: Pergunta → Escolha → Ação → Resultado.

Botões grandes, textos curtos, uma ação principal por tela e navegação reduzida são requisitos de UX.

## D-009 — Admin é uma experiência separada

O Admin pode utilizar termos técnicos e interfaces mais densas. A simplificação radical é obrigatória principalmente na experiência pública do participante.

## D-010 — Backend técnico permanece separado da linguagem pública

Não é necessário renomear tabelas, endpoints ou tipos técnicos para acompanhar a linguagem pública.

Exemplo: prediction_markets pode continuar existindo no banco enquanto a interface mostra Palpites.

## D-011 — Supabase é a fonte de verdade dos dados

O fluxo canônico é: React/Vite → Cloudflare Worker → Supabase.

O localStorage não é fonte de verdade para dados persistentes.

## D-012 — Criação de palpite exige fonte verificável

A capacidade administrativa de criar palpites não elimina a exigência de uma regra objetiva e de uma fonte verificável.

## D-013 — Desenvolvimento por fases

Cada fase deve ter objetivo definido, ser implementada sem misturar escopos, ser validada, ser documentada e gerar commit identificável no GitHub.

Nenhuma nova fase deve apagar decisões canônicas anteriores sem registrar uma nova decisão que as substitua.