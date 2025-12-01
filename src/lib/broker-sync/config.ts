/**
 * Broker Sync Integration
 * 
 * برای اتصال واقعی به بروکرها از Plaid API استفاده می‌کنیم
 * https://plaid.com/docs/investments/
 * 
 * Environment Variables needed:
 * PLAID_CLIENT_ID=your_client_id
 * PLAID_SECRET=your_secret
 * PLAID_ENV=sandbox|development|production
 */

export const SUPPORTED_BROKERS = [
  {
    id: 'robinhood',
    name: 'Robinhood',
    logo: '🟢',
    description: 'Commission-free trading',
    status: 'available' as const,
    plaidInstitutionId: 'ins_54',
  },
  {
    id: 'td_ameritrade',
    name: 'TD Ameritrade',
    logo: '🟩',
    description: 'Full-service brokerage',
    status: 'available' as const,
    plaidInstitutionId: 'ins_100103',
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    logo: '🟢',
    description: 'Investment & retirement',
    status: 'available' as const,
    plaidInstitutionId: 'ins_12',
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    logo: '🔵',
    description: 'Banking & investments',
    status: 'available' as const,
    plaidInstitutionId: 'ins_11',
  },
  {
    id: 'etrade',
    name: 'E*TRADE',
    logo: '🟣',
    description: 'Online trading',
    status: 'available' as const,
    plaidInstitutionId: 'ins_100077',
  },
  {
    id: 'interactive_brokers',
    name: 'Interactive Brokers',
    logo: '🔴',
    description: 'Professional trading',
    status: 'available' as const,
    plaidInstitutionId: 'ins_116530',
  },
  {
    id: 'webull',
    name: 'Webull',
    logo: '🟠',
    description: 'Advanced trading tools',
    status: 'available' as const,
    plaidInstitutionId: 'ins_128026',
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    logo: '🔵',
    description: 'Index funds & ETFs',
    status: 'available' as const,
    plaidInstitutionId: 'ins_115616',
  },
];

export interface BrokerConnection {
  id: string;
  brokerId: string;
  brokerName: string;
  accessToken: string;
  itemId: string;
  lastSynced: Date;
  status: 'active' | 'error' | 'disconnected';
}

export interface PlaidHolding {
  account_id: string;
  security_id: string;
  institution_price: number;
  institution_value: number;
  cost_basis: number | null;
  quantity: number;
  iso_currency_code: string;
}

export interface PlaidSecurity {
  security_id: string;
  ticker_symbol: string | null;
  name: string;
  type: string;
  close_price: number | null;
}
