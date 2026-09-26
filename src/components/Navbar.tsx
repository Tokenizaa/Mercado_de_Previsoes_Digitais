import React, { useState, useEffect } from 'react';
import { marketStore } from '../services/store';
import { User } from '../types/market';
import { Coins, UserCheck, ShieldAlert, BookOpen, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [user, setUser] = useState<User>(marketStore.getCurrentUser());
  const [users, setUsers] = useState<User[]>(marketStore.getUsers());
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = marketStore.subscribe(() => {
      setUser(marketStore.getCurrentUser());
      setUsers(marketStore.getUsers());
    });
    return unsubscribe;
  }, []);

  const navLinks = [
    { label: 'Descoberta', path: '/mercados' },
    { label: 'Portfólio', path: '/portfolio' },
    { label: 'Ranking', path: '/ranking' },
    { label: 'Meus Mercados', path: '/meus-mercados' },
    { label: 'Docs', path: '/docs' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="text-left font-display font-bold text-xl tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors"
          >
            Previsões Digitais
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          <button
            onClick={() => onNavigate('/')}
            className={`hover:text-neutral-900 transition-colors ${currentPath === '/' ? 'text-neutral-900 font-semibold' : ''}`}
          >
            Início
          </button>
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`hover:text-neutral-900 transition-colors ${currentPath === link.path ? 'text-neutral-900 font-semibold' : ''}`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Action 1: Criar Mercado */}
          <button
            onClick={() => onNavigate('/criar')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Criar Mercado</span>
          </button>

          {/* Admin Demo Shortcut */}
          <button
            onClick={() => onNavigate('/admin')}
            title="Console de Auditoria e Resolução DEMO"
            className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
              currentPath === '/admin'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* User Credits & Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-xs font-medium"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span className="tabular-nums font-semibold tracking-wide">
                {user.credits_balance.toLocaleString('pt-BR')}
              </span>
              <span className="text-neutral-300 font-normal hidden lg:inline">Créditos</span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 z-50 text-xs">
                <div className="pb-2 border-b border-neutral-100 mb-2">
                  <div className="font-semibold text-neutral-900">{user.name}</div>
                  <div className="text-neutral-500">@{user.username}</div>
                  <div className="mt-1 flex items-center justify-between text-neutral-600 pt-1">
                    <span>Saldo de demonstração:</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {user.credits_balance.toLocaleString('pt-BR')} Créditos
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                  Alternar Perfil Demo
                </div>

                <div className="space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        marketStore.switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        u.id === user.id ? 'bg-neutral-100 font-semibold text-neutral-900' : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="truncate">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-neutral-400">@{u.username}</div>
                      </div>
                      {u.id === user.id && <UserCheck className="w-3.5 h-3.5 text-neutral-900 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 text-center">
                  Ambiente de demonstração virtual
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-xs overflow-x-auto gap-4">
        <button
          onClick={() => onNavigate('/')}
          className={`${currentPath === '/' ? 'font-bold text-neutral-900' : 'text-neutral-600'} shrink-0`}
        >
          Início
        </button>
        <button
          onClick={() => onNavigate('/mercados')}
          className={`${currentPath === '/mercados' ? 'font-bold text-neutral-900' : 'text-neutral-600'} shrink-0`}
        >
          Descoberta
        </button>
        <button
          onClick={() => onNavigate('/criar')}
          className={`${currentPath === '/criar' ? 'font-bold text-neutral-900' : 'text-neutral-600'} shrink-0`}
        >
          + Criar
        </button>
        <button
          onClick={() => onNavigate('/portfolio')}
          className={`${currentPath === '/portfolio' ? 'font-bold text-neutral-900' : 'text-neutral-600'} shrink-0`}
        >
          Portfólio
        </button>
        <button
          onClick={() => onNavigate('/ranking')}
          className={`${currentPath === '/ranking' ? 'font-bold text-neutral-900' : 'text-neutral-600'} shrink-0`}
        >
          Ranking
        </button>
        <button
          onClick={() => onNavigate('/meus-mercados')}
          className={`${currentPath === '/meus-mercados' ? 'font-bold text-neutral-900' : 'text-neutral-600'} shrink-0`}
        >
          Meus Mercados
        </button>
      </div>
    </header>
  );
};
