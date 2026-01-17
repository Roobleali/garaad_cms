import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export default function KPICard({
    title,
    value,
    change,
    trend = 'neutral',
    icon,
    prefix = '',
    suffix = '',
    decimals = 0,
}: KPICardProps) {
    // Format number with commas
    const formatValue = (val: string | number): string => {
        if (typeof val === 'string') return val;
        return val.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    // Determine trend color
    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'text-green-600 dark:text-green-400';
            case 'down':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-500 dark:text-gray-400';
        }
    };

    // Determine background glow
    const getGlowColor = () => {
        switch (trend) {
            case 'up':
                return 'shadow-green-500/10';
            case 'down':
                return 'shadow-red-500/10';
            default:
                return 'shadow-gray-500/10';
        }
    };

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    return (
        <div
            className={`bg-white rounded-[2rem] p-7 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all duration-300`}
        >
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-bold text-[#64748b] uppercase tracking-wider">
                    {title}
                </h3>
                {icon && (
                    <div className="p-2.5 bg-[#f1f5f9] rounded-xl text-blue-600">
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-1 tracking-tight">
                        {prefix}
                        {formatValue(value)}
                        {suffix}
                    </div>

                    {change !== undefined && (
                        <div className={`flex items-center gap-1.5 text-sm font-bold ${getTrendColor()}`}>
                            <TrendIcon className="w-4 h-4 stroke-[3]" />
                            <span>
                                {Math.abs(change)}% {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'no change'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
