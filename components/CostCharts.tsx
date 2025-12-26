import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { PieDataPoint, SensitivityPoint } from '../types';

interface CostPieChartProps {
    data: PieDataPoint[];
}

export const CostPieChart: React.FC<CostPieChartProps> = ({ data }) => {
    if (data.length === 0) {
        return <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No Cost Data</div>;
    }

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <RechartsTooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                        contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            borderColor: '#334155', 
                            borderRadius: '8px', 
                            color: '#f1f5f9',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
                        }}
                        itemStyle={{ color: '#f1f5f9' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

interface SensitivityChartProps {
    data: SensitivityPoint[];
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ data }) => {
    return (
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="users" 
                        hide={true} 
                    />
                    <YAxis 
                        hide={true}
                    />
                    <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(0)}`, 'Monthly Cost']}
                        labelFormatter={(label) => `${label} Users`}
                        contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            borderColor: '#334155', 
                            borderRadius: '8px', 
                            color: '#f1f5f9',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                        }}
                        itemStyle={{ color: '#f1f5f9' }}
                        labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="#d946ef" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorCost)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-xs font-medium text-slate-500 px-1 mt-2">
                <span>Current Scale</span>
                <span>10x Growth</span>
            </div>
        </div>
    );
};