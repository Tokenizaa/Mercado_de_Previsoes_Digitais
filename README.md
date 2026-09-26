# Mercado de Previsões Digitais

Plataforma brasileira de palpites sobre acontecimentos populares da internet, creators, entretenimento, música, esportes, eventos digitais e cultura pop.

> Princípio central: o tema pode ser popular, mas o resultado precisa ser objetivamente verificável.

## Experiência do produto

O usuário não precisa conhecer mercados, finanças ou apostas.

Fluxo público: Veja → Escolha → Dar meu palpite → Acompanhar → Ver o resultado.

Documentos canônicos:

- docs/FRONTEND-CONSTITUTION.md
- docs/DECISIONS.md
- docs/PRODUCT.md
- docs/ROADMAP.md

## Regra atual de criação

Somente administradores criam e publicam palpites.

Usuários comuns podem descobrir, participar, acompanhar, compartilhar e consultar resultados.

## Créditos

O MVP utiliza somente Créditos virtuais.

- saldo inicial de demonstração: 10.000 Créditos;
- sem dinheiro real;
- sem depósito ou saque;
- sem PIX;
- sem blockchain;
- sem criptomoedas.

## Resolução

Todo palpite publicado precisa ter pergunta objetiva, prazo, regra clara, fonte verificável, forma de conferência e evidência registrada.

## Arquitetura

Frontend React + Vite → Cloudflare Worker → Supabase PostgreSQL.

O Supabase é a fonte de verdade dos dados persistentes.

## Documentação

docs/DECISIONS.md registra decisões permanentes.
docs/FRONTEND-CONSTITUTION.md define a experiência pública.
docs/PRODUCT.md define o produto.
docs/ROADMAP.md define as fases.
Os demais documentos detalham modelo, fontes, resolução e economia.

## Desenvolvimento por fases

Cada fase deve ser definida, implementada, validada, documentada e registrada em commit no GitHub.

O GitHub é a fonte de verdade do projeto.
