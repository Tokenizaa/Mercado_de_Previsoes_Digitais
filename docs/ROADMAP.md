# Roadmap Técnico & Evolução de Produto

## Fase 1: Fundação & Protótipo Funcional (Concluído)
- [x] Estrutura unificada: Frontend (React + Vite) + Cloudflare Worker.
- [x] 4 tipos de mercados operacionais (Resultado, Limiar, Métrica, Ranking).
- [x] Documentação arquitetural completa versionada.

## Fase 2: Canonização Supabase & Conexão do Worker (Fase Atual)
- [x] Migration canônica com namespace `prediction_*` versionada no GitHub (`supabase/migrations/20260926000000_canonical_prediction_schema.sql`).
- [x] Cloudflare Worker conectado à API Supabase (`prediction_profiles`, `prediction_markets`, `prediction_positions`, `prediction_activity`, `prediction_resolution_logs`, `prediction_credit_ledger`).
- [x] Endpoints reais implementados:
  - `GET /api/health`
  - `GET /api/markets`
  - `GET /api/markets/:slug`
  - `GET /api/sources`
  - `GET /api/activity`
  - `GET /api/portfolio`
  - `POST /api/markets`
  - `POST /api/markets/:id/positions`
  - `POST /api/markets/:id/sell`
  - `POST /api/markets/:id/resolve`
- [x] Garantia de atomicidade financeira e consistência com `prediction_credit_ledger`.
- [x] Resolução com evidência e repúdio a vencedor arbitrário enviado pelo cliente.
- [x] Testes de integração de fluxo ponta a ponta validados.

## Fase 3: Adapters de Produção & Cron Triggers
- [ ] Injeção de credenciais de produção no Cloudflare Worker (`YOUTUBE_API_KEY`, etc.).
- [ ] Execução periódica de consultas agendadas via Cloudflare Cron Triggers para fechamento pontual de mercados.
- [ ] Supabase Auth completo no frontend com fluxo de login e recuperação de senha.
