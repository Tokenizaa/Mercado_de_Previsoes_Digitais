import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Category, Market } from '../types/market';
import { MarketCard } from '../components/MarketCard';
import { Search } from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    { id: 'all', label: 'Todos' },
    { id: 'internet_creators', label: 'Internet e Creators' },
    { id: 'esportes', label: 'Esportes e Lutas' },
    { id: 'musica', label: 'Música' },
    { id: 'entretenimento', label: 'Entretenimento' },
  ];

  const filteredMarkets = markets.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (statusFilter === 'open' && m.status !== 'OPEN') return false;
    if (statusFilter === 'resolved' && m.status !== 'DISTRIBUTED' && m.status !== 'RESOLVED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 pb-20">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="font-extrabold text-[32px] sm:text-[40px] text-[#202124] tracking-tight">
          Explorar Palpites
        </h1>
        <p className="text-[18px] text-[#5F6368] mt-1">
          Escolha um assunto, dê o seu palpite e veja se você acerta.
        </p>
      </div>

      {/* Barra de Busca e Filtros Simples */}
      <div className="space-y-4">
        
        {/* Campo de Busca Grande */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#5F6368] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Qual palpite você está procurando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[52px] pl-12 pr-4 bg-white border border-[#E5E7E9] focus:border-[#009344] rounded-2xl text-[16px] text-[#202124] placeholder-[#5F6368] outline-none shadow-xs transition-colors"
          />
        </div>

        {/* Categorias (Abas Grandes com Toque Fácil) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-[44px] px-5 rounded-xl font-bold text-[15px] sm:text-[16px] whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#009344] text-white shadow-xs'
                  : 'bg-white text-[#5F6368] hover:text-[#202124] border border-[#E5E7E9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filtro de Status Direto */}
        <div className="flex items-center gap-2 pt-1 text-sm font-semibold">
          <span className="text-[#5F6368]">Ver:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#E5E7E9] text-[#202124] font-bold'
                : 'text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'open'
                ? 'bg-[#E5E7E9] text-[#202124] font-bold'
                : 'text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Ainda dá para participar
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-[#E5E7E9] text-[#202124] font-bold'
                : 'text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Saiu o resultado
          </button>
        </div>

      </div>

      {/* Grid de Cards */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E7E9] space-y-4">
          <p className="text-[18px] text-[#5F6368]">
            Nenhum palpite encontrado para essa busca.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="h-[48px] px-6 bg-[#009344] text-white font-bold text-[16px] rounded-xl hover:bg-[#007A38] transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      )}

    </div>
  );
};
