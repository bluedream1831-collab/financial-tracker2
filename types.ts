
export interface Asset {
  id: string;
  name: string;
  type: 'investment' | 'realestate' | 'cash';
  marketValue: number;
  cost: number;
  annualDividend: number;
  realizedDividend: number; // 已收配息金額
}

export interface Liability {
  id: string;
  name: string;
  type: 'mortgage' | 'credit' | 'pledge' | 'policy';
  principal: number;
  interestRate: number; // 2.1% = 0.021
  relatedAssetId?: string; // For pledges
  maintenanceThreshold?: number; // e.g. 1.4 for 140%
}

export interface IncomeExpense {
  monthlyActiveIncome: number; // 工作收入
  monthlyPassiveIncome: number; // 被動收入
  monthlyMortgagePayment: number; // 房貸月還款
  monthlyCreditPayment: number; // 信貸月還款
  monthlyBaseLivingExpense: number; // 一般生活支出
  fireGoal: number;
  unusedCreditLimit: number;
}

export interface StressTestState {
  marketCrash: number; // 0 to 0.5 (0% to 50%)
  interestHike: number; // 0 to 0.02 (0% to 2%)
}
