import React from 'react';
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
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface TrendChartProps {
    data: Array<{ [key: string]: any }>;
    dataKeys: Array<{
        key: string;
        color: string;
        name?: string;
    }>;
    xAxisKey: string;
    type?: 'line' | 'area' | 'bar';
    height?: number;
    showGrid?: boolean;
    showLegend?: boolean;
}

export default function TrendChart({
    data,
    dataKeys,
    xAxisKey,
    type = 'line',
    height = 300,
    showGrid = true,
    showLegend = false,
}: TrendChartProps) {
    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 10, left: 0, bottom: 0 },
        };

        const xAxis = (
            <XAxis
                dataKey={xAxisKey}
                stroke="#9CA3AF"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
            />
        );

        const yAxis = (
            <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                    return value.toString();
                }}
            />
        );

        const grid = showGrid ? (
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
        ) : null;

        const tooltip = (
            <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                itemStyle={{ color: '#6B7280', fontSize: '14px' }}
            />
        );

        const legend = showLegend ? (
            <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                formatter={(value) => <span style={{ color: '#6B7280', fontSize: '14px' }}>{value}</span>}
            />
        ) : null;

        switch (type) {
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        {grid}
                        {xAxis}
                        {yAxis}
                        {tooltip}
                        {legend}
                        {dataKeys.map(({ key, color, name }) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={color}
                                fill={color}
                                fillOpacity={0.2}
                                strokeWidth={2}
                                name={name || key}
                            />
                        ))}
                    </AreaChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        {grid}
                        {xAxis}
                        {yAxis}
                        {tooltip}
                        {legend}
                        {dataKeys.map(({ key, color, name }) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={color}
                                radius={[8, 8, 0, 0]}
                                name={name || key}
                            />
                        ))}
                    </BarChart>
                );

            case 'line':
            default:
                return (
                    <LineChart {...commonProps}>
                        {grid}
                        {xAxis}
                        {yAxis}
                        {tooltip}
                        {legend}
                        {dataKeys.map(({ key, color, name }) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={color}
                                strokeWidth={3}
                                dot={{ fill: color, r: 4 }}
                                activeDot={{ r: 6 }}
                                name={name || key}
                            />
                        ))}
                    </LineChart>
                );
        }
    };

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
