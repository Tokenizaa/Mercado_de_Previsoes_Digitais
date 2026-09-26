import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Market } from '../types/market';
import { calculateEconomics } from '../../worker/src/engine';
import { ArrowRight, Coins, Plus, ShieldCheck, Users } from 'lucide-react';

interface MyMarketsProps {
  onNavigate: (path: string) => void;
}

export const MyMarkets: React.FC<MyMarketsProps> = ({ onNavigate }) => {
  const currentUser = marketStore.getCurrentUser();
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      const all = marketStore.getMarkets();
      setMarkets(all.filter((m) => m.creator_id === currentUser.id));
    });
    const all = marketStore.getMarkets();
    setMarkets(all.filter((m) => m.creator_id === currentUser.id));
    return unsub;
  }, [currentUser.id]);

  const totalRewardsAccumulated = markets.reduce((sum, m) => {
    if (m.status === 'DISTRIBUTED') {
      const econ = calculateEconomics(m.total_pool);
      return sum + econ.creator_reward;
    }
    return sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
            Meus Mercados Publicados
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Gerencie os mercados criados por você, monitore a capacidade de contratos e suas recompensas de criador (20%).
          </p>
        </div>

        <button
          onClick={() => onNavigate('/criar')}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Mercado</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-neutral-200">
          <div className="text-xs text-neutral-500 mb-1">Mercados Criados</div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {markets.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Total de perguntas publicadas</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200">
          <div className="text-xs text-neutral-500 mb-1">Recompensa Acumulada de Criador (20%)</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-amber-500" />
            <span>{totalRewardsAccumulated.toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Créditos de mercados distribuídos</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200">
          <div className="text-xs text-neutral-500 mb-1">Pool Total Mobilizado</div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {markets.reduce((s, m) => s + m.total_pool, 0).toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Créditos nas opções dos seus mercados</div>
        </div>
      </div>

      {/* Lista de Mercados */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-neutral-900">
            Mercados Ativos e Resolvidos
          </h2>
          <span className="text-xs text-neutral-400">
            Modelo: 70% Acertadores · 20% Criador · 10% Custo Operacional
          </span>
        </div>

        {markets.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {markets.map((m) => {
              const econ = calculateEconomics(m.total_pool);
              const isResolved = m.status === 'DISTRIBUTED' || m.status === 'RESOLVED';

              return (
                <div key={m.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-800 uppercase">{m.category.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{m.market_type}</span>
                      <span>·</span>
                      <span className={isResolved ? 'text-emerald-700 font-semibold' : 'text-neutral-700'}>
                        Status: {m.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-neutral-900">
                      {m.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                      <span>Pool: <strong className="text-neutral-900 tabular-nums">{m.total_pool.toLocaleString('pt-BR')}</strong> Créditos</span>
                      <span>Sua recompensa de criador (20%): <strong className="text-emerald-700 tabular-nums">{econ.creator_reward.toLocaleString('pt-BR')}</strong></span>
                      <span>Fonte: <strong className="text-neutral-700">{m.source_name || m.source_type}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate(`/mercados/${m.slug}`)}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Acessar Mercado</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-500 text-xs space-y-3">
            <p>Você ainda não publicou nenhum mercado com este perfil.</p>
            <button
              onClick={() => onNavigate('/criar')}
              className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg text-xs"
            >
              Criar Meu Primeiro Mercado
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
