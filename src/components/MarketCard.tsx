import React from 'react';
import { Market } from '../types/market';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onSelect: (slug: string) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onSelect }) => {
  const categoryLabels: Record<string, string> = {
    internet_creators: 'Internet & Creators',
    esportes: 'Esportes',
    musica: 'Música',
    entretenimento: 'Entretenimento',
  };

  const typeLabels: Record<string, string> = {
    RESULTADO: 'Resultado',
    LIMIAR: 'Limiar',
    METRICA: 'Métrica',
    RANKING: 'Ranking',
  };

  // Encontra a opção líder
  const leadingOption = [...market.options].sort(
    (a, b) => b.current_probability - a.current_probability
  )[0];

  const isResolved = market.status === 'DISTRIBUTED' || market.status === 'RESOLVED';

  // Formata data de fechamento
  const closeDate = new Date(market.close_at);
  const formattedClose = closeDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <article
      onClick={() => onSelect(market.slug)}
      className="group cursor-pointer bg-white rounded-xl border border-neutral-200/90 hover:border-neutral-400/80 transition-all duration-200 overflow-hidden flex flex-col justify-between h-full"
    >
      <div>
        {/* Imagem do Evento com fallback resiliente */}
        {market.image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
            <img
              src={market.image_url}
              alt={market.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onError={(e) => {
                // Fallback visual silencioso sem quebrar layout
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {isResolved && (
              <div className="absolute top-2.5 right-2.5 bg-neutral-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resolvido</span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Metadata unboxed com separadores tipográficos (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2.5 flex-wrap">
            <span className="font-medium text-neutral-700">
              {categoryLabels[market.category] || market.category}
            </span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Tipo {typeLabels[market.market_type]}</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>Fecha em {formattedClose}</span>
            </span>
          </div>

          {/* Título / Pergunta do Mercado */}
          <h3 className="font-semibold text-neutral-900 text-base leading-snug group-hover:text-neutral-700 transition-colors mb-3 line-clamp-2">
            {market.title}
          </h3>

          {/* Opções e Probabilidade */}
          <div className="space-y-2 mb-4">
            {market.options.slice(0, 2).map((opt) => (
              <div key={opt.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700 font-medium truncate max-w-[200px]">
                    {opt.label}
                  </span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {opt.current_probability}%
                  </span>
                </div>
                {/* Barra de probabilidade sutil */}
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                    style={{ width: `${opt.current_probability}%` }}
                  />
                </div>
              </div>
            ))}
            {market.options.length > 2 && (
              <div className="text-[11px] text-neutral-400 pt-0.5">
                + {market.options.length - 2} outras opções
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé do Card */}
      <div className="px-5 py-3.5 bg-neutral-50/70 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <div>
          <span>Pool: </span>
          <span className="font-semibold text-neutral-900 tabular-nums">
            {market.total_pool.toLocaleString('pt-BR')}
          </span>
          <span className="text-neutral-400"> Créditos</span>
        </div>

        <div className="truncate max-w-[130px] text-right text-neutral-500">
          Fonte: <span className="text-neutral-700 font-medium">{market.source_name || 'Auditada'}</span>
        </div>
      </div>
    </article>
  );
};
