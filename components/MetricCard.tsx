import React from 'react';

type ColorVariant = "blue" | "indigo" | "emerald" | "amber" | "purple" | "teal" | "fuchsia";

interface MetricCardProps {
    title: string;
    value: string;
    subtext: string;
    color?: ColorVariant;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, color = "blue" }) => {
    // Dark mode colors: low opacity background, bright text, subtle border
    const colors: Record<ColorVariant, string> = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        fuchsia: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    };

    return (
        <div className={`p-5 rounded-xl border ${colors[color]} hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-0.5`}>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">{title}</div>
            <div className="text-3xl font-extrabold mb-1 tracking-tight text-white">{value}</div>
            <div className="text-xs opacity-80 font-medium">{subtext}</div>
        </div>
    );
};