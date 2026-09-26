import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="md:col-span-2">
            <div className="font-display font-bold text-lg text-neutral-900 tracking-tight mb-2">
              Mercado de Previsões Digitais
            </div>
            <p className="text-sm text-neutral-600 max-w-md leading-relaxed mb-4">
              Plataforma de inteligência coletiva para antecipar desfechos de acontecimentos da internet, creators, entretenimento e cultura pop através de dados objetivos e fontes auditáveis.
            </p>
            <div className="text-xs text-neutral-500 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100 max-w-md">
              <strong className="text-neutral-700">Modelo Econômico Transparente:</strong>
              <div className="mt-1">
                70% para acertadores · 20% para o criador do mercado · 10% custo operacional da plataforma.
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
              Navegação
            </div>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button onClick={() => onNavigate('/mercados')} className="hover:text-neutral-900 transition-colors">
                  Todos os Mercados
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/criar')} className="hover:text-neutral-900 transition-colors">
                  Criar um Mercado
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/portfolio')} className="hover:text-neutral-900 transition-colors">
                  Minhas Posições
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ranking')} className="hover:text-neutral-900 transition-colors">
                  Ranking de Previsores
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="hover:text-neutral-900 transition-colors">
                  Console DEMO & Auditoria
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
              Documentação do Projeto
            </div>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button onClick={() => onNavigate('/docs?doc=PRODUCT.md')} className="hover:text-neutral-900 transition-colors">
                  Visão do Produto
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/docs?doc=MARKET-MODEL.md')} className="hover:text-neutral-900 transition-colors">
                  Tipos de Mercados
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/docs?doc=DATA-SOURCES.md')} className="hover:text-neutral-900 transition-colors">
                  Fontes & Auditabilidade
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/docs?doc=RESOLUTION.md')} className="hover:text-neutral-900 transition-colors">
                  Regras de Resolução
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/docs?doc=ECONOMICS.md')} className="hover:text-neutral-900 transition-colors">
                  Créditos e Distribuição
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/docs?doc=ROADMAP.md')} className="hover:text-neutral-900 transition-colors">
                  Roadmap Técnico
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div>
            100% Créditos virtuais de demonstração. Não há dinheiro real, depósito ou saque.
          </div>
          <div>
            Popularidade é importante. Mas auditabilidade é obrigatória.
          </div>
        </div>
      </div>
    </footer>
  );
};
