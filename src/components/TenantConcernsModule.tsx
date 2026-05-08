import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  AlertCircle, 
  ChevronRight, 
  XCircle,
  HelpCircle,
  Lightbulb,
  MessageCircle
} from 'lucide-react';

interface TenantConcern {
  id: number;
  unit_id: number;
  unit_number: string;
  type: string;
  message: string;
  status: string;
  gm_notes: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { color: string, bg: string, icon: any }> = {
  'concern': { color: 'text-ruby', bg: 'bg-ruby/10', icon: AlertCircle },
  'question': { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: HelpCircle },
  'suggestion': { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Lightbulb },
  'complaint': { color: 'text-red-600', bg: 'bg-red-600/10', icon: MessageCircle },
};

export const TenantConcernsModule: React.FC = () => {
  const [concerns, setConcerns] = useState<TenantConcern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState<TenantConcern | null>(null);

  const fetchConcerns = async () => {
    try {
      const res = await fetch('/api/concerns');
      const data = await res.json();
      setConcerns(data);
    } catch (error) {
      console.error("Error fetching concerns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns();
  }, []);

  const handleUpdateStatus = async (id: number, payload: any) => {
    try {
      await fetch(`/api/concerns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetchConcerns();
      if (selectedConcern?.id === id) {
        setSelectedConcern(prev => prev ? { ...prev, ...payload } : null);
      }
    } catch (error) {
      console.error("Error updating concern:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-app-accent/20 border-t-app-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-app-text tracking-tight uppercase">Tenant Concerns Hub</h2>
          <p className="text-app-text/40 font-mono text-xs uppercase tracking-widest mt-1">Direct Feedback Management • GM Mezfin Interface</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-app-card border border-app-border text-xs font-bold text-app-text/60 flex items-center">
          {concerns.filter(c => c.status === 'Pending').length} Pending Items
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {concerns.map((concern) => {
            const config = TYPE_CONFIG[concern.type] || TYPE_CONFIG['concern'];
            const TypeIcon = config.icon;
            
            return (
              <motion.div
                key={concern.id}
                layoutId={`concern-${concern.id}`}
                onClick={() => setSelectedConcern(concern)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                  selectedConcern?.id === concern.id 
                    ? 'bg-app-card border-app-accent shadow-lg shadow-app-accent/10' 
                    : 'bg-app-card border-app-border hover:border-app-text/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center ${config.color}`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-black text-app-text font-mono tracking-tighter">UNIT #{concern.unit_number}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${concern.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-ruby/10 text-ruby'}`}>
                          {concern.status}
                        </span>
                        <span className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">{concern.type}</span>
                      </div>
                      <p className="text-app-text/60 text-sm line-clamp-1">{concern.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-app-text/30 font-mono uppercase tracking-widest">
                        <span>{new Date(concern.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-app-text/20 group-hover:text-app-text/40 transition-colors ${selectedConcern?.id === concern.id ? 'rotate-90 text-app-accent' : ''}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {selectedConcern ? (
              <motion.div
                key={selectedConcern.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="sticky top-8 p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-2xl space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-app-text tracking-tighter uppercase">Concern Details</h3>
                  <button onClick={() => setSelectedConcern(null)} className="text-app-text/30 hover:text-app-text">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block mb-2">Message from Tenant</label>
                    <div className="p-6 rounded-2xl bg-app-bg border border-app-border italic text-app-text/80 leading-relaxed">
                      "{selectedConcern.message}"
                    </div>
                  </div>

                  <div className="h-px bg-app-border" />

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block">Management Action</label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleUpdateStatus(selectedConcern.id, { status: 'Reviewed' })}
                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          selectedConcern.status === 'Reviewed' ? 'bg-ruby text-white' : 'bg-app-text/5 text-app-text/40 border border-app-border'
                        }`}
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedConcern.id, { status: 'Resolved' })}
                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          selectedConcern.status === 'Resolved' ? 'bg-ruby text-white' : 'bg-app-text/5 text-app-text/40 border border-app-border'
                        }`}
                      >
                        Mark Resolved
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-app-text/40 uppercase tracking-widest block mb-2">GM Internal Notes (Mezfin)</label>
                      <textarea
                        value={selectedConcern.gm_notes || ''}
                        onChange={(e) => handleUpdateStatus(selectedConcern.id, { gm_notes: e.target.value })}
                        placeholder="Add internal notes for management..."
                        className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50 min-h-[150px]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] rounded-[2.5rem] border-2 border-dashed border-app-border flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-30">
                <MessageSquare className="w-16 h-16 text-app-text" />
                <p className="text-lg font-medium text-app-text">Select a concern to review<br/>and manage the response.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
