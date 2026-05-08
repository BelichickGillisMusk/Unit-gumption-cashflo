import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShieldCheck, Zap, Wind, Cpu, X } from 'lucide-react';

const hotspots = [
  {
    id: 'amazon',
    title: 'Amazon Hub Lockers',
    description: 'Secure, 24/7 package retrieval for all residents. No more missed deliveries or porch pirates.',
    icon: Package,
    top: '75%',
    left: '20%',
    color: 'bg-orange-500'
  },
  {
    id: 'entry',
    title: 'AI-Powered Entry',
    description: 'Keyless, smartphone-integrated entry system with facial recognition options for enhanced security.',
    icon: ShieldCheck,
    top: '65%',
    left: '48%',
    color: 'bg-ruby'
  },
  {
    id: 'fiber',
    title: 'Fiber-Optic Backbone',
    description: 'Pre-wired with dedicated fiber-optic lines for gigabit-speed internet throughout the building.',
    icon: Zap,
    top: '15%',
    left: '70%',
    color: 'bg-ruby'
  },
  {
    id: 'hvac',
    title: 'Smart Climate Control',
    description: 'Energy-efficient HVAC systems with smart thermostats in every unit to reduce your carbon footprint.',
    icon: Wind,
    top: '40%',
    left: '85%',
    color: 'bg-cyan-500'
  },
  {
    id: 'core',
    title: 'Building Intelligence',
    description: 'Centralized monitoring for leaks, smoke, and structural health to ensure resident safety.',
    icon: Cpu,
    top: '30%',
    left: '30%',
    color: 'bg-purple-500'
  }
];

export function BuildingIntelligence() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeHotspot = hotspots.find(h => h.id === activeId);

  return (
    <section className="py-32 bg-app-bg overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <div className="text-xs font-bold text-app-accent uppercase tracking-[0.3em]">Building Intelligence</div>
            <h2 className="text-5xl md:text-7xl font-serif font-black">Smart <span className="italic text-app-accent">Infrastructure</span>.</h2>
          </div>
          <p className="text-app-text/50 max-w-md">1924 architecture meets 2026 technology. Explore the intelligent features that make 3875 Ruby a modern sanctuary.</p>
        </div>

        <div className="relative rounded-[4rem] overflow-hidden shadow-2xl bg-app-text group border border-app-border">
          {/* Main Building Image */}
          <img 
            src="https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=2000&auto=format&fit=crop" 
            alt="3875 Ruby Street - Smart Building Visualization" 
            className={`w-full h-auto object-cover transition-all duration-700 ${activeId ? 'scale-105 blur-sm brightness-50' : 'group-hover:scale-102'}`}
            referrerPolicy="no-referrer"
          />

          {/* Hotspots Overlay */}
          <div className="absolute inset-0">
            {hotspots.map((spot) => (
              <button
                key={spot.id}
                onClick={() => setActiveId(activeId === spot.id ? null : spot.id)}
                style={{ top: spot.top, left: spot.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-125 z-20 ${activeId === spot.id ? 'bg-app-accent ring-8 ring-white/30 scale-150' : 'bg-app-accent/80 animate-pulse'}`}
              >
                <spot.icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Feature Detail Overlay */}
          <AnimatePresence>
            {activeId && activeHotspot && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute inset-0 flex items-center justify-center z-30 p-6 pointer-events-none"
              >
                <div className="bg-app-card/90 backdrop-blur-2xl p-12 rounded-[3rem] shadow-2xl max-w-lg w-full pointer-events-auto relative border border-app-border">
                  <button 
                    onClick={() => setActiveId(null)}
                    className="absolute top-8 right-8 p-2 hover:bg-app-text/5 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-app-text" />
                  </button>
                  
                  <div className={`w-16 h-16 rounded-2xl bg-app-accent flex items-center justify-center mb-8 text-white shadow-lg`}>
                    <activeHotspot.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-3xl font-serif font-bold text-app-text mb-4">{activeHotspot.title}</h3>
                  <p className="text-lg text-app-text/70 leading-relaxed mb-8">
                    {activeHotspot.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-app-accent">
                    <div className="w-2 h-2 rounded-full bg-app-accent animate-ping" />
                    Live System Status: Optimal
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint */}
          {!activeId && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] pointer-events-none animate-bounce">
              Click the icons to explore smart features
            </div>
          )}
        </div>

        {/* Feature Grid (Mobile/Alternative View) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-12">
          {hotspots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setActiveId(spot.id)}
              className={`p-6 rounded-3xl border transition-all text-left group ${activeId === spot.id ? 'bg-app-accent text-white border-app-accent' : 'bg-app-card border-app-border hover:border-app-accent/20'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${activeId === spot.id ? 'bg-white/10 text-white' : 'bg-app-text/5 text-app-text group-hover:bg-app-accent/10 group-hover:text-app-accent'}`}>
                <spot.icon className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{spot.id}</div>
              <div className="font-serif font-bold text-sm">{spot.title}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
