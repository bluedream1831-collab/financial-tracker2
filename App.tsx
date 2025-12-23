
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
  Clock
} from 'lucide-react';
import { Asset, Liability, IncomeExpense, StressTestState } from './types';
import SummaryCards from './components/SummaryCards';
import FinancialCharts from './components/FinancialCharts';
import StressTestSection from './components/StressTestSection';
import AssetLiabilityList from './components/AssetLiabilityList';

const STORAGE_KEY = 'FINANCIAL_FREOM_DASHBOARD_DATA_V2';

const initialAssets: Asset[] = [
  { id: 'p1', name: '保單 A (法巴年金)', type: 'investment', marketValue: 477000, cost: 500000, annualDividend: 0, realizedDividend: 12000 },
  { id: 'p2', name: '保單 B (法巴壽險)', type: 'investment', marketValue: 1477000, cost: 1500000, annualDividend: 0, realizedDividend: 35000 },
  { id: 'p3', name: '保單 C (安達年金)', type: 'investment', marketValue: 1800000, cost: 1729999, annualDividend: 0, realizedDividend: 80000 },
  { id: 'p4', name: '保單 D (安聯主力)', type: 'investment', marketValue: 3280000, cost: 3030000, annualDividend: 0, realizedDividend: 150000 },
  { id: 's1', name: '股票質押貸款 (標的)', type: 'investment', marketValue: 2450000, cost: 1890000, annualDividend: 0, realizedDividend: 660000 },
  { id: 'r1', name: '房產 (估值)', type: 'realestate', marketValue: 4700000, cost: 4700000, annualDividend: 0, realizedDividend: 0 },
  { id: 'c1', name: '活存備用金', type: 'cash', marketValue: 420000, cost: 420000, annualDividend: 0, realizedDividend: 0 },
];

const initialLiabilities: Liability[] = [
  { id: 'l1', name: '保單 A 借款', type: 'policy', principal: 200000, interestRate: 0.0317, relatedAssetId: 'p1', maintenanceThreshold: 0.5 },
  { id: 'l2', name: '保單 B 借款', type: 'policy', principal: 650000, interestRate: 0.0317, relatedAssetId: 'p2', maintenanceThreshold: 0.5 },
  { id: 'l3', name: '保單 C 借款', type: 'policy', principal: 790000, interestRate: 0.04, relatedAssetId: 'p3', maintenanceThreshold: 0.5 },
  { id: 'l4', name: '保單 D 借款', type: 'policy', principal: 880000, interestRate: 0.04, relatedAssetId: 'p4', maintenanceThreshold: 0.5 },
  { id: 'l6', name: '股票質押貸款', type: 'pledge', principal: 500000, interestRate: 0.03, relatedAssetId: 's1', maintenanceThreshold: 1.3 },
  { id: 'l7', name: '房屋貸款', type: 'mortgage', principal: 4604000, interestRate: 0.021 },
  { id: 'l8', name: '信用貸款', type: 'credit', principal: 956000, interestRate: 0.035 },
];

