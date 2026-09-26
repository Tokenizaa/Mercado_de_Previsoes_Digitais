import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#E5E7E9] bg-white mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#009344] flex items-center justify-center text-white font-extrabold text-lg">
                P
              </div>
              <span className="font-extrabold text-xl text-[#202124]">
                Palpites da internet
              </span>
            </div>
            <p className="text-sm text-[#5F6368] leading-relaxed mb-4">
              O que você acha que vai acontecer? Escolha quem ganha nos assuntos mais comentados e acompanhe o resultado de verdade.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
              Navegação
            </div>
            <ul className="space-y-2.5 text-sm text-[#5F6368] font-semibold">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-[#202124] transition-colors">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/mercados')} className="hover:text-[#202124] transition-colors">
                  Explorar Palpites
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/portfolio')} className="hover:text-[#202124] transition-colors">
                  Meus palpites
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ranking')} className="hover:text-[#202124] transition-colors">
                  Quem mais acerta
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="hover:text-[#202124] transition-colors">
                  Área Admin
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3">
              Assuntos
            </div>
            <ul className="space-y-2.5 text-sm text-[#5F6368] font-semibold">
              <li>
                <button onClick={() => onNavigate('/categorias/internet_creators')} className="hover:text-[#202124] transition-colors">
                  Internet e Creators
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categorias/esportes')} className="hover:text-[#202124] transition-colors">
                  Esportes e Lutas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categorias/musica')} className="hover:text-[#202124] transition-colors">
                  Música e Streaming
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categorias/entretenimento')} className="hover:text-[#202124] transition-colors">
                  Entretenimento e TV
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#E5E7E9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F6368] gap-4">
          <div>
            100% Créditos virtuais de teste. Sem dinheiro real, PIX, aposta ou saque.
          </div>
          <div>
            Uma pergunta. Uma escolha. Um botão.
          </div>
        </div>
      </div>
    </footer>
  );
};
