# Roadmap Canônico — Mercado de Previsões Digitais

Fonte de verdade: este arquivo + docs/DECISIONS.md + histórico de commits do GitHub.

## Estado atual

- Fase 1 — Fundação: concluída
- Fase 2 — Backend canônico: concluída
- Fase 3 — Resolução automática / fontes reais: planejada
- Fase 4 — Simplificação do frontend: PRÓXIMA
- Fase 5 — Golden Path público: futura
- Fase 6 — Expansão de criação: futura

## Fase 1 — Fundação

Status: CONCLUÍDA

React + Vite + TypeScript, Tailwind, estrutura inicial, Worker, documentação inicial e quatro tipos de mercado.

## Fase 2 — Canonização do backend

Status: CONCLUÍDA

Schema prediction_* no Supabase, RLS, Worker conectado, endpoints reais, ledger de Créditos, persistência, resolução com evidência e testes de fluxo.

Migration canônica: supabase/migrations/20260926000000_canonical_prediction_schema.sql

## Fase 3 — Adapters de produção e resolução automática

Status: PLANEJADA

Objetivos: credenciais reais; YouTube primeiro; Spotify conforme acesso oficial; Google Trends conforme método reproduzível; TikTok/Meta indisponíveis quando exigirem acesso não disponível; Cron periódico; fechamento por close_at; resolução idempotente; logs de evidência; transições seguras.

Regra: não criar um Cron individual por palpite. Usar um Cron periódico que procura palpites vencidos.

A Fase 3 não deve criar novas funcionalidades de frontend.

# Fase 4 — Simplificação radical do frontend

Status: PRÓXIMA

Objetivo: transformar o frontend público em uma experiência brasileira, simples e rápida, com baixa carga de leitura.

### 4.1 Linguagem

- substituir linguagem técnica pública por linguagem comum;
- adotar palpite como termo principal;
- frases curtas e perguntas simples;
- CTAs explícitos;
- eliminar jargão financeiro;
- não imitar linguagem de bet/cassino.

### 4.2 UX

- botões grandes;
- fonte legível;
- poucas opções por tela;
- uma ação principal;
- cards simples;
- navegação curta;
- estados fáceis de entender;
- erros escritos para pessoas, não para desenvolvedores.

### 4.3 Fluxo público

Entrada → Descoberta → Palpite → Escolha → Confirmar → Acompanhar → Resultado.

### 4.4 Remover criação pública

Somente administradores criam e publicam palpites.

Remover da experiência pública: Criar mercado, Meus mercados, ferramentas de criação para usuários e qualquer CTA que sugira criação pública.

### 4.5 Referências de UX

Tinder, Instagram, TikTok, YouTube, WhatsApp e padrões brasileiros de linguagem simples.

Não copiar visual, marca ou identidade desses produtos.

### 4.6 Resultado esperado

O participante deve conseguir entender a pergunta, escolher, confirmar, acompanhar e entender o resultado sem conhecer termos de mercado, finanças ou apostas.

## Fase 5 — Golden Path público

Status: FUTURA

Validar entrada → descoberta → participação → acompanhamento → resultado → Créditos.

## Fase 6 — Expansão de criação

Status: FUTURA

Creators selecionados, criação pela comunidade, moderação e planos de criação poderão ser avaliados somente após o Golden Path estar estável.

## Regra de execução

Uma fase só é concluída quando implementação, testes/validação, documentação e commit estiverem concluídos.

Não avançar de fase carregando pendências silenciosas.
