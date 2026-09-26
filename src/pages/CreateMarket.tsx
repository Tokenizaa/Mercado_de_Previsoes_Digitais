import React, { useState } from 'react';
import { marketStore } from '../services/store';
import { Category, MarketType, SourceProvider } from '../types/market';
import { AlertCircle, CheckCircle2, HelpCircle, Plus, ShieldCheck, Trash2 } from 'lucide-react';

interface CreateMarketProps {
  onNavigate: (path: string) => void;
}

export const CreateMarket: React.FC<CreateMarketProps> = ({ onNavigate }) => {
  const sources = marketStore.getSources();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('internet_creators');
  const [marketType, setMarketType] = useState<MarketType>('RESULTADO');
  const [closeAt, setCloseAt] = useState('');
  const [sourceType, setSourceType] = useState(sources[0]?.slug || 'youtube');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceIdentifier, setSourceIdentifier] = useState('');
  const [resolutionRule, setResolutionRule] = useState('');
  const [creationPlan, setCreationPlan] = useState<'pequeno' | 'medio' | 'grande' | 'maior'>('medio');
  const [options, setOptions] = useState<string[]>(['Opção A', 'Opção B']);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    { id: 'pequeno', name: 'Plano Pequeno', capacity: 100, desc: 'Ideal para círculos próximos e testes' },
    { id: 'medio', name: 'Plano Médio', capacity: 500, desc: 'Recomendado para criadores e nichos' },
    { id: 'grande', name: 'Plano Grande', capacity: 2500, desc: 'Para canais com comunidades ativas' },
    { id: 'maior', name: 'Plano Maior', capacity: 10000, desc: 'Grandes eventos de repercussão nacional' },
  ];

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, `Opção ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.length < 10) {
      setError('A pergunta precisa ter pelo menos 10 caracteres.');
      return;
    }

    if (!closeAt) {
      setError('Informe a data e hora de encerramento do mercado.');
      return;
    }

    if (!sourceUrl.trim() || !resolutionRule.trim() || !sourceIdentifier.trim()) {
      setError('Auditabilidade obrigatória: URL, identificador e regra de resolução devem ser preenchidos.');
      return;
    }

    const res = marketStore.createMarket({
      title,
      description,
      category,
      market_type: marketType,
      close_at: new Date(closeAt).toISOString(),
      resolution_rule: resolutionRule,
      source_type: sourceType,
      source_url: sourceUrl,
      source_identifier: sourceIdentifier,
      options,
      creation_plan: creationPlan,
    });

    if (res.success && res.market) {
      onNavigate(`/mercados/${res.market.slug}`);
    } else {
      setError(res.message || 'Erro ao publicar mercado');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-neutral-900 tracking-tight">
          Criar Novo Mercado de Previsão
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Publique uma pergunta objetiva vinculada a dados auditáveis. Como criador, você receberá 20% do pool final de Créditos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200">
        
        {/* Erro Geral */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Pergunta e Descrição */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider pb-1 border-b border-neutral-100">
            01. Pergunta Principal & Categoria
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Pergunta do Mercado *
            </label>
            <input
              type="text"
              placeholder="Ex: Qual música ocupará a 1ª posição no Spotify Top 50 Brasil nesta sexta?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Formule uma questão clara sobre o que vai acontecer, e não sobre opiniões pessoais.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="internet_creators">Internet & Creators</option>
                <option value="esportes">Esportes & Lutas</option>
                <option value="musica">Música & Streaming</option>
                <option value="entretenimento">Entretenimento & TV</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Tipo de Mercado
              </label>
              <select
                value={marketType}
                onChange={(e) => {
                  const t = e.target.value as MarketType;
                  setMarketType(t);
                  if (t === 'LIMIAR') {
                    setOptions(['Sim', 'Não']);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="RESULTADO">RESULTADO (Quem vence entre opções)</option>
                <option value="LIMIAR">LIMIAR (Ultrapassará marca Sim/Não)</option>
                <option value="METRICA">METRICA (Faixas quantitativas)</option>
                <option value="RANKING">RANKING (Posição relativa em parada)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Descrição e Contexto do Evento
            </label>
            <textarea
              rows={3}
              placeholder="Explique o contexto, quem são os envolvidos e o que torna este evento relevante..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Data e Hora Limite de Encerramento *
            </label>
            <input
              type="datetime-local"
              value={closeAt}
              onChange={(e) => setCloseAt(e.target.value)}
              className="w-full sm:w-72 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        {/* 2. Opções de Resposta */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              02. Opções Disponíveis
            </span>
            {marketType !== 'LIMIAR' && options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-semibold text-neutral-900 hover:text-neutral-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Opção</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                {marketType !== 'LIMIAR' && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Fonte e Regra de Resolução (AUDITABILIDADE) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              03. Auditabilidade & Fonte Verificável (Obrigatório)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Provedor da Fonte
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                {sources.map((src) => (
                  <option key={src.slug} value={src.slug}>
                    {src.name} ({src.automated_resolution_supported ? 'Automatizável' : 'Auditável'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Identificador da Métrica *
              </label>
              <input
                type="text"
                placeholder="Ex: Video ID, Track ID, Tag ou Súmula"
                value={sourceIdentifier}
                onChange={(e) => setSourceIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              URL Pública de Aferição *
            </label>
            <input
              type="url"
              placeholder="https://charts.spotify.com ou https://youtube.com/watch?v=..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Regra de Resolução Objetiva *
            </label>
            <textarea
              rows={2}
              placeholder="Descreva exatamente como e quando o valor será conferido. Ex: O resultado será lido na parada do Spotify atualizada às 18h de sexta-feira. A faixa na posição #1 será declarada vencedora."
              value={resolutionRule}
              onChange={(e) => setResolutionRule(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>

        {/* 4. Plano de Criação & Capacidade de Contratos */}
        <div className="space-y-4">
          <div className="pb-1 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              04. Capacidade de Contratos Disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map((p) => {
              const isSelected = creationPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setCreationPlan(p.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-neutral-900 text-xs">{p.name}</div>
                  <div className="text-base font-bold text-neutral-900 tabular-nums mt-1">
                    {p.capacity.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Contratos disponíveis</div>
                  <div className="text-[10px] text-neutral-400 mt-2">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão de Envio */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            Como criador, você recebe 20% do pool total distribuído.
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Publicar Mercado Auditável
          </button>
        </div>

      </form>
    </div>
  );
};
