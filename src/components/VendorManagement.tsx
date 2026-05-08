import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Phone, Mail, Calendar, ShieldCheck, Search, Plus, ExternalLink } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  service_type: string;
  contact_person: string;
  email: string;
  phone: string;
  insurance_expiry_date: string;
  created_at: string;
}

export function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        setVendors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching vendors:', err);
        setLoading(false);
      });
  }, []);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpiringSoon = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days < 30;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-black text-app-text">Vendor <span className="italic">Network</span></h2>
          <p className="text-app-text/50 mt-2">Manage third-party contractors and insurance compliance.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-app-accent text-white rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-md">
          <Plus className="w-4 h-4" /> Add New Vendor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text/30" />
        <input 
          type="text" 
          placeholder="Search by name, service, or contact..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-app-card border-2 border-app-text/5 rounded-[2rem] text-app-text focus:border-app-accent/20 outline-none transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-app-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredVendors.map((vendor, i) => (
            <motion.div 
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-app-card border-2 border-app-text/5 shadow-lg hover:border-app-accent/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <div className={`p-3 rounded-2xl ${isExpiringSoon(vendor.insurance_expiry_date) ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-bold text-app-accent uppercase tracking-[0.2em] mb-1">{vendor.service_type}</div>
                  <h3 className="text-2xl font-serif font-bold text-app-text">{vendor.name}</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 text-sm text-app-text/60">
                    <Users className="w-4 h-4 text-app-accent" />
                    <span>{vendor.contact_person}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-app-text/60">
                    <Mail className="w-4 h-4 text-app-accent" />
                    <a href={`mailto:${vendor.email}`} className="hover:text-app-accent transition-colors">{vendor.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-app-text/60">
                    <Phone className="w-4 h-4 text-app-accent" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-app-accent" />
                    <span className="font-bold text-app-text/40 uppercase tracking-widest text-[10px]">Insurance Exp:</span>
                    <span className={`font-bold ${isExpiringSoon(vendor.insurance_expiry_date) ? 'text-red-600' : 'text-app-text'}`}>
                      {new Date(vendor.insurance_expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-app-text/5 flex justify-between items-center">
                  <button className="text-xs font-bold uppercase tracking-widest text-app-text/40 hover:text-app-accent transition-colors flex items-center gap-2">
                    View History <ExternalLink className="w-3 h-3" />
                  </button>
                  <button className="px-6 py-2 bg-app-text text-app-bg rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-app-accent hover:text-white transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
