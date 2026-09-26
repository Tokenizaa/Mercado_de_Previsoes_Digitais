import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Market } from '../types/market';
import { MarketCard } from '../components/MarketCard';
import { ArrowRight, Flame, Sparkles, TrendingUp, Radio, Trophy, Music, Tv } from 'lucide-react';

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

  const featuredMarket = markets.find((m) => m.featured) || markets[0];
  const emAltaMarkets = markets.slice(0, 3);
  const acontecendoAgora = markets.filter((m) => m.status === 'OPEN').slice(0, 3);
  const creatorsMarkets = markets.filter((m) => m.category === 'internet_creators').slice(0, 3);
  const sportsMarkets = markets.filter((m) => m.category === 'esportes').slice(0, 3);
  const musicMarkets = markets.filter((m) => m.category === 'musica').slice(0, 3);
  const entertainmentMarkets = markets.filter((m) => m.category === 'entretenimento').slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      
      {/* 1. Hero Principal: O QUE VAI ACONTECER? */}
      <section className="bg-white border-b border-[#E5E7E9] pt-8 pb-12 sm:pt-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-6">
            
            {/* Tag amigável */}
            <div className="inline-flex items-center gap-2 bg-[#F7F8F7] text-[#007A38] px-3.5 py-1.5 rounded-full text-sm font-bold border border-[#E5E7E9]">
              <Sparkles className="w-4 h-4 text-[#009344]" />
              <span>Acontecendo agora na internet</span>
            </div>

            {/* Pergunta Gigante */}
            <h1 className="font-extrabold text-[34px] sm:text-[46px] lg:text-[54px] text-[#202124] tracking-tight leading-[1.08]">
              O que você acha que vai acontecer?
            </h1>

            <p className="text-[18px] sm:text-[20px] text-[#5F6368] font-normal leading-relaxed max-w-2xl">
              Escolha quem ganha, acompanhe ao vivo e veja o resultado de verdade. Simples e rápido.
            </p>

            {/* Destaque Principal (Card Gigante) */}
            {featuredMarket && (
              <div
                onClick={() => onNavigate(`/mercados/${featuredMarket.slug}`)}
                className="mt-6 cursor-pointer bg-[#F7F8F7] hover:bg-white border-2 border-[#E5E7E9] hover:border-[#009344] rounded-3xl p-6 sm:p-8 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-[#007A38] uppercase tracking-wider mb-2">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Palpite mais falado de hoje</span>
                </div>

                <h2 className="font-extrabold text-[24px] sm:text-[30px] text-[#202124] leading-snug mb-5">
                  {featuredMarket.title}
                </h2>

                {/* Grid das Escolhas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {featuredMarket.options.slice(0, 2).map((opt) => (
                    <div
                      key={opt.id}
                      className="bg-white p-4 rounded-2xl border border-[#E5E7E9] flex items-center justify-between"
                    >
                      <span className="font-bold text-[#202124] text-[17px]">
                        {opt.label}
                      </span>
                      <span className="font-extrabold text-[16px] text-[#009344]">
                        {opt.current_probability}% de chance
                      </span>
                    </div>
                  ))}
                </div>

                {/* Botão Gigante de Ação */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(`/mercados/${featuredMarket.slug}`);
                  }}
                  className="w-full sm:w-auto h-[56px] px-8 bg-[#009344] hover:bg-[#007A38] text-white font-extrabold text-[18px] rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Dar meu palpite agora</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Conteúdo com Seções Simples */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-14">
        
        {/* 2. Em Alta */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <h2 className="font-extrabold text-[24px] sm:text-[28px] text-[#202124]">
                Em alta
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/mercados')}
              className="text-[16px] font-bold text-[#009344] hover:text-[#007A38] flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emAltaMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 3. Acontecendo Agora */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#009344]">
                <Radio className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-[24px] sm:text-[28px] text-[#202124]">
                Acontecendo agora
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/mercados')}
              className="text-[16px] font-bold text-[#009344] hover:text-[#007A38] flex items-center gap-1"
            >
              <span>Ver mais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {acontecendoAgora.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 4. Internet & Creators */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-[24px] sm:text-[28px] text-[#202124]">
                Internet e Creators
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/internet_creators')}
              className="text-[16px] font-bold text-[#009344] hover:text-[#007A38] flex items-center gap-1"
            >
              <span>Ver mais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creatorsMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 5. Esportes e Lutas */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-[24px] sm:text-[28px] text-[#202124]">
                Esportes e Lutas
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/esportes')}
              className="text-[16px] font-bold text-[#009344] hover:text-[#007A38] flex items-center gap-1"
            >
              <span>Ver mais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sportsMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 6. Música */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Music className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-[24px] sm:text-[28px] text-[#202124]">
                Música e Paradas
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/musica')}
              className="text-[16px] font-bold text-[#009344] hover:text-[#007A38] flex items-center gap-1"
            >
              <span>Ver mais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {musicMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

        {/* 7. Entretenimento & TV */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Tv className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-[24px] sm:text-[28px] text-[#202124]">
                Entretenimento
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categorias/entretenimento')}
              className="text-[16px] font-bold text-[#009344] hover:text-[#007A38] flex items-center gap-1"
            >
              <span>Ver mais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {entertainmentMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
