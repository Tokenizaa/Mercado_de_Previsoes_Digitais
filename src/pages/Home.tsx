import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Market } from '../types/market';
import { MarketCard } from '../components/MarketCard';
import { ArrowRight, CheckCircle, Database, Search, ShieldCheck, TrendingUp, Users } from 'lucide-react';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [markets, setMarkets] = useState<Market[]>(marketStore.getMarkets());

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      setMarkets(marketStore.getMarkets());
    });
    return unsub;
  }, []);

  const featuredMarkets = markets.filter((m) => m.featured).slice(0, 3);
  const creatorsMarkets = markets.filter((m) => m.category === 'internet_creators').slice(0, 4);
  const sportsMarkets = markets.filter((m) => m.category === 'esportes').slice(0, 4);
  const musicMarkets = markets.filter((m) => m.category === 'musica').slice(0, 4);
  const entertainmentMarkets = markets.filter((m) => m.category === 'entretenimento').slice(0, 4);

  return (
    <div className="space-y-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              
              {/* Quiet unboxed kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                <span>Mercados de Previsão Cultural e Digital</span>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="text-emerald-700 font-medium">Dados Verificáveis</span>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span>Créditos Virtuais</span>
              </div>

              {/* Dominant Headline */}
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-neutral-900 tracking-tight leading-[1.08] text-balance">
                O que você acha que vai acontecer?
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl text-balance">
                Antecipe o resultado de disputas de creators, paradas de música, eventos esportivos e tendências da internet brasileira com resolução baseada em métricas auditáveis.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('/mercados')}
                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <span>Explorar Mercados</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('/criar')}
                  className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-sm font-semibold transition-colors"
                >
                  Criar Novo Mercado
                </button>
              </div>

              {/* Micro proof points */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-500 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Resolução via APIs e Súmulas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-neutral-700" />
                  <span>Divisão Transparente 70 / 20 / 10</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>10.000 Créditos Iniciais para Testar</span>
                </div>
              </div>

            </div>

            {/* Hero Visual Asset */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md aspect-[16/10] bg-neutral-100">
                <img
                  src="/src/assets/images/hero_brazil_creators_1790456745699.jpg"
                  alt="Estúdio de criação de conteúdo digital e cultura pop"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-wider text-neutral-300 font-semibold mb-1">
                    Em Destaque Agora
                  </span>
                  <h3 className="font-semibold text-lg text-white leading-snug">
                    {featuredMarkets[0]?.title || 'Disputas populares da internet e creators'}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-200">
                    <span>Pool: {featuredMarkets[0]?.total_pool.toLocaleString('pt-BR')} Créditos</span>
                    <button
                      onClick={() => onNavigate(`/mercados/${featuredMarkets[0]?.slug}`)}
                      className="px-3 py-1 bg-white text-neutral-900 font-semibold rounded-lg text-xs hover:bg-neutral-100 transition-colors"
                    >
                      Dar Previsão
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">

        {/* 2. Em Alta Agora */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Tendências
              </div>
              <h2 className="font-display font-bold text-2xl text-neutral-900 tracking-tight">
                Em alta agora
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/mercados')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 3. Destaque Conceitual: Enquete vs Mercado com Auditabilidade */}
        <section className="bg-neutral-900 text-white rounded-2xl p-8 sm:p-10">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Princípio de Arquitetura
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white">
              Por que somos um mercado e não uma enquete?
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Uma enquete pergunta <em>"Em quem você vota?"</em> e mede apenas preferências imediatas. Nosso produto pergunta <em>"O que você acha que vai acontecer?"</em>, exigindo regra de resolução, prazo, evidência verificável na fonte e distribuição matemática aos participantes com maior precisão.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-white">1. Dado Objetivo</div>
                <div className="text-neutral-400">Todo mercado é vinculado a um identificador verificável (YouTube, Spotify, etc.).</div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-white">2. Posição & Venda</div>
                <div className="text-neutral-400">Você pode manter até a resolução ou liquidar sua posição antecipadamente.</div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-white">3. Divisão do Pool</div>
                <div className="text-neutral-400">70% para acertadores, 20% para o criador e 10% de custo operacional.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Internet & Creators */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Podcasts, Vídeos & Streamers
              </div>
              <h2 className="font-display font-bold text-2xl text-neutral-900 tracking-tight">
                Internet & Creators
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/internet_creators')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>Ver categoria</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creatorsMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 5. Esportes e Disputas Digitais */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Ringue, Arenas & Streaming
              </div>
              <h2 className="font-display font-bold text-2xl text-neutral-900 tracking-tight">
                Esportes & Lutas
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/esportes')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>Ver categoria</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sportsMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 6. Música e Charts */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Spotify, Top Brasil & Festivais
              </div>
              <h2 className="font-display font-bold text-2xl text-neutral-900 tracking-tight">
                Música & Streaming
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/musica')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>Ver categoria</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {musicMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 7. Entretenimento & Cultura Pop */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Premiações, Séries & TV
              </div>
              <h2 className="font-display font-bold text-2xl text-neutral-900 tracking-tight">
                Entretenimento & TV
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/entretenimento')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
            >
              <span>Ver categoria</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {entertainmentMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 8. Call to action para Criadores */}
        <section className="bg-neutral-100 rounded-2xl p-8 sm:p-10 border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-neutral-900">
              Tem uma audiência ou quer criar seu próprio mercado?
            </h3>
            <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
              Defina a pergunta, vincule uma fonte pública verificável e compartilhe com sua comunidade. Criadores recebem 20% do pool de créditos virtuais gerado pelo mercado.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/criar')}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            Começar Como Criador
          </button>
        </section>

      </div>
    </div>
  );
};
