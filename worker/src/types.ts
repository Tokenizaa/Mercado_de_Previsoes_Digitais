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

export interface User {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  credits_balance: number;
  created_at: string;
}

export interface MarketOption {
  id: string;
  market_id: string;
  label: string;
  slug: string;
  current_probability: number; // 0 a 100
  total_position: number;      // total créditos alocados
  result?: 'WINNER' | 'LOSER' | 'VOID' | null;
  created_at: string;
}

export interface Market {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  market_type: MarketType;
  status: MarketStatus;
  creator_id: string;
  close_at: string;
  resolution_at?: string;
  resolution_rule: string;
  source_type: string;
  source_url: string;
  source_identifier: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  options?: MarketOption[];
  total_pool?: number;
}

export interface Position {
  id: string;
  user_id: string;
  market_id: string;
  option_id: string;
  credits_spent: number;
  units: number;
  average_price: number;
  status: 'OPEN' | 'CLOSED' | 'WON' | 'LOST' | 'REFUNDED';
  created_at: string;
  updated_at: string;
}

export interface MarketActivity {
  id: string;
  market_id: string;
  user_id: string;
  userName?: string;
  type: 'BUY' | 'SELL' | 'RESOLVE' | 'DISTRIBUTE';
  option_id?: string;
  optionLabel?: string;
  credits: number;
  created_at: string;
}

export interface MarketResolutionLog {
  id: string;
  market_id: string;
  source_url: string;
  source_payload: Record<string, any>;
  observed_result: string;
  verified_at: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'DISPUTED';
  evidence: string;
  created_at: string;
}

export interface SourceProvider {
  id: string;
  name: string;
  slug: string;
  category: string;
  source_type: 'api' | 'web' | 'oficial';
  api_available: boolean;
  automated_resolution_supported: boolean;
  active: boolean;
  created_at: string;
}

export interface EconomicDistribution {
  total_pool: number;
  winners_share_pct: number;      // 70%
  winners_pool: number;
  creator_share_pct: number;      // 20%
  creator_reward: number;
  platform_cost_pct: number;      // 10%
  platform_cost: number;
}
