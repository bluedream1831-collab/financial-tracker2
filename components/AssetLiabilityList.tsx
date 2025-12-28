
import React, { useState } from 'react';
import { 
  Layers, 
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Coins,
  DollarSign,
  Calendar,
  CreditCard,
  Home,
  Coffee,
  Wallet,
  ArrowRightLeft,
  Settings2,
  TrendingUp,
  Banknote,
  Clock
} from 'lucide-react';
import { Asset, Liability, StressTestState, IncomeExpense } from '../types';

interface AssetLiabilityListProps {
  assets: Asset[];
  liabilities: Liability[];
  adjustedAssets: (Asset & { currentValue: number })[];
  stress: StressTestState;
  totalRealizedDividend?: number;
  incomeExpense: IncomeExpense;
  onUpdateAsset: (id: string, field: string, value: any) => void;
  onUpdateLiability: (id: string, field: string, value: number) => void;
  onAddAsset: (asset: Asset, initialLoan?: number) => void;
  onDeleteAsset: (id: string) => void;
  onUpdateIncomeExpense: (field: keyof IncomeExpense, value: number) => void;
  netCashFlow: number;
}

const calculateHoldingDuration = (dateStr?: string) => {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  const now = new Date();
  if (isNaN(start.getTime())) return null;
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years === 0) return `${months}個月`;
  if (months === 0) return `${years}年`;
  return `${years}年${months}個月`;
};

const formatWan = (val: number) => {
  const wan = val / 10000;
  return `${parseFloat(wan.toFixed(2)).toLocaleString()}萬`;
};

