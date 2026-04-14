import { memo } from 'react';

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 61000 },
  { month: 'Apr', revenue: 48000 },
];

export const RevenueChart = memo(() => {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
  const chartHeight = 200;
  const chartWidth = 100; // percentage based
  const barWidth = 100 / revenueData.length;
  
  return (
    <div className="w-full h-[250px] flex flex-col">
      {/* Chart Area */}
      <div className="flex-1 relative flex items-end justify-around px-4 pb-8">
        {revenueData.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          
          return (
            <div
              key={`bar-${index}-${item.month}`}
              className="group relative flex flex-col items-center"
              style={{ width: `${barWidth - 2}%` }}
            >
              {/* Tooltip */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm whitespace-nowrap pointer-events-none z-10">
                <div className="text-gray-600">Revenue</div>
                <div className="font-semibold">₹{item.revenue.toLocaleString()}</div>
              </div>
              
              {/* Bar */}
              <div
                className="w-full bg-emerald-500 rounded-t-lg transition-all duration-300 hover:bg-emerald-600 max-w-[60px]"
                style={{ height: `${height}%` }}
              />
              
              {/* Label */}
              <div className="text-xs text-gray-600 mt-2 absolute -bottom-6">
                {item.month}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-[200px] flex flex-col justify-between text-xs text-gray-600 pr-2">
        <div>₹60k</div>
        <div>₹40k</div>
        <div>₹20k</div>
        <div>₹0</div>
      </div>
    </div>
  );
});

RevenueChart.displayName = 'RevenueChart';