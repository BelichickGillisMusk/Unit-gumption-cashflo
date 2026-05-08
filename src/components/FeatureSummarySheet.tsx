import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  MessageSquare, 
  Image as ImageIcon, 
  Clock, 
  Layout, 
  Database,
  ArrowRight
} from 'lucide-react';

export const FeatureSummarySheet: React.FC = () => {
  const sections = [
    {
      title: "Silverback Intelligence",
      icon: Zap,
      color: "text-ruby",
      bg: "bg-ruby/10",
      features: [
        "Automated Rent Collection & Ledger Sync",
        "Predictive Vacancy & Yield Optimization",
        "Smart Compliance & Rent Cap Alerts"
      ]
    },
    {
      title: "Intelligent Rent Roll",
      icon: Database,
      color: "text-ruby-light",
      bg: "bg-ruby-light/10",
      features: [
        "Real-time Portfolio Financial Tracking",
        "Secure Tenant Activity & IP Logging",
        "Automated Delinquency Flagging"
      ]
    },
    {
      title: "Management Module",
      icon: Layout,
      color: "text-ruby",
      bg: "bg-ruby/10",
      features: [
        "Dual-Panel Resizable Management View",
        "Integrated Maintenance Request Tracker",
        "Photo & Document Evidence Vault"
      ]
    },
    {
      title: "Communication Hub",
      icon: MessageSquare,
      color: "text-ruby-light",
      bg: "bg-ruby-light/10",
      features: [
        "Direct Real-time Tenant Messaging",
        "Live 'Tenant Online' Presence Status",
        "One-click Manager Email Transcripts"
      ]
    },
    {
      title: "AI Property Visualizer",
      icon: ImageIcon,
      color: "text-ruby",
      bg: "bg-ruby/10",
      features: [
        "Nano Banana 2 Powered Image Generation",
        "4K Render Engine for Marketing Visuals",
        "Instant 'Property Potential' Mockups"
      ]
    },
    {
      title: "2026 Roadmap",
      icon: Clock,
      color: "text-zinc-400",
      bg: "bg-zinc-400/10",
      features: [
        "Ruby Core: Legal Forms & Notice Creator",
        "SF Plus: Chase Bank Direct Deposit & CSV Auto-Matching",
        "Market Max: ROI Sliders & Banked Rents"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-12 font-sans selection:bg-ruby/30">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ruby/10 border border-ruby/20 text-ruby text-[10px] font-black uppercase tracking-[0.3em]">
            Executive Briefing
          </div>
          <h1 className="text-7xl font-black tracking-tighter leading-none">
            SILVERBACKAI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ruby to-ruby-light">FEATURE SHEET</span>
          </h1>
        </div>
        <div className="text-right">
          <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Version 2.0.4 • 2026</div>
          <div className="text-zinc-400 text-sm font-medium">Engineered by Silverback AI Intelligence</div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="p-10 bg-zinc-950 hover:bg-zinc-900 transition-colors group relative"
          >
            <div className={`w-14 h-14 rounded-2xl ${section.bg} flex items-center justify-center ${section.color} mb-8 group-hover:scale-110 transition-transform duration-500`}>
              <section.icon className="w-7 h-7" />
            </div>
            
            <h3 className="text-2xl font-bold mb-6 tracking-tight">{section.title}</h3>
            
            <ul className="space-y-4">
              {section.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start gap-3 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full ${section.color} mt-1.5 shrink-0`} />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Decorative Number */}
            <div className="absolute top-8 right-8 text-4xl font-black text-white/5 font-mono select-none">
              0{idx + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer / Call to Action */}
      <div className="max-w-6xl mx-auto mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-ruby/20 to-ruby-light/20 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h4 className="text-2xl font-bold tracking-tight">Ready to deploy the empire?</h4>
          <p className="text-zinc-400">The Silverback engine is primed for your portfolio.</p>
        </div>
        <button className="px-10 py-5 bg-ruby text-white font-black rounded-2xl hover:bg-ruby-light transition-all flex items-center gap-3 shadow-xl shadow-ruby/20 active:scale-95">
          INITIALIZE SYSTEM
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Glossy Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ruby/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ruby-light/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};
