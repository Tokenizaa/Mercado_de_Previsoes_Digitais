# Economia Virtual de Créditos & Modelo de Criadores

## 1. Créditos Virtuais
- Cada novo usuário recebe uma concessão demonstrativa inicial de **10.000 Créditos**.
- Os Créditos não têm equivalência financeira legal nem valor monetário de resgate.
- Não existem saques, depósitos, conversões em moeda fiduciária ou criptoativos.

---

## 2. Modelo de Distribuição do Pool (70 / 20 / 10)

Quando um mercado é resolvido, todo o volume de Créditos alocado nas opções é reunido em um Pool Único:

$$\text{Pool Total} = \sum \text{Créditos alocados em todas as opções}$$

A divisão é rigorosa e transparente:

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

### Regras de Distribuição:
1. **70% para Acertadores**:
   $$\text{Retorno por Usuário} = \left( \frac{\text{Unidades detidas na opção vencedora}}{\text{Total de unidades da opção vencedora}} \right) \times (\text{Pool Total} \times 0.70)$$
2. **20% para o Criador do Mercado**:
   Recompensa que incentiva a criação de mercados com perguntas relevantes, boa divulgação e alto engajamento comunitário.
3. **10% para o Custo Operacional da Plataforma**:
   Sustenta os serviços de infraestrutura, auditoria de fontes e servidores. **Nunca é chamado de "comissão"**, mas sim de **"Custo operacional da plataforma"**.

---

## 3. Planos de Criação e Capacidade de Contratos

Para evitar spam e criar uma progressão estruturada para criadores, os mercados possuem limites de capacidade de contratos:

| Plano | Capacidade Máxima | Perfil Indicado |
| :--- | :--- | :--- |
| **Plano Pequeno** | 100 contratos | Amigos, nichos pequenos ou testes iniciais |
| **Plano Médio** | 500 contratos | Comunidades de criadores intermediários |
| **Plano Grande** | 2.500 contratos | Canais de médio porte, podcasts, eventos locais |
| **Plano Maior** | 10.000 contratos | Grandes eventos nacionais, charts de streaming |

> **Nota Conceitual:** O sistema adota estritamente o termo **"Contratos disponíveis"** e proíbe terminantemente a palavra "Bilhetes".
