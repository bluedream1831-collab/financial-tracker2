
import React from 'react';
import { AlertTriangle, TrendingDown, ArrowUpCircle, Zap } from 'lucide-react';
import { StressTestState } from '../types';

interface StressTestSectionProps {
  stress: StressTestState;
  setStress: React.Dispatch<React.SetStateAction<StressTestState>>;
}

const StressTestSection: React.FC<StressTestSectionProps> = ({ stress, setStress }) => {
  return (
    <div className="bg-white rounded-[1.2rem] sm:rounded-[2.5rem] p-5 sm:p-8 border border-orange-100 shadow-xl shadow-orange-100/30">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-2 sm:gap-3">
          <Zap className="w-4 h-4 sm:w-5 h-5 text-amber-500" />
          動態壓力測試
        </h3>
        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-widest">壓力測試模式</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {/* Market Crash Slider */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              市場性災難 (模擬股災)
            </div>
            <span className={`text-[10px] sm:text-sm font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg transition-colors ${stress.marketCrash > 0.3 ? 'bg-rose-500 text-white' : stress.marketCrash > 0.1 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              跌幅 -{Math.round(stress.marketCrash * 100)}%
            </span>
          </div>
          <div className="px-1">
            <input
              type="range" min="0" max="0.5" step="0.05" value={stress.marketCrash}
              onChange={(e) => setStress(prev => ({ ...prev, marketCrash: parseFloat(e.target.value) }))}
              className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
          <div className="flex justify-between text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">
            <span>正常</span>
            <span>-25% 股災</span>
            <span>-50% 金融危機</span>
          </div>
        </div>

        {/* Interest Hike Slider */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
              <ArrowUpCircle className="w-3.5 h-3.5 text-indigo-500" />
              流動性衝擊 (模擬升息)
            </div>
            <span className={`text-[10px] sm:text-sm font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg transition-colors ${stress.interestHike > 0.01 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              升息 +{Math.round(stress.interestHike * 1000) / 10}%
            </span>
          </div>
          <div className="px-1">
            <input
              type="range" min="0" max="0.02" step="0.001" value={stress.interestHike}
              onChange={(e) => setStress(prev => ({ ...prev, interestHike: parseFloat(e.target.value) }))}
              className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div className="flex justify-between text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">
            <span>基準利率</span>
            <span>+1.0% 升息</span>
            <span>+2.0% 劇烈升息</span>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-orange-50/50 rounded-xl border border-orange-100 border-dashed flex gap-3 sm:gap-4 items-start">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold leading-relaxed italic">
          極端環境模擬：系統將自動計算所有項目的「維持率」與「現金流穩定性」。若下方清單出現<span className="text-rose-600">紅色警戒</span>，請考慮適度調降槓桿比例。
        </p>
      </div>
    </div>
  );
};

export default StressTestSection;
