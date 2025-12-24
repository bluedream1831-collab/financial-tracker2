
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
  Calendar
} from 'lucide-react';
import { Asset, Liability, StressTestState } from '../types';

interface AssetLiabilityListProps {
  assets: Asset[];
  liabilities: Liability[];
  adjustedAssets: (Asset & { currentValue: number })[];
  stress: StressTestState;
  totalRealizedDividend?: number;
  onUpdateAsset: (id: string, field: string, value: any) => void;
  onUpdateLiability: (id: string, field: 'principal' | 'interestRate', value: number) => void;
  onAddAsset: (asset: Asset, initialLoan?: number) => void;
  onDeleteAsset: (id: string) => void;
}

const calculateHoldingDuration = (dateStr?: string) => {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  const now = new Date();
  
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

const AssetLiabilityList: React.FC<AssetLiabilityListProps> = ({ 
  assets, liabilities, adjustedAssets, stress, totalRealizedDividend, onUpdateAsset, onUpdateLiability, onAddAsset, onDeleteAsset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    name: '', type: 'investment', marketValue: 0, cost: 0, realizedDividend: 0, loan: 0, purchaseDate: ''
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
    setNewAsset({ name: '', type: 'investment', marketValue: 0, cost: 0, realizedDividend: 0, loan: 0, purchaseDate: '' });
  };

  const statusConfig = {
    safe: { color: 'text-emerald-500', bg: 'bg-emerald-500', label: '安全' },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500', label: '預警' },
    topup: { color: 'text-orange-500', bg: 'bg-orange-500', label: '補繳' },
    danger: { color: 'text-rose-600', bg: 'bg-rose-600', label: '斷頭' }
  };

  const tableData = [...liabilities.map(l => {
    const originalAsset = assets.find(a => a.id === l.relatedAssetId);
    const adjustedAsset = adjustedAssets.find(a => a.id === l.relatedAssetId);
    let ratio = 0;
    let status: 'safe' | 'warning' | 'topup' | 'danger' = 'safe';
    let totalRoi = 0;
    let topUpLine = 0; 
    let dangerLine = 0; 
    
    if (adjustedAsset && originalAsset && l.principal > 0) {
      const simulatedValue = adjustedAsset.currentValue;
      ratio = l.principal / simulatedValue;
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
        totalRoi = ((simulatedValue + originalAsset.realizedDividend - originalAsset.cost) / originalAsset.cost) * 100;
      }
    } else if (originalAsset) {
        const simulatedValue = adjustedAsset?.currentValue || originalAsset.marketValue;
        if (originalAsset.cost > 0) {
            totalRoi = ((simulatedValue + originalAsset.realizedDividend - originalAsset.cost) / originalAsset.cost) * 100;
        }
    }
    return { ...l, originalAsset, adjustedAsset, ratio, status, totalRoi, hasLiability: true, topUpLine, dangerLine, liabilityId: l.id };
  }), ...(isExpanded ? assets.filter(a => !liabilities.some(l => l.relatedAssetId === a.id)).map(a => ({
    id: `pure-${a.id}`, name: a.name, originalAsset: a, adjustedAsset: adjustedAssets.find(aa => aa.id === a.id),
    ratio: 0, status: 'safe' as const, totalRoi: a.cost > 0 ? (((adjustedAssets.find(aa => aa.id === a.id)?.currentValue || a.marketValue) + a.realizedDividend - a.cost) / a.cost) * 100 : 0,
    hasLiability: false, principal: 0, interestRate: 0, type: 'credit' as const, topUpLine: 0, dangerLine: 0, liabilityId: null, maintenanceThreshold: 0, liquidateThreshold: 0
  })) : [])];

  const formatWan = (val: number) => `${Math.round(val / 10000).toLocaleString()}萬`;

  return (
    <div className="bg-white rounded-[1.2rem] sm:rounded-[2.5rem] border border-orange-100 shadow-xl overflow-hidden">
      <div className="p-4 sm:p-8 border-b border-orange-50 bg-orange-50/10 no-print">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-rose-500 p-1.5 rounded-lg">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-black text-slate-900">資產負債風控明細</h3>
            </div>
            
            {totalRealizedDividend !== undefined && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100">
                <Coins className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-tight">戰略總息收: ${Math.round(totalRealizedDividend).toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[9px] sm:text-[11px] font-black px-3 py-2 rounded-lg bg-rose-500 text-white shadow-md shadow-rose-100">
              <Plus className="w-3.5 h-3.5" /> 新增資產
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[9px] sm:text-[11px] font-black px-3 py-2 rounded-lg border border-rose-100 text-rose-500">
              {isExpanded ? '隱藏純資產' : '展開全部資產'}
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="p-4 bg-rose-50/30 border-b border-rose-50 no-print animate-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="項目名稱 (例: 0050 股票質押)" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="col-span-2 bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-wider">持有日期</label>
                <input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})} className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-wider">目前資產市值</label>
                <input type="number" value={newAsset.marketValue || ''} onChange={e => setNewAsset({...newAsset, marketValue: Number(e.target.value)})} className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-wider">原始投資成本</label>
                <input type="number" value={newAsset.cost || ''} onChange={e => setNewAsset({...newAsset, cost: Number(e.target.value)})} className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-wider">累計已領息收</label>
                <input type="number" value={newAsset.realizedDividend || ''} onChange={e => setNewAsset({...newAsset, realizedDividend: Number(e.target.value)})} className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            </div>
            <button type="submit" className="col-span-2 mt-2 bg-rose-500 text-white py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-rose-100 active:scale-95 transition-all">建立戰略項目</button>
          </form>
        </div>
      )}

      {/* 手機版與列印版卡片列表 */}
      <div className="lg:hidden print:block p-3 space-y-3">
        {tableData.map((item) => (
          <div key={item.id} className={`p-4 rounded-[1.2rem] border transition-all ${item.status === 'danger' ? 'border-rose-300 bg-rose-50 shadow-inner' : 'border-orange-50 bg-white shadow-sm'}`}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-tight">{item.name.replace(' 借款', '')}</h4>
                {item.originalAsset?.purchaseDate && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-2.5 h-2.5 text-slate-300" />
                      <input 
                        type="date" 
                        value={item.originalAsset.purchaseDate}
                        onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'purchaseDate', e.target.value)}
                        className="bg-transparent text-[9px] font-bold text-slate-400 focus:outline-none"
                      />
                    </div>
                    <span className="text-[9px] font-black text-blue-500">持有：{calculateHoldingDuration(item.originalAsset.purchaseDate)}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black text-white ${statusConfig[item.status].bg} shadow-sm`}>
                  {statusConfig[item.status].label}
                </div>
                {item.maintenanceThreshold > 0 && (
                  <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    補繳{item.maintenanceThreshold * 100}% / 斷頭{item.liquidateThreshold * 100}%
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 mb-3">
               <span className={`text-[10px] font-black ${item.totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                總投報率 {Math.round(item.totalRoi)}%
              </span>
              <span className="text-[8px] font-bold text-slate-300">/</span>
              <span className="text-[10px] font-black text-slate-400 uppercase">目前市值 {formatWan(item.adjustedAsset?.currentValue || 0)}</span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">資產市值</label>
                    <input 
                      type="number" 
                      value={item.originalAsset?.marketValue || 0}
                      onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'marketValue', Number(e.target.value))}
                      className="w-full bg-transparent text-[11px] font-black text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1 text-slate-400">原始投資成本</label>
                    <input 
                      type="number" 
                      value={item.originalAsset?.cost || 0}
                      onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'cost', Number(e.target.value))}
                      className="w-full bg-transparent text-[11px] font-black text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                  <label className="text-[8px] font-black text-rose-400 uppercase block mb-1 flex items-center gap-1"><Coins className="w-2 h-2" /> 已領總息收</label>
                  <input 
                    type="number" 
                    value={item.originalAsset?.realizedDividend || 0}
                    onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'realizedDividend', Number(e.target.value))}
                    className="w-full bg-transparent text-[11px] font-black text-rose-600 focus:outline-none"
                  />
                </div>

                {item.hasLiability && item.liabilityId && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                      <label className="text-[8px] font-black text-indigo-400 uppercase block mb-1 flex items-center gap-1"><DollarSign className="w-2 h-2" /> 借款本金</label>
                      <input 
                        type="number" 
                        value={item.principal}
                        onChange={(e) => onUpdateLiability(item.liabilityId!, 'principal', Number(e.target.value))}
                        className="w-full bg-transparent text-[11px] font-black text-indigo-700 focus:outline-none"
                      />
                    </div>
                    <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                      <label className="text-[8px] font-black text-indigo-400 uppercase block mb-1 tracking-wider">年利率 (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={Number((item.interestRate * 100).toFixed(2))}
                        onChange={(e) => onUpdateLiability(item.liabilityId!, 'interestRate', Number(e.target.value) / 100)}
                        className="w-full bg-transparent text-[11px] font-black text-indigo-700 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
            </div>

            {item.hasLiability && item.adjustedAsset && item.dangerLine > 0 && (
              <div className="space-y-2 mb-3 pt-3 border-t border-slate-50">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">補繳警示線</span>
                    <span className="text-[11px] font-black text-amber-500 tracking-tight">{formatWan(item.topUpLine)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">斷頭危險線</span>
                    <span className="text-[11px] font-black text-rose-500 tracking-tight">{formatWan(item.dangerLine)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-50 no-print">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">資產項目管理</span>
              <button onClick={() => onDeleteAsset(item.originalAsset?.id || '')} className="p-1.5 text-slate-200 hover:text-rose-500 active:scale-90 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 電腦版表格 */}
      <div className="hidden lg:block print:hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-orange-50/5 border-b border-orange-50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">項目與持有期間</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">市值 / 成本 / 已領息</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">借款本金 / 利率</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">風控警示線 (壓力)</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">風控狀態</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right no-print">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {tableData.map(item => (
              <tr key={item.id} className={`hover:bg-orange-50/10 transition-colors ${item.status === 'danger' ? 'bg-rose-50/30' : ''}`}>
                <td className="px-6 py-6">
                  <div className="font-black text-slate-900">{item.name.replace(' 借款', '')}</div>
                  <div className="flex flex-col gap-1 mt-1.5">
                    {item.originalAsset?.purchaseDate && (
                      <div className="flex items-center gap-2">
                         <input 
                          type="date" 
                          value={item.originalAsset.purchaseDate}
                          onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'purchaseDate', e.target.value)}
                          className="bg-slate-50 border border-slate-100 rounded px-1 text-[10px] font-black text-slate-400 focus:outline-none"
                        />
                        <span className="text-[10px] font-black text-blue-500">持有：{calculateHoldingDuration(item.originalAsset.purchaseDate)}</span>
                      </div>
                    )}
                    <div className={`text-[10px] font-bold ${item.totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      總投報率: {Math.round(item.totalRoi)}% (含息)
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-6 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-slate-300 uppercase w-10 text-right">市值</span>
                        <input 
                            type="number" 
                            value={item.originalAsset?.marketValue || 0}
                            onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'marketValue', Number(e.target.value))}
                            className="w-24 bg-transparent border-b border-dashed border-slate-200 text-sm font-black text-slate-900 text-center focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-slate-300 uppercase w-10 text-right">成本</span>
                        <input 
                            type="number" 
                            value={item.originalAsset?.cost || 0}
                            onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'cost', Number(e.target.value))}
                            className="w-24 bg-transparent text-[10px] font-bold text-slate-400 text-center focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] font-black text-rose-300 uppercase w-10 text-right">已領息</span>
                        <input 
                            type="number" 
                            value={item.originalAsset?.realizedDividend || 0}
                            onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'realizedDividend', Number(e.target.value))}
                            className="w-24 bg-rose-50/50 rounded px-1 text-[10px] font-black text-rose-500 text-center focus:outline-none border-b border-rose-200"
                        />
                    </div>
                  </div>
                </td>

                <td className="px-6 py-6 text-center">
                  {item.hasLiability && item.liabilityId ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1">
                          <span className="text-[8px] font-black text-indigo-300 uppercase w-8 text-right">本金</span>
                          <input 
                            type="number" 
                            value={item.principal}
                            onChange={(e) => onUpdateLiability(item.liabilityId!, 'principal', Number(e.target.value))}
                            className="w-24 bg-transparent border-b border-dashed border-indigo-200 text-sm font-black text-indigo-700 text-center focus:outline-none"
                          />
                      </div>
                      <div className="flex items-center gap-1">
                          <span className="text-[8px] font-black text-indigo-300 uppercase w-8 text-right">利率</span>
                          <div className="flex items-center justify-center gap-1 w-24">
                              <input 
                                type="number" 
                                step="0.01"
                                value={Number((item.interestRate * 100).toFixed(2))}
                                onChange={(e) => onUpdateLiability(item.liabilityId!, 'interestRate', Number(e.target.value) / 100)}
                                className="w-12 bg-indigo-50/50 rounded text-[10px] font-black text-indigo-600 text-center focus:outline-none border-b border-indigo-200"
                              />
                              <span className="text-[8px] font-black text-indigo-300">%</span>
                          </div>
                      </div>
                    </div>
                  ) : <span className="text-slate-200">—</span>}
                </td>

                <td className="px-6 py-6 text-center">
                  {item.topUpLine > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded tracking-tighter border border-amber-100">
                        補繳({item.maintenanceThreshold * 100}%): {formatWan(item.topUpLine)}
                      </div>
                      <div className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded tracking-tighter border border-rose-100">
                        斷頭({item.liquidateThreshold * 100}%): {formatWan(item.dangerLine)}
                      </div>
                    </div>
                  ) : <span className="text-slate-200">—</span>}
                </td>

                <td className="px-6 py-6 text-center">
                  <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black inline-flex items-center gap-2 text-white ${statusConfig[item.status].bg} shadow-sm`}>
                    {item.status === 'safe' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {statusConfig[item.status].label}
                  </div>
                </td>

                <td className="px-6 py-6 text-right no-print">
                   <button onClick={() => onDeleteAsset(item.originalAsset?.id || '')} className="p-2 text-slate-200 hover:text-rose-500 transition-colors active:scale-90">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetLiabilityList;
