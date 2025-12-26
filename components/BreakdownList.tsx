import React from 'react';

interface BreakdownRowProps {
    label: string;
    value: number;
    total: number;
    icon: React.FC<{ size?: number }>;
    color: string;
    bgClass: string;
    colorClass: string;
}

export const BreakdownBarRow: React.FC<BreakdownRowProps> = ({ 
    label, 
    value, 
    total, 
    icon: Icon, 
    color, 
    bgClass, 
    colorClass 
}) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    // Ensure even small non-zero values are visible (min 1%)
    const barWidth = value > 0 && percent < 1 ? 1 : percent;
    
    // Transform classes for dark mode compatibility if they are using '50' shades
    // We'll extract the color name from colorClass (e.g. "text-fuchsia-600") and build custom dark classes
    // But passed props might be simple tailwind classes.
    // To ensure dark mode looks good, we'll override the background class with a dark opacity variant
    
    // We can assume the passed color hex is good for the bar, but the bgClass needs mapped to dark.
    // Simplified strategy: Use the passed color prop to create a dynamic style for the icon background
    
    return (
        <div className="flex items-center py-3.5 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 rounded-lg px-2 transition-colors duration-200">
            <div 
                className={`p-2.5 rounded-lg mr-4 flex-shrink-0 shadow-sm`}
                style={{ backgroundColor: `${color}20`, color: color }} 
            >
                <Icon size={20} />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-semibold text-slate-300">{label}</span>
                    <div className="text-right">
                        <span className="text-sm font-bold text-slate-100">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-xs text-slate-500 ml-2 font-medium w-12 inline-block text-right">({percent.toFixed(1)}%)</span>
                    </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)]" 
                        style={{ width: `${barWidth}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};