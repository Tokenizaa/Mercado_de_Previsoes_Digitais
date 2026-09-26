import React, { useState } from 'react';
import { BookOpen, FileText } from 'lucide-react';

interface DocsViewerProps {
  initialDoc?: string;
  onNavigate: (path: string) => void;
}

export const DocsViewer: React.FC<DocsViewerProps> = ({ initialDoc = 'PRODUCT.md' }) => {
  const [selectedDoc, setSelectedDoc] = useState<string>(initialDoc);

  const docs = [
    {
      id: 'PRODUCT.md',
      title: '01. Visão do Produto',
      summary: 'Posicionamento, diferenciação vs cassinos e princípios de arquitetura.',
      content: `# Visão do Produto: Mercado de Previsões Digitais

## 1. Contexto e Oportunidade
O consumo de entretenimento, disputas de influenciadores, lançamentos de faixas musicais e campeonatos digitais no Brasil geram milhões de discussões diárias nas redes sociais. No entanto, hoje essas discussões dividem-se em dois extremos:
1. **Enquetes efêmeras**: enquetes no Instagram ou X que apenas medem torcida ("Em quem você vota?"), sem compromisso com o resultado ou verificação posterior.
2. **Casas de apostas/cassinos**: plataformas com dinheiro real, linguagem agressiva, foco em jogos de azar e estigma severo.

O **Mercado de Previsões Digitais** preenche essa lacuna: uma plataforma de previsão social e cultural onde participantes usam **Créditos virtuais** para antecipar resultados mensuráveis do mundo digital, com foco em reputação, dados auditáveis e entretenimento inteligente.

---

## 2. Princípio Diferenciador

\`\`\`text
EVENTO DIGITAL ──► DADO OBJETIVO ──► FONTE VERIFICÁVEL ──► MERCADO ──► PREVISÃO ──► RESOLUÇÃO AUTOMÁTICA
\`\`\`

**"Popularidade é importante. Mas auditabilidade é obrigatória."**

Nenhum mercado é publicado sem:
- Uma pergunta com formulação inequívoca;
- Uma fonte pública especificada;
- Uma regra de resolução transparente (ex: valor observado no dia X às Y horas);
- Um método para aferir e registrar o dado de forma incontestável.

---

## 3. Linguagem e Posicionamento Visual
- **Tom de voz**: Inteligente, social, cultural e colaborativo.
- **Visual**: Inspirado em produtos como Linear, Stripe e Substack (fundo neutro claro, tipografia expressiva, espaçamento generoso, dados tabulares alinhados).
- **Termos proibidos**: *Aposta, Odd, Banca, Bilhete, Cassino, Token, Cripto, Trade alavancado*.
- **Termos adotados**: *Mercado, Posição, Probabilidade, Contratos disponíveis, Previsão, Créditos virtuais, Custo operacional da plataforma*.`,
    },
    {
      id: 'MARKET-MODEL.md',
      title: '02. Modelo Canônico (prediction_*)',
      summary: 'Schema no Supabase (prediction_*), 4 tipos e ciclo de vida.',
      content: `# Modelo de Mercados & Schema Canônico

## 1. Arquitetura do Produto
\`\`\`text
Frontend (React + Vite)
      ↓
Cloudflare Worker (API /api/*)
      ↓
Supabase PostgreSQL (project_ref = qyjoegombkgkgbvcjvhu)
\`\`\`

**Supabase é a fonte de verdade.**
Namespace oficial: **prediction_***

---

## 2. Tabelas Canônicas:
- \`prediction_profiles\`: Perfis e saldos de Créditos.
- \`prediction_source_providers\`: Catálogo de fontes auditáveis.
- \`prediction_markets\`: Mercados públicos.
- \`prediction_market_options\`: Opções e probabilidades.
- \`prediction_positions\`: Posições em aberto e liquidadas.
- \`prediction_activity\`: Feed de atividades em tempo real.
- \`prediction_resolution_logs\`: Evidências com payloads brutos.
- \`prediction_creator_markets\`: Capacidade dos planos de criação.
- \`prediction_credit_ledger\`: Livro-razão financeiro oficial.

---

## 3. Tipos de Mercado:
- **RESULTADO**: Pergunta fechada com duas ou mais opções exclusivas.
- **LIMIAR**: Marca numérica em janela de tempo (Sim/Não).
- **METRICA**: Faixas numéricas de métricas.
- **RANKING**: Posição relativa em paradas oficiais.`,
    },
    {
      id: 'DATA-SOURCES.md',
      title: '03. Fontes & Auditabilidade',
      summary: 'Catálogo de fontes (YouTube, Spotify, Trends, etc.) e matriz de automação.',
      content: `# Catálogo de Fontes Verificáveis & Auditabilidade

Para manter a integridade do sistema, cada mercado precisa estar vinculado a um provedor registrado no catálogo de fontes.

---

## Classificação dos Estados de Maturidade Técnica:
- **DISPONÍVEL**: A fonte existe publicamente e possui dados acessíveis para verificação humana.
- **ELEGÍVEL**: A fonte possui estrutura e formatos padronizados (ex: página HTML estável, RSS ou endpoint público).
- **RESOLVÍVEL**: O Worker possui parser ou adapter configurado para extrair a métrica com precisão determinística.
- **AUTOMATIZÁVEL**: A fonte possui API oficial ou webhook com consulta agendada via Cloudflare Cron Triggers.

---

## Catálogo Inicial de Fontes (MVP):
- **YouTube Data API v3**: viewCount, subscriberCount, likeCount (\`AUTOMATIZÁVEL\`).
- **Spotify Web API**: Top 50 Brasil, contagem de streams diários (\`AUTOMATIZÁVEL\`).
- **Google Trends**: Índice relativo de interesse (0–100) na região BR (\`RESOLVÍVEL\`).
- **TikTok Creator Portal**: Contagem de postagens com determinado áudio (\`ELEGÍVEL\`).
- **Fontes Oficiais**: Súmulas esportivas e atas de premiações (\`RESOLVÍVEL\`).`,
    },
    {
      id: 'RESOLUTION.md',
      title: '04. Regras de Resolução',
      summary: 'Determinismo, imutabilidade, consulta de adapters e registro de evidência.',
      content: `# Motor de Resolução & Registro de Evidências

O processo de resolução é o coração da confiança da plataforma.

---

## Princípios de Resolução:
1. **Determinismo**: Dada a mesma evidência de entrada, a resolução deve produzir exatamente o mesmo resultado vencedor.
2. **Imutabilidade**: Uma vez gravado o log de resolução (\`market_resolution_logs\`) e distribuído o pool, a decisão não é alterada sem auditoria transparente.
3. **Auditabilidade Pública**: Qualquer usuário pode inspecionar o payload bruto coletado da fonte, a URL consultada e a data/hora exata da captura.

---

## Fluxo Passo a Passo:
1. **Encerramento** (\`status = CLOSED\`).
2. **Gatilho de Verificação** (Worker Cron ou Endpoint \`/api/markets/:id/resolve\`).
3. **Coleta e Normalização de Dados** via adapter da fonte.
4. **Comparação Lógica** contra a regra especificada.
5. **Gravação do Log de Evidência** com snapshot JSON.
6. **Distribuição Virtual** (70% acertadores, 20% criador, 10% custo operacional).`,
    },
    {
      id: 'ECONOMICS.md',
      title: '05. Créditos & Economia',
      summary: 'Distribuição 70/20/10, capacidade de contratos dos criadores e créditos 100% virtuais.',
      content: `# Economia Virtual de Créditos & Modelo de Criadores

## 1. Créditos Virtuais
- Cada novo usuário recebe uma concessão demonstrativa inicial de **10.000 Créditos**.
- Não há depósito, saque, dinheiro real ou integração financeira.

---

## 2. Divisão do Pool (70% · 20% · 10%)
- **70% para Acertadores**: Distribuído proporcionalmente às unidades detidas na opção vencedora.
- **20% para o Criador do Mercado**: Recompensa para incentivar a criação de perguntas relevantes e atração de participantes.
- **10% para o Custo Operacional da Plataforma**: Sustenta a infraestrutura e os custos de auditoria. Nunca chamado de comissão.

---

## 3. Planos de Criação & Contratos Disponíveis:
- **Plano Pequeno**: 100 contratos disponíveis.
- **Plano Médio**: 500 contratos disponíveis.
- **Plano Grande**: 2.500 contratos disponíveis.
- **Plano Maior**: 10.000 contratos disponíveis.`,
    },
    {
      id: 'ROADMAP.md',
      title: '06. Roadmap Técnico',
      summary: 'Fases de expansão, cron triggers, adapters de produção e governança.',
      content: `# Roadmap Técnico & Evolução

## Fase 1: Fundação & MVP Funcional (Concluído)
- Arquitetura Frontend + Cloudflare Worker + Supabase DDL.
- 4 tipos de mercados operacionais (Resultado, Limiar, Métrica, Ranking).
- Sistema de Créditos virtuais, compra, venda e distribuição 70/20/10.
- Auditoria com registro de evidência JSON.

## Fase 2: Adapters de Produção
- Injeção de chaves reais de YouTube Data API e Spotify Web API.
- Cloudflare Cron Triggers para fechamento pontual em minutos exatos.

## Fase 3: Recursos Sociais
- Renderização de cartões com probabilidade em tempo real para Instagram Stories e WhatsApp.`,
    },
  ];

  const activeDoc = docs.find((d) => d.id === selectedDoc) || docs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Documentação e Arquitetura Versionada</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Especificações do Projeto
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Todos os documentos de produto, modelos de dados e diretrizes arquiteturais registrados no repositório.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-4 space-y-2">
          {docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id)}
              className={`w-full p-4 rounded-xl text-left border transition-all ${
                selectedDoc === doc.id
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">{doc.title}</span>
                <FileText className={`w-3.5 h-3.5 ${selectedDoc === doc.id ? 'text-amber-300' : 'text-neutral-400'}`} />
              </div>
              <div className={`text-[11px] mt-1 line-clamp-2 ${selectedDoc === doc.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {doc.summary}
              </div>
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200">
          <div className="prose prose-neutral max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
            <pre className="whitespace-pre-wrap font-sans text-neutral-800">
              {activeDoc.content}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};
