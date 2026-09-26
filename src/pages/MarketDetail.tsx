import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { Market, MarketOption, Position } from '../types/market';
import { ResolutionEvidenceModal } from '../components/ResolutionEvidenceModal';
import { ShareModal } from '../components/ShareModal';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Share2,
  ShieldCheck,
  Coins,
  AlertCircle,
  Sparkles,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface MarketDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const MarketDetail: React.FC<MarketDetailProps> = ({ slug, onNavigate }) => {
  const [market, setMarket] = useState<Market | undefined>(marketStore.getMarketBySlug(slug));
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [creditsInput, setCreditsInput] = useState<number>(250);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      document.title = `${current.title} – Palpites da Internet`;
    }
  }, [slug]);

  if (!market) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-[#202124]">Palpite não encontrado</h2>
        <p className="text-[#5F6368] text-base">Esse assunto pode ter saído do ar ou o link está diferente.</p>
        <button
          onClick={() => onNavigate('/mercados')}
          className="h-[52px] px-8 bg-[#009344] text-white rounded-2xl font-bold text-base hover:bg-[#007A38] transition-colors"
        >
          Ver outros palpites
        </button>
      </div>
    );
  }

  const currentUser = marketStore.getCurrentUser();
  const userPositions = marketStore.getUserPositions().filter((p) => p.market_id === market.id);
  const userExistingPalpite = userPositions.find((p) => p.status === 'OPEN');
  const userResolvedPalpite = userPositions.find((p) => p.status !== 'OPEN');

  const selectedOption = market.options.find((o) => o.id === selectedOptionId) || market.options[0];
  const isResolved = market.status === 'DISTRIBUTED' || market.status === 'RESOLVED';
  const isClosed = market.status === 'CLOSED' || market.status === 'AWAITING_RESULT' || isResolved;
  const winnerOption = market.options.find((o) => o.result === 'WINNER');

  const userWon = userResolvedPalpite?.status === 'WON' || (isResolved && userExistingPalpite?.option_id === winnerOption?.id);
  const userLost = userResolvedPalpite?.status === 'LOST' || (isResolved && userExistingPalpite && userExistingPalpite.option_id !== winnerOption?.id);

  // Formatação em português
  const closeDate = new Date(market.close_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoryLabels: Record<string, string> = {
    internet_creators: 'Internet e Creators',
    esportes: 'Esportes e Lutas',
    musica: 'Música e Streaming',
    entretenimento: 'Entretenimento e TV',
  };

  const handleConfirmPalpite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || isClosed) return;

    if (creditsInput > currentUser.credits_balance) {
      setFeedback({
        type: 'error',
        message: 'Você não tem créditos suficientes para esse palpite.',
      });
      return;
    }

    if (creditsInput <= 0) {
      setFeedback({
        type: 'error',
        message: 'Escolha uma quantidade de créditos válida.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await marketStore.buyPosition(market.id, selectedOptionId, Number(creditsInput));
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Pronto! Seu palpite em "${selectedOption?.label}" foi confirmado com ${creditsInput.toLocaleString('pt-BR')} créditos.`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.message || 'Não deu para confirmar agora. Tente de novo.',
      });
    }
  };

  const handleSairDoPalpite = async () => {
    if (!userExistingPalpite) return;
    if (!window.confirm('Tem certeza que deseja sair deste palpite e receber seus créditos de volta?')) return;

    setIsSubmitting(true);
    const res = await marketStore.sellPosition(userExistingPalpite.id);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'Você saiu deste palpite. Seus créditos foram devolvidos.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.message || 'Não foi possível sair agora. Tente de novo.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 pb-24">
      
      {/* Barra Superior Simples */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/mercados')}
          className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F6368] hover:text-[#202124] transition-colors py-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          {isResolved && (
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="h-10 px-4 bg-[#F7F8F7] hover:bg-[#E5E7E9] text-[#202124] border border-[#E5E7E9] rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#009344]" />
              <span className="hidden sm:inline">Como conferimos</span>
              <span className="sm:hidden">Conferir</span>
            </button>
          )}

          <button
            onClick={() => setShowShareModal(true)}
            className="h-10 px-4 bg-white hover:bg-[#F7F8F7] border border-[#E5E7E9] text-[#202124] rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4 text-[#5F6368]" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Card Principal do Palpite */}
      <div className="bg-white rounded-3xl border border-[#E5E7E9] p-6 sm:p-8 space-y-6 shadow-xs">
        
        {/* Contexto e Status */}
        <div className="flex items-center gap-2 flex-wrap text-sm font-semibold">
          <span className="text-[#007A38] bg-[#009344]/10 px-3 py-1 rounded-full">
            {categoryLabels[market.category] || 'Internet'}
          </span>
          <span className="text-[#E5E7E9] hidden sm:inline">•</span>
          <span className="flex items-center gap-1 text-[#5F6368]">
            <Clock className="w-4 h-4" />
            <span>
              {isResolved
                ? 'Resultado já divulgado'
                : isClosed
                ? 'Já fechou'
                : `Fecha em ${closeDate}`}
            </span>
          </span>
        </div>

        {/* PERGUNTA GIGANTE */}
        <h1 className="font-extrabold text-[28px] sm:text-[36px] text-[#202124] leading-[1.18] tracking-tight">
          {market.title}
        </h1>

        {/* Imagem do Evento se houver */}
        {market.image_url && (
          <div className="rounded-2xl overflow-hidden aspect-[16/9] w-full bg-[#F7F8F7] border border-[#E5E7E9]">
            <img
              src={market.image_url}
              alt={market.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Breve Explicação */}
        {market.description && (
          <p className="text-[17px] sm:text-[18px] text-[#5F6368] leading-relaxed">
            {market.description}
          </p>
        )}

        {/* BANNER SE O RESULTADO JÁ SAIU */}
        {isResolved && (
          <div className="p-6 rounded-2xl bg-[#202124] text-white space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-[#009344]" />
              <span>Saiu o resultado</span>
            </div>
            
            <div className="text-xl sm:text-2xl font-extrabold">
              Quem acertou: <span className="text-[#009344]">{winnerOption ? winnerOption.label : 'Resultado apurado'}</span>
            </div>

            {userWon && (
              <div className="p-4 bg-[#009344]/20 border border-[#009344] rounded-xl text-white font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Parabéns! Você acertou seu palpite e recebeu seus créditos!</span>
              </div>
            )}

            {userLost && (
              <div className="p-4 bg-white/10 rounded-xl text-neutral-300 font-medium text-sm">
                Você não acertou dessa vez. Mas ainda tem outros palpites abertos acontecendo!
              </div>
            )}

            <button
              onClick={() => setShowEvidenceModal(true)}
              className="text-sm font-bold text-white underline hover:text-neutral-200 block pt-1"
            >
              Ver onde e como conferimos a prova oficial →
            </button>
          </div>
        )}

        {/* SE O PALPITE JÁ FECHOU MAS AINDA NÃO SAIU O RESULTADO */}
        {!isResolved && isClosed && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="font-extrabold text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Já fechou para novos palpites</span>
            </div>
            <p className="text-sm text-amber-800">
              Estamos aguardando o momento exato para conferir a fonte oficial e divulgar o resultado.
            </p>
          </div>
        )}

        {/* SE O USUÁRIO JÁ TEM PALPITE ATIVO NESTE ASSUNTO */}
        {userExistingPalpite && !isResolved && (
          <div className="p-5 rounded-2xl bg-[#009344]/10 border border-[#009344]/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-[#007A38] uppercase tracking-wider block">
                  Seu palpite atual
                </span>
                <span className="font-extrabold text-[20px] text-[#202124]">
                  {userExistingPalpite.option_label}
                </span>
                <span className="text-sm text-[#5F6368] block mt-0.5">
                  Você usou <strong>{userExistingPalpite.credits_spent.toLocaleString('pt-BR')} créditos</strong>
                </span>
              </div>

              {!isClosed && (
                <button
                  type="button"
                  onClick={handleSairDoPalpite}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-white border border-[#E5E7E9] hover:bg-neutral-100 text-[#202124] rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#5F6368]" />
                  <span>Sair deste palpite</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ÁREA DE ESCOLHA (UMA PERGUNTA. UMA ESCOLHA. UM BOTÃO.) */}
        {!isClosed && (
          <form onSubmit={handleConfirmPalpite} className="space-y-6 pt-2">
            
            <div>
              <label className="block font-extrabold text-[20px] text-[#202124] mb-3">
                Qual é o seu palpite?
              </label>

              {/* CARDS GRANDES DE ESCOLHA */}
              <div className="space-y-3">
                {market.options.map((opt) => {
                  const isSelected = opt.id === selectedOptionId;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#009344] bg-[#009344]/5 shadow-xs'
                          : 'border-[#E5E7E9] hover:border-[#202124]/30 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-[#009344] bg-[#009344]'
                              : 'border-[#5F6368] bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-extrabold text-[18px] sm:text-[20px] text-[#202124]">
                          {opt.label}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-[17px] text-[#009344] tabular-nums block">
                          {opt.current_probability}% de chance
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELEÇÃO DE CRÉDITOS */}
            <div className="p-5 bg-[#F7F8F7] rounded-2xl border border-[#E5E7E9] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-[#202124]">Quantos créditos quer usar?</span>
                <span className="text-[#5F6368]">
                  Seus créditos: <strong className="text-[#009344] font-extrabold">{currentUser.credits_balance.toLocaleString('pt-BR')}</strong>
                </span>
              </div>

              {/* Botões de atalho rápido */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCreditsInput(amount)}
                    className={`h-11 rounded-xl font-bold text-sm transition-all border ${
                      creditsInput === amount
                        ? 'bg-[#202124] text-white border-[#202124]'
                        : 'bg-white text-[#202124] border-[#E5E7E9] hover:bg-[#E5E7E9]'
                    }`}
                  >
                    {amount.toLocaleString('pt-BR')}
                  </button>
                ))}
              </div>

              {/* Input simples */}
              <div className="relative">
                <input
                  type="number"
                  min={10}
                  max={currentUser.credits_balance}
                  value={creditsInput}
                  onChange={(e) => setCreditsInput(Number(e.target.value))}
                  className="w-full h-12 px-4 bg-white border border-[#E5E7E9] focus:border-[#009344] rounded-xl font-extrabold text-[18px] text-[#202124] outline-none tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5F6368]">
                  créditos
                </span>
              </div>
            </div>

            {/* FEEDBACK DE SUCESSO OU ERRO */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            {/* BOTÃO GIGANTE DE AÇÃO (MÍNIMO 56PX) */}
            <button
              type="submit"
              disabled={isSubmitting || currentUser.credits_balance < 10}
              className="w-full h-[56px] sm:h-[60px] bg-[#009344] hover:bg-[#007A38] text-white font-extrabold text-[19px] sm:text-[20px] rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Confirmando...' : 'Dar meu palpite'}</span>
              <ChevronRight className="w-6 h-6" />
            </button>

          </form>
        )}

      </div>

      {/* Como e Onde vamos conferir (Simples e Auditável) */}
      <div className="bg-white rounded-3xl border border-[#E5E7E9] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-[#202124]">
          <ShieldCheck className="w-5 h-5 text-[#009344]" />
          <h2 className="font-extrabold text-[20px]">
            Onde vamos conferir o resultado?
          </h2>
        </div>

        <div className="p-4 bg-[#F7F8F7] rounded-2xl border border-[#E5E7E9] space-y-3 text-sm">
          <div className="flex justify-between items-center flex-wrap gap-1">
            <span className="text-[#5F6368] font-medium">Fonte oficial:</span>
            <span className="font-bold text-[#202124]">{market.source_name || market.source_type}</span>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-1">
            <span className="text-[#5F6368] font-medium">Link oficial verificado:</span>
            <a
              href={market.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-[#009344] hover:underline flex items-center gap-1 font-semibold truncate max-w-[260px] sm:max-w-md"
            >
              <span className="truncate">{market.source_url}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          <div className="pt-2 border-t border-[#E5E7E9]">
            <span className="text-[#5F6368] font-medium block mb-1">Como vamos conferir:</span>
            <span className="text-[#202124] font-semibold leading-relaxed">
              {market.resolution_rule}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#5F6368] leading-relaxed">
          Sem enrolação: quando o prazo chegar, nós conferimos os números oficiais diretamente na fonte e quem acertou recebe seus créditos.
        </p>
      </div>

      {/* Modais */}
      {showEvidenceModal && (
        <ResolutionEvidenceModal
          market={market}
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
