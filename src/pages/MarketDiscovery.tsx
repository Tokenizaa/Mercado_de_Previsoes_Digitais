import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Category, Market, MarketType } from '../types/market';
import { MarketCard } from '../components/MarketCard';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';

interface MarketDiscoveryProps {
  onNavigate: (path: string) => void;
  initialCategory?: Category | 'all';
}

export const MarketDiscovery: React.FC<MarketDiscoveryProps> = ({
  onNavigate,
  initialCategory = 'all',
}) => {
  const [markets, setMarkets] = useState<Market[]>(marketStore.getMarkets());
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'pool' | 'recent' | 'closing'>('pool');

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      setMarkets(marketStore.getMarkets());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories = [
    { id: 'all', label: 'Todos os Assuntos' },
    { id: 'internet_creators', label: 'Internet & Creators' },
    { id: 'esportes', label: 'Esportes & Lutas' },
    { id: 'musica', label: 'Música & Charts' },
    { id: 'entretenimento', label: 'Entretenimento & TV' },
  ];

  const types = [
    { id: 'all', label: 'Todos os Tipos' },
    { id: 'RESULTADO', label: 'Resultado' },
    { id: 'LIMIAR', label: 'Limiar (Sim/Não)' },
    { id: 'METRICA', label: 'Métrica' },
    { id: 'RANKING', label: 'Ranking' },
  ];

  const filteredMarkets = markets
    .filter((m) => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (selectedType !== 'all' && m.market_type !== selectedType) return false;
      if (selectedStatus === 'open' && m.status !== 'OPEN') return false;
      if (selectedStatus === 'resolved' && m.status !== 'DISTRIBUTED' && m.status !== 'RESOLVED') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.source_name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'pool') return (b.total_pool || 0) - (a.total_pool || 0);
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'closing') return new Date(a.close_at).getTime() - new Date(b.close_at).getTime();
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Descoberta de Mercados
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Explore e assuma posições em eventos digitais verificados da cultura pop e internet.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-4">
        
        {/* Search Input & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por pergunta, creator, artista ou fonte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 font-medium focus:outline-none focus:border-neutral-900"
            >
              <option value="pool">Maior Pool de Créditos</option>
              <option value="recent">Mais Recentes</option>
              <option value="closing">Fechando em Breve</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700 font-medium focus:outline-none focus:border-neutral-900"
            >
              <option value="all">Todos os Status</option>
              <option value="open">Apenas Abertos</option>
              <option value="resolved">Já Resolvidos</option>
            </select>
          </div>
        </div>

        {/* Categories Tab Strip (Segmented control style) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-neutral-100 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Types Filter */}
        <div className="flex items-center gap-2 text-xs pt-1">
          <span className="text-neutral-400 font-medium shrink-0">Tipo:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedType === t.id
                    ? 'bg-neutral-200 text-neutral-900 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Mostrando <strong className="text-neutral-900 font-medium">{filteredMarkets.length}</strong> mercados disponíveis
        </span>
      </div>

      {/* Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-neutral-200 space-y-3">
          <p className="text-neutral-600 text-sm">
            Nenhum mercado encontrado com os filtros selecionados.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}

    </div>
  );
};
