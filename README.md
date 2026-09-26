# Mercado de Previsões Digitais

Plataforma brasileira de mercados de previsões sobre acontecimentos populares da internet, creators, entretenimento, música, esportes, eventos digitais e cultura pop.

> **Princípio Central:** Não somos uma casa de apostas, cassino, corretora ou plataforma de criptomoedas. Somos uma plataforma de inteligência coletiva e previsões sobre eventos digitais populares com métricas **objetivamente verificáveis** e resolução auditável.

---

## 🧭 O que é o produto

O Mercado de Previsões Digitais permite que qualquer pessoa acompanhe e assuma posições sobre o que acha que vai acontecer na cultura da internet e entretenimento.

Diferente de uma simples enquete ("Em quem você vota?"), o mercado opera sob regras de previsão coletiva:
1. **Pergunta objetiva** com prazo definido.
2. **Fontes verificáveis** (YouTube, Spotify, Google Trends, TikTok, rankings oficiais).
3. **Posições em Créditos Virtuais** (sem dinheiro real, saques ou depósitos).
4. **Resolução auditável** com registro de payload, timestamp e evidência pública.
5. **Distribuição transparente**:
   - **70%** para os acertadores
   - **20%** para o criador do mercado
   - **10%** para o custo operacional da plataforma

---

## 🚫 O que o produto NÃO é

- ❌ Não é casa de apostas ou cassino (sem "odds", "apostas", "bilhetes").
- ❌ Não utiliza dinheiro real, PIX, depósito bancário ou saque.
- ❌ Não utiliza blockchain, criptomoedas, NFTs ou carteiras Web3.
- ❌ Não é corretora financeira ou AMM de especulação monetária.
- ❌ Não aceita eventos sem regra objetiva ou fonte pública verificável.

---

## 🏗️ Arquitetura do Sistema

```text
GitHub
├── README.md
├── docs/
│   ├── PRODUCT.md          # Visão de produto e posicionamento
│   ├── MARKET-MODEL.md     # 4 tipos de mercados (Resultado, Ranking, Métrica, Limiar)
│   ├── DATA-SOURCES.md     # Catálogo de fontes, APIs e matriz de automação
│   ├── RESOLUTION.md       # Regras do motor de resolução e registro de evidência
│   ├── ECONOMICS.md        # Economia virtual de Créditos e distribuição 70/20/10
│   └── ROADMAP.md          # Fases de expansão
│
├── src/                    # Frontend React + TypeScript + Vite + Tailwind CSS
├── worker/                 # Cloudflare Worker API (Hono / Fetch standard)
│   ├── src/
│   │   ├── adapters/       # Adapters para YouTube, Spotify, TikTok, Meta, etc.
│   │   ├── engine.ts       # Motor econômico e de resolução
│   │   └── index.ts        # Endpoints da API REST
│   └── wrangler.toml
│
└── supabase/
    └── migrations/         # DDL PostgreSQL + RLS + Dados semente
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm

### 2. Instalação e Execução
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Vite)
npm run dev
```

Acesse em `http://localhost:3000` (ou na URL do AI Studio).

### 3. Executando o Cloudflare Worker (opcional / produção)
```bash
cd worker
npm install
npm run dev    # Executa wrangler dev
```

---

## 📊 Estado Atual do MVP

- ✅ **4 Tipos de Mercado Implementados**:
  - `RESULTADO` (ex: Luta de exibição de influenciadores, premiação)
  - `RANKING` (ex: #1 no Spotify Top Brasil semanal)
  - `METRICA` (ex: Contagem exata de inscritos ou visualizações em janela de 48h)
  - `LIMIAR` (ex: Vídeo ultrapassará 10 milhões de views até domingo)
- ✅ **Catálogo de Fontes Verificáveis**:
  - YouTube Data API (Automatizável)
  - Spotify Web API (Automatizável)
  - Google Trends (Automatizável)
  - TikTok Research / Creator API (Elegível)
  - Meta Graph / Instagram (Elegível)
  - Fontes Oficiais de Eventos (Semi-automático / Auditável)
- ✅ **Economia Virtual**: 10.000 Créditos iniciais de demonstração, compra de posições, venda antecipada, e distribuição 70% / 20% / 10%.
- ✅ **Auditoria Completa**: Visualizador de evidências, logs de resolução com payload e status transparente.
- ✅ **Console Administrativo DEMO**: Ferramenta de teste para simular encerramento e resolução automática com um clique.
