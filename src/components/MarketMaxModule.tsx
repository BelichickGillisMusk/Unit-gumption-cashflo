import { useState, useEffect } from 'react';
import { TrendingUp, PieChart, ArrowUpRight, Info, Zap, Calculator } from 'lucide-react';

interface Projection {
  id: number;
  property_id: number;
  property_name: string;
  projected_roi: number;
  banked_rents: number;
  target_occupancy: number;
}

export function MarketMaxModule() {
  const [projections, setProjections] = useState<Projection[]>([]);
  const [loading, setLoading] = useState(true);
  const [roiSlider, setRoiSlider] = useState(8.5);
  const [occupancySlider, setOccupancySlider] = useState(96);

  useEffect(() => {
    fetchProjections();
  }, []);

  const fetchProjections = async () => {
    try {
      const res = await fetch('/api/investment-projections');
      setProjections(await res.json());
    } catch (error) {
      console.error('Error fetching projections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-app-text/40">Calculating ROI Projections...</div>;

  const totalBanked = projections.reduce((acc, p) => acc + p.banked_rents, 0);
  const avgRoi = projections.reduce((acc, p) => acc + p.projected_roi, 0) / projections.length;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="text-xs font-bold text-app-accent uppercase tracking-[0.3em]">Market Max Intelligence</div>
          <h2 className="text-5xl font-serif font-black">ROI <span className="italic text-app-accent">Sliders</span> & Banked Rents.</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="px-8 py-4 bg-app-text text-app-bg rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Investment Calculator
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-10 rounded-[3rem] bg-app-card border border-app-text/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-serif font-bold italic">Investment Projections</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-app-accent"></div>
                  <span className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Projected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-ruby"></div>
                  <span className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Actual</span>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Target ROI</div>
                  <div className="text-3xl font-serif font-bold text-app-accent">{roiSlider}%</div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="0.1"
                  value={roiSlider}
                  onChange={(e) => setRoiSlider(parseFloat(e.target.value))}
                  className="w-full h-2 bg-app-text/5 rounded-lg appearance-none cursor-pointer accent-app-accent"
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Target Occupancy</div>
                  <div className="text-3xl font-serif font-bold text-ruby">{occupancySlider}%</div>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  step="1"
                  value={occupancySlider}
                  onChange={(e) => setOccupancySlider(parseInt(e.target.value))}
                  className="w-full h-2 bg-app-text/5 rounded-lg appearance-none cursor-pointer accent-ruby"
                />
              </div>
            </div>

            <div className="mt-12 p-8 rounded-[2rem] bg-app-text text-app-bg flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-app-accent uppercase tracking-widest">Projected Annual Yield</div>
                <div className="text-4xl font-serif font-bold italic">${(roiSlider * 125000).toLocaleString()}</div>
              </div>
              <div className="h-16 w-px bg-white/10 hidden md:block"></div>
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-ruby uppercase tracking-widest">Cashflow Surplus</div>
                <div className="text-4xl font-serif font-bold italic text-ruby">+${(occupancySlider * 450).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projections.map((p) => (
              <div key={p.id} className="p-8 rounded-[2.5rem] bg-app-card border border-app-text/5 shadow-sm space-y-6 group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-serif font-bold">{p.property_name}</h4>
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Portfolio Asset</div>
                  </div>
                  <div className="p-3 rounded-xl bg-app-text/5 group-hover:bg-app-accent/10 transition-colors">
                    <TrendingUp className="w-5 h-5 text-app-text group-hover:text-app-accent transition-colors" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Banked Rents</div>
                    <div className="text-2xl font-serif font-bold text-ruby">${(p.banked_rents / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Projected ROI</div>
                    <div className="text-2xl font-serif font-bold text-app-accent">{(p.projected_roi * 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-app-text/5 flex justify-between items-center">
                  <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Target: {p.target_occupancy * 100}%</div>
                  <button className="text-[10px] font-bold text-app-accent uppercase tracking-widest hover:underline">View Projections</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-10 rounded-[2.5rem] bg-app-bg border border-app-text/5 shadow-sm space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold italic">Banked Rents</h3>
              <p className="text-sm text-app-text/50">Total liquidity currently held in reserve across the portfolio.</p>
            </div>
            
            <div className="text-6xl font-serif font-black text-app-text">${(totalBanked / 1000).toFixed(0)}K</div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-app-card rounded-2xl border border-app-text/5">
                <div className="w-10 h-10 rounded-xl bg-ruby/10 text-ruby flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">This Month</div>
                  <div className="text-sm font-bold text-app-text">+$12,450</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-app-card rounded-2xl border border-app-text/5">
                <div className="w-10 h-10 rounded-xl bg-app-accent/5 text-app-accent flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Efficiency</div>
                  <div className="text-sm font-bold text-app-text">98.2% Yield</div>
                </div>
              </div>
            </div>

            <button className="w-full py-5 bg-app-text text-app-bg rounded-full text-xs font-bold uppercase tracking-widest hover:bg-app-accent hover:text-white transition-all shadow-xl">
              Distribute Dividends
            </button>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-app-accent text-white shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <PieChart className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-serif font-bold italic">Portfolio Health</h3>
              <p className="text-sm text-white/60 leading-relaxed">Your current portfolio ROI of {(avgRoi * 100).toFixed(1)}% is outperforming the market average by 2.4%.</p>
              <div className="pt-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Based on Q1 2024 Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
