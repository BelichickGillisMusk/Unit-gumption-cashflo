import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  Users, 
  CreditCard,
  BarChart3,
  Wrench,
  X,
  ArrowRight,
  Printer
} from 'lucide-react';

interface Slide {
  title: string;
  subtitle: string;
  content: string[];
  icon: any;
  image: string;
  color: string;
}

const slides: Slide[] = [
  {
    title: "The Homepage",
    subtitle: "A Cinematic Entry Point",
    content: [
      "Dynamic Hero: High-definition visuals of 3875 Ruby with real-time weather overlays.",
      "Stakeholder Hub: Instant routing for Owners, Tenants, and Prospective Residents.",
      "Portfolio Pulse: A live ticker showing community updates and property milestones."
    ],
    icon: Zap,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200",
    color: "#9B111E"
  },
  {
    title: "Resident Portal",
    subtitle: "The Digital Home Experience",
    content: [
      "Mailbox Hub: A 'Stadium View' interface for managing deliveries and communications.",
      "Lease Lifecycle: Visual progress bars for renewals, updates, and digital signatures.",
      "Community Board: Private social layer for unit-to-unit engagement and events."
    ],
    icon: Users,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200",
    color: "#9B111E"
  },
  {
    title: "Owner Suite",
    subtitle: "Executive Command & Control",
    content: [
      "CEO Briefing: One-tap access to ROI, liquidity, and asset health metrics.",
      "Legal Log: Chain-of-custody tracking for every notice and violation.",
      "Market Intelligence: Real-time neighborhood data driving rent optimization."
    ],
    icon: BarChart3,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    color: "#9B111E"
  },
  {
    title: "Tenant Features",
    subtitle: "Empowering the Modern Resident",
    content: [
      "Maintenance 2.0: Photo-first reporting with real-time vendor tracking.",
      "Flexible Payments: Split-rent options and automated credit building.",
      "Smart Access: Digital keys and guest permission management."
    ],
    icon: Wrench,
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?q=80&w=1200",
    color: "#9B111E"
  },
  {
    title: "The Rent Roll",
    subtitle: "Precision Financial Management",
    content: [
      "Dynamic Ledger: Real-time status of every unit with automated reconciliation.",
      "SF Plus Integration: Direct bank sync for zero-effort transaction matching.",
      "Future-Proofing: Predictive analytics for vacancy risk and capital improvements."
    ],
    icon: CreditCard,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200",
    color: "#9B111E"
  }
];

export const OwnerPresentation = ({ onClose }: { onClose: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => currentSlide < slides.length - 1 && setCurrentSlide(currentSlide + 1);
  const prev = () => currentSlide > 0 && setCurrentSlide(currentSlide - 1);

  const handlePrint = () => {
    window.print();
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[200] bg-[#0B1A2D] flex flex-col print:bg-white print:relative print:inset-auto print:z-0 print:flex-none">
      {/* Print-only Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: landscape; margin: 1cm; }
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-slide { 
            page-break-after: always; 
            display: flex !important; 
            flex-direction: column;
            height: 100vh;
            padding: 2cm;
            border: 1px solid #eee;
          }
          .print-slide:last-child { page-break-after: auto; }
        }
      `}} />

      {/* Screen View Controls */}
      <div className="absolute top-8 right-8 z-10 flex gap-4 no-print">
        <button 
          onClick={handlePrint}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white flex items-center gap-2"
          title="Print Presentation"
        >
          <Printer className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Print Deck</span>
        </button>
        <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Presentation View (Screen Only) */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden no-print">
        {/* Visual Side */}
        <div className="w-full lg:w-1/2 relative h-64 lg:h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slide.image}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover grayscale brightness-50"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1A2D] via-transparent to-transparent hidden lg:block"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2D] via-transparent to-transparent lg:hidden"></div>
          
          <div className="absolute bottom-12 left-12 hidden lg:block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <slide.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">
                Slide {currentSlide + 1} of {slides.length}
              </div>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
                  <div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  className="h-1.5 bg-[#9B111E] mb-8 rounded-full"
                />
                <h2 className="text-6xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none">
                  {slide.title.split(' ').map((word, i) => (
                    <span key={i} className={i === slide.title.split(' ').length - 1 ? "text-[#9B111E]" : ""}>
                      {word}{' '}
                    </span>
                  ))}
                </h2>
                <p className="text-2xl lg:text-3xl font-serif italic text-white/60 mt-6">
                  {slide.subtitle}
                </p>
              </div>

              <div className="space-y-6">
                {slide.content.map((item, i) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="mt-2 w-2 h-2 rounded-full bg-[#9B111E] shrink-0 group-hover:scale-150 transition-transform" />
                    <p className="text-xl text-white/80 font-light leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {currentSlide === slides.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onClose}
                  className="px-12 py-6 bg-[#9B111E] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-4"
                >
                  Launch Platform <ArrowRight className="w-6 h-6" />
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Bar (Screen Only) */}
      <div className="p-8 lg:p-12 border-t border-white/5 flex justify-between items-center bg-[#0B1A2D] no-print">
        <div className="flex gap-4">
          <button 
            onClick={prev} 
            disabled={currentSlide === 0}
            className="p-4 rounded-full border border-white/10 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={next} 
            disabled={currentSlide === slides.length - 1}
            className="p-4 rounded-full border border-white/10 text-white disabled:opacity-20 hover:bg-white/5 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-12 bg-[#9B111E]' : 'w-3 bg-white/10'}`}
            />
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Owner Vision Deck</div>
            <div className="text-xs font-black text-white uppercase tracking-tighter">3875 Ruby // 2026</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#9B111E] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Print Layout (Hidden on Screen) */}
      <div className="hidden print:block">
        {slides.map((s, idx) => (
          <div key={idx} className="print-slide">
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="text-[10px] font-bold text-[#9B111E] uppercase tracking-[0.4em] mb-4">Vision Deck // Slide {idx + 1}</div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-black">{s.title}</h1>
                <p className="text-xl italic text-gray-500 font-serif mt-2">{s.subtitle}</p>
              </div>
              <div className="w-12 h-12 bg-[#9B111E] rounded-xl flex items-center justify-center">
                <s.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 flex-grow">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Key Points</h3>
                {s.content.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#9B111E] shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <div className="border-l border-gray-100 pl-12 flex flex-col">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Notes</h3>
                <div className="flex-grow border-b border-dashed border-gray-200 mb-4" />
                <div className="flex-grow border-b border-dashed border-gray-200 mb-4" />
                <div className="flex-grow border-b border-dashed border-gray-200 mb-4" />
                <div className="flex-grow border-b border-dashed border-gray-200 mb-4" />
                <div className="flex-grow border-b border-dashed border-gray-200 mb-4" />
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div>3875 Ruby Street // Asset Management Suite</div>
              <div>Silverbackai.agency</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
