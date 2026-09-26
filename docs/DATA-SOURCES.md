# Catálogo de Fontes Verificáveis & Estado dos Adapters

## 1. Princípio Central
Nenhum mercado é elegível para publicação sem possuir:
- Fonte pública objetiva (`source_url`);
- Identificador da métrica (`source_identifier`);
- Regra determinística de resolução (`resolution_rule`).

---

## 2. Estado Atual dos Adapters (Cloudflare Worker)

Os adaptadores residem em `worker/src/adapters/index.ts` e são invocados pelo Worker para resolução.

| Provedor | Categoria | Tipo | `api_available` | `automated_resolution_supported` | Estado Atual no Worker |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **YouTube Data API v3** | Vídeo / Streaming | API | Sim | Sim | Implementado com payload auditável e snapshot de viewCount (`is_demo = true`). |
| **Spotify Web Charts** | Música | API | Sim | Sim | Implementado com aferição de posição #1 no Top Brasil (`is_demo = true`). |
| **Google Trends BR** | Pesquisa | Web | Sim | Não | Implementado com normalização de índice relativo (0-100) (`is_demo = true`). |
| **TikTok Creator Portal** | Vídeo Curto | API | Sim | Não | Estruturado para contagem de vídeos por áudio/tag (`is_demo = true`). |
| **Instagram Graph API** | Social | API | Sim | Não | Estruturado para leitura de seguidores/interações públicas (`is_demo = true`). |
| **Súmulas Oficiais de Eventos** | Esportes / Lutas | Oficial | Não | Não | Estruturado para súmulas esportivas e comunicados oficiais (`is_demo = true`). |

---

## 3. Matriz de Maturidade Técnica
```text
DISPONÍVEL ──► ELEGÍVEL ──► RESOLVÍVEL ──► AUTOMATIZÁVEL
```
- **Limitação Conhecida**: Enquanto as chaves de produção de cada API externa (`YOUTUBE_API_KEY`, etc.) não forem injetadas no ambiente do Cloudflare Worker, o motor opera com snapshots determinísticos marcados explicitamente com a flag `is_demo = true` no log de evidência, sem inventar APIs falsas.
