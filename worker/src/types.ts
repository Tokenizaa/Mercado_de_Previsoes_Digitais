export type MarketType = 'RESULTADO' | 'RANKING' | 'METRICA' | 'LIMIAR';

export type MarketStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'AWAITING_RESULT'
  | 'RESULT_FOUND'
  | 'RESOLVED'
  | 'DISTRIBUTED';

export type Category =
  | 'internet_creators'
  | 'esportes'
  | 'musica'
  | 'entretenimento';

export type LedgerType =
  | 'INITIAL_BALANCE'
  | 'BUY'
  | 'SELL'
  | 'WINNINGS'
  | 'CREATOR_REWARD'
  | 'PLATFORM_COST'
  | 'REFUND'
  | 'ADJUSTMENT';

// Canonical schema: prediction_profiles
export interface PredictionProfile {
  id: string;
  name: string;
  display_name?: string;
  bio?: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  username: string;
  avatar_url?: string | null;
  credits_balance: number;
  created_at: string;
  updated_at?: string;
}

// Canonical schema: prediction_source_providers
export interface PredictionSourceProvider {
  id: string;
  name: string;
  slug: string;
  category: string;
  source_type: 'api' | 'web' | 'oficial';
  api_available: boolean;
  automated_resolution_supported: boolean;
  active: boolean;
  description?: string | null;
  created_at: string;
}

// Canonical schema: prediction_market_options
export interface PredictionMarketOption {
  id: string;
  market_id: string;
  label: string;
  slug: string;
  current_probability: number; // 0 a 100
  total_position: number;      // total créditos alocados
  result?: 'WINNER' | 'LOSER' | 'VOID' | null;
  created_at: string;
}

// Canonical schema: prediction_markets
export interface PredictionMarket {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  market_type: MarketType;
  status: MarketStatus;
  creator_id: string;
  creator?: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string | null;
  };
  close_at: string;
  resolution_at?: string | null;
  resolution_rule: string;
  source_type: string;
  source_provider_id?: string | null;
  source_url: string;
  source_identifier: string;
  image_url?: string | null;
  total_pool: number;
  featured?: boolean;
  created_at: string;
  updated_at: string;
  options?: PredictionMarketOption[];
  source_provider?: PredictionSourceProvider | null;
  activity?: PredictionActivity[];
  resolution_log?: PredictionResolutionLog | null;
}

// Canonical schema: prediction_positions
export interface PredictionPosition {
  id: string;
  user_id: string;
  market_id: string;
  market_title?: string;
  market_slug?: string;
  option_id: string;
  option_label?: string;
  credits_spent: number;
  units: number;
  average_price: number;
  status: 'OPEN' | 'CLOSED' | 'WON' | 'LOST' | 'REFUNDED';
  credits_payout?: number;
  created_at: string;
  updated_at: string;
}

// Canonical schema: prediction_activity
export interface PredictionActivity {
  id: string;
  market_id: string;
  user_id: string;
  user_name?: string;
  type: 'BUY' | 'SELL' | 'RESOLVE' | 'DISTRIBUTE';
  option_id?: string | null;
  option_label?: string | null;
  credits: number;
  created_at: string;
}

// Canonical schema: prediction_resolution_logs
export interface PredictionResolutionLog {
  id: string;
  market_id: string;
  source_url: string;
  source_payload: Record<string, any>;
  observed_result: string;
  verified_at: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'DISPUTED';
  evidence: string;
  is_demo: boolean;
  created_at: string;
}

// Canonical schema: prediction_creator_markets
export interface PredictionCreatorMarket {
  id: string;
  market_id: string;
  creator_id: string;
  creation_plan: 'pequeno' | 'medio' | 'grande' | 'maior';
  contract_capacity: number;
  creator_reward: number;
  created_at: string;
}

// Canonical schema: prediction_credit_ledger
export interface PredictionCreditLedger {
  id: string;
  user_id: string;
  type: LedgerType;
  amount: number;
  balance_after: number;
  market_id?: string | null;
  position_id?: string | null;
  description?: string | null;
  created_at: string;
}

// Legacy aliases for backward-compatibility during phase transition
export type User = PredictionProfile;
export type Market = PredictionMarket;
export type MarketOption = PredictionMarketOption;
export type Position = PredictionPosition;
export type MarketActivity = PredictionActivity;
export type MarketResolutionLog = PredictionResolutionLog;
export type SourceProvider = PredictionSourceProvider;

export interface EconomicDistribution {
  total_pool: number;
  winners_share_pct: number;      // 70%
  winners_pool: number;
  creator_share_pct: number;      // 20%
  creator_reward: number;
  platform_cost_pct: number;      // 10%
  platform_cost: number;
}
