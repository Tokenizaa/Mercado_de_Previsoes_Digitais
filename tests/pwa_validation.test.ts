import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

console.log('--- INICIANDO VALIDAÇÃO DA FASE 4.1 (PWA MOBILE-FIRST) ---\n');

// 1. Verificar se manifest.webmanifest existe e é válido
try {
  const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent);

  assert(manifest.id === '/', '1. Manifest ID é "/"');
  assert(manifest.display === 'standalone', '2. Manifest display é "standalone"');
  assert(manifest.start_url === '/', '3. Manifest start_url é "/"');
  assert(manifest.scope === '/', '4. Manifest scope é "/"');
  assert(manifest.theme_color === '#009344', '5. Manifest theme_color é "#009344"');
  assert(manifest.background_color === '#F7F8F7', '6. Manifest background_color é "#F7F8F7"');
  assert(manifest.short_name && manifest.short_name.length <= 12, '7. Manifest short_name <= 12 caracteres', `Tamanho: ${manifest.short_name?.length}`);
  
  // Validar ícones no manifest
  const iconSizes = manifest.icons.map((i: any) => i.sizes);
  const has192 = iconSizes.includes('192x192');
  const has512 = iconSizes.includes('512x512');
  const hasMaskable = manifest.icons.some((i: any) => i.purpose === 'maskable');
  assert(has192 && has512 && hasMaskable, '8. Manifest contém ícones 192x192, 512x512 e maskable');
} catch (e: any) {
  assert(false, 'Manifest válido em public/manifest.webmanifest', e.message);
}

// 2. Verificar existência de todos os arquivos de ícone na pasta public
const requiredIcons = [
  'public/pwa-192x192.png',
  'public/pwa-512x512.png',
  'public/pwa-maskable-512x512.png',
  'public/apple-touch-icon.png',
  'public/icon.svg',
  'public/favicon.ico'
];

requiredIcons.forEach((iconFile) => {
  const exists = fs.existsSync(path.resolve(process.cwd(), iconFile));
  const stats = exists ? fs.statSync(path.resolve(process.cwd(), iconFile)) : null;
  assert(Boolean(exists && stats && stats.size > 0), `9. Ícone presente e não-vazio: ${iconFile}`);
});

// 3. Verificar Service Worker em public/sw.js
try {
  const swPath = path.resolve(process.cwd(), 'public/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf-8');
  assert(swContent.includes('CACHE_NAME'), '10. Service Worker define CACHE_NAME');
  assert(swContent.includes('addEventListener(\'install\''), '11. Service Worker possui listener de install');
  assert(swContent.includes('addEventListener(\'activate\''), '12. Service Worker possui listener de activate');
  assert(swContent.includes('addEventListener(\'fetch\''), '13. Service Worker possui interceptador de fetch com suporte offline');
} catch (e: any) {
  assert(false, 'Service Worker em public/sw.js', e.message);
}

// 4. Verificar tags no index.html
try {
  const htmlPath = path.resolve(process.cwd(), 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  assert(htmlContent.includes('rel="manifest" href="/manifest.webmanifest"'), '14. index.html referencia manifest.webmanifest');
  assert(htmlContent.includes('name="theme-color" content="#009344"'), '15. index.html define theme-color "#009344"');
  assert(htmlContent.includes('name="apple-mobile-web-app-capable" content="yes"'), '16. index.html define apple-mobile-web-app-capable');
  assert(htmlContent.includes('name="apple-mobile-web-app-status-bar-style"'), '17. index.html define status bar style para iOS');
  assert(htmlContent.includes('rel="apple-touch-icon"'), '18. index.html define apple-touch-icon');
  assert(htmlContent.includes('name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"'), '19. index.html configurado com viewport mobile completo');
} catch (e: any) {
  assert(false, 'Metatags PWA no index.html', e.message);
}

// 5. Verificar hook e componente de aviso de instalação
try {
  const hookPath = path.resolve(process.cwd(), 'src/hooks/usePWAInstall.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf-8');
  assert(hookContent.includes('display-mode: standalone'), '20. usePWAInstall detecta display-mode standalone');
  assert(hookContent.includes('beforeinstallprompt'), '21. usePWAInstall gerencia beforeinstallprompt');
  assert(hookContent.includes('pwa_install_dismissed'), '22. usePWAInstall persiste preferência de dispensa');
  assert(hookContent.includes('isIOS'), '23. usePWAInstall detecta dispositivos iOS');

  const bannerPath = path.resolve(process.cwd(), 'src/components/PWAInstallBanner.tsx');
  const bannerContent = fs.readFileSync(bannerPath, 'utf-8');
  assert(bannerContent.includes('Instale o app no seu celular'), '24. PWAInstallBanner contém título oficial');
  assert(bannerContent.includes('Tenha seus palpites sempre à mão.'), '25. PWAInstallBanner contém subtítulo oficial');
  assert(bannerContent.includes('Instalar app'), '26. PWAInstallBanner contém botão "Instalar app"');
  assert(bannerContent.includes('Compartilhar → Adicionar à Tela de Início'), '27. PWAInstallBanner contém fluxo específico para iOS');
  assert(bannerContent.includes('if (isInstalled || isDismissed)'), '28. PWAInstallBanner suprime exibição se instalado ou dispensado');
} catch (e: any) {
  assert(false, 'Componente de aviso de instalação', e.message);
}

// 6. Verificar integridade da UX da Fase 4
try {
  const homePath = path.resolve(process.cwd(), 'src/pages/Home.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');
  assert(!homeContent.includes('OrderBook') && !homeContent.includes('Liquidação') && !homeContent.includes('Buy Position'), '29. Linguagem da Fase 4 preservada (sem termos financeiros ou de apostas)');
  
  const detailPath = path.resolve(process.cwd(), 'src/pages/MarketDetail.tsx');
  const detailContent = fs.readFileSync(detailPath, 'utf-8');
  assert(detailContent.includes('Qual é o seu palpite?') && detailContent.includes('Dar meu palpite'), '30. Fluxo "Uma pergunta. Uma escolha. Um botão." da Fase 4 intacto');
} catch (e: any) {
  assert(false, 'Integridade da Fase 4', e.message);
}

console.log(`\n--- RESULTADO DA VALIDAÇÃO PWA: ${passed}/${passed + failed} passaram (${failed} falharam) ---`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
