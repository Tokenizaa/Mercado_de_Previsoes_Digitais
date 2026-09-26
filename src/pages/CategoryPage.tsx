import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Category, Market } from '../types/market';
import { MarketCard } from '../components/MarketCard';
import { ArrowLeft, Plus } from 'lucide-react';

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
      title: 'Internet & Creators',
      subtitle: 'Disputas de mesacasts, streamers, canais do YouTube e criadores digitais brasileiros.',
      categoryKey: 'internet_creators',
    },
    esportes: {
      title: 'Esportes & Lutas',
      subtitle: 'Combates do Fight Music Show, transmissões de CazéTV e grandes finais esportivas.',
      categoryKey: 'esportes',
    },
    musica: {
      title: 'Música & Streaming',
      subtitle: 'Top 50 Brasil no Spotify, lançamentos e prêmios como o Prêmio Multishow.',
      categoryKey: 'musica',
    },
    entretenimento: {
      title: 'Entretenimento & TV',
      subtitle: 'Programas de auditório, realities, premiações e métricas consolidadas de Ibope.',
      categoryKey: 'entretenimento',
    },
  };

  const current = categoryDetails[categorySlug] || {
    title: 'Categoria',
    subtitle: 'Mercados de previsões sobre acontecimentos populares.',
    categoryKey: 'internet_creators' as Category,
  };

  const filtered = markets.filter((m) => m.category === current.categoryKey);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <button
        onClick={() => onNavigate('/mercados')}
        className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para Descoberta</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
            {current.title}
          </h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            {current.subtitle}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/criar')}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Mercado nesta Categoria</span>
        </button>
      </div>

      <div className="text-xs text-neutral-500">
        Mostrando <strong className="text-neutral-900">{filtered.length}</strong> mercados disponíveis
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
