
import React from 'react';
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
import { Asset, Liability } from '../types';

interface FinancialChartsProps {
  assets: (Asset & { currentValue: number })[];
  liabilities: Liability[];
  incomeActive: number;
  incomePassive: number;
  expenseTotal: number;
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ assets, liabilities, incomeActive, incomePassive, expenseTotal }) => {
  const totalAssetsValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalLiabilitiesValue = liabilities.reduce((sum, l) => sum + l.principal, 0);

  const assetData = [
    { name: '不動產', value: assets.filter(a => a.type === 'realestate').reduce((sum, a) => sum + a.currentValue, 0), color: '#10B981' }, 
    { name: '現金', value: assets.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.currentValue, 0), color: '#F59E0B' }, 
    { name: '投資', value: assets.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.currentValue, 0), color: '#F43F5E' },
  ];

  const liabilityData = [
    { name: '房屋貸款', value: liabilities.filter(l => l.type === 'mortgage').reduce((sum, l) => sum + l.principal, 0), color: '#6366f1' },
    { name: '信用貸款', value: liabilities.filter(l => l.type === 'credit').reduce((sum, l) => sum + l.principal, 0), color: '#8b5cf6' },
    { name: '保單借款', value: liabilities.filter(l => l.type === 'policy').reduce((sum, l) => sum + l.principal, 0), color: '#ec4899' },
    { name: '股票質押', value: liabilities.filter(l => l.type === 'pledge').reduce((sum, l) => sum + l.principal, 0), color: '#f97316' },
  ].filter(d => d.value > 0);

  const flowData = [
    {
      name: '月收支對比',
      '主動收入': incomeActive,
      '被動收入': incomePassive,
      '支出與利息': expenseTotal,
    }
  ];

  const formatWan = (val: number) => `${(val / 10000).toFixed(1)}萬`;

  const renderPieLabel = ({ name, percent, value }: any) => {
    return `${name} ${formatWan(value)} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* 左側：資產權重 */}
        <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-orange-100 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">資產權重</h3>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md uppercase">Assets</span>
          </div>
          <div className="h-[280px] w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">總資產</span>
              <span className="text-lg font-black text-slate-900">${(totalAssetsValue / 10000).toFixed(0)}萬</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderPieLabel}
                  labelLine={false}
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

        {/* 中間：負債結構 */}
        <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-orange-100 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">負債結構</h3>
            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md uppercase">Liabilities</span>
          </div>
          <div className="h-[280px] w-full relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">總負債</span>
              <span className="text-lg font-black text-slate-900">${(totalLiabilitiesValue / 10000).toFixed(0)}萬</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={liabilityData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderPieLabel}
                  labelLine={false}
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

        {/* 右側：月現金流分析 - 增加數值標籤 */}
        <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-orange-100 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">月現金流分析</h3>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md uppercase">Cashflow</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData} barGap={20} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFF7ED" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#FEF9F6', opacity: 0.5 }} formatter={(value: number) => formatWan(value)} />
                <Legend 
                  verticalAlign="bottom" 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '20px' }} 
                />
                
                {/* 收入條 - 疊加數值 */}
                <Bar name="主動收入" dataKey="主動收入" stackId="income" fill="#FB7185" radius={[0, 0, 0, 0]}>
                  <LabelList 
                    dataKey="主動收入" 
                    position="center" 
                    content={(props: any) => {
                      const { x, y, width, height, value } = props;
                      if (height < 20) return null;
                      return (
                        <text x={x + width/2} y={y + height/2} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="900">
                          {formatWan(value)}
                        </text>
                      );
                    }}
                  />
                </Bar>
                <Bar name="被動收入" dataKey="被動收入" stackId="income" fill="#FBBF24" radius={[8, 8, 0, 0]}>
                  <LabelList 
                    dataKey="被動收入" 
                    position="center" 
                    content={(props: any) => {
                      const { x, y, width, height, value } = props;
                      if (height < 20) return null;
                      return (
                        <text x={x + width/2} y={y + height/2} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="900">
                          {formatWan(value)}
                        </text>
                      );
                    }}
                  />
                  {/* 在收入柱狀圖最上方顯示總收入 */}
                  <LabelList 
                    dataKey="被動收入" 
                    position="top" 
                    content={(props: any) => {
                      const total = incomeActive + incomePassive;
                      return (
                        <text x={props.x + props.width/2} y={props.y - 10} fill="#64748b" textAnchor="middle" fontSize="11" fontWeight="900">
                          總收 {formatWan(total)}
                        </text>
                      );
                    }}
                  />
                </Bar>

                {/* 支出條 - 頂端顯示數值 */}
                <Bar name="支出與利息" dataKey="支出與利息" fill="#F43F5E" radius={[8, 8, 0, 0]}>
                  <LabelList 
                    dataKey="支出與利息" 
                    position="top" 
                    formatter={formatWan} 
                    style={{ fill: '#F43F5E', fontSize: '11px', fontWeight: '900' }} 
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
