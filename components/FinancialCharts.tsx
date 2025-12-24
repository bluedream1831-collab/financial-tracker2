
import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LabelList
} from 'recharts';
import { Asset, Liability, StressTestState } from '../types';

interface FinancialChartsProps {
  assets: (Asset & { currentValue: number })[];
  liabilities: Liability[];
  incomeActive: number;
  incomePassive: number;
  expenseDetail: {
    fixedPayments: number;
    variableInterests: number;
    total: number;
  };
  stress: StressTestState;
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ assets, liabilities, incomeActive, incomePassive, expenseDetail, stress }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalLiabilitiesValue = liabilities.reduce((sum, l) => sum + l.principal, 0);

  const assetData = [
    { name: '不動產', value: assets.filter(a => a.type === 'realestate').reduce((sum, a) => sum + a.currentValue, 0), color: '#10B981' }, 
    { name: '備用現金', value: assets.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.currentValue, 0), color: '#F59E0B' }, 
    { name: '投資資產', value: assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.currentValue, 0), color: '#F43F5E' },
  ];

  const liabilityData = [
    { name: '房貸本金', value: liabilities.filter(l => l.type === 'mortgage').reduce((sum, l) => sum + l.principal, 0), color: '#6366f1' },
    { name: '信貸本金', value: liabilities.filter(l => l.type === 'credit').reduce((sum, l) => sum + l.principal, 0), color: '#8b5cf6' },
    { name: '保貸本金', value: liabilities.filter(l => l.type === 'policy').reduce((sum, l) => sum + l.principal, 0), color: '#ec4899' },
    { name: '質押本金', value: liabilities.filter(l => l.type === 'pledge').reduce((sum, l) => sum + l.principal, 0), color: '#f97316' },
  ].filter(d => d.value > 0);

  const flowData = [
    {
      name: '月收支分析',
      '薪資收入': incomeActive,
      '息收回報': incomePassive,
      '固定月付支出': expenseDetail.fixedPayments,
      '戰略借款利息': expenseDetail.variableInterests,
    }
  ];

  const formatWan = (val: number) => {
    const wan = val / 10000;
    return `${parseFloat(wan.toFixed(2)).toLocaleString()}萬`;
  };

  const renderPieLabel = ({ name, percent, value }: any) => {
    if (isMobile) return `${(percent * 100).toFixed(1)}%`;
    return `${name} ${formatWan(value)} (${(percent * 100).toFixed(1)}%)`;
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="bg-white p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[2.5rem] border border-orange-100 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">資產權重分布</h3>
            <span className="text-[8px] sm:text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">資產比例</span>
          </div>
          <div className="h-[200px] sm:h-[280px] w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-tighter">總資產估值</span>
              <span className="text-sm sm:text-lg font-black text-slate-900">${formatWan(totalAssetsValue)}</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  innerRadius={isMobile ? 40 : 50}
                  outerRadius={isMobile ? 55 : 70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderPieLabel}
                  labelLine={!isMobile}
                  animationDuration={800}
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatWan(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[2.5rem] border border-orange-100 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">負債結構比例</h3>
            <span className="text-[8px] sm:text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">負債分配</span>
          </div>
          <div className="h-[200px] sm:h-[280px] w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-tighter">總負債金額</span>
              <span className="text-sm sm:text-lg font-black text-slate-900">${formatWan(totalLiabilitiesValue)}</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liabilityData}
                  innerRadius={isMobile ? 40 : 50}
                  outerRadius={isMobile ? 55 : 70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderPieLabel}
                  labelLine={!isMobile}
                  animationDuration={800}
                >
                  {liabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatWan(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[2.5rem] border border-orange-100 shadow-lg">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight">月收支現金流</h3>
            <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">收支對比</span>
          </div>
          <div className="h-[200px] sm:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData} barGap={isMobile ? 10 : 20} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFF7ED" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#FEF9F6', opacity: 0.5 }} formatter={(value: number) => formatWan(value)} />
                <Legend 
                  verticalAlign="bottom" 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: isMobile ? '8px' : '9px', fontWeight: '900', paddingTop: '10px' }} 
                />
                
                {/* 收入疊加 */}
                <Bar name="薪資收入" dataKey="薪資收入" stackId="income" fill="#FB7185">
                  <LabelList 
                    dataKey="薪資收入" 
                    position="center" 
                    content={(props: any) => {
                      const { x, y, width, height, value } = props;
                      if (height < 20) return null;
                      return (
                        <text x={x + width/2} y={y + height/2} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize={isMobile ? "8" : "10"} fontWeight="900">
                          {formatWan(value)}
                        </text>
                      );
                    }}
                  />
                </Bar>
                <Bar name="息收回報" dataKey="息收回報" stackId="income" fill="#FBBF24">
                  <LabelList 
                    dataKey="息收回報" 
                    position="center" 
                    content={(props: any) => {
                      const { x, y, width, height, value } = props;
                      if (height < 20) return null;
                      return (
                        <text x={x + width/2} y={y + height/2} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize={isMobile ? "8" : "10"} fontWeight="900">
                          {formatWan(value)}
                        </text>
                      );
                    }}
                  />
                </Bar>

                {/* 支出疊加 (精確分拆利息) */}
                <Bar name="固定月付支出" dataKey="固定月付支出" stackId="expense" fill="#FDA4AF" />
                <Bar name="戰略借款利息" dataKey="戰略借款利息" stackId="expense" fill="#F43F5E" radius={[4, 4, 0, 0]}>
                  <LabelList 
                    dataKey="戰略借款利息" 
                    position="top" 
                    formatter={() => formatWan(expenseDetail.total)} 
                    style={{ fill: '#F43F5E', fontSize: isMobile ? '8px' : '11px', fontWeight: '900' }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;