const initialIncomeExpense: IncomeExpense = {
  monthlyActiveIncome: 42000,
  monthlyPassiveIncome: 55000,
  monthlyMortgagePayment: 31000,
  monthlyCreditPayment: 13000,
  monthlyBaseLivingExpense: 20000,
  fireGoal: 20000000,
  unusedCreditLimit: 860000,
};

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLiquidityDetail, setShowLiquidityDetail] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [liabilities, setLiabilities] = useState<Liability[]>(initialLiabilities);
  const [incomeExpense, setIncomeExpense] = useState<IncomeExpense>(initialIncomeExpense);
  const [stress, setStress] = useState<StressTestState>({
    marketCrash: 0,
    interestHike: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化讀取
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

  // 2. 存檔核心函數
  const performSave = () => {
    setIsSaving(true);
    const now = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const dataToSave = { assets, liabilities, incomeExpense, lastSavedTime: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedTime(now);
      setHasUnsavedChanges(false);
    }, 800);
  };

  // 3. 自動存檔機制 (Debounce)
  useEffect(() => {
    if (!isLoaded) return;
    setHasUnsavedChanges(true);
    const timeout = setTimeout(() => {
      performSave();
    }, 3000); // 延長到 3 秒自動存檔
    return () => clearTimeout(timeout);
  }, [assets, liabilities, incomeExpense, isLoaded]);

  // 4. 鍵盤快捷鍵 (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        performSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [assets, liabilities, incomeExpense]);

  const handleExportData = () => {
    const data = { assets, liabilities, incomeExpense, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Strategy_Core_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (!content.assets || !content.liabilities) throw new Error();
        setAssets(content.assets);
        setLiabilities(content.liabilities);
        setIncomeExpense(content.incomeExpense);
        alert("資料匯入成功！系統已更新。");
        performSave();
      } catch (err) { alert("檔案格式不符，請使用本系統導出的 JSON 檔案。"); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetData = () => {
    if (confirm("確定要將所有資料重置為初始狀態嗎？此操作不可撤銷。")) {
      setAssets(initialAssets);
      setLiabilities(initialLiabilities);
      setIncomeExpense(initialIncomeExpense);
      setStress({ marketCrash: 0, interestHike: 0 });
      localStorage.removeItem(STORAGE_KEY);
      alert("資料已重置。");
    }
  };

  const handleUpdateAsset = (id: string, field: 'marketValue' | 'cost' | 'realizedDividend', value: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleUpdateLiability = (id: string, field: 'principal' | 'interestRate', value: number) => {
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
        maintenanceThreshold: 0.5
      }]);
    }
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("確定刪除此資產？相關聯的借款也將一併移除。")) {
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
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.principal, 0);
    const monthlyTotalIncome = incomeExpense.monthlyActiveIncome + incomeExpense.monthlyPassiveIncome;
    const extraLoanInterestHike = liabilities
      .filter(l => l.type === 'policy' || l.type === 'pledge')
      .reduce((sum, l) => (sum + (l.principal * stress.interestHike) / 12), 0);
    const monthlyTotalExpense = incomeExpense.monthlyMortgagePayment + incomeExpense.monthlyCreditPayment + incomeExpense.monthlyBaseLivingExpense + extraLoanInterestHike;
    
    const totalCost = assets.reduce((sum, a) => sum + a.cost, 0);
    const totalRealizedDividend = assets.reduce((sum, a) => sum + a.realizedDividend, 0);
    const totalProfit = (assets.reduce((sum, a) => sum + a.marketValue, 0) + totalRealizedDividend) - totalCost;
    const investmentLoans = liabilities.filter(l => l.type === 'policy' || l.type === 'pledge').reduce((sum, l) => sum + l.principal, 0);
    const netInvestmentEquity = adjustedAssets.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.currentValue, 0) - investmentLoans;
    const totalLiquidity = netInvestmentEquity + (adjustedAssets.find(a => a.id === 'c1')?.currentValue || 0) + incomeExpense.unusedCreditLimit;

    return {
      netWorth: totalAssets - totalLiabilities,
      monthlyPassiveIncome: incomeExpense.monthlyPassiveIncome,
      netCashFlow: monthlyTotalIncome - monthlyTotalExpense,
      fireProgress: ((totalAssets - totalLiabilities) / incomeExpense.fireGoal) * 100,
      totalProfit,
      roi: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
      totalLiquidity,
      netInvestmentEquity,
      investmentEquityDetails,
      adjustedAssets,
      monthlyTotalIncomeActive: incomeExpense.monthlyActiveIncome,
      monthlyTotalExpense
    };
  }, [assets, liabilities, incomeExpense, stress]);

  return (
    <div className="min-h-screen bg-[#FEF9F6] text-slate-800 selection:bg-rose-100 pb-10">
      <header className="bg-white/70 backdrop-blur-lg border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Activity className="text-white w-4 h-4 sm:w-6 h-6" />
            </div>
            <h1 className="text-sm sm:text-lg font-black tracking-tighter">STRATEGY.CORE</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* 存檔狀態指示燈 */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${isSaving ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">同步中...</span>
                </>
              ) : (
                <>
                  {hasUnsavedChanges ? (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${hasUnsavedChanges ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {hasUnsavedChanges ? '偵測到變動' : '資料已存檔'}
                    </span>
                    {lastSavedTime && (
                      <span className="text-[7px] text-slate-400 font-bold leading-none">{lastSavedTime}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={performSave} 
                className="flex items-center gap-1.5 p-2 sm:px-4 py-2 text-[10px] font-black text-white bg-rose-500 hover:bg-rose-600 rounded-lg sm:rounded-xl transition-all active:scale-90 shadow-lg shadow-rose-200"
                title="立即儲存 (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">儲存策略</span>
              </button>
              
              <div className="h-6 w-px bg-orange-100 mx-1 hidden sm:block" />

              <button onClick={handleExportData} className="p-2 sm:px-3 py-2 text-[10px] font-black text-slate-600 hover:text-rose-600 transition-all border border-slate-100 rounded-lg sm:rounded-xl bg-white" title="導出 JSON 備份">
                <Download className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">備份</span>
              </button>
              
              <button onClick={() => fileInputRef.current?.click()} className="p-2 sm:px-3 py-2 text-[10px] font-black text-slate-600 hover:text-rose-600 transition-all border border-slate-100 rounded-lg sm:rounded-xl bg-white" title="還原備份">
                <Upload className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">還原</span>
              </button>
              
              <button onClick={handleResetData} className="p-2 sm:px-3 py-2 text-[10px] font-black text-slate-400 hover:text-rose-600 transition-all border border-slate-100 rounded-lg sm:rounded-xl bg-white" title="初始化資料">
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <SummaryCards data={financialData} fireGoal={incomeExpense.fireGoal} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8 mt-4 sm:mt-8">
          <div className="xl:col-span-8 space-y-4 sm:space-y-8">
            <FinancialCharts 
              assets={financialData.adjustedAssets} 
              liabilities={liabilities}
              incomeActive={financialData.monthlyTotalIncomeActive}
              incomePassive={financialData.monthlyPassiveIncome}
              expenseTotal={financialData.monthlyTotalExpense}
            />
            <AssetLiabilityList 
              assets={assets} liabilities={liabilities} 
              adjustedAssets={financialData.adjustedAssets}
              stress={stress}
              onUpdateAsset={handleUpdateAsset} onUpdateLiability={handleUpdateLiability}
              onAddAsset={handleAddAsset} onDeleteAsset={handleDeleteAsset}
            />
          </div>

          <div className="xl:col-span-4 space-y-4 sm:space-y-6">
            {/* 戰略參數區塊 */}
            <div className="bg-gradient-to-br from-[#4c0519] to-[#831843] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-base sm:text-lg font-black mb-6 flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-rose-300" /> 戰略參數
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                    <label className="text-[10px] font-black text-rose-200 uppercase mb-2 block tracking-widest">月主動薪資</label>
                    <div className="flex items-center">
                      <span className="text-rose-300 mr-1">$</span>
                      <input 
                        type="number" 
                        value={incomeExpense.monthlyActiveIncome} 
                        onChange={(e) => handleUpdateIncomeExpense('monthlyActiveIncome', Number(e.target.value))} 
                        className="w-full bg-transparent text-xl font-black focus:outline-none border-b border-dashed border-rose-400 focus:border-white transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                    <label className="text-[10px] font-black text-rose-200 uppercase mb-2 block tracking-widest">月被動配息</label>
                    <div className="flex items-center">
                      <span className="text-rose-300 mr-1">$</span>
                      <input 
                        type="number" 
                        value={incomeExpense.monthlyPassiveIncome} 
                        onChange={(e) => handleUpdateIncomeExpense('monthlyPassiveIncome', Number(e.target.value))} 
                        className="w-full bg-transparent text-xl font-black focus:outline-none border-b border-dashed border-rose-400 focus:border-white transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-bold text-rose-100">房貸月付:</span>
                    <input type="number" value={incomeExpense.monthlyMortgagePayment} onChange={(e) => handleUpdateIncomeExpense('monthlyMortgagePayment', Number(e.target.value))} className="w-24 bg-transparent text-right font-black border-b border-dashed border-rose-400 focus:outline-none" />
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-bold text-rose-100">信貸月付:</span>
                    <input type="number" value={incomeExpense.monthlyCreditPayment} onChange={(e) => handleUpdateIncomeExpense('monthlyCreditPayment', Number(e.target.value))} className="w-24 bg-transparent text-right font-black border-b border-dashed border-rose-400 focus:outline-none" />
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-bold text-rose-100">生活開銷:</span>
                    <input type="number" value={incomeExpense.monthlyBaseLivingExpense} onChange={(e) => handleUpdateIncomeExpense('monthlyBaseLivingExpense', Number(e.target.value))} className="w-24 bg-transparent text-right font-black border-b border-dashed border-rose-400 focus:outline-none" />
                  </div>
                </div>

                <div className={`p-5 rounded-xl border-2 transition-colors duration-500 ${financialData.netCashFlow >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-200/60 mb-1">預估每月戰略盈餘</p>
                  <span className={`text-3xl font-black ${financialData.netCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    ${financialData.netCashFlow.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <StressTestSection stress={stress} setStress={setStress} />

            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-orange-100 shadow-lg">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-rose-500" /> 備用金管理
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400">活存現金備用金</span>
                  <div className="flex items-center">
                    <span className="text-slate-300 text-xs mr-1">$</span>
                    <input 
                      type="number" 
                      value={assets.find(a => a.id === 'c1')?.marketValue || 0}
                      onChange={(e) => handleUpdateAsset('c1', 'marketValue', Number(e.target.value))}
                      className="w-28 bg-transparent border-b border-dashed border-slate-200 text-right font-black text-slate-900 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400">未用信貸額度</span>
                  <div className="flex items-center">
                    <span className="text-slate-300 text-xs mr-1">$</span>
                    <input 
                      type="number" 
                      value={incomeExpense.unusedCreditLimit}
                      onChange={(e) => handleUpdateIncomeExpense('unusedCreditLimit', Number(e.target.value))}
                      className="w-28 bg-transparent border-b border-dashed border-slate-200 text-right font-black text-slate-900 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div 
                  className="p-3 bg-orange-50/30 rounded-xl border border-orange-100 border-dashed cursor-pointer flex justify-between items-center group"
                  onClick={() => setShowLiquidityDetail(!showLiquidityDetail)}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-rose-400 transition-colors">投資淨值 (可變現)</span>
                    {showLiquidityDetail ? <ChevronUp className="w-3 h-3 text-slate-300" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
                  </div>
                  <span className="text-sm font-black text-rose-500">${Math.round(financialData.netInvestmentEquity).toLocaleString()}</span>
                </div>
                {showLiquidityDetail && (
                  <div className="ml-3 space-y-2 border-l border-orange-100 pl-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    {financialData.investmentEquityDetails.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[9px] font-bold text-slate-500">
                        <span>{item.name}</span>
                        <span>${Math.round(item.netValue).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-4 border-t border-orange-50">
                  <div className="flex items-center gap-1.5 mb-1">
                     <Clock className="w-3 h-3 text-rose-400" />
                     <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Total Strategic Liquidity</p>
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">${Math.round(financialData.totalLiquidity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
