import { memo } from 'react';

const bookingStatusData = [
  { name: 'Upcoming', value: 35, color: '#3b82f6' },
  { name: 'Completed', value: 52, color: '#10b981' },
  { name: 'Cancelled', value: 13, color: '#ef4444' },
];

export const BookingStatusChart = memo(() => {
  const total = bookingStatusData.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate pie slices
  let currentAngle = -90; // Start from top
  const slices = bookingStatusData.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const slice = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      percentage: Math.round(percentage * 100),
    };
    currentAngle += angle;
    return slice;
  });

  // Helper function to calculate arc path
  const getArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const start = polarToCartesian(50, 50, outerRadius, endAngle);
    const end = polarToCartesian(50, 50, outerRadius, startAngle);
    const innerStart = polarToCartesian(50, 50, innerRadius, endAngle);
    const innerEnd = polarToCartesian(50, 50, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      `M ${start.x} ${start.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <>
      <div className="w-full h-[180px] flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-[180px]">
          {slices.map((slice, index) => (
            <g key={`slice-${index}-${slice.name}`}>
              <path
                d={getArcPath(slice.startAngle, slice.endAngle, 25, 40)}
                fill={slice.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            </g>
          ))}
        </svg>
      </div>
      
      <div className="mt-3 md:mt-4 space-y-2">
        {bookingStatusData.map((item, index) => (
          <div key={`legend-${index}-${item.name}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs md:text-sm text-gray-600">{item.name}</span>
            </div>
            <span className="font-semibold text-sm md:text-base">{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
});

BookingStatusChart.displayName = 'BookingStatusChart';