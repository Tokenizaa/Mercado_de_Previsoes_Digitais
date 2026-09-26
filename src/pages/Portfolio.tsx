import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Position } from '../types/market';
import { Coins, CheckCircle2, Clock, Sparkles, ArrowRight, LogOut, ChevronRight } from 'lucide-react';

interface PortfolioProps {
  onNavigate: (path: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(marketStore.getCurrentUser());
  const [positions, setPositions] = useState<Position[]>(marketStore.getUserPositions());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      setCurrentUser(marketStore.getCurrentUser());
      setPositions(marketStore.getUserPositions());
    });
    return unsub;
  }, []);

  const openPositions = positions.filter((p) => p.status === 'OPEN');
  const wonPositions = positions.filter((p) => p.status === 'WON');
  const lostPositions = positions.filter((p) => p.status === 'LOST');

  const filteredPositions = positions.filter((p) => {
    if (filter === 'open') return p.status === 'OPEN';
    if (filter === 'resolved') return p.status !== 'OPEN';
    return true;
  });

  const handleSair = async (posId: string) => {
    if (!window.confirm('Quer sair deste palpite e receber seus créditos de volta?')) return;
    const res = await marketStore.sellPosition(posId);
    if (res.success) {
      setFeedback('Você saiu do palpite com sucesso. Seus créditos foram devolvidos!');
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 pb-24">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="font-extrabold text-[32px] sm:text-[40px] text-[#202124] tracking-tight">
          Meus palpites
        </h1>
        <p className="text-[18px] text-[#5F6368] mt-1">
          Acompanhe suas escolhas e veja se você acertou.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#009344] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Cartões de Resumo Simples */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Meus Créditos */}
        <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9] shadow-xs">
          <div className="flex items-center justify-between text-sm font-bold text-[#5F6368] mb-1">
            <span>Meus créditos</span>
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-[28px] font-extrabold text-[#009344] tabular-nums">
            {currentUser.credits_balance.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-[#5F6368] mt-0.5">Saldo disponível para palpitar</div>
        </div>

        {/* Em Andamento */}
        <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9] shadow-xs">
          <div className="flex items-center justify-between text-sm font-bold text-[#5F6368] mb-1">
            <span>Em andamento</span>
            <Clock className="w-5 h-5 text-[#5F6368]" />
          </div>
          <div className="text-[28px] font-extrabold text-[#202124] tabular-nums">
            {openPositions.length}
          </div>
          <div className="text-xs text-[#5F6368] mt-0.5">Palpites aguardando o resultado</div>
        </div>

        {/* Você Acertou */}
        <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9] shadow-xs">
          <div className="flex items-center justify-between text-sm font-bold text-[#5F6368] mb-1">
            <span>Você acertou</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-[28px] font-extrabold text-[#007A38] tabular-nums">
            {wonPositions.length}
          </div>
          <div className="text-xs text-[#5F6368] mt-0.5">Palpites que deram certo</div>
        </div>

      </div>

      {/* Filtros Simples */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`h-10 px-4 rounded-xl font-bold text-sm transition-colors ${
            filter === 'all'
              ? 'bg-[#202124] text-white'
              : 'bg-white text-[#5F6368] hover:text-[#202124] border border-[#E5E7E9]'
          }`}
        >
          Todos ({positions.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`h-10 px-4 rounded-xl font-bold text-sm transition-colors ${
            filter === 'open'
              ? 'bg-[#202124] text-white'
              : 'bg-white text-[#5F6368] hover:text-[#202124] border border-[#E5E7E9]'
          }`}
        >
          Em andamento ({openPositions.length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`h-10 px-4 rounded-xl font-bold text-sm transition-colors ${
            filter === 'resolved'
              ? 'bg-[#202124] text-white'
              : 'bg-white text-[#5F6368] hover:text-[#202124] border border-[#E5E7E9]'
          }`}
        >
          Encerrados ({wonPositions.length + lostPositions.length})
        </button>
      </div>

      {/* Lista de Palpites */}
      <div className="space-y-4">
        {filteredPositions.length > 0 ? (
          filteredPositions.map((pos) => {
            const market = marketStore.getMarketById(pos.market_id);
            const isMarketClosed = market?.status === 'CLOSED' || market?.status === 'AWAITING_RESULT';
            const isMarketResolved = market?.status === 'DISTRIBUTED' || market?.status === 'RESOLVED';
            const userWon = pos.status === 'WON';
            const userLost = pos.status === 'LOST';

            return (
              <div
                key={pos.id}
                className="bg-white rounded-3xl border border-[#E5E7E9] p-6 space-y-4 shadow-xs transition-all hover:border-[#009344]"
              >
                {/* Título do Palpite */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-[20px] text-[#202124] leading-snug">
                      {pos.market_title}
                    </h3>
                  </div>

                  {/* Badge de Status Simples */}
                  <div className="shrink-0">
                    {userWon ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#009344]/10 text-[#007A38] font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Você acertou!</span>
                      </span>
                    ) : userLost ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 text-[#5F6368] font-bold text-xs">
                        Você não acertou dessa vez
                      </span>
                    ) : isMarketClosed ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                        Esperando o resultado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#009344]/10 text-[#007A38] font-bold text-xs">
                        Ainda dá para participar
                      </span>
                    )}
                  </div>
                </div>

                {/* Escolha do Usuário */}
                <div className="p-4 rounded-2xl bg-[#F7F8F7] border border-[#E5E7E9] flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider block">
                      Sua escolha
                    </span>
                    <span className="font-extrabold text-[18px] text-[#202124]">
                      {pos.option_label}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#5F6368] block">
                      Créditos usados
                    </span>
                    <span className="font-extrabold text-[16px] text-[#202124] tabular-nums">
                      {pos.credits_spent.toLocaleString('pt-BR')} créditos
                    </span>
                  </div>
                </div>

                {/* Resultado do acerto com créditos ganhos */}
                {userWon && pos.credits_payout && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold text-sm flex items-center justify-between">
                    <span>Parabéns pelo acerto!</span>
                    <span className="text-base text-[#007A38] font-extrabold">
                      +{pos.credits_payout.toLocaleString('pt-BR')} créditos
                    </span>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7E9] flex-wrap gap-2">
                  <div>
                    {pos.status === 'OPEN' && !isMarketClosed && !isMarketResolved && (
                      <button
                        onClick={() => handleSair(pos.id)}
                        className="text-sm font-bold text-[#5F6368] hover:text-rose-600 transition-colors flex items-center gap-1.5 py-1.5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair deste palpite</span>
                      </button>
                    )}
                  </div>

                  {pos.market_slug && (
                    <button
                      onClick={() => onNavigate(`/mercados/${pos.market_slug}`)}
                      className="h-11 px-5 bg-[#009344] hover:bg-[#007A38] text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors ml-auto"
                    >
                      <span>Ver palpite</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E7E9] space-y-4">
            <p className="text-[18px] text-[#5F6368]">
              Você ainda não deu nenhum palpite nessa seção.
            </p>
            <button
              onClick={() => onNavigate('/mercados')}
              className="h-[52px] px-8 bg-[#009344] hover:bg-[#007A38] text-white font-extrabold text-[16px] rounded-2xl transition-colors shadow-xs"
            >
              Explorar palpites em alta
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
