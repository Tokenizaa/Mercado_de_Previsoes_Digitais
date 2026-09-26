import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Market, MarketResolutionLog, SourceProvider } from '../types/market';
import { CheckCircle2, Database, Play, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AdminDemoProps {
  onNavigate: (path: string) => void;
}

export const AdminDemo: React.FC<AdminDemoProps> = ({ onNavigate }) => {
  const [markets, setMarkets] = useState<Market[]>(marketStore.getMarkets());
  const [logs, setLogs] = useState<MarketResolutionLog[]>(marketStore.getResolutionLogs());
  const [sources, setSources] = useState<SourceProvider[]>(marketStore.getSources());
  const [selectedMarketId, setSelectedMarketId] = useState<string>('');
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      setMarkets(marketStore.getMarkets());
      setLogs(marketStore.getResolutionLogs());
      setSources(marketStore.getSources());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const openMarkets = markets.filter((m) => m.status === 'OPEN');
    if (openMarkets.length > 0 && !selectedMarketId) {
      setSelectedMarketId(openMarkets[0].id);
      if (openMarkets[0].options.length > 0) {
        setSelectedWinnerId(openMarkets[0].options[0].id);
      }
    }
  }, [markets, selectedMarketId]);

  const currentSelectedMarket = markets.find((m) => m.id === selectedMarketId);

  const handleExecuteResolution = async () => {
    if (!selectedMarketId) return;
    setIsProcessing(true);
    setFeedback(null);

    const res = await marketStore.resolveMarketDemo(selectedMarketId, selectedWinnerId || undefined);

    setIsProcessing(false);
    if (res.success) {
      setFeedback(`Mercado resolvido com sucesso! Log de evidência registrado e pool distribuído.`);
    } else {
      setFeedback(res.message || 'Erro na resolução');
    }
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar todos os mercados, saldos e dados semente originais de demonstração?')) {
      marketStore.resetToDefaults();
      setFeedback('Dados restaurados para os valores padrão de demonstração.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md w-fit mb-2 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Console Administrativo de Demonstração</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
            Auditoria, Fontes & Motor de Resolução
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Simule a consulta de adapters pelo Cloudflare Worker, registro de evidência pública e distribuição virtual de Créditos.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restaurar Seed Padrão</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: Resolver Widget & Sources Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Resolver Box (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 space-y-5">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-neutral-900" />
            <h2 className="font-display font-bold text-base text-neutral-900">
              Executar Resolução DEMO
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1.5">
                Selecione o Mercado para Resolver:
              </label>
              <select
                value={selectedMarketId}
                onChange={(e) => {
                  setSelectedMarketId(e.target.value);
                  const m = markets.find((x) => x.id === e.target.value);
                  if (m && m.options.length > 0) {
                    setSelectedWinnerId(m.options[0].id);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-neutral-900"
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.status}] {m.title} ({m.total_pool.toLocaleString('pt-BR')} Créditos)
                  </option>
                ))}
              </select>
            </div>

            {currentSelectedMarket && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tipo:</span>
                  <span className="font-semibold text-neutral-900">{currentSelectedMarket.market_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Fonte Auditada:</span>
                  <span className="font-semibold text-neutral-900">{currentSelectedMarket.source_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Identificador:</span>
                  <span className="font-mono text-neutral-800">{currentSelectedMarket.source_identifier}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1">Regra de Resolução:</span>
                  <p className="text-neutral-700 bg-white p-2 rounded border border-neutral-200 leading-relaxed">
                    {currentSelectedMarket.resolution_rule}
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1.5">
                    Opção que será declarada Vencedora na Verificação:
                  </label>
                  <select
                    value={selectedWinnerId}
                    onChange={(e) => setSelectedWinnerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 font-semibold focus:outline-none"
                  >
                    {currentSelectedMarket.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.current_probability}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={handleExecuteResolution}
              disabled={isProcessing || !selectedMarketId || currentSelectedMarket?.status === 'DISTRIBUTED'}
              className={`w-full py-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 ${
                currentSelectedMarket?.status === 'DISTRIBUTED'
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {currentSelectedMarket?.status === 'DISTRIBUTED'
                  ? 'Mercado já Resolvido e Distribuído'
                  : isProcessing
                  ? 'Consultando Adapter da Fonte...'
                  : 'Executar Verificação & Distribuir Pool 70/20/10'}
              </span>
            </button>
          </div>
        </div>

        {/* Sources Catalog (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-900" />
            <h2 className="font-display font-bold text-base text-neutral-900">
              Catálogo de Fontes Verificáveis
            </h2>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Mapeamento dos provedores suportados e prontidão dos adaptadores para consulta via Cloudflare Worker.
          </p>

          <div className="space-y-2.5 text-xs">
            {sources.map((src) => (
              <div key={src.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">{src.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    src.automated_resolution_supported ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {src.automated_resolution_supported ? 'AUTOMATIZÁVEL' : 'AUDITÁVEL'}
                  </span>
                </div>
                <div className="text-neutral-500 text-[11px]">{src.description}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Resolution Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-neutral-900">
              Logs de Resolução & Evidências Registradas ({logs.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Auditoria imutável dos snapshots coletados das fontes
            </p>
          </div>
        </div>

        {logs.length > 0 ? (
          <div className="divide-y divide-neutral-100 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-neutral-900">{log.observed_result}</span>
                  <span className="text-neutral-400 text-[11px]">
                    {new Date(log.verified_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="text-neutral-600 text-[11px]">{log.evidence}</div>
                <div className="text-neutral-400 font-mono text-[10px] truncate max-w-2xl">
                  URL: {log.source_url}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400">
            Nenhum log de resolução gerado ainda. Execute uma resolução acima para inspecionar.
          </div>
        )}
      </div>

    </div>
  );
};