const AssetLiabilityList: React.FC<AssetLiabilityListProps> = ({ 
  assets, liabilities, adjustedAssets, stress, totalRealizedDividend, incomeExpense, onUpdateAsset, onUpdateLiability, onAddAsset, onDeleteAsset, onUpdateIncomeExpense, netCashFlow
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    type: Asset['type'];
    marketValue: number;
    cost: number;
    realizedDividend: number;
    loan: number;
    purchaseDate: string;
  }>({
    name: '', type: 'investment', marketValue: 0, cost: 0, realizedDividend: 0, loan: 0, purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name) return;
    onAddAsset({
      id: `a-${Date.now()}`,
      name: newAsset.name,
      type: newAsset.type,
      marketValue: newAsset.marketValue,
      cost: newAsset.cost,
      annualDividend: 0,
      realizedDividend: newAsset.realizedDividend,
      purchaseDate: newAsset.purchaseDate
    }, newAsset.loan);
    setShowAddForm(false);
    setNewAsset({ name: '', type: 'investment', marketValue: 0, cost: 0, realizedDividend: 0, loan: 0, purchaseDate: new Date().toISOString().split('T')[0] });
  };

  const statusConfig = {
    safe: { color: 'text-emerald-500', bg: 'bg-emerald-500', label: '安全' },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500', label: '預警' },
    topup: { color: 'text-orange-500', bg: 'bg-orange-500', label: '補繳' },
    danger: { color: 'text-rose-600', bg: 'bg-rose-600', label: '斷頭' }
  };

  const strategicItems = liabilities
    .filter(l => l.relatedAssetId)
    .map(l => {
      const originalAsset = assets.find(a => a.id === l.relatedAssetId);
      const adjustedAsset = adjustedAssets.find(a => a.id === l.relatedAssetId);
      let ratio = 0;
      let status: 'safe' | 'warning' | 'topup' | 'danger' = 'safe';
      let totalRoi = 0;
      let topUpLine = 0; 
      let dangerLine = 0; 
      const individualMonthlyInterest = (l.principal * (l.interestRate + stress.interestHike)) / 12;
      
      if (adjustedAsset && originalAsset) {
        ratio = l.principal / adjustedAsset.currentValue;
        const isPledge = l.type === 'pledge';
        const mRatio = l.maintenanceThreshold || (isPledge ? 1.4 : 0.7);
        const lRatio = l.liquidateThreshold || (isPledge ? 1.3 : 0.8);

        if (isPledge) {
          topUpLine = l.principal * mRatio; 
          dangerLine = l.principal * lRatio; 
          const maintenanceRatio = 1 / ratio;
          if (maintenanceRatio <= lRatio) status = 'danger';      
          else if (maintenanceRatio <= mRatio) status = 'topup'; 
          else if (maintenanceRatio <= mRatio + 0.1) status = 'warning'; 
        } else {
          topUpLine = l.principal / mRatio;
          dangerLine = l.principal / lRatio;
          if (ratio >= lRatio) status = 'danger';
          else if (ratio >= mRatio) status = 'topup';
          else if (ratio >= mRatio - 0.1) status = 'warning';
        }
        if (originalAsset.cost > 0) {
          totalRoi = ((adjustedAsset.currentValue + originalAsset.realizedDividend - originalAsset.cost) / originalAsset.cost) * 100;
        }
      }
      return { ...l, originalAsset, adjustedAsset, ratio, status, totalRoi, topUpLine, dangerLine, individualMonthlyInterest };
    });

  const pureAssets = assets.filter(a => !liabilities.some(l => l.relatedAssetId === a.id) && a.type !== 'cash' && a.id !== 'r1')
      .map(a => ({
        id: `pure-${a.id}`, name: a.name, originalAsset: a, 
        adjustedAsset: adjustedAssets.find(aa => aa.id === a.id),
        totalRoi: a.cost > 0 ? (((adjustedAssets.find(aa => aa.id === a.id)?.currentValue || a.marketValue) + a.realizedDividend - a.cost) / a.cost) * 100 : 0
      }));

  const fixedLiabilities = liabilities
    .filter(l => !l.relatedAssetId)
    .map(l => ({
      ...l,
      individualMonthlyInterest: (l.principal * (l.interestRate + stress.interestHike)) / 12
    }));

  return (
    <div className="space-y-8">
      {/* 戰略槓桿清單面版 */}
      <div className="bg-white rounded-[1.2rem] sm:rounded-[2.5rem] border border-rose-100 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-rose-50 bg-rose-50/10 no-print">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-rose-500 p-1.5 rounded-lg">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm sm:text-lg font-black text-slate-900 uppercase">戰略投資槓桿管理</h3>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100">
                <Coins className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-black text-rose-600 uppercase">戰略總息收: ${parseFloat((totalRealizedDividend || 0).toFixed(0)).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setShowAddForm(!showAddForm)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[9px] sm:text-[11px] font-black px-3 py-2 rounded-lg bg-rose-500 text-white shadow-md shadow-rose-100">
                <Plus className="w-3.5 h-3.5" /> 新增資產
              </button>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="p-4 bg-rose-50/30 border-b border-rose-50 no-print animate-in slide-in-from-top-2 duration-300">
            <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="項目名稱 (例: 0050 股票質押)" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="col-span-2 bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">持有起始日期</label>
                <input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">目前市場價值</label>
                <input type="number" placeholder="目前市值" value={newAsset.marketValue || ''} onChange={e => setNewAsset({...newAsset, marketValue: Number(e.target.value)})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
              </div>
              <input type="number" placeholder="投資投入成本" value={newAsset.cost || ''} onChange={e => setNewAsset({...newAsset, cost: Number(e.target.value)})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
              <input type="number" placeholder="已領累計息收" value={newAsset.realizedDividend || ''} onChange={e => setNewAsset({...newAsset, realizedDividend: Number(e.target.value)})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
              <button type="submit" className="col-span-2 mt-2 bg-rose-500 text-white py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-rose-100 active:scale-95 transition-all">建立戰略項目</button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-rose-50/5 border-b border-rose-50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">投資項目與期間</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">市值 / 成本 / 已領息</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">借款本金 / 利率 (月息)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">風控狀態 (LTV)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right no-print">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50/50">
              {strategicItems.map(item => (
                <tr key={item.id} className={`hover:bg-rose-50/10 transition-colors ${item.status === 'danger' ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-6 py-6">
                    <div className="font-black text-slate-900">{item.name.replace(' 借款', '')}</div>
                    <div className="flex flex-col gap-1 mt-1.5">
                      <div className="flex items-center gap-1.5 group/date">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <input 
                          type="date" 
                          value={item.originalAsset?.purchaseDate || ''} 
                          onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'purchaseDate', e.target.value)}
                          className="text-[10px] font-black text-blue-600 bg-transparent border-none focus:outline-none p-0 w-24 cursor-pointer hover:bg-blue-50/50 rounded px-1 transition-colors"
                        />
                      </div>
                      {item.originalAsset?.purchaseDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-300" />
                          <span className="text-[10px] font-black text-slate-400">已持有：{calculateHoldingDuration(item.originalAsset.purchaseDate)}</span>
                        </div>
                      )}
                      <div className={`text-[10px] font-bold ${item.totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>總投報率: {parseFloat(item.totalRoi.toFixed(1))}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-slate-300 uppercase w-8 text-right">市值</span>
                        <input type="number" value={item.originalAsset?.marketValue || 0} onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'marketValue', Number(e.target.value))} className="w-24 bg-transparent border-b border-dashed border-slate-200 text-sm font-black text-slate-900 text-center focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-blue-300 uppercase w-8 text-right">成本</span>
                        <input type="number" value={item.originalAsset?.cost || 0} onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'cost', Number(e.target.value))} className="w-24 bg-transparent border-b border-dashed border-blue-200 text-xs font-black text-blue-700 text-center focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-rose-300 uppercase w-8 text-right">領息</span>
                        <input type="number" value={item.originalAsset?.realizedDividend || 0} onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'realizedDividend', Number(e.target.value))} className="w-24 bg-rose-50/50 rounded px-1 text-[10px] font-black text-rose-500 text-center focus:outline-none border-b border-rose-200" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-indigo-300 uppercase w-8 text-right">本金</span>
                        <input type="number" value={item.principal} onChange={(e) => onUpdateLiability(item.id, 'principal', Number(e.target.value))} className="w-24 bg-transparent border-b border-dashed border-indigo-200 text-sm font-black text-indigo-700 text-center focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-indigo-300 uppercase w-8 text-right">利率</span>
                        <div className="flex items-center justify-center gap-1 w-24">
                          <input type="number" step="0.01" value={Number((item.interestRate * 100).toFixed(2))} onChange={(e) => onUpdateLiability(item.id, 'interestRate', Number(e.target.value) / 100)} className="w-12 bg-indigo-50/50 rounded text-[10px] font-black text-indigo-600 text-center focus:outline-none border-b border-indigo-200" />
                          <span className="text-[8px] font-black text-indigo-300">%</span>
                        </div>
                      </div>
                      <div className="bg-rose-50/50 p-1.5 rounded-lg border border-rose-100">
                        <span className="text-[11px] font-black text-rose-600">${parseFloat(item.individualMonthlyInterest.toFixed(0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black inline-flex items-center gap-2 text-white ${statusConfig[item.status].bg} shadow-sm mb-1.5`}>
                        {statusConfig[item.status].label}
                      </div>
                      
                      {/* 當前借款比顯示 */}
                      <div className="mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-0.5">當前借款佔比</span>
                        <span className={`text-xs font-black ${(item.ratio * 100) > 60 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {parseFloat((item.ratio * 100).toFixed(1))}%
                        </span>
                      </div>

                      {item.topUpLine > 0 && (
                        <div className="text-[8px] font-bold text-slate-400 space-y-0.5 border-t border-rose-50 pt-1.5 w-full">
                          <div className="flex justify-between">
                            <span>補繳市值</span>
                            <span>{formatWan(item.topUpLine)}</span>
                          </div>
                          <div className="flex justify-between text-rose-400">
                            <span>斷頭市值</span>
                            <span>{formatWan(item.dangerLine)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right no-print">
                    <button onClick={() => onDeleteAsset(item.originalAsset?.id || '')} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {pureAssets.map(item => (
                <tr key={item.id} className="bg-slate-50/30 italic">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-500 text-xs">{item.name} <span className="text-[8px] font-black text-slate-300 uppercase bg-slate-100 px-1 rounded ml-1">純資產</span></div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-2.5 h-2.5 text-slate-300" />
                      <input 
                        type="date" 
                        value={item.originalAsset?.purchaseDate || ''} 
                        onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'purchaseDate', e.target.value)}
                        className="text-[9px] font-bold text-slate-400 bg-transparent border-none focus:outline-none p-0 w-20 cursor-pointer"
                      />
                      {item.originalAsset?.purchaseDate && <span className="text-[9px] font-bold text-slate-300">({calculateHoldingDuration(item.originalAsset.purchaseDate)})</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-[10px] font-black text-slate-400">市值: {formatWan(item.adjustedAsset?.currentValue || 0)}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-200">—</td>
                  <td className="px-6 py-4 text-center text-slate-200">—</td>
                  <td className="px-6 py-4 text-right no-print">
                    <button onClick={() => onDeleteAsset(item.originalAsset?.id || '')} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 現金流與債務引擎 (結合參數與固定支出) */}
      <div className="bg-slate-50 rounded-[1.2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        {/* 頂部整合參數區 */}
        <div className="bg-gradient-to-r from-[#4c0519] to-[#831843] p-4 sm:p-8 text-white no-print">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Settings2 className="w-5 h-5 text-rose-200" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight">戰略現金流與債務引擎</h3>
                <p className="text-[8px] sm:text-[10px] font-bold text-rose-300 uppercase tracking-widest">Cash Flow & Fixed Liability Management</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 lg:max-w-3xl">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                <label className="text-[8px] font-black text-rose-200 uppercase mb-1 block tracking-widest">月主動薪資</label>
                <div className="flex items-center">
                  <span className="text-rose-400 text-xs mr-1">$</span>
                  <input type="number" value={incomeExpense.monthlyActiveIncome} onChange={(e) => onUpdateIncomeExpense('monthlyActiveIncome', Number(e.target.value))} className="w-full bg-transparent text-sm sm:text-lg font-black focus:outline-none border-b border-dashed border-rose-500" />
                </div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                <label className="text-[8px] font-black text-rose-200 uppercase mb-1 block tracking-widest">月被動配息</label>
                <div className="flex items-center">
                  <span className="text-rose-400 text-xs mr-1">$</span>
                  <input type="number" value={incomeExpense.monthlyPassiveIncome} onChange={(e) => onUpdateIncomeExpense('monthlyPassiveIncome', Number(e.target.value))} className="w-full bg-transparent text-sm sm:text-lg font-black focus:outline-none border-b border-dashed border-rose-500" />
                </div>
              </div>
              <div className={`col-span-2 sm:col-span-1 p-3 rounded-xl border-2 transition-all ${netCashFlow >= 0 ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-rose-500/20 border-rose-500/40'}`}>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">戰略月盈餘</p>
                <span className={`text-lg sm:text-xl font-black ${netCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  ${parseFloat(netCashFlow.toFixed(0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 下方支出明細 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-indigo-50/20 border-b border-indigo-50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">支出類別</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">借款本金 / 餘額</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">年利率 (%)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">每月支付金額 (本利)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">備註</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50/50">
              <tr className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-5 h-5 text-amber-500" />
                    <div className="font-black text-slate-900">基礎生活開銷支出</div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center text-slate-200">—</td>
                <td className="px-6 py-6 text-center text-slate-200">—</td>
                <td className="px-6 py-6 text-center">
                  <input type="number" value={incomeExpense.monthlyBaseLivingExpense} onChange={(e) => onUpdateIncomeExpense('monthlyBaseLivingExpense', Number(e.target.value))} className="w-32 bg-transparent border-b border-dashed border-amber-300 text-sm font-black text-amber-700 text-center focus:outline-none" />
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase bg-white/80 border border-slate-200 px-2 py-1 rounded shadow-sm">生存基礎</span>
                </td>
              </tr>
              {fixedLiabilities.map(l => (
                <tr key={l.id} className="hover:bg-indigo-100/20 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      {l.type === 'mortgage' ? <Home className="w-5 h-5 text-indigo-400" /> : <CreditCard className="w-5 h-5 text-purple-400" />}
                      <div className="font-black text-slate-900">{l.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <input type="number" value={l.principal} onChange={(e) => onUpdateLiability(l.id, 'principal', Number(e.target.value))} className="w-32 bg-transparent border-b border-dashed border-indigo-200 text-sm font-black text-indigo-700 text-center focus:outline-none" />
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <input type="number" step="0.01" value={Number((l.interestRate * 100).toFixed(2))} onChange={(e) => onUpdateLiability(l.id, 'interestRate', Number(e.target.value) / 100)} className="w-16 bg-white/80 border border-indigo-100 rounded text-xs font-black text-indigo-600 text-center focus:outline-none py-1" />
                      <span className="text-[10px] font-bold text-indigo-300">%</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <input type="number" value={l.type === 'mortgage' ? incomeExpense.monthlyMortgagePayment : incomeExpense.monthlyCreditPayment} onChange={(e) => onUpdateIncomeExpense(l.type === 'mortgage' ? 'monthlyMortgagePayment' : 'monthlyCreditPayment', Number(e.target.value))} className="w-32 bg-transparent border-b border-dashed border-rose-300 text-sm font-black text-rose-500 text-center focus:outline-none" />
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="text-[8px] font-bold text-slate-500 uppercase bg-white/50 px-2 py-1 rounded border border-slate-100">
                      壓力利息: ${parseFloat(l.individualMonthlyInterest.toFixed(0)).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetLiabilityList;
