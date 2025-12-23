
import React from 'react';
import { AlertTriangle, TrendingDown, ArrowUpCircle, Zap } from 'lucide-react';
import { StressTestState } from '../types';

interface StressTestSectionProps {
  stress: StressTestState;
  setStress: React.Dispatch<React.SetStateAction<StressTestState>>;
}

const StressTestSection: React.FC<StressTestSectionProps> = ({ stress, setStress }) => {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
      <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
        <Zap className="w-5 h-5 text-amber-500" />
        動態壓力測試系統
      </h3>
      
      <div className="space-y-10">
        {/* Market Crash Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              市場性災難 (股災)
            </div>
            <span className={`text-sm font-black px-3 py-1 rounded-lg ${stress.marketCrash > 0.3 ? 'bg-rose-500 text-white' : stress.marketCrash > 0.1 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              -{Math.round(stress.marketCrash * 100)}%
            </span>
          </div>
          <input
            type="range" min="0" max="0.5" step="0.05" value={stress.marketCrash}
            onChange={(e) => setStress(prev => ({ ...prev, marketCrash: parseFloat(e.target.value) }))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            <span>Normal</span>
            <span>-25% Crash</span>
            <span>-50% Crisis</span>
          </div>
        </div>

        {/* Interest Hike Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
              <ArrowUpCircle className="w-4 h-4 text-indigo-500" />
              流動性衝擊 (升息)
            </div>
            <span className={`text-sm font-black px-3 py-1 rounded-lg ${stress.interestHike > 0.01 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              +{Math.round(stress.interestHike * 1000) / 10}%
            </span>
          </div>
          <input
            type="range" min="0" max="0.02" step="0.001" value={stress.interestHike}
            onChange={(e) => setStress(prev => ({ ...prev, interestHike: parseFloat(e.target.value) }))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            <span>Baseline</span>
            <span>+1.0% hike</span>
            <span>+2.0% spike</span>
          </div>
        </div>

        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
            模擬極端環境：系統將自動重新計算所有槓桿項目的「即時維持率」與「利息償付能力」。若盈餘轉為負數，請重新配置資產或減少槓桿。
          </p>
        </div>
      </div>
    </div>
  );
};

export default StressTestSection;
