import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function EventTypesChart({ data }) {
  // Transform data for chart
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value: Number(value) || 0
  }));

  // Sort by value descending
  chartData.sort((a, b) => b.value - a.value);
  
  // Define colors for pie segments
  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Event Types</h2>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value, 'Events']}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#e2e8f0',
              }}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex justify-center items-center text-gray-400">
          No event data available
        </div>
      )}
    </div>
  );
}