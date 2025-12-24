
import React, { useState } from 'react';
import { X, Copy, Check, MessageSquareCode, ShieldAlert, Sparkles } from 'lucide-react';
import { Asset, Liability, IncomeExpense, StressTestState } from '../types';

interface AIDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  liabilities: Liability[];
  incomeExpense: IncomeExpense;
  stress: StressTestState;
  financialData: any;
}

const AIDiagnosisModal: React.FC<AIDiagnosisModalProps> = ({ 
  isOpen, onClose, assets, liabilities, incomeExpense, stress, financialData 
}) => {
  const [copied, setCopied] = useState(false);

  const generateDiagnosisText = () => {
    const format = (val: number) => `$${Math.round(val).toLocaleString()}`;
    const formatWan = (val: number) => `${Math.round(val / 10000).toLocaleString()}萬`;

    const assetList = assets.map(a => `- ${a.name}: 市值 ${format(a.marketValue)} (成本 ${format(a.cost)}), 累計息收 ${format(a.realizedDividend)}`).join('\n');
    const liabilityList = liabilities.map(l => `- ${l.name}: 本金 ${format(l.principal)} (利率 ${(l.interestRate * 100).toFixed(2)}%)`).join('\n');

    return `你是頂級財富管理專家與資產配置顧問。請根據我提供的財務數據進行深度診斷。

[核心財務摘要]
- 真實淨資產: ${format(financialData.netWorth)} (${formatWan(financialData.netWorth)})
- 每月主動薪資: ${format(incomeExpense.monthlyActiveIncome)}
- 每月被動息收: ${format(incomeExpense.monthlyPassiveIncome)}
- 每月總支出 (含房信貸本利與生活費): ${format(financialData.monthlyTotalExpense)}
- 每月戰略盈餘: ${format(financialData.netCashFlow)}
- 總流動性備用金 (含現金、額度與投資淨權益): ${format(financialData.totalLiquidity)}

[風險模擬環境]
- 市場模擬股災跌幅: -${Math.round(stress.marketCrash * 100)}%
- 模擬升息幅度: +${Math.round(stress.interestHike * 1000) / 10}%

[資產明細清單]
${assetList}

[負債明細清單]
${liabilityList}

[診斷需求]
請從以下維度給予 1000 字左右的深度建議：
1. 槓桿安全性：評估當前負債比例與質押維持率，在模擬股災下的安全性。
2. 息收效率：已領息收與資產成本比，是否有更好的配置方案提升被動收入。
3. 戰略建議：如何優化現金流，並在保護流動性的前提下，加速 FIRE (財務自由) 進度。

請用繁體中文回覆，條列重點並提供具體的行動方案。`;
  };

  const handleCopy = () => {
    const text = generateDiagnosisText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <MessageSquareCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">AI 診斷文本生成器</h3>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Structural Financial Context</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-[400px] overflow-y-auto scrollbar-hide">
            <pre className="text-[11px] font-bold text-slate-600 whitespace-pre-wrap leading-relaxed font-mono">
              {generateDiagnosisText()}
            </pre>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-600">已優化提示詞</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              <span className="text-[9px] font-black text-blue-600">含壓力測試數據</span>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center gap-1">
              <Copy className="w-4 h-4 text-orange-500" />
              <span className="text-[9px] font-black text-orange-600">不需 API 金鑰</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95 ${copied ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'}`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? '已複製到剪貼簿' : '一鍵複製診斷文本'}
            </button>
          </div>
          
          <p className="text-center text-[10px] font-bold text-slate-400">
            * 複製後可貼入 Gemini, ChatGPT 或 Claude 以獲得深度財務建議 *
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnosisModal;
