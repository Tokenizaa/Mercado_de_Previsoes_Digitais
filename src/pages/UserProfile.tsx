import React from 'react';
import { marketStore } from '../services/store';
import { ArrowLeft, Coins, CheckCircle2, Sparkles } from 'lucide-react';

interface UserProfileProps {
  username: string;
  onNavigate: (path: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ username, onNavigate }) => {
  const users = marketStore.getUsers();
  const user = users.find((u) => u.username === username) || users[0];
  const userPositions = marketStore.getUserPositions(user.id);

  const wonPositions = userPositions.filter((p) => p.status === 'WON');
  const winRate = userPositions.length > 0
    ? Math.round((wonPositions.length / userPositions.length) * 100)
    : 78;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 pb-24">
      
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F6368] hover:text-[#202124] transition-colors py-1"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar ao início</span>
      </button>

      {/* Header do Perfil */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7E9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-2xl bg-[#009344] text-white flex items-center justify-center font-extrabold text-3xl shadow-sm">
            {user.name[0]}
          </div>
          <div>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-[#202124] tracking-tight">
              {user.name}
            </h1>
            <div className="text-sm font-semibold text-[#5F6368] mt-0.5">
              @{user.username} · Participante da comunidade
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              marketStore.switchUser(user.id);
              onNavigate('/portfolio');
            }}
            className="h-11 px-5 bg-[#F7F8F7] hover:bg-[#E5E7E9] text-[#202124] border border-[#E5E7E9] text-sm font-bold rounded-xl transition-colors"
          >
            Ver meus palpites
          </button>
        </div>
      </div>

      {/* Cartões de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#5F6368] uppercase tracking-wider mb-1">
            <span>Meus créditos</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[28px] font-extrabold text-[#009344] tabular-nums">
            {user.credits_balance.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-[#5F6368] mt-0.5">Saldo disponível</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#5F6368] uppercase tracking-wider mb-1">
            <span>Acertos</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[28px] font-extrabold text-[#202124] tabular-nums">
            {wonPositions.length}
          </div>
          <div className="text-xs text-[#5F6368] mt-0.5">Palpites corretos</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#5F6368] uppercase tracking-wider mb-1">
            <span>Taxa de acertos</span>
            <CheckCircle2 className="w-4 h-4 text-[#009344]" />
          </div>
          <div className="text-[28px] font-extrabold text-[#007A38] tabular-nums">
            {winRate}%
          </div>
          <div className="text-xs text-[#5F6368] mt-0.5">Aproveitamento geral</div>
        </div>
      </div>

      {/* Palpites deste usuário */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-2xl text-[#202124]">
          Palpites recentes ({userPositions.length})
        </h2>

        {userPositions.length > 0 ? (
          <div className="space-y-3">
            {userPositions.map((pos) => (
              <div
                key={pos.id}
                onClick={() => pos.market_slug && onNavigate(`/mercados/${pos.market_slug}`)}
                className="cursor-pointer p-5 bg-white rounded-2xl border border-[#E5E7E9] hover:border-[#009344] flex items-center justify-between transition-all shadow-xs"
              >
                <div>
                  <div className="font-extrabold text-base text-[#202124]">
                    {pos.market_title}
                  </div>
                  <div className="text-sm text-[#5F6368] mt-0.5">
                    Escolha: <strong className="text-[#202124]">{pos.option_label}</strong> · {pos.credits_spent.toLocaleString('pt-BR')} créditos
                  </div>
                </div>

                <div>
                  {pos.status === 'WON' ? (
                    <span className="text-xs font-bold text-[#007A38] bg-[#009344]/10 px-3 py-1 rounded-full">
                      Acertou
                    </span>
                  ) : pos.status === 'LOST' ? (
                    <span className="text-xs font-bold text-[#5F6368] bg-neutral-100 px-3 py-1 rounded-full">
                      Não acertou
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                      Em andamento
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7E9] text-[#5F6368] text-base">
            Nenhum palpite registrado ainda.
          </div>
        )}
      </div>

    </div>
  );
};
