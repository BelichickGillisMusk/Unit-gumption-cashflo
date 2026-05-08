import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Search,
  Plus,
  Eye,
  Info,
  Camera,
  X
} from 'lucide-react';
import { auth } from '../firebase';

interface SecurityCamera {
  id: number;
  property_id: number;
  property_name: string;
  location: string;
  model: string;
  installation_date: string;
  status: string;
  last_update: string;
  notes?: string;
}

interface LegalForm {
  id: number;
  title: string;
  category: string;
  content_template: string;
  created_at: string;
}

interface Law {
  id: number;
  title: string;
  jurisdiction: string;
  summary: string;
  link: string;
  last_updated: string;
}

interface Violation {
  id: number;
  tenant_id: number;
  tenant_name: string;
  unit_number: string;
  description: string;
  violation_date: string;
  photo_url?: string;
  gm_notes?: string;
  status: string;
  created_at: string;
}

interface Notice {
  id: number;
  tenant_id: number;
  tenant_name: string;
  unit_number: string;
  title: string;
  content: string;
  status: string;
  sent_at: string;
  viewed_at?: string;
  acknowledged_at?: string;
  viewed_ip?: string;
  acknowledged_ip?: string;
}

interface Tenant {
  id: number;
  name: string;
  unit_number: string;
}

interface LegalLibraryDoc {
  id: number;
  title: string;
  description: string;
  category: string;
  pdf_url?: string;
  external_link?: string;
  is_mandatory: number;
  created_at: string;
}

