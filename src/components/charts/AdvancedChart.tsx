'use client';

import React, { Suspense } from 'react';
import { ChartSkeleton } from '@/components/ui/PageLoader';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';

export interface ChartData {
  [key: string]: any;
}

export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'radial' | 'composed';
  data: ChartData[];
  xKey: string;
  yKeys: Array<{
    key: string;
    name: string;
    color: string;
    type?: 'line' | 'bar' | 'area';
  }>;
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  currency?: boolean;
  percentage?: boolean;
  colors?: string[];
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
];

const formatValue = (value: number, currency?: boolean, percentage?: boolean) => {
  if (percentage) {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (currency) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  return new Intl.NumberFormat('pt-BR').format(value);
};

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency?: boolean;
  percentage?: boolean;
}

const CustomTooltip = ({ active, payload, label, currency, percentage }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-gray-700 dark:text-gray-300">
              {entry.name}: <span className="font-semibold">
                {formatValue(entry.value, currency, percentage)}
              </span>
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AdvancedChart: React.FC<ChartConfig> = ({
  type,
  data,
  xKey,
  yKeys,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  currency = false,
  percentage = false,
  colors = defaultColors
}) => {
  const chartColors = colors.length >= yKeys.length ? colors : [...colors, ...defaultColors];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xKey} 
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              className="text-xs text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => formatValue(value, currency, percentage)}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip currency={currency} percentage={percentage} />}
              />
            )}
            {showLegend && <Legend />}
            {yKeys.map((yKey, index) => (
              <Line
                key={yKey.key}
                type="monotone"
                dataKey={yKey.key}
                stroke={yKey.color || chartColors[index]}
                strokeWidth={2}
                name={yKey.name}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xKey} 
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              className="text-xs text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => formatValue(value, currency, percentage)}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip currency={currency} percentage={percentage} />}
              />
            )}
            {showLegend && <Legend />}
            {yKeys.map((yKey, index) => (
              <Area
                key={yKey.key}
                type="monotone"
                dataKey={yKey.key}
                stackId="1"
                stroke={yKey.color || chartColors[index]}
                fill={yKey.color || chartColors[index]}
                fillOpacity={0.6}
                name={yKey.name}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xKey} 
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              className="text-xs text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => formatValue(value, currency, percentage)}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip currency={currency} percentage={percentage} />}
              />
            )}
            {showLegend && <Legend />}
            {yKeys.map((yKey, index) => (
              <Bar
                key={yKey.key}
                dataKey={yKey.key}
                fill={yKey.color || chartColors[index]}
                name={yKey.name}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          name: item[xKey],
          value: item[yKeys[0].key],
          fill: chartColors[index % chartColors.length]
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip 
                formatter={(value: number) => [formatValue(value, currency, percentage), 'Valor']}
              />
            )}
          </PieChart>
        );

      case 'radial':
        const radialData = data.map((item, index) => ({
          name: item[xKey],
          value: item[yKeys[0].key],
          fill: chartColors[index % chartColors.length]
        }));

        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={radialData}>
            <RadialBar
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              dataKey="value"
            />
            {showTooltip && (
              <Tooltip 
                formatter={(value: number) => [formatValue(value, currency, percentage), 'Valor']}
              />
            )}
          </RadialBarChart>
        );

      case 'composed':
        return (
          <ComposedChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xKey} 
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              className="text-xs text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => formatValue(value, currency, percentage)}
            />
            {showTooltip && (
              <Tooltip 
                content={<CustomTooltip currency={currency} percentage={percentage} />}
              />
            )}
            {showLegend && <Legend />}
            {yKeys.map((yKey, index) => {
              const props: any = {
                dataKey: yKey.key,
                name: yKey.name,
                [yKey.type === 'line' ? 'stroke' : 'fill']: yKey.color || chartColors[index]
              };

              if (yKey.type === 'line') {
                props.type = 'monotone';
                props.strokeWidth = 2;
                return <Line key={yKey.key} {...props} />;
              } else if (yKey.type === 'area') {
                props.type = 'monotone';
                props.fillOpacity = 0.6;
                return <Area key={yKey.key} {...props} />;
              } else {
                props.radius = [4, 4, 0, 0];
                return <Bar key={yKey.key} {...props} />;
              }
            })}
          </ComposedChart>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  // Memoização do renderChart para performance
  const memoizedChart = React.useMemo(() => renderChart(), [
    type, data, xKey, yKeys, showGrid, showLegend, showTooltip, currency, percentage, colors
  ]);

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
            {title}
          </h3>
        )}
        <ResponsiveContainer width="100%" height={height}>
          {memoizedChart}
        </ResponsiveContainer>
      </div>
    </Suspense>
  );
};

export default AdvancedChart;