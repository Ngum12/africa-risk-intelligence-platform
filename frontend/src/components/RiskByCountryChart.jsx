import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RiskByCountryChart({ data }) {
  // Transform data for chart display
  const chartData = Object.entries(data || {}).map(([country, values]) => ({
    name: country,
    high: values.high || 0,
    low: values.low || 0
  }));
  
  // Sort by high risk percentage
  chartData.sort((a, b) => b.high - a.high);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Risk by Country</h2>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
            />
            <Tooltip 
              formatter={(value) => [`${value}%`]}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#e2e8f0',
              }}
            />
            <Legend />
            <Bar 
              dataKey="high" 
              stackId="stack" 
              fill="#ef4444" 
              name="High Risk" 
            />
            <Bar 
              dataKey="low" 
              stackId="stack" 
              fill="#22c55e" 
              name="Low Risk" 
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex justify-center items-center text-gray-400">
          No risk data available
        </div>
      )}
    </div>
  );
}