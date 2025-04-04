import React from 'react';

export default function MetricsCard({ title, value, icon, color = 'blue' }) {
  // Map of color schemes
  const colors = {
    blue: "bg-blue-900/30 border-blue-700 text-blue-300",
    green: "bg-green-900/30 border-green-700 text-green-300",
    red: "bg-red-900/30 border-red-700 text-red-300",
    yellow: "bg-yellow-900/30 border-yellow-700 text-yellow-300",
    purple: "bg-purple-900/30 border-purple-700 text-purple-300",
  };
  
  const colorClass = colors[color] || colors.blue;
  
  return (
    <div className={`p-4 rounded-lg border ${colorClass}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium opacity-80">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && (
          <div className="text-2xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}