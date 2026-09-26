# Catálogo de Fontes Verificáveis & Auditabilidade

Para manter a integridade do sistema, cada mercado precisa estar vinculado a um provedor registrado no catálogo de fontes.

---

## 1. Classificação das Fontes

Cada fonte passa por 4 estados de maturidade técnica:

| Estado | Significado |
| :--- | :--- |
| **DISPONÍVEL** | A fonte existe publicamente e possui dados acessíveis para verificação humana. |
| **ELEGÍVEL** | A fonte possui estrutura e formatos padronizados (ex: página HTML estável, RSS ou endpoint público). |
| **RESOLVÍVEL** | O Worker possui parser ou adapter configurado para extrair a métrica com precisão determinística. |
| **AUTOMATIZÁVEL** | A fonte possui API oficial ou webhook com consulta agendada via Cloudflare Cron Triggers sem intervenção manual. |

---

## 2. Catálogo Inicial de Fontes (MVP)

### A. YouTube (YouTube Data API v3)
- **Slug**: `youtube`
- **Categoria**: Vídeo & Streaming
- **Métricas Suportadas**:
  - `statistics.viewCount` (Contagem de visualizações de vídeo específico)
  - `statistics.subscriberCount` (Contagem pública de inscritos)
  - `statistics.likeCount` (Contagem de curtidas)
- **Status de Automação**: `AUTOMATIZÁVEL` (Adapter preparado no Worker).
- **Formato de Evidência**: JSON com `videoId`, `viewCount`, `collectedAt` e hash SHA-256.

### B. Spotify (Spotify Web API / Charts)
- **Slug**: `spotify`
- **Categoria**: Música
- **Métricas Suportadas**:
  - Posição `#1` a `#50` no Daily / Weekly Top Brasil
  - Total diário de streams de uma faixa
- **Status de Automação**: `AUTOMATIZÁVEL`.
- **Formato de Evidência**: JSON com `chartDate`, `trackId`, `trackName`, `position`, `streamCount`.

### C. Google Trends
- **Slug**: `google-trends`
- **Categoria**: Cultura & Pesquisa
- **Métricas Suportadas**:
  - Volume comparativo de interesse relativo (0–100) em janela delimitada de 7 dias no território Brasil (`geo=BR`).
- **Status de Automação**: `RESOLVÍVEL`.

### D. TikTok (TikTok Creator / Research API)
- **Slug**: `tiktok`
- **Categoria**: Vídeo Curto
- **Métricas Suportadas**:
  - Visualizações e contagem de vídeos com determinado áudio oficial.
- **Status de Automação**: `ELEGÍVEL` (DEMO adapter com estrutura para chave de API).

### E. Fontes Oficiais de Eventos (Súmulas e Portais Oficiais)
- **Slug**: `official-events`
- **Categoria**: Esportes & Festivais
- **Exemplos**:
  - Organização do Fight Music Show
  - Academia do Prêmio Multishow / Grammy Latino
  - Transmissões oficiais (CazéTV / SporTV / Globoplay)
- **Status de Automação**: `RESOLVÍVEL` (Auditado com link permanente e captura de tela ou ata).
