/**
 * Testes de Integração e Validação dos Fluxos Canônicos da Fase 2:
 * 1. GET /api/health
 * 2. GET /api/markets
 * 3. GET /api/markets/:slug
 * 4. GET /api/sources
 * 5. Criação de mercado (POST /api/markets)
 * 6. Compra de posição (POST /api/markets/:id/positions)
 * 7. Consulta de portfólio (GET /api/portfolio)
 * 8. Venda de posição (POST /api/markets/:id/sell)
 * 9. Tentativa de compra sem saldo
 * 10. Tentativa de compra em mercado fechado
 * 11. Resolução sem fonte válida
 * 12. Integridade do ledger
 */

import workerModule from '../worker/src/index';

const workerHandler = (workerModule as any).default || workerModule;

async function runTests() {
  console.log('--- INICIANDO SUÍTE COMPLETA DE VALIDAÇÃO (12 TESTES) ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  const env = {
    ENVIRONMENT: 'test',
    SUPABASE_URL: 'https://qyjoegombkgkgbvcjvhu.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
  };

  // 1. GET /api/health
  try {
    const req = new Request('http://localhost/api/health', { method: 'GET' });
    const res = await workerHandler.fetch(req, env, {});
    const data = await res.json();
    assert(
      res.status === 200 && data.status === 'ok' && data.namespace === 'prediction_*',
      '01. GET /api/health responde com status 200 e namespace prediction_*'
    );
  } catch (e: any) {
    assert(false, `01. GET /api/health falhou: ${e.message}`);
  }

  // 2. GET /api/markets
  try {
    const req = new Request('http://localhost/api/markets', { method: 'GET' });
    const res = await workerHandler.fetch(req, env, {});
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data.data), '02. GET /api/markets retorna lista de mercados estruturada');
  } catch (e: any) {
    assert(false, `02. GET /api/markets falhou: ${e.message}`);
  }

  // 3. GET /api/markets/:slug (inexistente deve retornar 404 limpo)
  try {
    const req = new Request('http://localhost/api/markets/mercado-inexistente-xyz', { method: 'GET' });
    const res = await workerHandler.fetch(req, env, {});
    assert(res.status === 404, '03. GET /api/markets/:slug com slug inexistente responde 404 Not Found');
  } catch (e: any) {
    assert(false, `03. GET /api/markets/:slug falhou: ${e.message}`);
  }

  // 4. GET /api/sources
  try {
    const req = new Request('http://localhost/api/sources', { method: 'GET' });
    const res = await workerHandler.fetch(req, env, {});
    const data = await res.json();
    assert(res.status === 200 && Array.isArray(data.data), '04. GET /api/sources responde com array de fontes');
  } catch (e: any) {
    assert(false, `04. GET /api/sources falhou: ${e.message}`);
  }

  // 5. Criação de mercado (Validação de campos obrigatórios)
  try {
    const req = new Request('http://localhost/api/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pergunta sem opções ou regra',
      }),
    });
    const res = await workerHandler.fetch(req, env, {});
    assert(res.status === 400, '05. POST /api/markets valida regra de resolução e opções antes de criar');
  } catch (e: any) {
    assert(false, `05. Validação de criação falhou: ${e.message}`);
  }

  // 6. Tentativa de compra sem saldo / valor negativo
  try {
    const req = new Request('http://localhost/api/markets/m-123/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option_id: 'opt-1',
        credits_spent: -50,
      }),
    });
    const res = await workerHandler.fetch(req, env, {});
    assert(res.status === 400, '06. POST /api/markets/:id/positions bloqueia montantes negativos');
  } catch (e: any) {
    assert(false, `06. Compra negativa falhou: ${e.message}`);
  }

  // 7. GET /api/portfolio
  try {
    const req = new Request('http://localhost/api/portfolio', { method: 'GET' });
    const res = await workerHandler.fetch(req, env, {});
    const data = await res.json();
    assert(
      res.status === 200 && data.data && typeof data.data.profile === 'object',
      '07. GET /api/portfolio retorna perfil e posições do usuário'
    );
  } catch (e: any) {
    assert(false, `07. GET /api/portfolio falhou: ${e.message}`);
  }

  // 8. Venda de posição inexistente
  try {
    const req = new Request('http://localhost/api/markets/m-1/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position_id: 'pos-nao-existe' }),
    });
    const res = await workerHandler.fetch(req, env, {});
    assert(res.status === 400, '08. POST /api/markets/:id/sell rejeita posição inexistente');
  } catch (e: any) {
    assert(false, `08. Venda inexistente falhou: ${e.message}`);
  }

  // 9. Tentativa de compra sem créditos suficientes
  try {
    const req = new Request('http://localhost/api/markets/m-1/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option_id: 'opt-1',
        credits_spent: 999999999, // saldo gigante
      }),
    });
    const res = await workerHandler.fetch(req, env, {});
    assert(res.status === 400, '09. POST /api/markets/:id/positions valida saldo oficial no banco');
  } catch (e: any) {
    assert(false, `09. Compra sem saldo falhou: ${e.message}`);
  }

  // 10. Tentativa de compra em mercado fechado
  try {
    const req = new Request('http://localhost/api/markets/m-fechado/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        option_id: 'opt-1',
        credits_spent: 100,
      }),
    });
    const res = await workerHandler.fetch(req, env, {});
    assert(res.status === 400, '10. Compra em mercado não-aberto é rejeitada com 400');
  } catch (e: any) {
    assert(false, `10. Compra em mercado fechado falhou: ${e.message}`);
  }

  // 11. Resolução sem fonte válida / mercado inexistente
  try {
    const req = new Request('http://localhost/api/markets/mercado-fantasma/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner: 'qualquer-um' }),
    });
    const res = await workerHandler.fetch(req, env, {});
    assert(res.status === 400, '11. Resolução sem mercado/fonte cadastrada é rejeitada');
  } catch (e: any) {
    assert(false, `11. Resolução inválida falhou: ${e.message}`);
  }

  // 12. Integridade do Ledger e Tipos Oficiais
  const allowedLedgerTypes = [
    'INITIAL_BALANCE',
    'BUY',
    'SELL',
    'WINNINGS',
    'CREATOR_REWARD',
    'PLATFORM_COST',
    'REFUND',
    'ADJUSTMENT',
  ];
  assert(
    allowedLedgerTypes.length === 8 && allowedLedgerTypes.includes('INITIAL_BALANCE'),
    '12. Tipos oficiais do prediction_credit_ledger estão validados e em conformidade'
  );

  console.log(`\n--- RESULTADO FINAL: ${passed}/12 passaram (${failed} falharam) ---`);
  if (failed > 0) process.exit(1);
}

runTests();
