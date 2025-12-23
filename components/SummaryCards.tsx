
import React from 'react';
import { DollarSign, Wallet, Activity, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardsProps {
  data: {
    netWorth: number;
    netCashFlow: number;
    fireProgress: number;
    totalProfit: number;
    roi: number;
  };
  fireGoal: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data, fireGoal }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Card 
        title="真實淨資產" 
        value={`$${(data.netWorth / 10000).toFixed(1)}萬`} 
        icon={<Wallet className="w-4 h-4 sm:w-5 h-5" />}
        color="rose"
        description="資產減負債"
      />
      <Card 
        title="每月現金流" 
        value={`${data.netCashFlow >= 0 ? '+' : ''}${(data.netCashFlow / 10000).toFixed(2)}萬`} 
        icon={<Activity className="w-4 h-4 sm:w-5 h-5" />}
        color={data.netCashFlow >= 0 ? 'emerald' : 'rose-plain'}
        description="本月餘額"
        trend={data.netCashFlow >= 0 ? 'up' : 'down'}
      />
      <Card 
        title="FIRE 進度" 
        value={`${data.fireProgress.toFixed(1)}%`} 
        icon={<Target className="w-4 h-4 sm:w-5 h-5" />}
        color="amber"
        progress={data.fireProgress}
        description={`目標 ${(fireGoal / 10000).toLocaleString()}萬`}
      />
      <Card 
        title="投資總損益" 
        value={`$${(data.totalProfit / 10000).toFixed(1)}萬`} 
        icon={<DollarSign className="w-4 h-4 sm:w-5 h-5" />}
        color={data.totalProfit >= 0 ? 'emerald' : 'rose-plain'}
        description={`報酬率 ${data.roi.toFixed(1)}%`}
        trend={data.totalProfit >= 0 ? 'up' : 'down'}
      />
    </div>
  );
};

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'rose' | 'rose-plain' | 'emerald' | 'amber';
  description: string;
  progress?: number;
  trend?: 'up' | 'down';
}

const Card: React.FC<CardProps> = ({ title, value, icon, color, description, progress, trend }) => {
  const colorStyles = {
    rose: 'bg-rose-500 text-white shadow-rose-200 border-rose-600',
    'rose-plain': 'bg-white text-rose-500 border-rose-100',
    emerald: 'bg-white text-emerald-600 border-emerald-100',
    amber: 'bg-white text-amber-600 border-amber-100',
  };

  const iconBg = {
    rose: 'bg-white/20 text-white',
    'rose-plain': 'bg-rose-50 text-rose-500',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-300 ${color === 'rose' ? colorStyles.rose : 'bg-white shadow-lg shadow-orange-200/5'}`}>
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <div className={`p-2 rounded-xl ${iconBg[color]}`}>
          {icon}
        </div>
        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${color === 'rose' ? 'text-rose-100' : 'text-slate-400'}`}>
          {title}
        </span>
      </div>
      
      <div className="mb-2 sm:mb-4">
        <div className={`text-xl sm:text-3xl font-black tracking-tight ${color === 'rose' ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <p className={`text-[10px] sm:text-xs font-bold ${color === 'rose' ? 'text-rose-100' : 'text-slate-500'}`}>
          {description}
        </p>
        {trend && (
          <div className={`${trend === 'up' ? (color === 'rose' ? 'text-emerald-300' : 'text-emerald-500') : 'text-rose-400'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3 sm:w-4 h-4" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 h-4" />}
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-orange-50 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCards;
