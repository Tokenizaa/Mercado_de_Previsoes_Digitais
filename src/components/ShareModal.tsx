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

  const shareText = `O que você acha que vai acontecer?\n\n"${market.title}"\n\nDê sua previsão no Mercado de Previsões Digitais:\n${shareUrl}`;

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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-neutral-800" />
            <h3 className="font-semibold text-neutral-900 text-sm">Compartilhar Mercado</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-neutral-600 line-clamp-2">
            "{market.title}"
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleTwitter}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>X / Twitter</span>
            </button>
          </div>

          <div className="pt-2">
            <div className="text-[11px] text-neutral-400 font-medium mb-1">Link Direto</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-700 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-neutral-500 hover:text-neutral-900"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
