
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Download,
  Upload,
  RotateCcw,
  Settings2,
  Activity,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Loader2,
  Clock,
  Menu,
  X,
  Printer,
  FileText
} from 'lucide-react';
import { Asset, Liability, IncomeExpense, StressTestState } from './types';
import SummaryCards from './components/SummaryCards';
import FinancialCharts from './components/FinancialCharts';
import StressTestSection from './components/StressTestSection';
import AssetLiabilityList from './components/AssetLiabilityList';
import AIDiagnosisModal from './components/AIDiagnosisModal';

const STORAGE_KEY = 'FINANCIAL_FREOM_DASHBOARD_DATA_V2';

const initialAssets: Asset[] = [
  { id: 'p1', name: '保單 A (法巴年金)', type: 'investment', marketValue: 477000, cost: 500000, annualDividend: 0, realizedDividend: 48208, purchaseDate: '2024-09-01' },
  { id: 'p2', name: '保單 B (法巴壽險)', type: 'investment', marketValue: 1477000, cost: 1500000, annualDividend: 0, realizedDividend: 139927, purchaseDate: '2024-10-01' },
  { id: 'p3', name: '保單 C (安達年金)', type: 'investment', marketValue: 1800000, cost: 1729999, annualDividend: 0, realizedDividend: 45305, purchaseDate: '2025-09-01' },
  { id: 'p4', name: '保單 D (安聯主力)', type: 'investment', marketValue: 3280000, cost: 3030000, annualDividend: 0, realizedDividend: 120148, purchaseDate: '2025-07-01' },
  { id: 's1', name: '股票質押貸款 (標的)', type: 'investment', marketValue: 1900000, cost: 1890000, annualDividend: 0, realizedDividend: 127126, purchaseDate: '2024-01-01' },
  { id: 'r1', name: '房產 (估值)', type: 'realestate', marketValue: 4700000, cost: 4700000, annualDividend: 0, realizedDividend: 0 },
  { id: 'c1', name: '活存備用金', type: 'cash', marketValue: 420000, cost: 420000, annualDividend: 0, realizedDividend: 0 },
];

const initialLiabilities: Liability[] = [
  { id: 'l1', name: '保單 A 借款', type: 'policy', principal: 200000, interestRate: 0.0317, relatedAssetId: 'p1', maintenanceThreshold: 0.8, liquidateThreshold: 0.9 },
  { id: 'l2', name: '保單 B 借款', type: 'policy', principal: 650000, interestRate: 0.0317, relatedAssetId: 'p2', maintenanceThreshold: 0.8, liquidateThreshold: 0.9 },
  { id: 'l3', name: '保單 C 借款', type: 'policy', principal: 790000, interestRate: 0.04, relatedAssetId: 'p3', maintenanceThreshold: 0.8, liquidateThreshold: 0.9 },
  { id: 'l4', name: '保單 D 借款', type: 'policy', principal: 880000, interestRate: 0.04, relatedAssetId: 'p4', maintenanceThreshold: 0.6, liquidateThreshold: 0.7 },
  { id: 'l6', name: '股票質押貸款', type: 'pledge', principal: 500000, interestRate: 0.03, relatedAssetId: 's1', maintenanceThreshold: 1.4, liquidateThreshold: 1.3 },
  { id: 'l7', name: '房屋貸款', type: 'mortgage', principal: 4604000, interestRate: 0.021 },
  { id: 'l8', name: '信用貸款', type: 'credit', principal: 956000, interestRate: 0.035 },
];

