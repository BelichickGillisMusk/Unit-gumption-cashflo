import { motion } from 'motion/react';
import { Train, Hospital, TreePine, Coffee } from 'lucide-react';

const landmarks = [
  { name: 'Mosswood Park', dist: 0.1, angle: -45, icon: TreePine },
  { name: 'MacArthur BART', dist: 0.4, angle: 120, icon: Train },
  { name: 'Kaiser', dist: 0.3, angle: 30, icon: Hospital },
  { name: 'Piedmont Ave', dist: 0.6, angle: 210, icon: Coffee },
  { name: 'Alta Bates', dist: 0.5, angle: 300, icon: Hospital }
];

export const NeighborhoodRadiusMap = () => {
  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto flex items-center justify-center overflow-hidden">
      {/* Background Radius Rings */}
      {[0.2, 0.4, 0.6].map((radius, i) => (
        <motion.div
          key={radius}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.2, duration: 1 }}
          className="absolute border border-white/10 rounded-full"
          style={{ 
            width: `${(radius / 0.7) * 100}%`, 
            height: `${(radius / 0.7) * 100}%` 
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#0B1A2D] text-[8px] font-bold text-white/20 uppercase tracking-widest">
            {radius} MI
          </div>
        </motion.div>
      ))}

      {/* Radar Pulse */}
      <motion.div
        animate={{ 
          scale: [1, 1.5],
          opacity: [0.5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeOut"
        }}
        className="absolute w-24 h-24 bg-app-accent/20 rounded-full"
      />

      {/* Center Point: The Ruby */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-app-accent rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,95,31,0.6)] border-4 border-[#0B1A2D]"
        >
          <div className="text-[10px] font-black text-white leading-none text-center">
            RUBY<br/>HUB
          </div>
        </motion.div>
      </div>

      {/* Landmark Chips */}
      {landmarks.map((item, i) => {
        const x = Math.cos((item.angle * Math.PI) / 180) * (item.dist / 0.7) * 50;
        const y = Math.sin((item.angle * Math.PI) / 180) * (item.dist / 0.7) * 50;

        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + (i * 0.1) }}
            className="absolute z-20"
            style={{ 
              left: `${50 + x}%`, 
              top: `${50 + y}%` 
            }}
          >
            <div className="relative group">
              <div className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-app-accent hover:border-app-accent transition-all cursor-pointer shadow-xl">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              
              {/* Label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-3 py-1 bg-white text-[#0B1A2D] rounded-lg text-[10px] font-bold whitespace-nowrap shadow-2xl">
                  {item.name} • {item.dist}mi
                </div>
              </div>

              {/* Connector Line */}
              <div 
                className="absolute top-1/2 left-1/2 w-[1px] bg-gradient-to-t from-app-accent/40 to-transparent origin-top"
                style={{ 
                  height: '40px',
                  transform: `translate(-50%, -50%) rotate(${item.angle + 90}deg)`,
                  zIndex: -1
                }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full grid grid-cols-12 grid-rows-12">
          {[...Array(144)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
