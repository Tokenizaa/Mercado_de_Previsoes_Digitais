# Motor de Resolução & Registro de Evidências

O processo de resolução é o núcleo de confiança do **Mercado de Previsões Digitais**.

---

## 1. Regra Contra Decisões Arbitrárias
**NUNCA aceitamos simplesmente \`winner = req.body.winner\` como critério de resolução.**

A resolução passa obrigatoriamente por:
1. Localização do mercado em `prediction_markets`;
2. Consulta ao adapter do provedor em `worker/src/adapters`;
3. Registro de auditoria em `prediction_resolution_logs` com:
   - `source_url`
   - `source_payload` (JSON bruto capturado)
   - `observed_result`
   - `evidence`
   - `is_demo` (booleano explícito)
4. Transição de estado para `DISTRIBUTED`;
5. Atualização atômica das posições em `prediction_positions` (`WON` / `LOST`);
6. Lançamento oficial dos créditos no `prediction_credit_ledger` e atualização dos saldos em `prediction_profiles`.

---

## 2. Fluxos Financeiros no Supabase

### Fluxo de Compra (`POST /api/markets/:id/positions`):
1. Autentica usuário através do token Supabase;
2. Consulta saldo oficial em `prediction_profiles.credits_balance`;
3. Valida se o mercado está em `status = 'OPEN'`;
4. Valida se a opção existe e pertence ao mercado;
5. Debita os créditos de `prediction_profiles`;
6. Registra/atualiza registro em `prediction_positions`;
7. Cria lançamento imutável em `prediction_credit_ledger` com tipo `BUY`;
8. Registra evento em `prediction_activity`;
9. Recalcula probabilidades do mercado com base no novo pool.

### Fluxo de Venda (`POST /api/markets/:id/sell`):
1. Autentica usuário;
2. Localiza posição em `prediction_positions` e valida propriedade;
3. Valida se mercado está `OPEN`;
4. Calcula retorno de liquidação com base nas unidades e probabilidade atual (spread de saída de 5%);
5. Atualiza unidades da posição ou marca como `CLOSED`;
6. Credita saldo em `prediction_profiles`;
7. Registra movimentação em `prediction_credit_ledger` com tipo `SELL`;
8. Registra evento em `prediction_activity`.

### Fluxo de Resolução & Payout (`POST /api/markets/:id/resolve`):
1. Inspeciona a fonte oficial via adapter;
2. Demarca opção vencedora (`WINNER`) e perdedoras (`LOSER`);
3. Aloca **70% do pool** proporcionalmente às unidades dos acertadores com lançamentos `WINNINGS` no ledger;
4. Aloca **20% do pool** ao criador com lançamento `CREATOR_REWARD` no ledger;
5. Retém **10% do pool** como custo operacional com lançamento `PLATFORM_COST` no ledger.
