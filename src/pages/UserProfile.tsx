import React from 'react';
import { marketStore } from '../services/store';
import { MarketCard } from '../components/MarketCard';
import { ArrowLeft, Coins, Award, CheckCircle, ShieldCheck } from 'lucide-react';

interface UserProfileProps {
  username: string;
  onNavigate: (path: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ username, onNavigate }) => {
  const users = marketStore.getUsers();
  const user = users.find((u) => u.username === username) || users[0];
  const allMarkets = marketStore.getMarkets();
  const createdMarkets = allMarkets.filter((m) => m.creator_id === user.id);
  const userPositions = marketStore.getUserPositions(user.id);

  const wonPositions = userPositions.filter((p) => p.status === 'WON');
  const winRate = userPositions.length > 0
    ? Math.round((wonPositions.length / userPositions.length) * 100)
    : 78;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <button
        onClick={() => onNavigate('/ranking')}
        className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Ranking</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-display font-bold text-2xl">
            {user.name[0]}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-neutral-900 tracking-tight">
              {user.name}
            </h1>
            <div className="text-xs text-neutral-500">@{user.username} · Membro da comunidade</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              marketStore.switchUser(user.id);
              onNavigate('/portfolio');
            }}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-lg transition-colors"
          >
            Usar Este Perfil Demo
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-neutral-200">
          <div className="text-xs text-neutral-500 mb-1">Saldo em Créditos Virtuais</div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {user.credits_balance.toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-neutral-200">
          <div className="text-xs text-neutral-500 mb-1">Taxa Estimada de Precisão</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {winRate}%
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-neutral-200">
          <div className="text-xs text-neutral-500 mb-1">Mercados Criados</div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {createdMarkets.length}
          </div>
        </div>
      </div>

      {/* Mercados Criados pelo Usuário */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-neutral-900">
          Mercados Publicados por {user.name} ({createdMarkets.length})
        </h2>

        {createdMarkets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdMarkets.map((m) => (
              <MarketCard
                key={m.id}
                market={m}
                onSelect={(slug) => onNavigate(`/mercados/${slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-500 text-xs">
            Nenhum mercado publicado por este usuário ainda.
          </div>
        )}
      </div>

    </div>
  );
};
