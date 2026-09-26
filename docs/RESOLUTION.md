# Motor de Resolução & Registro de Evidências

O processo de resolução é o coração da confiança da plataforma.

---

## 1. Princípios de Resolução
1. **Determinismo**: Dada a mesma evidência de entrada, a resolução deve produzir exatamente o mesmo resultado vencedor.
2. **Imutabilidade**: Uma vez gravado o log de resolução (`market_resolution_logs`) e distribuído o pool, a decisão não é alterada sem auditoria transparente.
3. **Auditabilidade Pública**: Qualquer usuário pode inspecionar o payload bruto coletado da fonte, a URL consultada e a data/hora exata da captura.

---

## 2. Fluxo Passo a Passo

```text
1. Encerramento do Mercado (status = CLOSED)
   Nenhuma nova posição ou venda pode ser realizada após close_at.

2. Gatilho de Verificação (Worker Cron ou Endpoint /api/markets/:id/resolve)
   O Worker consulta o adapter correspondente (ex: YouTube Adapter com video_id).

3. Coleta e Normalização de Dados
   O adapter extrai a métrica especificada na resolution_rule.

4. Comparação Lógica
   - RESULTADO: Identifica se o vencedor declarado confere com uma das opções.
   - LIMIAR: Avalia (métrica_observada >= limiar_definido).
   - METRICA: Encaixa o valor numérico na faixa correspondente.
   - RANKING: Identifica o elemento na posição #1.

5. Registro de Evidência (market_resolution_logs)
   Armazena:
   - source_url
   - source_payload (JSON bruto)
   - observed_result
   - verified_at (timestamp)
   - status: SUCCESS / FAILED

6. Execução da Distribuição Virtual (status = DISTRIBUTED)
   Invoca o módulo de cálculo econômico:
   - 70% distribuídos proporcionalmente aos donos de unidades da opção vencedora.
   - 20% creditados ao saldo do criador do mercado.
   - 10% retidos como custo operacional da plataforma.
```

---

## 3. Estrutura do Registro de Evidência

```json
{
  "market_id": "uuid-do-mercado",
  "source_url": "https://www.youtube.com/watch?v=EXAMPLE_ID",
  "source_payload": {
    "provider": "youtube",
    "resource_id": "EXAMPLE_ID",
    "metric": "viewCount",
    "value": 12458900,
    "timestamp_iso": "2026-09-26T21:00:00Z"
  },
  "observed_result": "Sim (12.458.900 views >= 10.000.000)",
  "verified_at": "2026-09-26T21:00:05Z",
  "status": "VERIFIED",
  "evidence": "API response payload confirmed via YouTube Data v3"
}
```
