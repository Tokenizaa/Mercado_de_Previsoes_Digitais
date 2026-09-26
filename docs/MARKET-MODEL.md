# Modelo de Mercados & Schema Canônico

## 1. Arquitetura do Produto
```text
Frontend (React + Vite)
      ↓
Cloudflare Worker (API /api/*)
      ↓
Supabase PostgreSQL (project_ref = qyjoegombkgkgbvcjvhu)
```

**Supabase é a fonte de verdade.**
Não existe localStorage como fonte de verdade para dados persistentes.

---

## 2. Schema Canônico (Namespace: `prediction_*`)

As tabelas do Mercado de Previsões Digitais estão isoladas por namespace para convivência harmônica com outros sistemas do banco:

| Tabela | Responsabilidade |
| :--- | :--- |
| `prediction_profiles` | Perfis com `id` (chave estrangeira para `auth.users`), `username`, `name` e `credits_balance`. |
| `prediction_source_providers` | Catálogo de provedores auditáveis (YouTube, Spotify, Google Trends, etc.). |
| `prediction_markets` | Mercados públicos com regra de resolução, identificador da fonte, pool e prazos. |
| `prediction_market_options` | Opções de resultado de cada mercado com probabilidade coletiva e total alocado. |
| `prediction_positions` | Posições assumidas pelos usuários em Créditos Virtuais com unidades e preço médio. |
| `prediction_activity` | Registro cronológico público de compras, vendas, resoluções e distribuições. |
| `prediction_resolution_logs` | Logs imutáveis de evidência com payloads brutos inspecionados nas fontes. |
| `prediction_creator_markets` | Metadados dos planos de criadores e limites de capacidade de contratos disponíveis. |
| `prediction_credit_ledger` | Livro-razão financeiro oficial imutável para todas as alterações de Créditos. |

---

## 3. Estados Oficiais do Mercado

```text
[OPEN] ──► [CLOSED] ──► [AWAITING_RESULT] ──► [RESULT_FOUND] ──► [RESOLVED] ──► [DISTRIBUTED]
```

- `OPEN`: Mercado aberto para novas posições e liquidações antecipadas.
- `CLOSED`: Encerramento pelo prazo (`close_at`). Nenhuma nova posição pode ser assumida.
- `AWAITING_RESULT`: Aguardando publicação oficial da métrica pela fonte.
- `RESULT_FOUND`: Snapshot coletado pelo Cloudflare Worker e gravado em `prediction_resolution_logs`.
- `RESOLVED`: Opção vencedora demarcada no banco.
- `DISTRIBUTED`: Créditos virtuais creditados aos acertadores e ao criador com registro no ledger.

---

## 4. Tipos de Mercado Suportados
1. **RESULTADO**: Disputas discretas com vencedor categórico (ex: Popó vs Desafiante no FMS).
2. **LIMIAR**: Ultrapassagem de marca numérica em janela de tempo (ex: $\ge 10\text{M}$ views em 48h).
3. **METRICA**: Faixas numéricas de audiência ou engajamento (ex: pico de espectadores ao vivo).
4. **RANKING**: Posição relativa em paradas oficiais (ex: #1 no Spotify Top 50 Brasil).
