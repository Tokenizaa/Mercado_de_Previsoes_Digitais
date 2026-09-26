import React, { useState } from 'react';
import { Market } from '../types/market';
import { Check, Copy, MessageCircle, Share2, X } from 'lucide-react';

interface ShareModalProps {
  market: Market;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ market, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/mercados/${market.slug}`;

  const shareText = `O que você acha que vai acontecer?\n\n"${market.title}"\n\nDê o seu palpite aqui:\n${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#E5E7E9] shadow-2xl space-y-5">
        
        {/* Topo */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7E9]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#009344]" />
            <h3 className="font-extrabold text-[#202124] text-lg">
              Compartilhar este palpite
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5F6368] hover:text-[#202124] hover:bg-[#F7F8F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pergunta */}
        <p className="text-sm font-bold text-[#202124] line-clamp-2 bg-[#F7F8F7] p-3.5 rounded-2xl border border-[#E5E7E9]">
          "{market.title}"
        </p>

        {/* Botões Grandes de Compartilhamento */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsApp}
            className="h-12 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold text-sm transition-colors shadow-xs"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTwitter}
            className="h-12 flex items-center justify-center gap-2 bg-[#202124] hover:bg-[#333] text-white rounded-2xl font-bold text-sm transition-colors shadow-xs"
          >
            <span>Postar no X</span>
          </button>
        </div>

        {/* Link Direto */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-[#5F6368]">Copiar link</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full h-11 px-3.5 bg-[#F7F8F7] border border-[#E5E7E9] rounded-xl text-xs font-mono text-[#202124] truncate outline-none"
            />
            <button
              onClick={handleCopy}
              className="h-11 px-4 bg-[#009344] hover:bg-[#007A38] text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full h-11 bg-[#F7F8F7] hover:bg-[#E5E7E9] text-[#202124] rounded-xl text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
