import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { X, Share, PlusSquare, Smartphone, Download } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismiss } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Se já está instalado em standalone ou usuário dispensou, não exibe
  if (isInstalled || isDismissed) {
    return null;
  }

  // Em navegadores de desktop que não suportam beforeinstallprompt e não são iOS,
  // ou quando nenhuma das condições de instalação é atendida, mantemos a interface limpa
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Banner Flutuante de Instalação: posicionamento seguro acima da barra móvel */}
      <aside
        aria-label="Instalação do Aplicativo"
        className="fixed z-45 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-96 bg-white border border-[#E5E7E9] rounded-2xl shadow-xl p-3.5 sm:p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="flex items-start gap-3">
          {/* Ícone do App */}
          <div className="w-10 h-10 rounded-xl bg-[#009344] flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-xs">
            P
          </div>

          {/* Texto Oficial */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-[15px] sm:text-[16px] font-bold text-[#202124] leading-snug">
              Instale o app no seu celular
            </h4>
            <p className="text-[13px] sm:text-[14px] text-[#5F6368] mt-0.5 leading-normal">
              Tenha seus palpites sempre à mão.
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-1.5 h-11 px-4 bg-[#009344] hover:bg-[#007A38] text-white text-[14px] sm:text-[15px] font-bold rounded-xl shadow-xs transition-colors active:scale-98 cursor-pointer"
              >
                {isIOS ? (
                  <>
                    <Share className="w-4 h-4" />
                    <span>Como instalar</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Instalar app</span>
                  </>
                )}
              </button>

              <button
                onClick={dismiss}
                className="h-11 px-3 text-[#5F6368] hover:text-[#202124] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Agora não
              </button>
            </div>
          </div>

          {/* Botão Fechar (Dismiss) */}
          <button
            onClick={dismiss}
            aria-label="Fechar aviso de instalação"
            className="w-8 h-8 rounded-full hover:bg-[#F7F8F7] flex items-center justify-center text-[#5F6368] hover:text-[#202124] transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Modal / Diálogo de Instrução Específica para iOS Safari */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl text-[#202124] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7E9]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#009344]" />
                <h3 className="font-bold text-lg">Instalar no iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F7F8F7] flex items-center justify-center text-[#5F6368]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-[#202124]">
              <div className="flex items-start gap-3 p-3 bg-[#F7F8F7] rounded-xl border border-[#E5E7E9]">
                <div className="w-7 h-7 rounded-full bg-[#009344] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold">Toque no botão Compartilhar</div>
                  <div className="text-xs text-[#5F6368] mt-0.5 flex items-center gap-1">
                    Procure pelo ícone <Share className="w-3.5 h-3.5 inline text-[#009344]" /> na barra inferior do Safari.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F7F8F7] rounded-xl border border-[#E5E7E9]">
                <div className="w-7 h-7 rounded-full bg-[#009344] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-bold">Compartilhar → Adicionar à Tela de Início</div>
                  <div className="text-xs text-[#5F6368] mt-0.5 flex items-center gap-1">
                    Role a lista para baixo e toque em <PlusSquare className="w-3.5 h-3.5 inline text-[#009344]" /> Adicionar à Tela de Início.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F7F8F7] rounded-xl border border-[#E5E7E9]">
                <div className="w-7 h-7 rounded-full bg-[#009344] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-bold">Pronto!</div>
                  <div className="text-xs text-[#5F6368] mt-0.5">
                    O aplicativo aparecerá como um app nativo na sua tela.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full h-12 bg-[#009344] hover:bg-[#007A38] text-white font-bold rounded-xl transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
