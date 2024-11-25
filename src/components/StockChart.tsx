import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StockHistory } from '../types/stock';
import { format } from 'date-fns';

interface Props {
  data: StockHistory[];
  isPositive: boolean;
}

export default function StockChart({ data, isPositive }: Props) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
            fontSize={12}
          />
          <YAxis domain={['auto', 'auto']} fontSize={12} />
          <Tooltip
            labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
            formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}