export const AdminLegalLog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forms' | 'laws' | 'violations' | 'notices' | 'library' | 'cameras'>('notices');
  const [forms, setForms] = useState<LegalForm[]>([]);
  const [laws, setLaws] = useState<Law[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [library, setLibrary] = useState<LegalLibraryDoc[]>([]);
  const [cameras, setCameras] = useState<SecurityCamera[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [selectedAuditNotice, setSelectedAuditNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState({ tenant_id: '', title: '', content: '' });
  const [newCamera, setNewCamera] = useState({ property_id: '', location: '', model: '', installation_date: '', status: 'Operational', notes: '' });

  const logLibraryAccess = async (docId: number) => {
    try {
      await fetch('/api/legal-library-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: docId,
          user_email: auth.currentUser?.email || 'Anonymous'
        })
      });
    } catch (err) {
      console.error("Failed to log library access:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTenants();
    fetchProperties();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, lawsRes, violationsRes, noticesRes, libraryRes, camerasRes] = await Promise.all([
        fetch('/api/legal-forms'),
        fetch('/api/laws-regulations'),
        fetch('/api/lease-violations'),
        fetch('/api/tenant-notices'),
        fetch('/api/legal-library-2026'),
        fetch('/api/security-cameras')
      ]);

      const [formsData, lawsData, violationsData, noticesData, libraryData, camerasData] = await Promise.all([
        formsRes.json(),
        lawsRes.json(),
        violationsRes.json(),
        noticesRes.json(),
        libraryRes.json(),
        camerasRes.json()
      ]);

      setForms(formsData);
      setLaws(lawsData);
      setViolations(violationsData);
      setNotices(noticesData);
      setLibrary(libraryData);
      setCameras(camerasData);
    } catch (error) {
      console.error('Error fetching legal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/rent-roll');
      const data = await res.json();
      const activeTenants = data
        .filter((u: any) => u.tenant_id && u.tenant_name)
        .map((u: any) => ({
          id: u.tenant_id,
          name: u.tenant_name,
          unit_number: u.unit_number
        }));
      setTenants(activeTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/security-cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamera)
      });
      setIsCameraModalOpen(false);
      setNewCamera({ property_id: '', location: '', model: '', installation_date: '', status: 'Operational', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding camera:', error);
    }
  };

  const updateCameraStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/security-cameras/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating camera status:', error);
    }
  };

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/tenant-notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice)
      });
      setIsNoticeModalOpen(false);
      setNewNotice({ tenant_id: '', title: '', content: '' });
      fetchData();
    } catch (error) {
      console.error('Error sending notice:', error);
    }
  };

  const tabs = [
    { id: 'notices', label: 'Tenant Notices', icon: ShieldCheck },
    { id: 'violations', label: 'Lease Violations', icon: AlertTriangle },
    { id: 'cameras', label: 'Security Cameras', icon: Camera },
    { id: 'library', label: 'Legal Library 2026', icon: FileText },
    { id: 'forms', label: 'Legal Forms', icon: FileText },
    { id: 'laws', label: 'Laws & Regs', icon: Scale },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-black text-app-text">Legal Defense <span className="italic text-app-accent">Log</span></h2>
          <p className="text-app-text/50 mt-2 font-medium">Comprehensive compliance tracking and legal documentation.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if (activeTab === 'cameras') setIsCameraModalOpen(true);
              else setIsNoticeModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-app-card border border-app-text/10 rounded-full font-bold text-sm hover:bg-app-text hover:text-app-bg transition-all shadow-sm"
          >
            {activeTab === 'cameras' ? <Camera className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {activeTab === 'cameras' ? 'Add Camera' : 'Send Notice'}
          </button>
          <button className="px-6 py-3 bg-app-accent text-white rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-md">
            Export Audit Log
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCameraModalOpen(false)}
              className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-app-card rounded-[3rem] border border-app-border shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black text-app-text uppercase tracking-tighter">Add Security Camera</h2>
                    <p className="text-app-text/40 text-sm mt-2 uppercase tracking-widest font-bold">Register new hardware at 3875 Ruby</p>
                  </div>
                  <button onClick={() => setIsCameraModalOpen(false)} className="p-4 hover:bg-app-text/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-app-text/40" />
                  </button>
                </div>

                <form onSubmit={handleAddCamera} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Property</label>
                      <select 
                        required
                        value={newCamera.property_id}
                        onChange={(e) => setNewCamera({ ...newCamera, property_id: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      >
                        <option value="">Select Property</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Location</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g., Main Entrance, Garage"
                        value={newCamera.location}
                        onChange={(e) => setNewCamera({ ...newCamera, location: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Model</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g., Ring Pro 2, Nest Cam"
                        value={newCamera.model}
                        onChange={(e) => setNewCamera({ ...newCamera, model: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Installation Date</label>
                      <input 
                        required
                        type="date"
                        value={newCamera.installation_date}
                        onChange={(e) => setNewCamera({ ...newCamera, installation_date: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Initial Notes</label>
                    <textarea 
                      rows={3}
                      value={newCamera.notes}
                      onChange={(e) => setNewCamera({ ...newCamera, notes: e.target.value })}
                      className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-ruby text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-ruby/20"
                  >
                    Register Hardware
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Notice Modal */}
      <AnimatePresence>
        {isNoticeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-app-text/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-app-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-app-text/10"
            >
              <div className="p-8 border-b border-app-text/5 bg-app-bg/30">
                <h3 className="text-2xl font-serif font-black text-app-text">Issue Official <span className="italic text-app-accent">Notice</span></h3>
                <p className="text-xs text-app-text/40 font-bold uppercase tracking-widest mt-1">Legal Defense Log Entry</p>
              </div>
              <form onSubmit={handleSendNotice} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest ml-4">Recipient Tenant</label>
                  <select 
                    required
                    value={newNotice.tenant_id}
                    onChange={(e) => setNewNotice({ ...newNotice, tenant_id: e.target.value })}
                    className="w-full px-6 py-4 bg-app-text/5 border border-app-text/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-app-accent/20 font-bold text-app-text"
                  >
                    <option value="">Select a tenant...</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Unit {t.unit_number})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest ml-4">Notice Title</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g., 3-Day Notice to Pay or Quit"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full px-6 py-4 bg-app-text/5 border border-app-text/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-app-accent/20 font-bold text-app-text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest ml-4">Notice Content</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Enter the full legal text of the notice..."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="w-full px-6 py-4 bg-app-text/5 border border-app-text/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-app-accent/20 font-bold text-app-text resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsNoticeModalOpen(false)}
                    className="flex-1 py-4 bg-app-text/5 text-app-text/40 font-bold uppercase tracking-widest rounded-2xl hover:bg-app-text/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-app-accent text-white font-bold uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-app-accent/20"
                  >
                    Send Notice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex gap-4 p-1 bg-app-text/5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
              ? 'bg-app-card text-app-accent shadow-sm' 
              : 'text-app-text/40 hover:text-app-text'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-app-card rounded-[2.5rem] border border-app-text/5 shadow-xl overflow-hidden"
        >
          {activeTab === 'library' && (
            <div className="p-8 space-y-8">
              <div className="bg-app-accent/5 border border-app-accent/10 rounded-[2rem] p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-app-accent text-white">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-black text-app-text">Top 10 <span className="italic">Must-Haves</span> in Tenant Files</h4>
                    <p className="text-xs text-app-text/40 font-bold uppercase tracking-widest">California 94609 Compliance Checklist</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Signed 2026 Standard Lease Agreement",
                    "Oakland RAP Notice (Mandatory)",
                    "Security Deposit Statement & Receipt",
                    "Lead-Based Paint Disclosure (Pre-1978)",
                    "Mold Disclosure Addendum",
                    "Bed Bug Information Sheet",
                    "Flood Zone Disclosure",
                    "Megan's Law Disclosure",
                    "Move-In Inspection Checklist (Signed)",
                    "Proof of Service for all Notices"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-app-card rounded-2xl border border-app-accent/10 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-app-accent/10 text-app-accent flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-bold text-app-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {library.map((doc) => (
                  <div key={doc.id} className="p-6 rounded-[2rem] border border-app-text/5 bg-app-bg/30 hover:border-app-accent/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-app-text text-app-bg group-hover:bg-app-accent group-hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-app-text/30 bg-app-text/5 px-2 py-1 rounded">
                          {doc.category}
                        </span>
                        {doc.is_mandatory === 1 && (
                          <span className="text-[8px] font-bold uppercase tracking-widest text-red-600 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">
                            Mandatory
                          </span>
                        )}
                      </div>
                    </div>
                    <h4 className="text-lg font-serif font-bold mb-2 group-hover:text-app-accent transition-colors">{doc.title}</h4>
                    <p className="text-xs text-app-text/50 line-clamp-2 mb-6 leading-relaxed">
                      {doc.description}
                    </p>
                    <div className="flex gap-2">
                      {doc.external_link && (
                        <a 
                          href={doc.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => logLibraryAccess(doc.id)}
                          className="flex-grow flex items-center justify-center gap-2 py-3 bg-app-text text-app-bg text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-app-accent hover:text-white transition-colors"
                        >
                          View Official <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button 
                        onClick={() => logLibraryAccess(doc.id)}
                        className="p-3 bg-app-text/5 text-app-text/40 rounded-xl hover:text-app-text transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cameras' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-app-text/5 border-b border-app-text/5">
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Property</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Location / Model</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Status</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Last Update</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-text/5">
                  {cameras.map((camera) => (
                    <tr key={camera.id} className="hover:bg-app-text/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-app-text">{camera.property_name}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-app-text">{camera.location}</div>
                        <div className="text-xs text-app-text/40">{camera.model}</div>
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          value={camera.status}
                          onChange={(e) => updateCameraStatus(camera.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none focus:ring-2 focus:ring-ruby/20 ${
                            camera.status === 'Operational' ? 'bg-ruby/10 text-ruby' :
                            camera.status === 'Offline' ? 'bg-app-accent/10 text-app-accent' :
                            'bg-ruby-light/10 text-ruby-light'
                          }`}
                        >
                          <option value="Operational">Operational</option>
                          <option value="Maintenance Required">Maintenance</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs text-app-text font-medium">{new Date(camera.last_update).toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-3 bg-app-text/5 text-app-text/40 rounded-xl hover:text-app-text transition-colors">
                          <Info className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cameras.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-app-text/40 italic font-medium">
                        No security cameras registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-app-text/5 border-b border-app-text/5">
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Tenant / Unit</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Notice Title</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Status</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Chain of Custody</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-text/5">
                  {notices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-app-text/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-ruby/10 flex items-center justify-center text-ruby font-bold text-xs">
                            {notice.unit_number}
                          </div>
                          <div>
                            <div className="font-bold text-app-text">{notice.tenant_name}</div>
                            <div className="text-xs text-app-text/40">Unit {notice.unit_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-app-text">{notice.title}</div>
                        <div className="text-xs text-app-text/40 truncate max-w-[200px]">{notice.content}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                            notice.status === 'Acknowledged' ? 'bg-ruby/10 text-ruby border border-ruby/20' :
                            notice.status === 'Viewed' ? 'bg-ruby/5 text-ruby/60 border border-ruby/10' :
                            'bg-ruby-light/10 text-ruby-light border border-ruby-light/20'
                          }`}>
                            {notice.status === 'Acknowledged' && <CheckCircle2 className="w-3 h-3" />}
                            {notice.status === 'Viewed' && <Eye className="w-3 h-3" />}
                            {notice.status === 'Sent' && <Clock className="w-3 h-3" />}
                            {notice.status}
                          </span>
                          {notice.acknowledged_at && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ruby text-white text-[8px] font-black uppercase tracking-tighter rounded w-fit">
                              <ShieldCheck className="w-2 h-2" /> Verified Defense
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-ruby shadow-[0_0_8px_rgba(166,75,75,0.5)]" />
                            <div className="w-0.5 h-4 bg-app-text/10" />
                            <div className={`w-2 h-2 rounded-full ${notice.viewed_at ? 'bg-ruby shadow-[0_0_8px_rgba(166,75,75,0.5)]' : 'bg-app-text/10'}`} />
                            <div className="w-0.5 h-4 bg-app-text/10" />
                            <div className={`w-2 h-2 rounded-full ${notice.acknowledged_at ? 'bg-ruby shadow-[0_0_8px_rgba(166,75,75,0.5)]' : 'bg-app-text/10'}`} />
                          </div>
                          <div className="space-y-3">
                            <div className="text-[10px] leading-none">
                              <span className="font-bold text-app-text/40 uppercase tracking-widest block mb-1">Sent</span>
                              <span className="text-app-text font-medium">{new Date(notice.sent_at).toLocaleString()}</span>
                            </div>
                            <div className={`text-[10px] leading-none ${notice.viewed_at ? 'opacity-100' : 'opacity-20'}`}>
                              <span className="font-bold text-app-text/40 uppercase tracking-widest block mb-1">Viewed</span>
                              <span className="text-app-text font-medium">{notice.viewed_at ? new Date(notice.viewed_at).toLocaleString() : 'Pending...'}</span>
                              {notice.viewed_ip && <span className="ml-2 font-mono text-[8px] bg-app-text/5 px-1 rounded">IP: {notice.viewed_ip}</span>}
                            </div>
                            <div className={`text-[10px] leading-none ${notice.acknowledged_at ? 'opacity-100' : 'opacity-20'}`}>
                              <span className="font-bold text-app-text/40 uppercase tracking-widest block mb-1">Acknowledged</span>
                              <span className="text-app-text font-medium">{notice.acknowledged_at ? new Date(notice.acknowledged_at).toLocaleString() : 'Pending...'}</span>
                              {notice.acknowledged_ip && <span className="ml-2 font-mono text-[8px] bg-app-text/5 px-1 rounded">IP: {notice.acknowledged_ip}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setSelectedAuditNotice(notice)}
                          className="p-3 bg-app-text/5 text-app-text/40 rounded-xl hover:bg-app-accent hover:text-white transition-all group"
                          title="View Full Audit Trail"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'violations' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-app-text/5 border-b border-app-text/5">
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Tenant / Unit</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Violation Details</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Date</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Status</th>
                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-app-text/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-text/5">
                  {violations.map((v) => (
                    <tr key={v.id} className="hover:bg-app-text/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                            {v.unit_number}
                          </div>
                          <div>
                            <div className="font-bold text-app-text">{v.tenant_name}</div>
                            <div className="text-xs text-app-text/40">Unit {v.unit_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-app-text">{v.description}</div>
                        {v.gm_notes && <div className="text-xs text-app-text/40 italic mt-1">Note: {v.gm_notes}</div>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium text-app-text">{new Date(v.violation_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/10 text-red-600 border border-red-600/20">
                          <AlertTriangle className="w-3 h-3" />
                          {v.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button className="p-2 hover:bg-app-text/5 rounded-lg transition-colors text-app-text/40 hover:text-app-accent">
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div key={form.id} className="p-6 rounded-3xl border border-app-text/5 bg-app-bg/50 hover:border-app-accent/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-app-accent/10 text-app-accent group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-app-text/30 bg-app-text/5 px-2 py-1 rounded">
                      {form.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-bold mb-2">{form.title}</h4>
                  <p className="text-xs text-app-text/50 line-clamp-3 mb-6 leading-relaxed">
                    {form.content_template}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-grow py-2 bg-app-text text-app-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-app-accent hover:text-white transition-colors">
                      Use Template
                    </button>
                    <button className="p-2 bg-app-text/5 text-app-text/40 rounded-xl hover:text-app-text transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'laws' && (
            <div className="p-8 space-y-6">
              {laws.map((law) => (
                <div key={law.id} className="p-8 rounded-[2rem] border border-app-text/5 bg-app-card shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-start">
                  <div className="p-4 rounded-2xl bg-ruby/10 text-ruby">
                    <Scale className="w-8 h-8" />
                  </div>
                  <div className="flex-grow space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-2xl font-serif font-bold">{law.title}</h4>
                      <span className="px-3 py-1 bg-app-text/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-app-text/40">
                        {law.jurisdiction}
                      </span>
                    </div>
                    <p className="text-app-text/60 leading-relaxed max-w-3xl">
                      {law.summary}
                    </p>
                    <div className="flex items-center gap-6 pt-2">
                      <a 
                        href={law.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-app-accent hover:underline"
                      >
                        Official Source <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-app-text/30">
                        Last Updated: {law.last_updated}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Audit Trail Modal */}
      <AnimatePresence>
        {selectedAuditNotice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-app-text/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-app-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-app-text/10"
            >
              <div className="p-8 border-b border-app-text/5 bg-app-bg/30 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-serif font-black text-app-text">Chain of <span className="italic text-app-accent">Custody</span></h3>
                  <p className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest mt-1">Audit Trail // Notice ID: {selectedAuditNotice.id}</p>
                </div>
                <button onClick={() => setSelectedAuditNotice(null)} className="p-2 hover:bg-app-text/5 rounded-full transition-colors">
                  <Plus className="w-6 h-6 rotate-45 text-app-text/40" />
                </button>
              </div>
              
              <div className="p-10 space-y-12">
                <div className="flex items-center gap-6 p-6 bg-app-text/5 rounded-3xl border border-app-text/5">
                  <div className="w-16 h-16 rounded-2xl bg-app-accent text-white flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-app-text">{selectedAuditNotice.title}</h4>
                    <p className="text-xs text-app-text/50 uppercase tracking-widest font-bold">Issued to {selectedAuditNotice.tenant_name} (Unit {selectedAuditNotice.unit_number})</p>
                  </div>
                </div>

                <div className="relative space-y-12 pl-8">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-app-text/10" />

                  {/* Sent Step */}
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-ruby border-4 border-app-card shadow-[0_0_10px_rgba(155,17,30,0.5)]" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-app-text">Notice Issued</span>
                        <span className="text-[10px] font-mono text-app-text/40">{new Date(selectedAuditNotice.sent_at).toLocaleString()}</span>
                      </div>
                      <div className="p-4 bg-app-bg/50 rounded-2xl border border-app-text/5 text-[10px] text-app-text/60 leading-relaxed italic">
                        Notice successfully dispatched via digital portal. Cryptographic timestamp generated.
                      </div>
                    </div>
                  </div>

                  {/* Viewed Step */}
                  <div className="relative">
                    <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-4 border-app-card ${selectedAuditNotice.viewed_at ? 'bg-ruby shadow-[0_0_10px_rgba(155,17,30,0.5)]' : 'bg-app-text/10'}`} />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedAuditNotice.viewed_at ? 'text-app-text' : 'text-app-text/20'}`}>Tenant Viewed</span>
                        <span className="text-[10px] font-mono text-app-text/40">{selectedAuditNotice.viewed_at ? new Date(selectedAuditNotice.viewed_at).toLocaleString() : 'Pending'}</span>
                      </div>
                      {selectedAuditNotice.viewed_at ? (
                        <div className="p-4 bg-ruby/5 rounded-2xl border border-ruby/10 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Eye className="w-4 h-4 text-ruby" />
                            <span className="text-[10px] font-bold text-ruby uppercase tracking-widest">Read Receipt Confirmed</span>
                          </div>
                          <span className="font-mono text-[10px] text-app-text/40 bg-white/50 px-2 py-0.5 rounded">IP: {selectedAuditNotice.viewed_ip}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-app-text/20 italic ml-4">Waiting for tenant interaction...</div>
                      )}
                    </div>
                  </div>

                  {/* Acknowledged Step */}
                  <div className="relative">
                    <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-4 border-app-card ${selectedAuditNotice.acknowledged_at ? 'bg-ruby shadow-[0_0_10px_rgba(155,17,30,0.5)]' : 'bg-app-text/10'}`} />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedAuditNotice.acknowledged_at ? 'text-app-text' : 'text-app-text/20'}`}>Digital Acknowledgment</span>
                        <span className="text-[10px] font-mono text-app-text/40">{selectedAuditNotice.acknowledged_at ? new Date(selectedAuditNotice.acknowledged_at).toLocaleString() : 'Pending'}</span>
                      </div>
                      {selectedAuditNotice.acknowledged_at ? (
                        <div className="p-4 bg-ruby/5 rounded-2xl border border-ruby/10 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-ruby" />
                            <span className="text-[10px] font-bold text-ruby uppercase tracking-widest">Legally Binding Signature</span>
                          </div>
                          <span className="font-mono text-[10px] text-app-text/40 bg-white/50 px-2 py-0.5 rounded">IP: {selectedAuditNotice.acknowledged_ip}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-app-text/20 italic ml-4">Waiting for tenant signature...</div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedAuditNotice.acknowledged_at && (
                  <div className="p-6 bg-app-text text-app-bg rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ShieldCheck className="w-8 h-8 text-ruby" />
                      <div>
                        <div className="text-sm font-black uppercase tracking-tighter">Defense-Ready Document</div>
                        <div className="text-[10px] font-bold text-app-bg/50 uppercase tracking-widest">Verified Chain of Custody Complete</div>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                      Download PDF
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Notices', value: notices.length, icon: ShieldCheck, color: 'text-ruby' },
          { label: 'Active Violations', value: violations.filter(v => v.status !== 'Resolved').length, icon: AlertTriangle, color: 'text-orange-600' },
          { label: 'Ack Rate', value: `${Math.round((notices.filter(n => n.status === 'Acknowledged').length / (notices.length || 1)) * 100)}%`, icon: CheckCircle2, color: 'text-ruby' },
          { label: 'Last Audit', value: 'Today', icon: Clock, color: 'text-ruby' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl bg-app-card border border-app-text/5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-app-text/5 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-serif font-black text-app-text">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCameraModalOpen(false)}
              className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-app-card rounded-[3rem] border border-app-border shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black text-app-text uppercase tracking-tighter">Add Security Camera</h2>
                    <p className="text-app-text/40 text-sm mt-2 uppercase tracking-widest font-bold">Register new hardware at 3875 Ruby</p>
                  </div>
                  <button onClick={() => setIsCameraModalOpen(false)} className="p-4 hover:bg-app-text/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-app-text/40" />
                  </button>
                </div>

                <form onSubmit={handleAddCamera} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Property</label>
                      <select 
                        required
                        value={newCamera.property_id}
                        onChange={(e) => setNewCamera({ ...newCamera, property_id: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      >
                        <option value="">Select Property</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Location</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g., Main Entrance, Garage"
                        value={newCamera.location}
                        onChange={(e) => setNewCamera({ ...newCamera, location: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Model</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g., Ring Pro 2, Nest Cam"
                        value={newCamera.model}
                        onChange={(e) => setNewCamera({ ...newCamera, model: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Installation Date</label>
                      <input 
                        required
                        type="date"
                        value={newCamera.installation_date}
                        onChange={(e) => setNewCamera({ ...newCamera, installation_date: e.target.value })}
                        className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text/40 ml-4">Initial Notes</label>
                    <textarea 
                      rows={3}
                      value={newCamera.notes}
                      onChange={(e) => setNewCamera({ ...newCamera, notes: e.target.value })}
                      className="w-full px-8 py-5 bg-app-text/[0.02] border border-app-border rounded-2xl focus:ring-2 focus:ring-ruby/20 outline-none transition-all font-bold resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-ruby text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-ruby/20"
                  >
                    Register Hardware
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