const initialIncomeExpense: IncomeExpense = {
  monthlyActiveIncome: 42000,
  monthlyPassiveIncome: 55000,
  monthlyMortgagePayment: 31000,
  monthlyCreditPayment: 13000,
  monthlyBaseLivingExpense: 18000, 
  fireGoal: 20000000,
  unusedCreditLimit: 360000,
};

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLiquidityDetail, setShowLiquidityDetail] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [liabilities, setLiabilities] = useState<Liability[]>(initialLiabilities);
  const [incomeExpense, setIncomeExpense] = useState<IncomeExpense>(initialIncomeExpense);
  const [stress, setStress] = useState<StressTestState>({
    marketCrash: 0,
    interestHike: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAssets(parsed.assets || initialAssets);
        setLiabilities(parsed.liabilities || initialLiabilities);
        setIncomeExpense(parsed.incomeExpense || initialIncomeExpense);
        if (parsed.lastSavedTime) setLastSavedTime(parsed.lastSavedTime);
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  const performSave = () => {
    setIsSaving(true);
    const now = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const dataToSave = { assets, liabilities, incomeExpense, lastSavedTime: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedTime(now);
      setHasUnsavedChanges(false);
    }, 600);
  };

  const handleExport = () => {
    const dataToSave = { assets, liabilities, incomeExpense, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FIRE_Dashboard_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.assets && parsed.liabilities && parsed.incomeExpense) {
          setAssets(parsed.assets);
          setLiabilities(parsed.liabilities);
          setIncomeExpense(parsed.incomeExpense);
          alert("數據匯入成功！");
          performSave();
        } else {
          alert("檔案格式不正確，請確認是正確的備份檔。");
        }
      } catch (err) {
        alert("讀取檔案失敗：" + err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (!isLoaded) return;
    setHasUnsavedChanges(true);
  }, [assets, liabilities, incomeExpense]);

  const handleUpdateAsset = (id: string, field: string, value: any) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleUpdateLiability = (id: string, field: string, value: number) => {
    setLiabilities(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleUpdateIncomeExpense = (field: keyof IncomeExpense, value: number) => {
    setIncomeExpense(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAsset = (newAsset: Asset, initialLoan?: number) => {
    setAssets(prev => [...prev, newAsset]);
    if (initialLoan !== undefined && initialLoan > 0) {
      setLiabilities(prev => [...prev, {
        id: `l-${Date.now()}`,
        name: `${newAsset.name} 借款`,
        type: newAsset.type === 'investment' ? 'policy' : 'mortgage',
        principal: initialLoan,
        interestRate: 0.03,
        relatedAssetId: newAsset.id,
        maintenanceThreshold: 0.7,
        liquidateThreshold: 0.8
      }]);
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("確定刪除此資產？")) {
      setAssets(prev => prev.filter(a => a.id !== id));
      setLiabilities(prev => prev.filter(l => l.relatedAssetId !== id));
    }
  };

  const financialData = useMemo(() => {
    const adjustedAssets = assets.map(a => ({
      ...a,
      currentValue: a.type === 'investment' ? a.marketValue * (1 - stress.marketCrash) : a.marketValue
    }));
    
    const investmentEquityDetails = adjustedAssets
      .filter(a => a.type === 'investment')
      .map(a => {
        const loan = liabilities.find(l => l.relatedAssetId === a.id);
        return { name: a.name, netValue: a.currentValue - (loan?.principal || 0) };
      });

    const totalAssets = adjustedAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalLiabilitiesValue = liabilities.reduce((sum, l) => sum + l.principal, 0);
    const monthlyTotalIncome = incomeExpense.monthlyActiveIncome + incomeExpense.monthlyPassiveIncome;
    
    let assetLoanInterestOnly = 0;
    let bankHikePressure = 0;

    liabilities.forEach(l => {
      const isBankLoan = l.type === 'mortgage' || l.type === 'credit';
      const monthlyHikeInterest = (l.principal * stress.interestHike) / 12;
      
      if (isBankLoan) {
        bankHikePressure += monthlyHikeInterest;
      } else {
        const fullRate = l.interestRate + stress.interestHike;
        assetLoanInterestOnly += (l.principal * fullRate) / 12;
      }
    });

    const fixedMonthlyPayments = incomeExpense.monthlyMortgagePayment + incomeExpense.monthlyCreditPayment + incomeExpense.monthlyBaseLivingExpense;
    const monthlyTotalExpense = fixedMonthlyPayments + assetLoanInterestOnly + bankHikePressure;
    
    const totalCost = assets.reduce((sum, a) => sum + a.cost, 0);
    const totalRealizedDividend = assets.reduce((sum, a) => sum + a.realizedDividend, 0);
    const totalProfit = (assets.reduce((sum, a) => sum + a.marketValue, 0) + totalRealizedDividend) - totalCost;
    
    const investmentLoans = liabilities.filter(l => l.type === 'policy' || l.type === 'pledge').reduce((sum, l) => sum + l.principal, 0);
    const netInvestmentEquity = adjustedAssets.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.currentValue, 0) - investmentLoans;
    const totalLiquidity = netInvestmentEquity + (adjustedAssets.find(a => a.id === 'c1')?.currentValue || 0) + incomeExpense.unusedCreditLimit;

    return {
      netWorth: totalAssets - totalLiabilitiesValue,
      monthlyPassiveIncome: incomeExpense.monthlyPassiveIncome,
      netCashFlow: monthlyTotalIncome - monthlyTotalExpense,
      fireProgress: ((totalAssets - totalLiabilitiesValue) / incomeExpense.fireGoal) * 100,
      totalProfit,
      roi: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
      totalLiquidity,
      netInvestmentEquity,
      investmentEquityDetails,
      adjustedAssets,
      monthlyTotalIncomeActive: incomeExpense.monthlyActiveIncome,
      expenseDetail: {
        fixedPayments: fixedMonthlyPayments,
        variableInterests: assetLoanInterestOnly + bankHikePressure,
        total: monthlyTotalExpense
      },
      totalRealizedDividend
    };
  }, [assets, liabilities, incomeExpense, stress]);

  return (
    <div className="min-h-screen bg-[#FEF9F6] text-slate-800 selection:bg-rose-100 pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-rose-500 p-1.5 rounded-lg shadow-sm">
              <Activity className="text-white w-4 h-4 sm:w-5 h-5" />
            </div>
            <h1 className="text-xs sm:text-base font-black tracking-tighter uppercase">財務戰略核心</h1>
          </div>

          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            
            <div className="hidden lg:flex items-center gap-2 mr-2 border-r border-orange-100 pr-4">
              <button onClick={handleExport} title="匯出 JSON 備份" className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} title="匯入 JSON 備份" className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${isSaving ? 'bg-amber-50 border-amber-100' : (hasUnsavedChanges ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-slate-50 border-slate-100')}`}>
              {isSaving ? <Loader2 className="w-3 h-3 text-amber-500 animate-spin" /> : (hasUnsavedChanges ? <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />)}
              <span className={`text-[8px] font-black uppercase tracking-tighter ${hasUnsavedChanges ? 'text-amber-600 font-black' : 'text-emerald-600'}`}>
                {isSaving ? '同步中...' : (hasUnsavedChanges ? '待存檔' : '已存檔')}
              </span>
            </div>

            <button onClick={() => setShowAIModal(true)} className="flex items-center gap-1 p-2 sm:px-4 py-1.5 text-[10px] font-black text-amber-600 border border-amber-100 bg-amber-50 hover:bg-amber-100 rounded-lg sm:rounded-xl transition-all shadow-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">AI 診斷文本</span>
            </button>

            <button onClick={() => window.print()} className="flex items-center gap-1 p-2 sm:px-4 py-1.5 text-[10px] font-black text-rose-600 border border-rose-100 bg-rose-50 hover:bg-rose-100 rounded-lg sm:rounded-xl transition-all shadow-sm">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">列印 PDF</span>
            </button>

            <button onClick={performSave} className={`flex items-center gap-1 p-2 sm:px-4 py-1.5 text-[10px] font-black text-white rounded-lg sm:rounded-xl transition-all shadow-md ${hasUnsavedChanges ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-slate-400 hover:bg-slate-500'}`}>
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">手動儲存</span>
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 sm:hidden text-slate-600">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <SummaryCards data={financialData} fireGoal={incomeExpense.fireGoal} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8">
          <div className="xl:col-span-8 space-y-4 sm:space-y-8">
            <FinancialCharts 
              assets={financialData.adjustedAssets} 
              liabilities={liabilities}
              incomeActive={financialData.monthlyTotalIncomeActive}
              incomePassive={financialData.monthlyPassiveIncome}
              expenseDetail={financialData.expenseDetail}
              stress={stress}
            />
            
            <StressTestSection stress={stress} setStress={setStress} />
            
            <AssetLiabilityList 
              assets={assets} liabilities={liabilities} 
              adjustedAssets={financialData.adjustedAssets}
              stress={stress}
              totalRealizedDividend={financialData.totalRealizedDividend}
              onUpdateAsset={handleUpdateAsset} onUpdateLiability={handleUpdateLiability}
              onAddAsset={handleAddAsset} onDeleteAsset={handleDeleteAsset}
              onUpdateIncomeExpense={handleUpdateIncomeExpense}
              incomeExpense={incomeExpense}
              netCashFlow={financialData.netCashFlow}
            />
          </div>

          <div className="xl:col-span-4 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-orange-100 shadow-lg">
              <h3 className="text-sm sm:text-lg font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 sm:w-5 h-5 text-rose-500" /> 備用金管理系統
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider">活存現金</span>
                  <input type="number" value={assets.find(a => a.id === 'c1')?.marketValue || 0} onChange={(e) => handleUpdateAsset('c1', 'marketValue', Number(e.target.value))} className="w-24 sm:w-28 bg-transparent border-b border-slate-200 text-right font-black text-xs sm:text-sm" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider">未用信貸額度</span>
                  <input type="number" value={incomeExpense.unusedCreditLimit} onChange={(e) => handleUpdateIncomeExpense('unusedCreditLimit', Number(e.target.value))} className="w-24 sm:w-28 bg-transparent border-b border-slate-200 text-right font-black text-xs sm:text-sm" />
                </div>
                <div className="p-3 bg-orange-50/30 rounded-xl border border-orange-100 border-dashed cursor-pointer flex justify-between items-center" onClick={() => setShowLiquidityDetail(!showLiquidityDetail)}>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-wider">投資權益淨值</span>
                    {showLiquidityDetail ? <ChevronUp className="w-3 h-3 text-slate-300" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
                  </div>
                  <span className="text-xs sm:text-sm font-black text-rose-500">${parseFloat(financialData.netInvestmentEquity.toFixed(0)).toLocaleString()}</span>
                </div>
                {showLiquidityDetail && (
                  <div className="ml-3 space-y-1.5 border-l border-orange-100 pl-3 py-1 animate-in slide-in-from-top-1 duration-300">
                    {financialData.investmentEquityDetails.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[8px] sm:text-[9px] font-bold text-slate-400">
                        <span>{item.name}</span>
                        <span>${parseFloat(item.netValue.toFixed(0)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-3 border-t border-orange-50">
                  <div className="flex items-center gap-1.5 mb-0.5">
                     <Clock className="w-3 h-3 text-rose-400" />
                     <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">戰略總流動性</p>
                  </div>
                  <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">${parseFloat(financialData.totalLiquidity.toFixed(0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAIModal && (
        <AIDiagnosisModal 
          isOpen={showAIModal} 
          onClose={() => setShowAIModal(false)} 
          assets={assets}
          liabilities={liabilities}
          incomeExpense={incomeExpense}
          stress={stress}
          financialData={financialData}
        />
      )}
    </div>
  );
};

export default App;
