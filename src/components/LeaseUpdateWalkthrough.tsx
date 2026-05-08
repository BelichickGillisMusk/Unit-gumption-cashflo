import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  content: string;
  order_index: number;
}

interface LeaseUpdateWalkthroughProps {
  tenantId: number;
  onComplete: () => void;
  onClose: () => void;
}

export const LeaseUpdateWalkthrough: React.FC<LeaseUpdateWalkthroughProps> = ({ tenantId, onComplete, onClose }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    fetch('/api/lease-update-steps')
      .then(res => res.json())
      .then(data => {
        setSteps(data);
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleSignLease = async () => {
    setIsSigning(true);
    try {
      await fetch('/api/lease-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          year: 2026,
          status: 'Completed',
          walkthrough_completed: 1,
          signed_at: new Date().toISOString()
        })
      });
      onComplete();
    } catch (error) {
      console.error('Error signing lease:', error);
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) return null;

  const currentStep = steps[currentStepIdx];
  const isLastStep = currentStepIdx === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-app-text/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-app-bg rounded-[3rem] overflow-hidden shadow-2xl border border-app-text/10 flex flex-col md:flex-row h-[80vh]"
      >
        {/* Sidebar Progress */}
        <div className="w-full md:w-80 bg-app-text p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2 bg-app-accent rounded-xl">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Lease <span className="italic text-app-accent">Update</span></h3>
            </div>

            {/* Visual Progress Bar */}
            <div className="mb-10 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Progress</span>
                <span className="text-lg font-serif italic text-app-accent">{Math.round(((currentStepIdx + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                  className="h-full bg-app-accent shadow-[0_0_15px_rgba(224,17,95,0.5)]"
                />
              </div>
            </div>

            <div className="space-y-6">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                    idx === currentStepIdx ? 'bg-app-accent border-app-accent text-white scale-110 shadow-lg shadow-app-accent/20' :
                    idx < currentStepIdx ? 'bg-emerald-500 border-emerald-500 text-white' :
                    'bg-white/5 border-white/10 text-white/30'
                  }`}>
                    {idx < currentStepIdx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                    idx === currentStepIdx ? 'text-white' : 'text-white/20'
                  }`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <p className="text-[10px] text-white/30 leading-relaxed italic">
              California Law (Oakland 94609) requires annual disclosure of tenant rights and building safety features.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col bg-app-bg/30">
          <div className="flex-grow overflow-y-auto p-12">
            <div className="max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h2 className="text-5xl font-serif font-black text-app-text leading-tight">
                      {currentStep.title.split(' ').map((word, i) => 
                        i === currentStep.title.split(' ').length - 1 ? <span key={i} className="italic text-app-accent">{word}</span> : word + ' '
                      )}
                    </h2>
                    <div className="h-1 w-20 bg-app-accent rounded-full" />
                  </div>

                  <div className="prose prose-oakland max-w-none">
                    <p className="text-xl text-app-text/60 leading-relaxed font-medium">
                      {currentStep.content}
                    </p>
                  </div>

                  {isLastStep && (
                    <div className="p-8 rounded-[2rem] bg-app-card border border-app-text/5 shadow-sm space-y-6">
                      <div className="flex items-center gap-4 text-app-text">
                        <FileText className="w-6 h-6 text-app-accent" />
                        <h4 className="text-xl font-serif font-bold">2026 Lease Agreement</h4>
                      </div>
                      <p className="text-sm text-app-text/50 leading-relaxed">
                        By clicking "Sign & Complete", you acknowledge that you have reviewed the 2026 building updates, your rights under Oakland Rent Law, and agree to the terms of the updated lease agreement.
                      </p>
                      <div className="p-4 bg-app-text/5 rounded-2xl border border-app-text/10 font-mono text-[10px] text-app-text/40">
                        ELECTRONIC SIGNATURE ID: {Math.random().toString(36).substring(7).toUpperCase()}
                        <br />
                        TIMESTAMP: {new Date().toLocaleString()}
                        <br />
                        IP ADDRESS: 127.0.0.1
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="p-10 border-t border-app-text/5 bg-app-card flex justify-between items-center">
            <button 
              onClick={handleBack}
              disabled={currentStepIdx === 0}
              className="flex items-center gap-2 px-6 py-3 text-app-text/40 font-bold uppercase tracking-widest hover:text-app-text disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-3 text-app-text/40 font-bold uppercase tracking-widest hover:text-app-text transition-all"
              >
                Exit
              </button>
              {isLastStep ? (
                <button 
                  onClick={handleSignLease}
                  disabled={isSigning}
                  className="flex items-center gap-3 px-10 py-4 bg-app-accent text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-app-accent/20 disabled:opacity-50"
                >
                  {isSigning ? 'Signing...' : (
                    <>
                      Sign & Complete <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-3 px-10 py-4 bg-app-text text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-app-accent transition-all shadow-xl"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
