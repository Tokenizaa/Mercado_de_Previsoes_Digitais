# Economia Virtual de Créditos & Livro-Razão (Ledger)

## 1. O Livro-Razão (`prediction_credit_ledger`)

O `prediction_credit_ledger` é o registro financeiro oficial do produto. Nenhuma alteração de saldo ocorre sem um registro correspondente no ledger.

### Tipos Canônicos Permitidos:
- `INITIAL_BALANCE`: Saldo concedido na criação da conta (10.000 Créditos de demonstração).
- `BUY`: Débito por aquisição de posição em uma opção de mercado.
- `SELL`: Crédito por venda/liquidação antecipada de uma posição aberta.
- `WINNINGS`: Crédito correspondente aos 70% do pool para acertadores da opção vencedora.
- `CREATOR_REWARD`: Crédito correspondente aos 20% do pool concedido ao criador do mercado.
- `PLATFORM_COST`: Registro dos 10% retidos como custo operacional da plataforma.
- `REFUND`: Reembolso integral caso um mercado seja cancelado ou anulado.
- `ADJUSTMENT`: Ajustes administrativos ou de auditoria justificados.

---

## 2. Divisão do Pool de Mercado (70 / 20 / 10)

$$\text{Pool Total} = \sum \text{Créditos alocados em todas as opções}$$

```text
┌────────────────────────────────────────────────────────┐
│                      POOL TOTAL                        │
├─────────────────────┬──────────────────┬───────────────┤
│        70%          │       20%        │      10%      │
│     Acertadores     │    Criador do    │     Custo     │
│   (Proporcional às  │     Mercado      │  Operacional  │
│       unidades)     │                  │ da Plataforma │
└─────────────────────┴──────────────────┴───────────────┘
```

> **Aviso de Integridade:** Não é permitido o uso da palavra "comissão" para os 10%. O termo estrito da especificação é **"Custo operacional da plataforma"**.
