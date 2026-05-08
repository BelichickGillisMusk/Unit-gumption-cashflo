import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  ShieldCheck, 
  Send, 
  Camera, 
  AlertCircle, 
  Clock, 
  History,
  Trash2,
  Wind
} from 'lucide-react';

interface ConstructionUpdate {
  id: number;
  title: string;
  content: string;
  update_date: string;
}

interface SecurityEvent {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

export const CommunityModule = () => {
  const [updates, setUpdates] = useState<ConstructionUpdate[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/construction-updates/1').then(res => res.json()).then(setUpdates);
    fetch('/api/security-events/1').then(res => res.json()).then(setSecurityEvents);
  }, []);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, we'd have a POST endpoint for construction updates
    // For now, we'll just mock the success
    setTimeout(() => {
      alert('Community update posted! Residents will be notified at their preferred time.');
      setNewUpdate({ title: '', content: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-text/5 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-app-accent/10 text-app-accent rounded-2xl">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold">Post <span className="italic">Resident</span> Update</h3>
          </div>

          <form onSubmit={handlePostUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Update Title</label>
              <input 
                type="text"
                required
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                className="w-full px-6 py-4 bg-app-text/5 border border-transparent rounded-2xl focus:bg-app-bg focus:border-app-accent/20 focus:outline-none transition-all"
                placeholder="e.g., Roof Maintenance Next Week"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Content</label>
              <textarea 
                required
                value={newUpdate.content}
                onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                className="w-full px-6 py-4 bg-app-text/5 border border-transparent rounded-2xl focus:bg-app-bg focus:border-app-accent/20 focus:outline-none transition-all min-h-[120px]"
                placeholder="Describe the update for residents..."
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-ruby/5 rounded-2xl border border-ruby/10">
              <div className="flex items-center gap-3 text-ruby">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Scheduled Delivery</span>
              </div>
              <span className="text-[10px] font-bold text-ruby/60 uppercase tracking-widest">Resident Preferred Times</span>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-app-text text-app-bg rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-app-accent hover:text-white transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : (
                <>
                  <Send className="w-4 h-4" /> Broadcast Update
                </>
              )}
            </button>
          </form>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-app-text text-app-bg shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif font-bold">Community Schedule</h3>
            <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60">
              Automated SMS Active
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-app-accent" />
                </div>
                <div>
                  <div className="font-bold">Trash Day</div>
                  <div className="text-xs text-white/40">Every Tuesday</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
                Edit Schedule
              </button>
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Wind className="w-6 h-6 text-ruby-light" />
                </div>
                <div>
                  <div className="font-bold">Street Sweeping</div>
                  <div className="text-xs text-white/40">2nd & 4th Thursday</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
                Edit Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-text/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-ruby/10 text-ruby rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif font-bold">Security <span className="italic">Intelligence</span></h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-ruby/10 text-ruby rounded-full text-[10px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-ruby rounded-full animate-pulse" /> Live Feed
            </div>
          </div>

          <div className="aspect-video rounded-[2rem] bg-app-text overflow-hidden relative group mb-8">
            <img 
              src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1200&auto=format&fit=crop" 
              alt="Security Feed" 
              className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
              Recognition Active
            </div>
            <div className="absolute inset-0 border-[2px] border-white/10 rounded-[2rem] pointer-events-none" />
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Recent Security Events</h4>
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-app-text/5 transition-colors group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    event.type === 'Recognition' ? 'bg-ruby/10 text-ruby' : 'bg-ruby-light/10 text-ruby-light'
                  }`}>
                    {event.type === 'Recognition' ? <Camera className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-sm text-app-text">{event.type}</div>
                    <div className="text-xs text-app-text/50">{event.description}</div>
                  </div>
                  <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 border border-app-text/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-app-text/40 hover:text-app-text hover:border-app-text/20 transition-all">
              View Full Security Log
            </button>
          </div>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-text/5 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-ruby/10 text-ruby rounded-2xl">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold">Past <span className="italic">Updates</span></h3>
          </div>
          <div className="space-y-6">
            {updates.map((update) => (
              <div key={update.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-app-text/10">
                <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-app-accent" />
                <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mb-1">
                  {new Date(update.update_date).toLocaleDateString()}
                </div>
                <div className="font-bold text-app-text">{update.title}</div>
                <p className="text-xs text-app-text/50 mt-1 line-clamp-2">{update.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
