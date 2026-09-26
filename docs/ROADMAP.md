# Roadmap Técnico & Evolução de Produto

Este documento mapeia os passos de expansão do **Mercado de Previsões Digitais**.

---

## Fase 1: Fundação & MVP Funcional (Fase Atual)
- [x] Estrutura unificada: Frontend (React + Vite) + Cloudflare Worker + Supabase DDL.
- [x] Implementação dos 4 tipos de mercados: `RESULTADO`, `RANKING`, `METRICA`, `LIMIAR`.
- [x] Economia de Créditos Virtuais (10.000 de demonstração) com distribuição 70/20/10.
- [x] Páginas principais: Home, Descoberta, Detalhe do Mercado, Categorias, Criar, Portfolio, Ranking, Perfil e Console DEMO.
- [x] Catálogo de fontes com flags de auditabilidade e automação.
- [x] Motor de demonstração para resolução com evidência auditável.
- [x] Documentação técnica completa versionada.

---

## Fase 2: Adapters de Produção para APIs Oficiais
- [ ] **YouTube Data API v3**:
  - Webhook de monitoramento agendado via Cloudflare Cron Triggers.
  - Verificação com snapshot de views e likes gravado com hash de integridade.
- [ ] **Spotify Web API**:
  - Scraping/API de Charts semanais oficiais nas sextas-feiras às 18h BRT.
- [ ] **Google Trends PyTrends / SerpAPI**:
  - Normalização de índices de busca relativos no Brasil.
- [ ] **TikTok Research API**:
  - Conexão para validação de reproduções de áudio.

---

## Fase 3: Comunidade & Distribuição Social
- [ ] Compartilhamento dinâmico com cartões gráficos renderizados para Instagram Stories e WhatsApp.
- [ ] Sistema de selos de reputação para criadores com alta taxa de acerto e mercados auditados sem contestação.
- [ ] Notificações automáticas via Web Push quando um mercado em que o usuário tem posição for encerrado ou resolvido.

---

## Fase 4: Governança & Resolução Descentralizada
- [ ] Mecanismo de contestação comunitária caso a fonte oficial apresente inconsistência temporária ou queda de servidor.
- [ ] Comitê de auditores com registro imutável de deliberação.
