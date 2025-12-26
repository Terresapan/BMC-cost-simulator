import React, { useState, useMemo, useCallback } from 'react';
import { 
    MODEL_PRICING, 
    EMBED_PRICE, 
    VCPU_COST, 
    MEM_COST, 
    SEARCH_PRICE_PER_1K, 
    SEARCH_FREE_TIER_DAILY,
    STORAGE_REGISTRY_COST,
    STORAGE_DB_COST,
    NETWORKING_COST
} from './constants';
import { CalculationStats, SensitivityPoint, PieDataPoint } from './types';
import { Zap, Users, Calendar, Cpu, Search, Database, Server, Activity, Brain, Layers } from './components/Icons';
import { InputSlider } from './components/InputSlider';
import { MetricCard } from './components/MetricCard';
import { CostPieChart, SensitivityChart } from './components/CostCharts';
import { BreakdownBarRow } from './components/BreakdownList';

const App: React.FC = () => {
    // --- State: Business Defaults ---
    const [users, setUsers] = useState<number>(100);
    const [tracesPerDay, setTracesPerDay] = useState<number>(50);
    const [daysPerMonth, setDaysPerMonth] = useState<number>(10);
    
    // --- State: Tech Defaults ---
    const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash-lite");
    const [inputPct, setInputPct] = useState<number>(0.70);
    const [tokensPerTrace, setTokensPerTrace] = useState<number>(2500);
    const [wallTime, setWallTime] = useState<number>(5.0);
    const [vcpu, setVcpu] = useState<number>(1.0);
    const [mem, setMem] = useState<number>(1.0);
    const [embedTokens, setEmbedTokens] = useState<number>(0);
    const [searchesPerUserDay, setSearchesPerUserDay] = useState<number>(0);

    // --- State: Infrastructure Defaults ---
    const [registryStorage, setRegistryStorage] = useState<number>(0.5); // GB
    const [dbStorage, setDbStorage] = useState<number>(0.5); // GB
    const [egress, setEgress] = useState<number>(5.0); // GB

    // --- Logic: Calculation ---
    const calculateStats = useCallback((): CalculationStats => {
        const tracesPerMonth = users * tracesPerDay * daysPerMonth;
        
        // Tokens
        const inputTokens = tokensPerTrace * inputPct;
        const outputTokens = tokensPerTrace * (1 - inputPct);
        
        const totalInput = inputTokens * tracesPerMonth;
        const totalOutput = outputTokens * tracesPerMonth;
        
        // 1. Model Cost
        const mp = MODEL_PRICING[selectedModel];
        const modelCost = (totalInput / 1e6) * mp.input + (totalOutput / 1e6) * mp.output;
        
        // 2. Embedding Cost
        const embeddingCost = (embedTokens / 1e6) * EMBED_PRICE;
        
        // 3. Google Search Grounding Cost
        const isFlash = selectedModel.includes("flash"); 
        const dailyFreeLimit = isFlash ? SEARCH_FREE_TIER_DAILY : 0;
        
        const totalDailySearches = users * searchesPerUserDay;
        const billableDailySearches = Math.max(0, totalDailySearches - dailyFreeLimit);
        
        const dailySearchCost = (billableDailySearches / 1000) * SEARCH_PRICE_PER_1K;
        const monthlySearchCost = dailySearchCost * daysPerMonth;
        
        // 4. Compute Cost (Cloud Run)
        const computeSeconds = wallTime * tracesPerMonth;
        const computeCost = (computeSeconds * vcpu * VCPU_COST) + (computeSeconds * mem * MEM_COST);

        // 5. Infrastructure Cost
        const infraRegistry = registryStorage * STORAGE_REGISTRY_COST;
        const infraDb = dbStorage * STORAGE_DB_COST;
        const infraEgress = egress * NETWORKING_COST;
        
        const infraTotal = infraRegistry + infraDb + infraEgress;
        
        const totalMonthly = modelCost + embeddingCost + monthlySearchCost + computeCost + infraTotal;
        
        return {
            tracesPerMonth,
            modelCost,
            embeddingCost,
            monthlySearchCost,
            computeCost,
            infraTotal,
            infraRegistry,
            infraDb,
            infraEgress,
            totalMonthly,
            costPerUser: totalMonthly / (users || 1),
            costPer1kTraces: (totalMonthly / (tracesPerMonth || 1)) * 1000
        };
    }, [users, tracesPerDay, daysPerMonth, selectedModel, inputPct, tokensPerTrace, wallTime, vcpu, mem, embedTokens, searchesPerUserDay, registryStorage, dbStorage, egress]);

    const stats = calculateStats();

    // --- Logic: Sensitivity Data (Scaling Users) ---
    const sensitivityData = useMemo<SensitivityPoint[]>(() => {
        const data: SensitivityPoint[] = [];
        for (let i = 1; i <= 10; i++) {
            const scaledUsers = users * i;
            const traces = scaledUsers * tracesPerDay * daysPerMonth;
            const inTok = tokensPerTrace * inputPct * traces;
            const outTok = tokensPerTrace * (1 - inputPct) * traces;
            const mp = MODEL_PRICING[selectedModel];
            const mCost = (inTok / 1e6) * mp.input + (outTok / 1e6) * mp.output;
            
            // Assume embedding tokens scale linearly with users for simplicity in this view
            const scaledEmbed = (embedTokens / (users || 1)) * scaledUsers; 
            const eCostScaled = (scaledEmbed / 1e6) * EMBED_PRICE;
            
            const isFlash = selectedModel.includes("flash");
            const dailyFreeLimit = isFlash ? SEARCH_FREE_TIER_DAILY : 0;
            const scaledDailySearches = scaledUsers * searchesPerUserDay;
            const scaledBillable = Math.max(0, scaledDailySearches - dailyFreeLimit);
            const sCost = (scaledBillable / 1000) * SEARCH_PRICE_PER_1K * daysPerMonth;

            const cSec = wallTime * traces;
            const cCost = (cSec * vcpu * VCPU_COST) + (cSec * mem * MEM_COST);
            
            const iReg = registryStorage * STORAGE_REGISTRY_COST;
            const scaledDbStorage = (dbStorage / (users || 1)) * scaledUsers;
            const iDb = scaledDbStorage * STORAGE_DB_COST;
            
            // Egress scales with traces
            const egressPerTrace = egress / (users * tracesPerDay * daysPerMonth || 1);
            const iEgress = (egressPerTrace * traces) * NETWORKING_COST;
            
            const iTotal = iReg + iDb + iEgress;

            data.push({
                users: scaledUsers,
                cost: mCost + eCostScaled + sCost + cCost + iTotal
            });
        }
        return data;
    }, [users, tracesPerDay, daysPerMonth, tokensPerTrace, inputPct, selectedModel, embedTokens, searchesPerUserDay, wallTime, vcpu, mem, registryStorage, dbStorage, egress]); 

    // Brand Palette: Fuchsia-500 (#d946ef) via Purple-500 (#a855f7) to Indigo-500 (#6366f1)
    const pieData: PieDataPoint[] = [
        { name: 'LLM Model', value: stats.modelCost, color: '#d946ef' }, // Fuchsia
        { name: 'Grounding', value: stats.monthlySearchCost, color: '#a855f7' }, // Purple
        { name: 'Cloud Run', value: stats.computeCost, color: '#6366f1' }, // Indigo
        { name: 'Embeddings', value: stats.embeddingCost, color: '#ec4899' }, // Pink
        { name: 'Infra & Storage', value: stats.infraTotal, color: '#8b5cf6' } // Violet
    ].filter(d => d.value > 0);

    return (
        <div className="min-h-screen p-4 md:p-8 flex justify-center text-slate-100 bg-slate-950">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                
                {/* LEFT COLUMN: CONTROLS */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Header */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-black/20 border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <div className="flex items-center space-x-3 mb-2 relative z-10">
                            <div className="p-2.5 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 rounded-xl text-white shadow-lg shadow-purple-500/30">
                                <Zap size={20} />
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight">BMC Town AI Cost Simulator</h1>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                            Configure your agent architecture and business scale to estimate monthly burn.
                        </p>
                    </div>

                    {/* Business Driver Inputs */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-black/20 border border-slate-800">
                        <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-6 flex items-center">
                            <Users size={16} className="mr-2 text-slate-600" /> Business Metrics
                        </h2>
                        
                        <InputSlider 
                            label="Active Users" 
                            value={users} 
                            onChange={setUsers} 
                            min={10} max={5000} step={10} 
                        />
                        <InputSlider 
                            label="Traces per User / Day" 
                            value={tracesPerDay} 
                            onChange={setTracesPerDay} 
                            min={1} max={200} step={1} 
                        />
                        <InputSlider 
                            label="Days Active / Month" 
                            value={daysPerMonth} 
                            onChange={setDaysPerMonth} 
                            min={1} max={31} step={1} 
                            icon={Calendar}
                        />
                    </div>

                    {/* Tech Architecture Inputs */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-black/20 border border-slate-800">
                        <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-6 flex items-center">
                            <Cpu size={16} className="mr-2 text-slate-600" /> Technical Stack
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Model Selection</label>
                            <div className="relative">
                                <select 
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full p-3 pl-4 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500 outline-none font-semibold text-slate-200 appearance-none transition-shadow hover:border-slate-600"
                                >
                                    {Object.entries(MODEL_PRICING).map(([key, val]) => (
                                        <option key={key} value={key} className="bg-slate-800">{val.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <InputSlider 
                            label="Tokens per Trace" 
                            value={tokensPerTrace} 
                            onChange={setTokensPerTrace} 
                            min={100} max={10000} step={100} 
                        />
                        
                        <InputSlider 
                            label="Input Context %" 
                            value={inputPct} 
                            onChange={setInputPct} 
                            min={0} max={1} step={0.05} 
                            unit="%"
                        />
                        
                        <InputSlider 
                            label="Google Searches / User / Day" 
                            value={searchesPerUserDay} 
                            onChange={setSearchesPerUserDay} 
                            min={0} max={50} step={1}
                            icon={Search}
                        />
                        
                        <div className="h-px bg-slate-800 my-6"></div>

                        <InputSlider 
                            label="Latency (Wall Time)" 
                            value={wallTime} 
                            onChange={setWallTime} 
                            min={0.5} max={30} step={0.5} 
                            unit="s"
                        />

                         <div className="grid grid-cols-2 gap-4">
                            <InputSlider 
                                label="vCPU" 
                                value={vcpu} 
                                onChange={setVcpu} 
                                min={1} max={8} step={1} 
                            />
                            <InputSlider 
                                label="Memory (GB)" 
                                value={mem} 
                                onChange={setMem} 
                                min={0.5} max={16} step={0.5} 
                            />
                         </div>
                    </div>

                    {/* Infrastructure Inputs */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-black/20 border border-slate-800">
                        <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-6 flex items-center">
                            <Server size={16} className="mr-2 text-slate-600" /> Storage & Network
                        </h2>
                        <InputSlider 
                            label="Artifact Registry (GB)" 
                            value={registryStorage} 
                            onChange={setRegistryStorage} 
                            min={0.1} max={10} step={0.1} 
                        />
                        <InputSlider 
                            label="Database Storage (GB)" 
                            value={dbStorage} 
                            onChange={setDbStorage} 
                            min={0.1} max={50} step={0.1} 
                            icon={Database}
                        />
                        <InputSlider 
                            label="Egress Transfer (GB)" 
                            value={egress} 
                            onChange={setEgress} 
                            min={1} max={100} step={1} 
                        />
                    </div>

                </div>

                {/* RIGHT COLUMN: DASHBOARD */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* KPI Grid - Updated Colors to Gradient */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard 
                            title="Total Monthly Cost" 
                            value={`$${stats.totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            subtext={`${stats.tracesPerMonth.toLocaleString()} traces/mo`}
                            color="fuchsia"
                        />
                        <MetricCard 
                            title="Cost Per User" 
                            value={`$${stats.costPerUser.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            subtext="Monthly average"
                            color="purple"
                        />
                        <MetricCard 
                            title="Cost / 1k Traces" 
                            value={`$${stats.costPer1kTraces.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            subtext="Unit economics"
                            color="indigo"
                        />
                    </div>

                    {/* CHART ROW: Two Columns Side-by-Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Cost Structure (Pie) */}
                        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-black/20 border border-slate-800 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white">Cost Structure</h3>
                                <p className="text-slate-400 text-sm">Distribution by component</p>
                            </div>
                            <div className="flex-grow flex flex-col items-center justify-center min-h-[250px]">
                                <CostPieChart data={pieData} />
                                <div className="text-center text-xs font-medium text-slate-400 mt-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                                    {(stats.modelCost / (stats.totalMonthly || 1) * 100).toFixed(0)}% LLM Spend
                                </div>
                            </div>
                        </div>

                        {/* Growth Simulator (Line) */}
                        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-black/20 border border-slate-800 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <Activity size={20} className="mr-2 text-fuchsia-400"/>
                                    Growth Simulator
                                </h3>
                                <p className="text-slate-400 text-sm">Projected costs @ 10x scale</p>
                            </div>
                            <div className="flex-grow flex items-center justify-center min-h-[200px]">
                                <SensitivityChart data={sensitivityData} />
                            </div>
                            <div className="mt-4 flex justify-between items-center text-sm border-t border-slate-800 pt-4">
                                <div className="text-slate-400">
                                    Current: <span className="font-bold text-slate-200">${sensitivityData[0].cost.toFixed(0)}</span>
                                </div>
                                <div className="text-slate-400">
                                    10x Scale: <span className="font-bold text-fuchsia-400">${sensitivityData[sensitivityData.length-1].cost.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DETAILED COST BREAKDOWN LIST */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-black/20 border border-slate-800">
                         <div className="flex items-center justify-between mb-6">
                             <h3 className="text-lg font-bold text-white">Detailed Breakdown</h3>
                             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-800 border border-slate-700 px-2 py-1 rounded">Monthly Estimates</span>
                         </div>
                         <div className="space-y-1">
                            <BreakdownBarRow 
                                label="LLM Model" 
                                value={stats.modelCost} 
                                total={stats.totalMonthly}
                                icon={Brain} 
                                color="#d946ef"
                                bgClass="" colorClass="" 
                            />
                            <BreakdownBarRow 
                                label="Search Grounding" 
                                value={stats.monthlySearchCost} 
                                total={stats.totalMonthly}
                                icon={Search} 
                                color="#a855f7"
                                bgClass="" colorClass="" 
                            />
                            <BreakdownBarRow 
                                label="Cloud Run Compute" 
                                value={stats.computeCost} 
                                total={stats.totalMonthly}
                                icon={Cpu} 
                                color="#6366f1"
                                bgClass="" colorClass="" 
                            />
                            <BreakdownBarRow 
                                label="Vector Embeddings" 
                                value={stats.embeddingCost} 
                                total={stats.totalMonthly}
                                icon={Layers} 
                                color="#ec4899"
                                bgClass="" colorClass="" 
                            />
                            <BreakdownBarRow 
                                label="Infra & Ops" 
                                value={stats.infraTotal} 
                                total={stats.totalMonthly}
                                icon={Server} 
                                color="#8b5cf6"
                                bgClass="" colorClass="" 
                            />
                         </div>
                    </div>

                     {/* Info Footer */}
                    <div className="text-center text-slate-500 text-xs py-4">
                         BMC Town AI Cost Simulator • Estimates based on Gemini 2.5 Pricing & GCP Cloud Run Standard Tiers.
                    </div>

                </div>
            </div>
        </div>
    );
};

export default App;