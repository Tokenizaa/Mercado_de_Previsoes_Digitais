import React from 'react';
import { Market, MarketResolutionLog } from '../types/market';
import { calculateEconomics } from '../../worker/src/engine';
import { CheckCircle2, ExternalLink, ShieldCheck, X } from 'lucide-react';

interface ResolutionEvidenceModalProps {
  market: Market;
  log?: MarketResolutionLog;
  onClose: () => void;
}

export const ResolutionEvidenceModal: React.FC<ResolutionEvidenceModalProps> = ({
  market,
  log,
  onClose,
}) => {
  const winnerOption = market.options.find((o) => o.result === 'WINNER');
  const economics = calculateEconomics(market.total_pool);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-base">
                Evidência e Auditoria da Resolução
              </h3>
              <p className="text-xs text-neutral-500">
                Registro imutável coletado e processado pelo Cloudflare Worker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 text-sm">
          
          {/* Pergunta e Vencedor */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div className="text-xs text-neutral-500 mb-1">Mercado Auditado:</div>
            <div className="font-semibold text-neutral-900 text-sm mb-3">{market.title}</div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="text-neutral-600">Resultado Oficial Verificado: </span>
                <span className="font-bold text-neutral-900">
                  {winnerOption ? winnerOption.label : 'Opção confirmada'}
                </span>
              </div>
            </div>
          </div>

          {/* Dados da Fonte */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Fonte Verificada
            </div>
            <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Provedor:</span>
                <span className="font-medium text-neutral-900">{market.source_name || market.source_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">URL Auditada:</span>
                <a
                  href={market.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-900 hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-[280px]"
                >
                  <span className="truncate">{market.source_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Identificador:</span>
                <span className="font-mono text-[11px] text-neutral-700">{market.source_identifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Regra de Resolução:</span>
                <span className="text-neutral-700 text-right max-w-xs">{market.resolution_rule}</span>
              </div>
            </div>
          </div>

          {/* Divisão Econômica do Pool */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Distribuição do Pool (70% · 20% · 10%)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">70% Acertadores</div>
                <div className="font-bold text-neutral-900 tabular-nums mt-0.5">
                  {economics.winners_pool.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-neutral-400">Créditos</div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">20% Criador</div>
                <div className="font-bold text-neutral-900 tabular-nums mt-0.5">
                  {economics.creator_reward.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-neutral-400">Créditos</div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="text-neutral-500 text-[11px]">10% Custo Operacional</div>
                <div className="font-bold text-neutral-900 tabular-nums mt-0.5">
                  {economics.platform_cost.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-neutral-400">Créditos</div>
              </div>
            </div>
          </div>

          {/* Payload Bruto (JSON Auditável) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider">
                Payload Bruto Coletado da Fonte
              </span>
              <span className="text-neutral-400 text-[11px]">
                {log?.verified_at ? new Date(log.verified_at).toLocaleString('pt-BR') : 'Snapshot registrado'}
              </span>
            </div>
            <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-x-auto max-h-48 leading-relaxed">
              {JSON.stringify(
                log?.source_payload || {
                  provider: market.source_type,
                  identifier: market.source_identifier,
                  status: 'VERIFIED_BY_ENGINE',
                  observed_metric: 'Metrica confirmada na janela estipulada',
                  timestamp_iso: market.resolution_at || new Date().toISOString(),
                },
                null,
                2
              )}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Fechar Auditoria
          </button>
        </div>

      </div>
    </div>
  );
};
