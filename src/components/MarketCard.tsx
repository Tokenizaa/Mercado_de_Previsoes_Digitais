import React from 'react';
import { Market } from '../types/market';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onSelect: (slug: string) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onSelect }) => {
  const isResolved = market.status === 'DISTRIBUTED' || market.status === 'RESOLVED';
  const isClosed = market.status === 'CLOSED' || market.status === 'AWAITING_RESULT' || isResolved;

  // Formatação de prazo amigável em português
  const closeDate = new Date(market.close_at);
  const formattedClose = closeDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const winnerOption = market.options.find((o) => o.result === 'WINNER');

  return (
    <article
      onClick={() => onSelect(market.slug)}
      className="group cursor-pointer bg-white rounded-3xl border border-[#E5E7E9] hover:border-[#009344] transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Imagem do Evento */}
        {market.image_url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F7F8F7]">
            <img
              src={market.image_url}
              alt={market.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />

            {/* Badge de Status Simples */}
            <div className="absolute top-3 left-3">
              {isResolved ? (
                <div className="bg-[#202124]/90 backdrop-blur-xs text-white text-[13px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#009344]" />
                  <span>Saiu o resultado</span>
                </div>
              ) : isClosed ? (
                <div className="bg-amber-600/90 backdrop-blur-xs text-white text-[13px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                  Esperando o resultado
                </div>
              ) : (
                <div className="bg-[#009344] text-white text-[13px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                  Ainda dá para participar
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Prazo Curto e Direto */}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#5F6368] mb-2">
            <Clock className="w-4 h-4 text-[#5F6368]" />
            <span>
              {isResolved
                ? 'Concluído'
                : isClosed
                ? 'Já fechou'
                : `Fecha em ${formattedClose}`}
            </span>
          </div>

          {/* PERGUNTA GRANDE (22–26px, bold 700) */}
          <h3 className="font-extrabold text-[22px] sm:text-[24px] text-[#202124] leading-snug group-hover:text-[#007A38] transition-colors mb-5 line-clamp-3">
            {market.title}
          </h3>

          {/* ESCOLHAS GRANDES */}
          <div className="space-y-3 mb-6">
            {market.options.slice(0, 3).map((opt) => {
              const isWinner = opt.result === 'WINNER';

              return (
                <div
                  key={opt.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isWinner
                      ? 'border-[#009344] bg-[#009344]/5'
                      : 'border-[#E5E7E9] bg-[#F7F8F7]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202124] text-[16px] truncate max-w-[210px]">
                      {opt.label}
                    </span>
                    <span className="font-extrabold text-[16px] text-[#007A38] tabular-nums">
                      {opt.current_probability}% de chance
                    </span>
                  </div>

                  {/* Barra de Chance Simples */}
                  <div className="w-full h-2 bg-[#E5E7E9] rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isWinner ? 'bg-[#009344]' : 'bg-[#007A38]'
                      }`}
                      style={{ width: `${opt.current_probability}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {market.options.length > 3 && (
              <div className="text-center text-xs font-bold text-[#5F6368] pt-1">
                + mais {market.options.length - 3} opções
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTÃO GRANDE DE AÇÃO (mínimo 52px de altura) */}
      <div className="p-6 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(market.slug);
          }}
          className={`w-full h-[52px] rounded-2xl font-extrabold text-[17px] flex items-center justify-center gap-2 transition-all shadow-sm ${
            isResolved
              ? 'bg-[#202124] hover:bg-[#333] text-white'
              : 'bg-[#009344] hover:bg-[#007A38] text-white'
          }`}
        >
          <span>{isResolved ? 'Ver o resultado' : 'Dar meu palpite'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </article>
  );
};
