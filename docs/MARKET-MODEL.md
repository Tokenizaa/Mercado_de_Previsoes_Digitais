# Modelo de Mercados & Tipos de Contrato

A plataforma suporta quatro tipos fundamentais de mercado. Cada tipo atende a uma natureza diferente de evento digital.

---

## 1. Tipo: RESULTADO (Discreto / Categórico)
- **Definição**: Pergunta fechada com duas ou mais opções mutuamente exclusivas onde apenas uma será a vencedora.
- **Exemplo**: *"Quem vence o combate principal do Fight Music Show 11?"*
  - Opção A: Popó Freitas
  - Opção B: Desafiante
  - Opção C: Empate / Sem resultado oficial
- **Métrica**: Decisão oficial anunciada pela organização ou súmula esportiva pública.
- **Resolução**: Identificador da opção vencedora gravada como `observed_result`.

---

## 2. Tipo: LIMIAR (Booleano / Acima ou Abaixo)
- **Definição**: Pergunta de ultrapassagem de uma marca numérica antes de uma data e hora limite.
- **Exemplo**: *"O novo clipe de Anitta ultrapassará 15 milhões de visualizações no YouTube em 72h?"*
  - Opção Sim: $\ge 15.000.000$ views
  - Opção Não: $< 15.000.000$ views
- **Métrica**: Contagem de visualizações retornada pela API pública do YouTube (`statistics.viewCount`) no exato timestamp de fechamento.
- **Resolução**: Se o número lido na API for maior ou igual ao limiar, "Sim" resolve vencedor.

---

## 3. Tipo: METRICA (Faixas ou Escalas Quantitativas)
- **Definição**: Estimativa do valor numérico final alcançado em uma janela estipulada, dividido em faixas contínuas.
- **Exemplo**: *"Qual será o pico de espectadores simultâneos na transmissão de CazéTV no jogo de abertura?"*
  - Faixa 1: Menos de 1.000.000
  - Faixa 2: De 1.000.000 a 2.500.000
  - Faixa 3: De 2.500.001 a 4.000.000
  - Faixa 4: Mais de 4.000.000
- **Métrica**: Pico registrado em monitor público oficial ou relatório analítico da plataforma de streaming.
- **Resolução**: Verificação do valor de pico contra os intervalos pré-definidos.

---

## 4. Tipo: RANKING (Posição Relativa em Tabela)
- **Definição**: Previsão de quem ocupará o topo ou uma posição determinada em uma parada oficial de métricas.
- **Exemplo**: *"Qual faixa ocupará a 1ª posição no Spotify Top 50 Brasil na atualização de sexta-feira?"*
  - Opção A: Música X (Artista A)
  - Opção B: Música Y (Artista B)
  - Opção C: Outra faixa
- **Métrica**: Parada oficial publicada em `charts.spotify.com` ou endpoint da API oficial de charts.
- **Resolução**: Leitura direta da posição `#1` no snapshot verificado.

---

## Ciclo de Vida do Mercado

```text
[OPEN] ────────► [CLOSED] ────────► [AWAITING_RESULT] ────────► [RESULT_FOUND] ────────► [RESOLVED] ────────► [DISTRIBUTED]
  │                 │                      │                          │                       │                     │
Mercado aberto    Atingiu hora        Aguardando publicação     Payload capturado        Opção vencedora      Créditos creditados
para posições     de fechamento       da métrica na fonte       e registrado no log      marcada no banco     aos participantes
```
