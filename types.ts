
export enum AssetType {
  POLICY = 'POLICY',
  ETF = 'ETF',
  STOCK = 'STOCK',
  CASH = 'CASH',
  REAL_ESTATE = 'REAL_ESTATE'
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  subType?: string;
  startDate?: string;
  marketValue: number; // 萬
  cost: number; // 萬
  accumulatedDividends: number; // 萬
  loanPrincipal: number; // 萬
  interestRate: number; // %
  topUpThreshold: number; // 補繳 %
  liquidationThreshold: number; // 斷頭 %
}

export interface FinanceData {
  assets: Asset[];
  realEstate: {
    value: number;
    mortgageBalance: number;
    creditBalance: number;
  };
  liquidity: {
    cash: number;
    unusedCreditLine: number;
    unusedPledge: number;
  };
  cashflow: {
    activeIncome: number;
    passiveIncome: number;
    housingExpense: number;
    livingExpense: number;
    creditExpense: number;
    insuranceExpense: number;
    flexibleExpense: number;
  };
  settings: {
    fireTarget: number;
    showAmounts: boolean;
    stressStock: number; 
    stressInterest: number;
    currency: string;
  };
  notes: string;
  lastUpdate: string;
}
