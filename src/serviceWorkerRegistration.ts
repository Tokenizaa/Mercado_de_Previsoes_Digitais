// Registro do Service Worker para suporte PWA Mobile-First

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Atualização automática quando um novo service worker estiver disponível
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Novo conteúdo disponível após recarregamento
                  console.info('[PWA] Nova versão do app disponível.');
                } else {
                  // Conteúdo precacheado para uso offline
                  console.info('[PWA] Conteúdo precacheado para acesso rápido e offline.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[PWA] Erro ao registrar Service Worker:', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
