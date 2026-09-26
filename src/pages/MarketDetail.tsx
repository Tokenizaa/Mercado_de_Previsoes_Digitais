import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Market, MarketOption, Position } from '../types/market';
import { calculateEconomics } from '../../worker/src/engine';
import { ResolutionEvidenceModal } from '../components/ResolutionEvidenceModal';
import { ShareModal } from '../components/ShareModal';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Share2,
  ShieldCheck,
  TrendingUp,
  User,
  AlertCircle,
  Coins,
} from 'lucide-react';

interface MarketDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const MarketDetail: React.FC<MarketDetailProps> = ({ slug, onNavigate }) => {
  const [market, setMarket] = useState<Market | undefined>(marketStore.getMarketBySlug(slug));
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [creditsInput, setCreditsInput] = useState<number>(250);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      const current = marketStore.getMarketBySlug(slug);
      setMarket(current);
    });
    return unsub;
  }, [slug]);

  useEffect(() => {
    const current = marketStore.getMarketBySlug(slug);
    setMarket(current);
    if (current && current.options.length > 0) {
      setSelectedOptionId(current.options[0].id);
      
      // Atualiza Title dinâmico para SEO
      document.title = `${current.title} – Mercado de Previsões Digitais`;
    }
  }, [slug]);

  if (!market) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Mercado não encontrado</h2>
        <p className="text-neutral-500 text-sm">O mercado solicitado pode ter sido arquivado ou o link está incorreto.</p>
        <button
          onClick={() => onNavigate('/mercados')}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
        >
          Voltar para Descoberta
        </button>
      </div>
    );
  }

  const currentUser = marketStore.getCurrentUser();
  const userPositions = marketStore.getUserPositions().filter((p) => p.market_id === market.id);
  const activePosition = userPositions.find((p) => p.option_id === selectedOptionId && p.status === 'OPEN');
  const marketActivities = marketStore.getMarketActivity(market.id);
  const resolutionLogs = marketStore.getResolutionLogs(market.id);
  const economics = calculateEconomics(market.total_pool);

  const selectedOption = market.options.find((o) => o.id === selectedOptionId) || market.options[0];
  const isResolved = market.status === 'DISTRIBUTED' || market.status === 'RESOLVED';
  const winnerOption = market.options.find((o) => o.result === 'WINNER');

  // Cálculo estimativo de retorno caso a opção selecionada vença
  const estProbDecimal = Math.max(0.05, (selectedOption?.current_probability || 50) / 100);
  const estUnits = Number((creditsInput / (estProbDecimal * 100)).toFixed(2));
  const simulatedPool = market.total_pool + (tradeMode === 'buy' ? creditsInput : 0);
  const simulatedWinnersPool = Math.floor(simulatedPool * 0.70);
  const estWinningPayout = Math.floor(creditsInput * (100 / (selectedOption?.current_probability || 50)));

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (tradeMode === 'buy') {
      const res = marketStore.buyPosition(market.id, selectedOptionId, Number(creditsInput));
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Posição de ${creditsInput.toLocaleString('pt-BR')} Créditos em "${selectedOption?.label}" confirmada!`,
        });
      } else {
        setFeedback({ type: 'error', message: res.message || 'Erro ao comprar posição' });
      }
    } else {
      if (!activePosition) {
        setFeedback({ type: 'error', message: 'Você não tem posição ativa aberta nesta opção para vender.' });
        return;
      }
      const res = marketStore.sellPosition(activePosition.id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Posição liquidada com sucesso com retorno em Créditos!' });
      } else {
        setFeedback({ type: 'error', message: res.message || 'Erro ao vender posição' });
      }
    }
  };

  const closeDate = new Date(market.close_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Botão de retorno e Ações Superiores */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/mercados')}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Mercados</span>
        </button>

        <div className="flex items-center gap-2">
          {isResolved && (
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ver Auditoria da Resolução</span>
            </button>
          )}

          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left details & Right trading panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Header, Probabilities, Resolution, Description */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Market Header Block */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-4">
            
            {/* Metadata unboxed */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider">
                {market.category.replace('_', ' & ')}
              </span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span>Tipo {market.market_type}</span>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Fecha em {closeDate}</span>
              </span>
            </div>

            {/* Title Question */}
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight leading-tight">
              {market.title}
            </h1>

            {/* Resolved Status Banner */}
            {isResolved && (
              <div className="p-3.5 bg-neutral-900 text-white rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-neutral-300">Resultado Oficial Verificado: </span>
                    <strong className="text-white font-semibold">
                      {winnerOption ? winnerOption.label : 'Opção confirmada'}
                    </strong>
                  </div>
                </div>
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="text-xs text-amber-300 underline font-medium hover:text-amber-200"
                >
                  Ver Evidência
                </button>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-neutral-600 leading-relaxed pt-1">
              {market.description}
            </p>

            {/* Imagem do Evento */}
            {market.image_url && (
              <div className="rounded-xl overflow-hidden aspect-[16/9] border border-neutral-100 bg-neutral-50 mt-4">
                <img
                  src={market.image_url}
                  alt={market.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

          </div>

          {/* Options & Probability Breakdown */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-neutral-900">
                Opções & Probabilidade Coletiva
              </h2>
              <span className="text-xs text-neutral-500 tabular-nums">
                Pool: <strong>{market.total_pool.toLocaleString('pt-BR')}</strong> Créditos
              </span>
            </div>

            <div className="space-y-3">
              {market.options.map((opt) => {
                const isSelected = opt.id === selectedOptionId;
                const isWinner = opt.result === 'WINNER';

                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900">
                          {opt.label}
                        </span>
                        {isWinner && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            VENCEDOR
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-neutral-900 tabular-nums">
                        {opt.current_probability}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                        style={{ width: `${opt.current_probability}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
                      <span>Posição alocada: {opt.total_position.toLocaleString('pt-BR')} Créditos</span>
                      <span className="text-neutral-700 font-medium">
                        {isSelected ? 'Selecionada' : 'Clique para selecionar'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auditability & Verifiable Source Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-neutral-900" />
              <h2 className="font-display font-bold text-base text-neutral-900">
                Fonte Verificável & Regra de Resolução
              </h2>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Provedor de Dados:</span>
                <span className="font-semibold text-neutral-900">{market.source_name || market.source_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">URL Auditada:</span>
                <a
                  href={market.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-900 hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-[260px]"
                >
                  <span className="truncate">{market.source_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Identificador da Métrica:</span>
                <span className="font-mono text-neutral-800">{market.source_identifier}</span>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <div className="text-neutral-500 mb-1">Regra Objetiva:</div>
                <div className="text-neutral-700 leading-relaxed">{market.resolution_rule}</div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3">
            <h2 className="font-display font-bold text-base text-neutral-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neutral-600" />
              <span>Dúvidas Frequentes sobre este Mercado</span>
            </h2>
            <div className="space-y-3 text-xs text-neutral-600">
              <div>
                <strong className="text-neutral-900 block mb-0.5">Como a opção vencedora é decidida?</strong>
                O Cloudflare Worker consulta a API ou súmula pública no horário estipulado e extrai a métrica exata registrada na regra.
              </div>
              <div>
                <strong className="text-neutral-900 block mb-0.5">Posso vender minha posição antes do fim?</strong>
                Sim! Você pode liquidar sua posição a qualquer momento enquanto o mercado estiver em status ABERTO.
              </div>
              <div>
                <strong className="text-neutral-900 block mb-0.5">Posso sacar ou comprar com dinheiro real?</strong>
                Não. A plataforma utiliza 100% de Créditos virtuais demonstrativos sem equivalência financeira.
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Trading Action Box & Economics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Trading Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-5 sticky top-20">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Assumir Posição
              </span>
              <div className="text-xs text-neutral-600">
                Seu Saldo: <strong className="text-neutral-900 font-semibold tabular-nums">{currentUser.credits_balance.toLocaleString('pt-BR')}</strong> Créditos
              </div>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTradeMode('buy')}
                className={`py-2 rounded-lg transition-all ${
                  tradeMode === 'buy' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Comprar Posição
              </button>
              <button
                type="button"
                onClick={() => setTradeMode('sell')}
                className={`py-2 rounded-lg transition-all ${
                  tradeMode === 'sell' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Vender Posição
              </button>
            </div>

            {/* Opção Selecionada Info */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div className="text-neutral-500">Opção Selecionada:</div>
              <div className="font-semibold text-neutral-900 text-sm mt-0.5">
                {selectedOption?.label}
              </div>
              <div className="text-neutral-500 mt-1 flex justify-between">
                <span>Probabilidade de consenso:</span>
                <span className="font-bold text-neutral-900">{selectedOption?.current_probability}%</span>
              </div>
            </div>

            {/* Formulário de Negociação */}
            <form onSubmit={handleTrade} className="space-y-4">
              
              {tradeMode === 'buy' ? (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                    Quantidade de Créditos a alocar:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={currentUser.credits_balance}
                      value={creditsInput}
                      onChange={(e) => setCreditsInput(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold tabular-nums focus:outline-none focus:border-neutral-900"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">
                      Créditos
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[100, 250, 500, 1000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setCreditsInput(preset)}
                        className="py-1 px-2 text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>

                  {/* Projeção de Retorno */}
                  <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Unidades estimadas:</span>
                      <span className="font-semibold text-neutral-900 tabular-nums">{estUnits}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Retorno estimado se vencer:</span>
                      <span className="font-bold text-emerald-700 tabular-nums">
                        ~{estWinningPayout.toLocaleString('pt-BR')} Créditos
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Aba de Venda */
                <div className="space-y-3 text-xs">
                  {activePosition ? (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                      <div className="text-neutral-500">Sua posição ativa nesta opção:</div>
                      <div className="flex justify-between font-semibold text-neutral-900">
                        <span>Unidades detidas:</span>
                        <span className="tabular-nums">{activePosition.units}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-neutral-900">
                        <span>Créditos investidos:</span>
                        <span className="tabular-nums">{activePosition.credits_spent}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-emerald-700 pt-1 border-t border-neutral-200">
                        <span>Estimativa de liquidação:</span>
                        <span className="tabular-nums font-bold">
                          ~{Math.floor(activePosition.units * (selectedOption.current_probability / 100) * 100 * 0.95)} Créditos
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                      Você não possui unidades em aberto na opção <strong>{selectedOption?.label}</strong> para vender.
                    </div>
                  )}
                </div>
              )}

              {/* Botão de Submissão */}
              <button
                type="submit"
                disabled={isResolved || (tradeMode === 'sell' && !activePosition)}
                className={`w-full py-3 rounded-xl text-xs font-semibold transition-colors ${
                  isResolved
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                {isResolved
                  ? 'Mercado Encerrado'
                  : tradeMode === 'buy'
                  ? `Comprar Posição (${creditsInput} Créditos)`
                  : 'Vender Posição Agora'}
              </button>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}

            </form>

            {/* Divisão Econômica Transparente */}
            <div className="pt-3 border-t border-neutral-100 text-xs space-y-2">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider block text-[11px]">
                Divisão Transparente do Pool
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-neutral-500">70%</div>
                  <div className="font-bold text-neutral-900">Acertadores</div>
                  <div className="tabular-nums text-[10px] text-neutral-400">
                    {economics.winners_pool.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-neutral-500">20%</div>
                  <div className="font-bold text-neutral-900">Criador</div>
                  <div className="tabular-nums text-[10px] text-neutral-400">
                    {economics.creator_reward.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-neutral-500">10%</div>
                  <div className="font-bold text-neutral-900">Custo Oper.</div>
                  <div className="tabular-nums text-[10px] text-neutral-400">
                    {economics.platform_cost.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Criador */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-[10px]">
                  {market.creator_name?.[0] || 'C'}
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">{market.creator_name || 'Comunidade'}</div>
                  <div className="text-[10px]">@{market.creator_username || 'criador'}</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate(`/perfil/${market.creator_username || 'lucasb'}`)}
                className="text-[11px] font-semibold text-neutral-700 hover:text-neutral-900"
              >
                Ver Perfil
              </button>
            </div>

          </div>

          {/* Atividade Recente */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3">
            <h3 className="font-display font-bold text-sm text-neutral-900">
              Atividade Recente no Mercado
            </h3>
            <div className="space-y-2.5">
              {marketActivities.length > 0 ? (
                marketActivities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                    <div className="truncate max-w-[200px]">
                      <span className="font-semibold text-neutral-900">{act.user_name} </span>
                      <span className="text-neutral-500">
                        {act.type === 'BUY' ? 'comprou' : act.type === 'SELL' ? 'vendeu' : 'distribuiu'}
                      </span>
                      {act.option_label && (
                        <span className="text-neutral-700 font-medium"> "{act.option_label}"</span>
                      )}
                    </div>
                    <span className="font-semibold text-neutral-900 tabular-nums shrink-0">
                      {act.credits.toLocaleString('pt-BR')} Créditos
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-neutral-400 text-center py-2">
                  Nenhuma atividade recente registrada
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modais */}
      {showEvidenceModal && (
        <ResolutionEvidenceModal
          market={market}
          log={resolutionLogs[0]}
          onClose={() => setShowEvidenceModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          market={market}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </div>
  );
};
