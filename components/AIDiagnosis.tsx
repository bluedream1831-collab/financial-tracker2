
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Loader2, MessageSquareText, ShieldAlert, Rocket, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Asset, Liability, IncomeExpense, StressTestState } from '../types';

interface AIDiagnosisProps {
  assets: Asset[];
  liabilities: Liability[];
  incomeExpense: IncomeExpense;
  stress: StressTestState;
  financialData: any;
  onResetKey: () => Promise<void>;
}

const AIDiagnosis: React.FC<AIDiagnosisProps> = ({ assets, liabilities, incomeExpense, stress, financialData, onResetKey }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);

  const generateDiagnosis = async () => {
    setErrorDetail(null);
    setRawError(null);
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey === 'null') {
      setReport(null);
      setErrorDetail("缺少 API 金鑰");
      setRawError("請確認環境變數已設定。");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const prompt = `
        你是一位頂級財富管理專家，擅長「以配息支撐槓桿、以槓桿創造資產」的戰略。
        請根據以下數據進行「財務健康度與風險診斷」：

        [基本數據]
        - 真實淨資產: ${financialData.netWorth}
        - 每月總收支: 收入 ${financialData.monthlyTotalIncomeActive + financialData.monthlyPassiveIncome} / 支出 ${financialData.monthlyTotalExpense}
        - 總流動性備用金: ${financialData.totalLiquidity}

        [壓力測試]
        - 股災: -${stress.marketCrash * 100}% / 升息: +${stress.interestHike * 100}%

        請用繁體中文提供專業建議。格式需包含：
        1. 現況診斷
        2. 風險預警
        3. 具體戰略行動 (2-3項)
        請多使用條列式清單。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response && response.text) {
        setReport(response.text);
      } else {
        throw new Error("Empty API Response");
      }
    } catch (error: any) {
      console.error(error);
      setErrorDetail("診斷系統異常");
      setRawError(error.message || String(error));
      if (window.aistudio) onResetKey();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[1.2rem] sm:rounded-[2rem] border border-orange-100 shadow-xl overflow-hidden relative group">
      <div className="p-5 sm:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-1.5 sm:p-2 rounded-xl shadow-lg shadow-rose-200">
              <BrainCircuit className="w-4 h-4 sm:w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-slate-900 leading-tight">AI 戰略指揮官</h3>
              <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini Dynamic Analysis</p>
            </div>
          </div>
          
          <button 
            onClick={generateDiagnosis}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg sm:rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-md"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {report ? '重新生成' : '即刻診斷'}
          </button>
        </div>

        {errorDetail && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 items-start animate-in zoom-in duration-300">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 text-[10px] font-bold text-rose-500 leading-relaxed">
              {errorDetail}: {rawError}
            </div>
          </div>
        )}

        {!report && !loading && !errorDetail && (
          <div className="py-8 sm:py-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 h-16 bg-rose-50 rounded-full mb-3">
              <MessageSquareText className="w-6 h-6 sm:w-8 h-8 text-rose-200" />
            </div>
            <p className="text-[10px] sm:text-sm font-bold text-slate-400 max-w-[180px] mx-auto leading-relaxed">
              點擊診斷，AI 將為您的槓桿資產進行極端環境評估。
            </p>
          </div>
        )}

        {loading && (
          <div className="py-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">正在精算數據庫與歷史模型...</p>
          </div>
        )}

        {report && !loading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 sm:p-5 text-slate-700">
              <div className="text-[10px] sm:text-xs leading-relaxed font-bold space-y-2">
                {report.split('\n').map((line, i) => {
                  const isTitle = line.match(/^[0-9#]/) || line.includes(':');
                  const isList = line.trim().startsWith('-') || line.trim().startsWith('*');
                  return (
                    <p key={i} className={`
                      ${isTitle ? 'text-[11px] sm:text-sm font-black text-rose-600 mt-4 mb-1' : 'mb-1'}
                      ${isList ? 'pl-2 border-l-2 border-rose-100 italic' : ''}
                    `}>
                      {line.replace(/[#*]/g, '').trim()}
                    </p>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex flex-col items-center text-center">
                <Rocket className="w-3 h-3 text-emerald-500 mb-0.5" />
                <span className="text-[8px] font-black text-emerald-600">優化效率</span>
              </div>
              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100 flex flex-col items-center text-center">
                <ShieldAlert className="w-3 h-3 text-amber-500 mb-0.5" />
                <span className="text-[8px] font-black text-amber-600">風險控制</span>
              </div>
              <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 flex flex-col items-center text-center">
                <TrendingUp className="w-3 h-3 text-indigo-500 mb-0.5" />
                <span className="text-[8px] font-black text-indigo-600">調整配置</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDiagnosis;
