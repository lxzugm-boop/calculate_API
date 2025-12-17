import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ModelTier } from '../types';

interface CostChartProps {
  flashCost: number;
  proCost: number;
}

export const CostChart: React.FC<CostChartProps> = ({ flashCost, proCost }) => {
  const data = [
    {
      name: 'Flash',
      cost: flashCost,
      tier: ModelTier.FLASH,
    },
    {
      name: 'Nano Banana Pro',
      cost: proCost,
      tier: ModelTier.PRO,
    },
  ];

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="w-full h-64 mt-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Сравнение стоимости (в месяц)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={formatCurrency} />
          <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Стоимость']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.tier === ModelTier.PRO ? '#3b82f6' : '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};