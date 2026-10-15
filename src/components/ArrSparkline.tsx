import React from 'react';
import { AreaChart, Area, Tooltip, YAxis } from 'recharts';
import { ArrHistoryPoint } from '../types';
import { formatCurrency } from '../utils/revenueUtils';

interface ArrSparklineProps {
  data: ArrHistoryPoint[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  isPositive?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload as ArrHistoryPoint;
    return (
      <div className="bg-[#0B0F17] border border-slate-700/90 rounded px-2 py-1 shadow-xl text-[10px] pointer-events-none z-50 whitespace-nowrap">
        <div className="text-slate-400 font-medium">{item.period}</div>
        <div className="font-mono font-bold text-emerald-400">
          {item.formattedArr || formatCurrency(item.arr)} ARR
        </div>
      </div>
    );
  }
  return null;
};

export const ArrSparkline: React.FC<ArrSparklineProps> = ({
  data,
  width = 84,
  height = 26,
  strokeColor,
  fillColor,
  isPositive = true,
}) => {
  if (!data || data.length === 0) {
    return <div style={{ width, height }} className="bg-slate-800/40 rounded" />;
  }

  // Calculate min and max for responsive domain
  const arrValues = data.map((d) => d.arr);
  const minVal = Math.min(...arrValues);
  const maxVal = Math.max(...arrValues);
  const padding = (maxVal - minVal) * 0.15 || maxVal * 0.1 || 1000;
  const domainMin = Math.max(0, minVal - padding);
  const domainMax = maxVal + padding;

  const defaultStroke = isPositive ? '#10b981' : '#38bdf8';
  const defaultFill = isPositive ? '#10b981' : '#38bdf8';
  const stroke = strokeColor || defaultStroke;
  const fill = fillColor || defaultFill;
  const gradientId = `arr-grad-${Math.abs(minVal + maxVal + data.length)}`;

  return (
    <div
      className="inline-block relative overflow-visible cursor-crosshair select-none"
      style={{ width, height }}
      onClick={(e) => e.stopPropagation()}
    >
      <AreaChart
        width={width}
        height={height}
        data={data}
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fill} stopOpacity={0.4} />
            <stop offset="95%" stopColor={fill} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <YAxis domain={[domainMin, domainMax]} hide />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '2 2' }}
          wrapperStyle={{ outline: 'none', zIndex: 100 }}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="arr"
          stroke={stroke}
          strokeWidth={1.6}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          activeDot={{
            r: 3,
            fill: stroke,
            stroke: '#0B0F17',
            strokeWidth: 1.5,
          }}
        />
      </AreaChart>
    </div>
  );
};
