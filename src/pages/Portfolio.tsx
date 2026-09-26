import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Position } from '../types/market';
import { Coins, CheckCircle, Clock, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

interface PortfolioProps {
  onNavigate: (path: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(marketStore.getCurrentUser());
  const [positions, setPositions] = useState<Position[]>(marketStore.getUserPositions());
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      setCurrentUser(marketStore.getCurrentUser());
      setPositions(marketStore.getUserPositions());
    });
    return unsub;
  }, []);

  const openPositions = positions.filter((p) => p.status === 'OPEN');
  const resolvedPositions = positions.filter((p) => p.status !== 'OPEN');

  const totalCreditsSpent = positions.reduce((sum, p) => sum + p.credits_spent, 0);
  const totalPayoutsWon = positions
    .filter((p) => p.status === 'WON')
    .reduce((sum, p) => sum + (p.credits_payout || 0), 0);

  const handleQuickSell = (posId: string) => {
    const res = marketStore.sellPosition(posId);
    if (res.success) {
      setFeedback('Posição liquidada com sucesso! Créditos reembolsados.');
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Seu Portfólio de Previsões
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Acompanhe suas posições abertas, liquidações e retornos obtidos em Créditos virtuais.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Saldo Atual</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {currentUser.credits_balance.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Créditos de demonstração</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Posições Ativas</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {openPositions.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Mercados em andamento</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Créditos Alocados</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {openPositions.reduce((s, p) => s + p.credits_spent, 0).toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Em posições abertas</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Retornos Recebidos</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {totalPayoutsWon.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Total de acertos resolvidos</div>
        </div>

      </div>

      {/* Posições Abertas */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-neutral-900">
            Posições Abertas ({openPositions.length})
          </h2>
          <span className="text-xs text-neutral-400">
            Você pode vender sua posição a qualquer momento antes do fechamento
          </span>
        </div>

        {openPositions.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {openPositions.map((pos) => {
              const market = marketStore.getMarketById(pos.market_id);
              const option = market?.options.find((o) => o.id === pos.option_id);
              const estProb = option?.current_probability || 50;
              const estLiquidation = Math.floor(pos.units * (estProb / 100) * 100 * 0.95);

              return (
                <div key={pos.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs text-neutral-500">
                      Mercado: <span className="font-medium text-neutral-700">{pos.market_title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-neutral-900">
                        {pos.option_label}
                      </span>
                      <span className="text-xs font-semibold text-neutral-600 tabular-nums">
                        Probabilidade atual: {estProb}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
                      <span>Unidades: <strong className="text-neutral-900 tabular-nums">{pos.units}</strong></span>
                      <span>Créditos gastos: <strong className="text-neutral-900 tabular-nums">{pos.credits_spent}</strong></span>
                      <span>Est. liquidação: <strong className="text-emerald-700 tabular-nums">~{estLiquidation} Créditos</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleQuickSell(pos.id)}
                      className="px-3.5 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors"
                    >
                      Vender Posição
                    </button>
                    {pos.market_slug && (
                      <button
                        onClick={() => onNavigate(`/mercados/${pos.market_slug}`)}
                        className="px-3.5 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Abrir Mercado</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-500 text-xs space-y-3">
            <p>Você ainda não possui posições abertas.</p>
            <button
              onClick={() => onNavigate('/mercados')}
              className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg text-xs"
            >
              Explorar Mercados
            </button>
          </div>
        )}
      </div>

      {/* Histórico / Posições Resolvidas */}
      {resolvedPositions.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-display font-bold text-lg text-neutral-900">
              Histórico de Posições Resolvidas e Liquidadas ({resolvedPositions.length})
            </h2>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {resolvedPositions.map((pos) => (
              <div key={pos.id} className="p-5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">{pos.market_title}</div>
                  <div className="text-neutral-500 mt-0.5">
                    Opção: <strong>{pos.option_label}</strong> · {pos.credits_spent} Créditos alocados
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold tabular-nums ${pos.status === 'WON' ? 'text-emerald-700' : 'text-neutral-500'}`}>
                    {pos.status === 'WON'
                      ? `+${(pos.credits_payout || 0).toLocaleString('pt-BR')} Créditos`
                      : pos.status === 'CLOSED'
                      ? `Liquidado (+${pos.credits_payout || 0} Créditos)`
                      : 'Não premiado'}
                  </div>
                  <div className="text-[10px] text-neutral-400 capitalize">{pos.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
