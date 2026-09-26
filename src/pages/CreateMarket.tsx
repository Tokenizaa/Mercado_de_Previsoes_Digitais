import React, { useState } from 'react';
import { marketStore } from '../services/store';
import { Category, MarketType, SourceProvider } from '../types/market';
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldAlert, ShieldCheck, Trash2, Plus } from 'lucide-react';

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
  const [options, setOptions] = useState<string[]>(['Opção A', 'Opção B']);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.length < 10) {
      setError('A pergunta precisa ter pelo menos 10 caracteres.');
      return;
    }

    if (!closeAt) {
      setError('Informe a data e hora de encerramento do palpite.');
      return;
    }

    if (!sourceUrl.trim() || !resolutionRule.trim() || !sourceIdentifier.trim()) {
      setError('Auditabilidade obrigatória: URL, identificador e regra de resolução devem ser preenchidos.');
      return;
    }

    const res = await marketStore.createMarket({
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
      creation_plan: 'medio',
    });

    if (res.success && res.market) {
      onNavigate(`/mercados/${res.market.slug}`);
    } else {
      setError(res.message || 'Erro ao publicar palpite');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      
      <button
        onClick={() => onNavigate('/admin')}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#5F6368] hover:text-[#202124] transition-colors py-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para Área Admin</span>
      </button>

      {/* Banner de Aviso Administrativo Conforme D-005 */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-sm font-medium">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
        <div>
          <strong>Área Administrativa:</strong> Apenas administradores cadastram novos palpites nesta versão (D-005). Todo palpite exige pergunta objetiva, prazo e fonte pública auditável.
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7E9] shadow-xs space-y-6">
        <div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-[#202124] tracking-tight">
            Cadastrar Novo Palpite
          </h1>
          <p className="text-sm text-[#5F6368] mt-1">
            Defina uma pergunta clara e aponte onde o resultado será apurado automaticamente.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Pergunta */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#202124]">
              Pergunta Principal (Ex: "Quem vence o combate no FMS 5?") *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite a pergunta de forma direta..."
              className="w-full h-12 px-4 bg-[#F7F8F7] border border-[#E5E7E9] rounded-xl text-sm font-medium text-[#202124] outline-none focus:border-[#009344]"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-[#202124]">
              Contexto / Descrição curta
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique o contexto do acontecimento..."
              className="w-full p-4 bg-[#F7F8F7] border border-[#E5E7E9] rounded-xl text-sm font-medium text-[#202124] outline-none focus:border-[#009344]"
            />
          </div>

          {/* Categoria e Prazo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#202124]">
                Assunto / Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full h-12 px-4 bg-[#F7F8F7] border border-[#E5E7E9] rounded-xl text-sm font-bold text-[#202124] outline-none"
              >
                <option value="internet_creators">Internet e Creators</option>
                <option value="esportes">Esportes e Lutas</option>
                <option value="musica">Música e Streaming</option>
                <option value="entretenimento">Entretenimento e TV</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-[#202124]">
                Data e Hora de Fechamento *
              </label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                className="w-full h-12 px-4 bg-[#F7F8F7] border border-[#E5E7E9] rounded-xl text-sm font-medium text-[#202124] outline-none"
              >
              </input>
            </div>
          </div>

          {/* Opções de Escolha */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#202124]">
                Escolhas possíveis para o usuário *
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-bold text-[#009344] hover:text-[#007A38] flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar opção</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#F7F8F7] border border-[#E5E7E9] flex items-center justify-center text-xs font-bold text-[#5F6368]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 h-11 px-3.5 bg-[#F7F8F7] border border-[#E5E7E9] rounded-xl text-sm font-medium text-[#202124] outline-none focus:border-[#009344]"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-[#5F6368] hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auditabilidade Obrigatória */}
          <div className="p-5 rounded-2xl bg-[#F7F8F7] border border-[#E5E7E9] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#202124]">
              <ShieldCheck className="w-5 h-5 text-[#009344]" />
              <span>Fonte Oficial Auditável (D-004)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5F6368]">
                  Provedor da Fonte *
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E5E7E9] rounded-xl text-xs font-medium text-[#202124] outline-none"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.name} ({s.source_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#5F6368]">
                  Identificador / ID da Métrica *
                </label>
                <input
                  type="text"
                  placeholder="Ex: video_id, spotify_track_id..."
                  value={sourceIdentifier}
                  onChange={(e) => setSourceIdentifier(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#E5E7E9] rounded-xl text-xs font-medium text-[#202124] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5F6368]">
                URL Oficial da Fonte *
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-[#E5E7E9] rounded-xl text-xs font-medium text-[#202124] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5F6368]">
                Regra Objetiva de Apuração *
              </label>
              <textarea
                rows={2}
                placeholder="Descreva exatamente o critério numérico ou oficial de desfecho..."
                value={resolutionRule}
                onChange={(e) => setResolutionRule(e.target.value)}
                className="w-full p-3 bg-white border border-[#E5E7E9] rounded-xl text-xs font-medium text-[#202124] outline-none"
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full h-14 bg-[#009344] hover:bg-[#007A38] text-white rounded-2xl font-extrabold text-base transition-colors shadow-sm"
          >
            Publicar Palpite Administrativo
          </button>

        </form>
      </div>

    </div>
  );
};
