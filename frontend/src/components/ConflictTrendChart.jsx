import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ConflictTrendChart({ data }) {
  // Prepare data for chart
  const chartData = (data?.months || []).map((month, index) => ({
    name: month,
    incidents: data?.incidents?.[index] || 0,
    fatalities: data?.fatalities?.[index] || 0,
  }));
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Conflict Trends</h2>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
                color: '#e2e8f0',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="incidents" 
              stroke="#3b82f6" 
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="fatalities" 
              stroke="#ef4444"
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex justify-center items-center text-gray-400">
          No trend data available
        </div>
      )}
    </div>
  );
}