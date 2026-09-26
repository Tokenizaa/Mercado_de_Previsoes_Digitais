import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Category, Market } from '../types/market';
import { MarketCard } from '../components/MarketCard';
import { ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, onNavigate }) => {
  const [markets, setMarkets] = useState<Market[]>(marketStore.getMarkets());

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      setMarkets(marketStore.getMarkets());
    });
    return unsub;
  }, []);

  const categoryDetails: Record<
    string,
    { title: string; subtitle: string; categoryKey: Category }
  > = {
    internet_creators: {
      title: 'Internet e Creators',
      subtitle: 'Disputas de canais, streamers, mesacasts e grandes criadores digitais brasileiros.',
      categoryKey: 'internet_creators',
    },
    esportes: {
      title: 'Esportes e Lutas',
      subtitle: 'Combates, eventos esportivos e transmissões de grandes decisões.',
      categoryKey: 'esportes',
    },
    musica: {
      title: 'Música e Streaming',
      subtitle: 'Lançamentos, paradas de streaming e premiações musicais.',
      categoryKey: 'musica',
    },
    entretenimento: {
      title: 'Entretenimento e TV',
      subtitle: 'Realities, estreias, programas e momentos marcantes da cultura pop.',
      categoryKey: 'entretenimento',
    },
  };

  const current = categoryDetails[categorySlug] || {
    title: 'Palpites',
    subtitle: 'Palpites sobre acontecimentos populares da internet.',
    categoryKey: 'internet_creators' as Category,
  };

  const filtered = markets.filter((m) => m.category === current.categoryKey);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 pb-24">
      
      <button
        onClick={() => onNavigate('/mercados')}
        className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F6368] hover:text-[#202124] transition-colors py-1"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar para Explorar</span>
      </button>

      <div>
        <h1 className="font-extrabold text-[32px] sm:text-[40px] text-[#202124] tracking-tight">
          {current.title}
        </h1>
        <p className="text-[18px] text-[#5F6368] mt-1 max-w-2xl">
          {current.subtitle}
        </p>
      </div>

      <div className="text-sm font-semibold text-[#5F6368]">
        Mostrando <strong className="text-[#202124]">{filtered.length}</strong> palpites disponíveis
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((market) => (
          <MarketCard
            key={market.id}
            market={market}
            onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
          />
        ))}
      </div>

    </div>
  );
};
