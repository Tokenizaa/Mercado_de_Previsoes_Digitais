import React, { useState } from 'react';
import { Market, MarketResolutionLog } from '../types/market';
import { CheckCircle2, ExternalLink, ShieldCheck, X, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-[#E5E7E9] shadow-2xl space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E5E7E9]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#009344]/10 text-[#009344] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#202124] text-xl">
                Como conferimos o resultado
              </h3>
              <p className="text-xs font-semibold text-[#5F6368]">
                Apuração 100% verificada na fonte oficial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#5F6368] hover:text-[#202124] hover:bg-[#F7F8F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pergunta e Vencedor */}
        <div className="bg-[#F7F8F7] p-5 rounded-2xl border border-[#E5E7E9] space-y-3">
          <div className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
            Palpite apurado
          </div>
          <div className="font-extrabold text-[#202124] text-lg leading-snug">
            {market.title}
          </div>

          <div className="pt-3 border-t border-[#E5E7E9] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#009344] shrink-0" />
            <div className="text-sm font-bold text-[#202124]">
              Quem acertou: <span className="text-[#007A38] text-base">{winnerOption ? winnerOption.label : 'Resultado confirmado'}</span>
            </div>
          </div>
        </div>

        {/* Fonte Verificada */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Onde e como foi apurado
          </div>

          <div className="p-4 rounded-2xl border border-[#E5E7E9] bg-white space-y-3 text-sm">
            <div className="flex justify-between items-center flex-wrap gap-1">
              <span className="text-[#5F6368] font-medium">Fonte oficial:</span>
              <span className="font-bold text-[#202124]">{market.source_name || market.source_type}</span>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-1">
              <span className="text-[#5F6368] font-medium">Link oficial consultado:</span>
              <a
                href={market.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#009344] hover:underline flex items-center gap-1 font-semibold truncate max-w-[240px] sm:max-w-xs"
              >
                <span className="truncate">{market.source_url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <div className="pt-2 border-t border-[#E5E7E9]">
              <span className="text-[#5F6368] font-medium block mb-1">Como foi medido:</span>
              <span className="text-[#202124] font-semibold leading-relaxed">
                {market.resolution_rule}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle para Dados Técnicos */}
        <div>
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-xs font-bold text-[#5F6368] hover:text-[#202124] flex items-center gap-1 py-1"
          >
            <span>{showTechnicalDetails ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos da apuração'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-4 bg-[#202124] text-neutral-200 rounded-2xl text-xs font-mono space-y-2">
              <div className="text-neutral-400">
                Horário da apuração: {log?.verified_at ? new Date(log.verified_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
              </div>
              <div className="text-neutral-400">
                Identificador: {market.source_identifier}
              </div>
              {log?.source_payload && (
                <pre className="overflow-x-auto text-[11px] p-2 bg-black/40 rounded-lg text-emerald-400">
                  {JSON.stringify(log.source_payload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Botão Fechar */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full h-12 bg-[#202124] hover:bg-[#333] text-white rounded-2xl font-bold text-sm transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
