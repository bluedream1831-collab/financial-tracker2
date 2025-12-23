
import React, { useState } from 'react';
import { 
  Layers, 
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck
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
    let topUpLine = 0; // 補繳線市值
    let dangerLine = 0; // 斷頭線市值
    
    if (adjustedAsset && originalAsset && l.principal > 0) {
      const simulatedValue = adjustedAsset.currentValue;
      ratio = l.principal / simulatedValue;
      const isPledge = l.type === 'pledge';
      
      // 計算觸發市值
      if (isPledge) {
        // 股票質押：維持率 = 市值 / 借款
        // 130% 補繳, 120% 斷頭
        topUpLine = l.principal * 1.4; // 預留一點緩衝到 140% 預警
        dangerLine = l.principal * 1.3; // 130% 補繳
        
        const maintenanceRatio = 1 / ratio;
        if (maintenanceRatio <= 1.3) status = 'danger';      
        else if (maintenanceRatio <= 1.4) status = 'topup'; 
        else if (maintenanceRatio <= 1.5) status = 'warning'; 
      } else {
        // 保單借款或其它：借款比 = 借款 / 市值
        // 假設 80% 斷頭, 70% 補繳
        topUpLine = l.principal / 0.7;
        dangerLine = l.principal / 0.8;
        
        if (ratio >= 0.8) status = 'danger';
        else if (ratio >= 0.7) status = 'topup';
        else if (ratio >= 0.6) status = 'warning';
      }

      if (originalAsset.cost > 0) {
        totalRoi = ((simulatedValue + originalAsset.realizedDividend - originalAsset.cost) / originalAsset.cost) * 100;
      }
    }
    return { ...l, originalAsset, adjustedAsset, ratio, status, totalRoi, hasLiability: true, topUpLine, dangerLine };
  }), ...(isExpanded ? assets.filter(a => !liabilities.some(l => l.relatedAssetId === a.id)).map(a => ({
    id: `pure-${a.id}`, name: a.name, originalAsset: a, adjustedAsset: adjustedAssets.find(aa => aa.id === a.id),
    ratio: 0, status: 'safe' as const, totalRoi: a.cost > 0 ? ((adjustedAssets.find(aa => aa.id === a.id)!.currentValue + a.realizedDividend - a.cost) / a.cost) * 100 : 0,
    hasLiability: false, principal: 0, interestRate: 0, type: 'credit' as const, topUpLine: 0, dangerLine: 0
  })) : [])];

  const formatWan = (val: number) => `${(val / 10000).toFixed(1)}萬`;

  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-200/20 overflow-hidden">
      <div className="p-5 sm:p-8 border-b border-orange-50 bg-orange-50/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-2 rounded-xl">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-black text-slate-900">資產與風險明細 (含觸發預警線)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-black px-4 py-2.5 rounded-xl bg-rose-500 text-white">
              <Plus className="w-4 h-4" /> 新增資產
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-black px-4 py-2.5 rounded-xl border border-rose-100 text-rose-500">
              {isExpanded ? '收合純資產' : '展開純資產'}
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="p-5 bg-rose-50/20 border-b border-rose-50 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddSubmit} className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="col-span-2 lg:col-span-1">
              <input type="text" placeholder="資產名稱" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            </div>
            <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value as any})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold">
              <option value="investment">投資</option>
              <option value="realestate">房產</option>
              <option value="cash">現金</option>
            </select>
            <input type="number" placeholder="成本" value={newAsset.cost || ''} onChange={e => setNewAsset({...newAsset, cost: Number(e.target.value)})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            <input type="number" placeholder="市值" value={newAsset.marketValue || ''} onChange={e => setNewAsset({...newAsset, marketValue: Number(e.target.value)})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            <input type="number" placeholder="已收配息" value={newAsset.realizedDividend || ''} onChange={e => setNewAsset({...newAsset, realizedDividend: Number(e.target.value)})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            <input type="number" placeholder="借款金額" value={newAsset.loan || ''} onChange={e => setNewAsset({...newAsset, loan: Number(e.target.value)})} className="bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-bold" />
            <button type="submit" className="col-span-2 bg-rose-500 text-white py-2 rounded-lg text-[10px] font-black">建立項目</button>
          </form>
        </div>
      )}

      {/* 手機端佈局優化 */}
      <div className="lg:hidden p-4 space-y-4">
        {tableData.map((item) => (
          <div key={item.id} className={`p-4 rounded-2xl border transition-all ${item.status === 'danger' ? 'border-rose-300 bg-rose-50' : 'border-orange-50 bg-white shadow-sm'}`}>
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-black text-sm text-slate-800">{item.name.replace(' 借款', '')}</h4>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${statusConfig[item.status].bg}`}>
                {statusConfig[item.status].label}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 text-center">補繳線</p>
                <p className="text-xs font-black text-amber-600 text-center">{item.topUpLine > 0 ? formatWan(item.topUpLine) : '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 text-center">斷頭線</p>
                <p className="text-xs font-black text-rose-600 text-center">{item.dangerLine > 0 ? formatWan(item.dangerLine) : '—'}</p>
              </div>
            </div>

            {item.hasLiability && item.adjustedAsset && (
              <div className="mb-4">
                <div className="flex justify-between text-[10px] font-black mb-1">
                  <span className="text-slate-400">目前距斷頭空間</span>
                  <span className={item.adjustedAsset.currentValue > item.dangerLine ? 'text-emerald-500' : 'text-rose-500'}>
                    {Math.round((item.adjustedAsset.currentValue / item.dangerLine - 1) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${statusConfig[item.status].bg}`} 
                    style={{ width: `${Math.max(0, Math.min(100, (item.adjustedAsset.currentValue / item.dangerLine - 1) * 200))}%` }} 
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className={`text-xs font-black ${item.totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ROI: {item.totalRoi.toFixed(1)}%
              </span>
              <button onClick={() => onDeleteAsset(item.originalAsset?.id || '')} className="p-2 text-slate-300 hover:text-rose-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 桌機端表格優化 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-orange-50/5 border-b border-orange-50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">項目內容</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">目前市值 / 成本</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">債務本金 / 利率</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">補繳 / 斷頭線</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">風險狀態與空間</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {tableData.map(item => (
              <tr key={item.id} className={`hover:bg-orange-50/10 transition-colors ${item.status === 'danger' ? 'bg-rose-50/30' : ''}`}>
                <td className="px-6 py-6">
                  <div className="font-black text-slate-900">{item.name.replace(' 借款', '')}</div>
                  <div className={`text-[10px] font-bold mt-1 ${item.totalRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    總報酬: {item.totalRoi.toFixed(1)}% (含息)
                  </div>
                </td>
                
                <td className="px-6 py-6 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center">
                      <span className="text-[10px] font-black text-slate-300 mr-1">現值:</span>
                      <input 
                        type="number" 
                        value={item.originalAsset?.marketValue || 0}
                        onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'marketValue', Number(e.target.value))}
                        className="w-24 bg-transparent border-b border-dashed border-rose-200 text-sm font-black text-slate-900 text-center focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-[10px] font-black text-slate-300 mr-1">成本:</span>
                      <input 
                        type="number" 
                        value={item.originalAsset?.cost || 0}
                        onChange={(e) => onUpdateAsset(item.originalAsset!.id, 'cost', Number(e.target.value))}
                        className="w-20 bg-transparent border-b border-dashed border-slate-200 text-[10px] font-bold text-slate-400 text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </td>

                <td className="px-6 py-6 text-center">
                  {item.hasLiability ? (
                    <>
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-black text-slate-600">$</span>
                        <input 
                          type="number" 
                          value={item.principal}
                          onChange={(e) => onUpdateLiability(item.id, 'principal', Number(e.target.value))}
                          className="w-24 bg-transparent border-b border-dashed border-rose-200 text-sm font-black text-slate-700 text-center focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase">利率:</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={(item.interestRate * 100).toFixed(2)} 
                          onChange={(e) => onUpdateLiability(item.id, 'interestRate', Number(e.target.value)/100)}
                          className="w-10 bg-transparent text-[10px] font-black text-rose-500 text-center focus:outline-none"
                        />
                        <span className="text-[10px] font-black text-rose-500">%</span>
                      </div>
                    </>
                  ) : <span className="text-slate-200">—</span>}
                </td>

                <td className="px-6 py-6 text-center">
                  {item.topUpLine > 0 ? (
                    <div className="space-y-1">
                      <div className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                        補: {formatWan(item.topUpLine)}
                      </div>
                      <div className="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded block">
                        斷: {formatWan(item.dangerLine)}
                      </div>
                    </div>
                  ) : <span className="text-slate-200">—</span>}
                </td>

                <td className="px-6 py-6 text-center">
                  <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black inline-flex items-center gap-2 text-white ${statusConfig[item.status].bg} shadow-sm`}>
                    {item.status === 'safe' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {item.type === 'pledge' ? `${Math.round(100/item.ratio)}% ${statusConfig[item.status].label}` : statusConfig[item.status].label}
                  </div>
                  {item.hasLiability && item.adjustedAsset && (
                    <div className="mt-2 text-[10px] font-black text-slate-400">
                      距斷頭還有 <span className={item.adjustedAsset.currentValue > item.dangerLine ? 'text-emerald-500' : 'text-rose-500'}>
                        ${formatWan(item.adjustedAsset.currentValue - item.dangerLine)}
                      </span>
                    </div>
                  )}
                </td>

                <td className="px-6 py-6 text-right">
                   <button onClick={() => onDeleteAsset(item.originalAsset?.id || '')} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
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
