import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { User } from '../types/market';
import { Award, Coins, TrendingUp } from 'lucide-react';

interface RankingProps {
  onNavigate: (path: string) => void;
}

export const Ranking: React.FC<RankingProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>(marketStore.getUsers());

  useEffect(() => {
    const unsub = marketStore.subscribe(() => {
      setUsers(marketStore.getUsers());
    });
    return unsub;
  }, []);

  // Ordena por saldo de créditos acumulados
  const sortedUsers = [...users].sort((a, b) => b.credits_balance - a.credits_balance);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Ranking de Previsores da Comunidade
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Os membros com maior saldo de Créditos virtuais acumulados por acertos comprovados.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-neutral-100">
          {sortedUsers.map((u, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div
                key={u.id}
                onClick={() => onNavigate(`/perfil/${u.username}`)}
                className="p-5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isFirst
                        ? 'bg-amber-100 text-amber-900'
                        : isSecond
                        ? 'bg-neutral-200 text-neutral-800'
                        : isThird
                        ? 'bg-amber-50 text-amber-800'
                        : 'text-neutral-400 font-normal'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  {/* Informações do Usuário */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-sm">
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 text-sm">{u.name}</div>
                      <div className="text-xs text-neutral-400">@{u.username}</div>
                    </div>
                  </div>
                </div>

                {/* Saldo de Créditos */}
                <div className="text-right">
                  <div className="font-bold text-neutral-900 text-sm sm:text-base tabular-nums flex items-center justify-end gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{u.credits_balance.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">Créditos Acumulados</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
