import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { User } from '../types/market';
import { Coins, Trophy, ArrowRight } from 'lucide-react';

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

  const sortedUsers = [...users].sort((a, b) => b.credits_balance - a.credits_balance);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 pb-24">
      
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-[#007A38] uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Classificação da comunidade</span>
        </div>
        <h1 className="font-extrabold text-[32px] sm:text-[40px] text-[#202124] tracking-tight">
          Quem mais acerta na internet
        </h1>
        <p className="text-[18px] text-[#5F6368] mt-1">
          Os participantes com maior saldo acumulado em créditos virtuais por palpites certos.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E7E9] overflow-hidden shadow-xs divide-y divide-[#E5E7E9]">
        {sortedUsers.map((u, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          return (
            <div
              key={u.id}
              onClick={() => onNavigate(`/perfil/${u.username}`)}
              className="p-5 sm:p-6 flex items-center justify-between hover:bg-[#F7F8F7] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Posição */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                    isFirst
                      ? 'bg-amber-100 text-amber-800'
                      : isSecond
                      ? 'bg-neutral-200 text-neutral-800'
                      : isThird
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-[#F7F8F7] text-[#5F6368]'
                  }`}
                >
                  #{index + 1}
                </div>

                {/* Avatar e Nome */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#009344] text-white flex items-center justify-center font-extrabold text-base">
                    {u.name[0]}
                  </div>
                  <div>
                    <div className="font-extrabold text-[#202124] text-[17px]">{u.name}</div>
                    <div className="text-xs font-semibold text-[#5F6368]">@{u.username}</div>
                  </div>
                </div>
              </div>

              {/* Saldo de Créditos */}
              <div className="text-right">
                <div className="font-extrabold text-[#009344] text-base sm:text-lg tabular-nums flex items-center justify-end gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>{u.credits_balance.toLocaleString('pt-BR')}</span>
                </div>
                <div className="text-xs font-semibold text-[#5F6368]">créditos</div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
