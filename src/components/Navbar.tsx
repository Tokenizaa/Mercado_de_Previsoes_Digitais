import React, { useState, useEffect } from 'react';
import { supabase, workerApi } from '../services/api';
import { Coins, ShieldCheck, Home, Compass, BookmarkCheck, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [user, setUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => setSession(data.session));
    const {data} = supabase.auth.onAuthStateChange((_event,next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setUser(null); return; }
    workerApi.getPortfolio().then(({ profile }) => setUser(profile)).catch(() => setUser(null));
  }, [session]);

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Explorar', path: '/mercados' },
    { label: 'Meus palpites', path: '/portfolio' },
    ...(session ? [{ label: 'Perfil', path: `/perfil/${user.username}` }] : []),
  ];

  return (
    <>
      {/* Top Bar para Desktop e Mobile */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7E9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#009344] flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
              P
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#202124] block leading-none">
                Palpites
              </span>
              <span className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">
                da internet
              </span>
            </div>
          </button>

          {/* Links Principais (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[17px] font-semibold text-[#5F6368]">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(link.path);

              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`py-2 transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#009344] border-[#009344] font-bold'
                      : 'border-transparent hover:text-[#202124]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Seus Créditos & Perfil */}
          <div className="flex items-center gap-3">
            
            {!session && <button onClick={() => onNavigate('/login')} className="px-4 py-2 rounded-xl bg-[#009344] text-white font-extrabold">Entrar</button>}

            {/* Saldo de Créditos Amigável */}
            {session && <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#F7F8F7] hover:bg-[#E5E7E9] border border-[#E5E7E9] rounded-xl text-[#202124] font-bold text-sm transition-all"
              >
                <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="tabular-nums text-[16px] font-extrabold text-[#007A38]">
                  {user.credits_balance.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs font-semibold text-[#5F6368] hidden sm:inline">
                  créditos
                </span>
              </button>

              {/* Dropdown de Perfil Simples */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E7E9] rounded-2xl shadow-xl p-4 z-50 text-sm">
                  <div className="pb-3 border-b border-[#E5E7E9] mb-3">
                    <div className="font-bold text-[#202124] text-base">{user.name}</div>
                    <div className="text-xs text-[#5F6368]">@{user.username}</div>
                    <div className="mt-2 bg-[#F7F8F7] p-2.5 rounded-xl border border-[#E5E7E9] flex justify-between items-center">
                      <span className="text-xs text-[#5F6368]">Seus créditos:</span>
                      <span className="font-extrabold text-base text-[#009344] tabular-nums">
                        {user.credits_balance.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E5E7E9] flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('/admin');
                      }}
                      className="text-[#5F6368] hover:text-[#202124] flex items-center gap-1 font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Área Admin</span>
                    </button>
                    <span className="text-[11px] text-[#5F6368]">100% Virtual</span>
                  </div>
                </div>
              )}
            </div>}

          </div>

        </div>
      </header>

      {/* Barra de Navegação Inferior Fixa no Mobile (Tinder / Instagram style com suporte a safe-area do iOS) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7E9] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentPath === '/' ? 'text-[#009344] font-bold' : 'text-[#5F6368]'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[12px] font-semibold">Início</span>
        </button>

        <button
          onClick={() => onNavigate('/mercados')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentPath.startsWith('/mercados') ? 'text-[#009344] font-bold' : 'text-[#5F6368]'
          }`}
        >
          <Compass className="w-6 h-6" />
          <span className="text-[12px] font-semibold">Explorar</span>
        </button>

        <button
          onClick={() => onNavigate('/portfolio')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentPath === '/portfolio' ? 'text-[#009344] font-bold' : 'text-[#5F6368]'
          }`}
        >
          <BookmarkCheck className="w-6 h-6" />
          <span className="text-[12px] font-semibold">Meus palpites</span>
        </button>

        {session ? <button
          onClick={() => user && onNavigate(`/perfil/${user.username}`)}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentPath.startsWith('/perfil') ? 'text-[#009344] font-bold' : 'text-[#5F6368]'
          }`}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-[12px] font-semibold">Perfil</span>
        </button> : <button
          onClick={() => onNavigate('/login')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[#009344] font-bold"
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-[12px] font-semibold">Entrar</span>
        </button>}
      </nav>
    </>
  );
};
