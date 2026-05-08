import { motion } from 'motion/react';
import { Wrench, Clock, CheckCircle2, AlertCircle, Smartphone, Zap } from 'lucide-react';

export const MaintenanceFlow = () => {
  return (
    <section id="maintenance-flow" className="py-32 bg-[#0B1A2D] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <div className="text-xs font-bold text-app-accent uppercase tracking-[0.4em] mb-4">The Ruby Standard</div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Maintenance, <br /> <span className="text-app-accent italic font-serif">Reimagined.</span>
          </h2>
          <p className="mt-8 text-white/50 max-w-2xl mx-auto text-lg">
            We don't do paper forms or endless waiting. See how our maintenance flow compares to the industry standard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* The Old Way */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-white/70">Other Companies</h3>
            </div>
            
            <div className="relative border-l-2 border-white/10 pl-8 space-y-12">
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-transparent border-2 border-white/30"></div>
                <h4 className="text-lg font-bold mb-2 text-white/90">1. The Paper Trail</h4>
                <p className="text-sm text-white/80">Fill out a paper form in the lobby or call a generic hotline during business hours.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-transparent border-2 border-white/30"></div>
                <h4 className="text-lg font-bold mb-2 text-white/90">2. The Waiting Game</h4>
                <p className="text-sm text-white/80">Wait days for a response, with no visibility into when the issue will be addressed.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-transparent border-2 border-white/30"></div>
                <h4 className="text-lg font-bold mb-2 text-white/90">3. The Surprise Visit</h4>
                <p className="text-sm text-white/80">Maintenance shows up unannounced, often when you're not home or prepared.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-transparent border-2 border-white/30"></div>
                <h4 className="text-lg font-bold mb-2 text-white/90">4. The Unknown Resolution</h4>
                <p className="text-sm text-white/80">Come home to find a generic "we were here" slip, unsure if the problem is actually fixed.</p>
              </div>
            </div>
          </div>

          {/* The Ruby Way */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-app-accent flex items-center justify-center shadow-[0_0_30px_rgba(255,95,31,0.3)]">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-app-accent">The Ruby Flow</h3>
            </div>
            
            <div className="relative border-l-2 border-app-accent/30 pl-8 space-y-12">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-app-accent shadow-[0_0_15px_rgba(255,95,31,0.5)]"></div>
                <div className="p-6 rounded-3xl bg-white/5 border border-app-accent/20 hover:border-app-accent/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="w-5 h-5 text-app-accent" />
                    <h4 className="text-lg font-bold text-white">1. Instant Digital Logging</h4>
                  </div>
                  <p className="text-sm text-white/70">Snap a photo and submit your request directly through the Tenant Portal. It's instantly routed to our team.</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-app-accent shadow-[0_0_15px_rgba(255,95,31,0.5)]"></div>
                <div className="p-6 rounded-3xl bg-white/5 border border-app-accent/20 hover:border-app-accent/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-app-accent" />
                    <h4 className="text-lg font-bold text-white">2. AI Triage & Scheduling</h4>
                  </div>
                  <p className="text-sm text-white/70">Our system categorizes the urgency and allows you to select preferred entry times that fit your schedule.</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-app-accent shadow-[0_0_15px_rgba(255,95,31,0.5)]"></div>
                <div className="p-6 rounded-3xl bg-white/5 border border-app-accent/20 hover:border-app-accent/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <Wrench className="w-5 h-5 text-app-accent" />
                    <h4 className="text-lg font-bold text-white">3. Real-Time Tracking</h4>
                  </div>
                  <p className="text-sm text-white/70">Watch the status change from "Received" to "In Progress." You'll know exactly when we're working on it.</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-app-accent shadow-[0_0_15px_rgba(255,95,31,0.5)]"></div>
                <div className="p-6 rounded-3xl bg-white/5 border border-app-accent/20 hover:border-app-accent/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-app-accent" />
                    <h4 className="text-lg font-bold text-white">4. Verified Resolution</h4>
                  </div>
                  <p className="text-sm text-white/70">Receive a completion notification with notes and photos of the finished work. Rate the service instantly.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
