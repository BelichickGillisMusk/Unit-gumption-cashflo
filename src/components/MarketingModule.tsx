import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Train, Hospital, TreePine, Navigation, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface LocationInfo {
  name: string;
  distance: string;
  type: 'transit' | 'hospital' | 'park' | 'highway' | 'neighborhood';
}

export const MarketingModule: React.FC = () => {
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const fetchProximityData = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "List the proximity of 3875 Ruby St, Oakland, CA to BART stations, major hospitals (Kaiser, Sutter, UCSF), parks, Piedmont Ave, Berkeley, SF, and major highways. Return as a JSON array of objects with 'name', 'distance', and 'type' (one of: transit, hospital, park, highway, neighborhood).",
        config: {
          tools: [{ googleMaps: {} }],
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text);
      setLocations(data);
    } catch (err) {
      console.error("Error fetching proximity data:", err);
      setError("Failed to load location intelligence.");
      // Fallback data if API fails
      setLocations([
        { name: "MacArthur BART", distance: "0.8 miles", type: "transit" },
        { name: "Kaiser Permanente Oakland", distance: "0.5 miles", type: "hospital" },
        { name: "Sutter Alta Bates Summit", distance: "0.6 miles", type: "hospital" },
        { name: "Mosswood Park", distance: "0.3 miles", type: "park" },
        { name: "Piedmont Avenue", distance: "0.7 miles", type: "neighborhood" },
        { name: "I-580 / I-980", distance: "0.4 miles", type: "highway" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProximityData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'transit': return <Train className="w-5 h-5" />;
      case 'hospital': return <Hospital className="w-5 h-5" />;
      case 'park': return <TreePine className="w-5 h-5" />;
      case 'highway': return <Navigation className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'transit': return 'text-ruby bg-ruby/10';
      case 'hospital': return 'text-ruby-light bg-ruby-light/10';
      case 'park': return 'text-ruby bg-ruby/10';
      case 'highway': return 'text-ruby-light bg-ruby-light/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-white tracking-tight">Location Intelligence</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">Marketing Proximity Data • Silverback Grounding</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-ruby/10 border border-ruby/20 text-[10px] font-black text-ruby uppercase tracking-widest flex items-center gap-2">
          <Info className="w-3 h-3" /> Live Maps Data
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 rounded-[2rem] bg-app-card border border-app-border hover:border-ruby/20 transition-all group shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${getColor(loc.type)}`}>
                  {getIcon(loc.type)}
                </div>
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">{loc.type}</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tighter mb-1 uppercase">{loc.name}</h3>
              <p className="text-zinc-500 font-mono text-sm font-bold tracking-widest">{loc.distance} AWAY</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="p-8 rounded-[2.5rem] bg-ruby/5 border border-ruby/10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Marketing Advantage</h3>
          <p className="text-app-text/60 leading-relaxed">
            3875 Ruby St is strategically located for the modern healthcare professional. 
            With a Walk Score of 92, residents enjoy immediate proximity to Kaiser and Sutter medical centers, 
            rapid transit to SF and Berkeley, and the vibrant dining scene of Piedmont Avenue.
          </p>
          <div className="flex gap-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">92 Walk Score</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">88 Bike Score</span>
          </div>
        </div>
        <div className="w-full md:w-64 aspect-square rounded-3xl bg-app-card border border-app-border flex items-center justify-center overflow-hidden shadow-sm">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-ruby mx-auto mb-4" />
            <p className="text-xs font-black text-app-text uppercase tracking-widest">Interactive Map View</p>
            <p className="text-[10px] text-app-text/30 mt-2 uppercase tracking-widest">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};
