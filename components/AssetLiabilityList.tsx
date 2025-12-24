
import React, { useState } from 'react';
import { 
  Layers, 
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Coins,
  DollarSign
} from 'lucide-react';
import { Asset, Liability, StressTestState } from '../types';

interface AssetLiabilityListProps {
  assets: Asset[];
  liabilities: Liability[];
  adjustedAssets: (Asset & { currentValue: number })[];
  stress: StressTestState;
  onUpdateAsset: (id: string, field: 'marketValue' | 'cost' | 'realizedDividend', value: number) => void;
  onUpdateLiability: (id: string, field: 'principal' | 'interestRate', value: number) => void;
  onAddAsset: (asset: Asset, initialLoan?: number) => void;
  onDeleteAsset: (id: string) => void;
}

const AssetLiabilityList: React.FC<AssetLiabilityListProps> = ({ 
  assets, liabilities, adjustedAssets, stress, onUpdateAsset, onUpdateLiability, onAddAsset, onDeleteAsset
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
  }>({
    name: '', type: 'investment', marketValue: 0, cost: 0, realizedDividend: 0, loan: 0
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
      realizedDividend: newAsset.realizedDividend
    }, newAsset.loan);
    setShowAddForm(false);
    setNewAsset({ name: '', type: 'investment', marketValue: 0, cost: 0, realizedDividend: 0, loan: 0 });
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
      
      if (isPledge) {
        topUpLine = l.principal * 1.4; 
        dangerLine = l.principal * 1.3; 
        const maintenanceRatio = 1 / ratio;
        if (maintenanceRatio <= 1.3) status = 'danger';      
        else if (maintenanceRatio <= 1.4) status = 'topup'; 
        else if (maintenanceRatio <= 1.5) status = 'warning'; 
      } else {
        topUpLine = l.principal / 0.7;
        dangerLine = l.principal / 0.8;
        if (ratio >= 0.8) status = 'danger';
        else if (ratio >= 0.7) status = 'topup';
        else if (ratio >= 0.6) status = 'warning';
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
    hasLiability: false, principal: 0, interestRate: 0, type: 'credit' as const, topUpLine: 0, dangerLine: 0, liabilityId: null
  })) : [])];

  const formatWan = (val: number) => `${Math.round(val / 10000).toLocaleString()}萬`;

  return (
    <div className="bg-white rounded-[1.2rem] sm:rounded-[2.5rem] border border-orange-100 shadow-xl overflow-hidden">
      <div className="p-4 sm:p-8 border-b border-orange-50 bg-orange-50/10 no-print">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500 p-1.5 rounded-lg">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm sm:text-lg font-black text-slate-900">資產負債風控明細</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[9px] sm:text-[11px] font-black px-3 py-2 rounded-lg bg-rose-500 text-white">
              <Plus className="w-3.5 h-3.5" /> 新增資產
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-[9px] sm:text-[11px] font-black px-3 py-2 rounded-lg border border-rose-100 text-rose-500">
              {isExpanded ? '隱藏純資產' : '展開全部資產'}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden print:block p-8 border-b border-orange-50 bg-orange-50/5 text-center">
         <h3 className="text-xl font-black text-slate-900">個人財務戰略診斷報表</h3>
         <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">全方位資產風險風控清單</p>
      </div>

      {showAddForm && (
        <div className="p-4 bg-rose-50/30 border-b border-rose-50 no-print animate-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="項目名稱 (例: 0050 股票質押)" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="col-span-2 bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
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
            <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1 tracking-wider">初始負債金額</label>
                <input type="number" value={newAsset.loan || ''} onChange={e => setNewAsset({...newAsset, loan: Number(e.target.value)})} className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            </div>
            <button type="submit" className="col-span-2 mt-2 bg-rose-500 text-white py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-rose-100 active:scale-95 transition-all">建立戰略項目</button>
          </form>
        </div>
      )}

      {/* 手機版與列印版卡片列表 */}
      <div className="lg:hidden print:block p-3 space-y-3">
        {tableData.map((item) => (
          <div key={item.id} className={`p-4 rounded-[1.2rem] border transition-all ${item.status === 'danger' ? 'border-rose-300 bg-rose-50 shadow-inner' : 'border-orange-50 bg-white shadow-sm'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-tight">{item.name.replace(' 借款', '')}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <span className={`text-[9px] font-black ${item.totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    總投報率 {Math.round(item.totalRoi)}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-300">/</span>
                  <span className="text-[9px] font-black text-slate-400">目前市值 {formatWan(item.adjustedAsset?.currentValue || 0)}</span>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black text-white ${statusConfig[item.status].bg} shadow-sm`}>
                {statusConfig[item.status].label}
              </div>
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

                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                    <label className="text-[8px] font-black text-rose-400 uppercase block mb-1 flex items-center gap-1"><Coins className="w-2 h-2" /> 已領總息收</label>
                    <input 
                      type="number" 
                      value={item.originalAsset?.realizedDividend || 0}
                      onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'realizedDividend', Number(e.target.value))}
                      className="w-full bg-transparent text-[11px] font-black text-rose-600 focus:outline-none"
                    />
                  </div>
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
                    <span className="text-[10px] font-black text-amber-500">{formatWan(item.topUpLine)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">斷頭危險線</span>
                    <span className="text-[10px] font-black text-rose-500">{formatWan(item.dangerLine)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-50 no-print">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">資產狀態管理</span>
              <button onClick={() => onDeleteAsset(item.originalAsset?.id || '')} className="p-1.5 text-slate-200 hover:text-rose-500 active:scale-90 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block print:hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-orange-50/5 border-b border-orange-50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">項目內容</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">市值 / 成本 / 已領息</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">借款本金 / 利率</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">維持率警示線 (壓力)</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">風控狀態</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right no-print">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {tableData.map(item => (
              <tr key={item.id} className={`hover:bg-orange-50/10 transition-colors ${item.status === 'danger' ? 'bg-rose-50/30' : ''}`}>
                <td className="px-6 py-6">
                  <div className="font-black text-slate-900">{item.name.replace(' 借款', '')}</div>
                  <div className={`text-[10px] font-bold mt-1 ${item.totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    總投報率: {Math.round(item.totalRoi)}% (含息)
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
                    <div className="space-y-1">
                      <div className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded tracking-tighter">補繳: {formatWan(item.topUpLine)}</div>
                      <div className="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded tracking-tighter">斷頭: {formatWan(item.dangerLine)}</div>
                    </div>
                  ) : <span className="text-slate-200">—</span>}
                </td>

                <td className="px-6 py-6 text-center">
                  <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black inline-flex items-center gap-2 text-white ${statusConfig[item.status].bg}`}>
                    {item.status === 'safe' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {statusConfig[item.status].label}
                  </div>
                  {item.hasLiability && item.adjustedAsset && (
                    <div className="mt-2 text-[10px] font-black text-slate-400">
                      距斷頭空間 <span className={item.adjustedAsset.currentValue > item.dangerLine ? 'text-emerald-500' : 'text-rose-500'}>
                        ${formatWan(item.adjustedAsset.currentValue - item.dangerLine)}
                      </span>
                    </div>
                  )}
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
