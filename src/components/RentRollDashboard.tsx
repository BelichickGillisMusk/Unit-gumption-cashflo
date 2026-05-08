import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Search,
  Plus,
  MoreHorizontal,
  MessageSquare,
  FileText,
  ShieldAlert,
  Gavel
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface RentRollItem {
  id: number;
  unit_number: string;
  rent_amount: number;
  status: string;
  tenant_name: string | null;
  tenant_id: number | null;
  lease_end: string | null;
  balance_due: number;
  last_login_at: string | null;
  last_login_ip: string | null;
  last_payment_date: string | null;
  last_payment_status: string | null;
  neighborhood: string | null;
  photos: string | null;
  needs_reply: number;
  last_tenant_activity_at: string | null;
}

interface User {
  id: number;
  email: string;
  role: 'OWNER' | 'GM' | 'ACCOUNTING';
  name: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  neighborhood: string;
  trash_day: string;
  street_sweeping_day: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  created_at: string;
}

interface MaintenanceRequest {
  id: number;
  description: string;
  photo_url: string | null;
  status: string;
  created_at: string;
}

interface Stats {
  total_units: number;
  occupied_units: number;
  total_potential_revenue: number;
}

interface TenantNotice {
  id: number;
  title: string;
  content: string;
  status: string;
  sent_at: string;
  viewed_at?: string;
  acknowledged_at?: string;
  acknowledged_ip?: string;
  viewed_ip?: string;
}

interface LeaseViolation {
  id: number;
  description: string;
  violation_date: string;
  status: string;
}

export const RentRollDashboard: React.FC = () => {
  const [data, setData] = useState<RentRollItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<RentRollItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Detail views state
  const [messages, setMessages] = useState<Message[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [notices, setNotices] = useState<TenantNotice[]>([]);
  const [violations, setViolations] = useState<LeaseViolation[]>([]);
  const [isLoggingViolation, setIsLoggingViolation] = useState(false);
  const [violationData, setViolationData] = useState({ description: '', violation_date: new Date().toISOString().split('T')[0] });
  const [newMessage, setNewMessage] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [, setCookieStatus] = useState<'checking' | 'active' | 'blocked'>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [editUnitData, setEditUnitData] = useState({ status: '', photos: '' });

  // Confirmation state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const fetchData = async () => {
    try {
      const [rentRollRes, statsRes, meRes, propRes] = await Promise.all([
        fetch('/api/rent-roll'),
        fetch('/api/stats'),
        fetch('/api/me'),
        fetch('/api/property/1')
      ]);
      const rentRollData = await rentRollRes.json();
      const statsData = await statsRes.json();
      const meData = await meRes.json();
      const propData = await propRes.json();
      setData(rentRollData);
      setStats(statsData);
      setUser(meData);
      setProperty(propData);
    } catch (error) {
      console.error("Error fetching rent roll:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitDetails = async (unitId: number, tenantId: number | null) => {
    try {
      const [msgRes, maintRes] = await Promise.all([
        fetch(`/api/messages/${unitId}`),
        fetch(`/api/maintenance/${unitId}`)
      ]);
      setMessages(await msgRes.json());
      setMaintenance(await maintRes.json());
      
      if (tenantId) {
        const [noticesRes, violationsRes] = await Promise.all([
          fetch(`/api/tenant-notices/${tenantId}`),
          fetch(`/api/lease-violations/${tenantId}`)
        ]);
        setNotices(await noticesRes.json());
        setViolations(await violationsRes.json());
      } else {
        setNotices([]);
        setViolations([]);
      }
    } catch (error) {
      console.error("Error fetching unit details:", error);
    }
  };

  const checkCookies = async () => {
    try {
      await fetch('/api/cookie-set');
      // Small delay to ensure cookie is processed
      setTimeout(async () => {
        const res = await fetch('/api/cookie-verify');
        const data = await res.json();
        setCookieStatus(data.active ? 'active' : 'blocked');
      }, 500);
    } catch (error) {
      console.error("Cookie check failed:", error);
      setCookieStatus('blocked');
    }
  };

  useEffect(() => {
    fetchData();
    checkCookies();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
    }
  }, [selectedUnit]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUnit) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnit.id,
          sender: 'Manager',
          content: newMessage
        })
      });
      setNewMessage('');
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleMarkOverdue = (unitId: number) => {
    const unit = data.find(u => u.id === unitId);
    if (!unit) return;

    setConfirmState({
      isOpen: true,
      title: 'CONFIRM DELINQUENCY',
      message: `You are about to mark Unit #${unit.unit_number} as OVERDUE. 

This action will:
1. Flag the tenant (${unit.tenant_name}) as delinquent.
2. Trigger an automated late notice email.
3. Apply a $50 administrative late fee to the balance.
4. Enable the 'Chase Direct Deposit' recovery link.

Are you absolutely sure you want to proceed?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`/api/rent-roll/${unitId}/overdue`, { method: 'PATCH' });
          fetchData(); // Refresh the table
        } catch (error) {
          console.error("Error marking overdue:", error);
        }
      }
    });
  };

  const handleGenerateReport = async (unitId: number) => {
    try {
      const res = await fetch(`/api/reports/unit/${unitId}`);
      const data = await res.json();
      
      // Fetch additional legal data
      if (data.unit.tenant_id) {
        const [noticesRes, violationsRes] = await Promise.all([
          fetch(`/api/tenant-notices/${data.unit.tenant_id}`),
          fetch(`/api/lease-violations/${data.unit.tenant_id}`)
        ]);
        data.notices = await noticesRes.json();
        data.violations = await violationsRes.json();
      } else {
        data.notices = [];
        data.violations = [];
      }

      setReportData(data);
      setIsReportOpen(true);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleLogViolation = async () => {
    if (!selectedUnit?.tenant_id) return;
    try {
      await fetch('/api/lease-violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: selectedUnit.tenant_id,
          ...violationData
        })
      });
      setIsLoggingViolation(false);
      setViolationData({ description: '', violation_date: new Date().toISOString().split('T')[0] });
      fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
    } catch (error) {
      console.error("Failed to log violation:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUnit) return;

    const description = prompt("Enter a description for this maintenance request:", "Photo Uploaded");
    if (description === null) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unit_id: selectedUnit.id,
            description: description || "Photo Uploaded",
            photo_url: base64String
          })
        });
        fetchUnitDetails(selectedUnit.id, selectedUnit.tenant_id);
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatCurrency = (val: number | null | undefined) => {
    return (val ?? 0).toLocaleString();
  };

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const end = new Date(dateStr);
    const now = new Date();
    // Set both to start of day for accurate day calculation
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleUpdateUnit = async () => {
    if (!selectedUnit) return;
    try {
      await fetch(`/api/units/${selectedUnit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUnitData)
      });
      setIsEditingUnit(false);
      fetchData();
      setSelectedUnit(prev => prev ? { ...prev, ...editUnitData } : null);
    } catch (error) {
      console.error("Error updating unit:", error);
    }
  };

  const isOwnerOrAccounting = user?.role === 'OWNER' || user?.role === 'ACCOUNTING';
  const isGM = user?.role === 'GM';
  const isGMOrOwner = user?.role === 'GM' || user?.role === 'OWNER';

  const isUnansweredAlert = (unit: RentRollItem) => {
    if (!unit.needs_reply || !unit.last_tenant_activity_at) return false;
    const activityDate = new Date(unit.last_tenant_activity_at);
    const now = new Date();
    const diffHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);
    return diffHours >= 48;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-app-accent/20 border-t-app-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
      
      {/* Global Alerts */}
      {data.some(isUnansweredAlert) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2rem] bg-app-accent/10 border border-app-accent/20 flex items-center justify-between gap-6 shadow-2xl shadow-app-accent/5"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-app-accent flex items-center justify-center text-white shadow-lg shadow-app-accent/40 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-app-text tracking-tighter uppercase">Legal Compliance Alert</h3>
              <p className="text-app-accent font-mono text-xs font-bold uppercase tracking-widest mt-1">
                {data.filter(isUnansweredAlert).length} Tenant messages unanswered for 48+ hours. Immediate response required for legal defense.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const firstAlert = data.find(isUnansweredAlert);
                if (firstAlert) {
                  setSelectedUnit(firstAlert);
                  setIsDetailOpen(true);
                }
              }}
              className="px-8 py-4 rounded-2xl bg-app-accent text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-app-accent/20"
            >
              Review Alerts
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-app-accent/10 text-app-accent">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="text-sm font-black text-app-text/40 uppercase tracking-widest">Occupancy Rate</span>
          </div>
          <div className="text-6xl font-black text-app-text tracking-tighter">
            {stats ? Math.round((stats.occupied_units / stats.total_units) * 100) : 0}%
          </div>
          <div className="mt-4 text-sm font-mono text-app-text/30 uppercase tracking-widest">
            {stats?.occupied_units} / {stats?.total_units} Units Active
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-app-accent/10 text-app-accent">
              <CreditCard className="w-8 h-8" />
            </div>
            <span className="text-sm font-black text-app-text/40 uppercase tracking-widest">Potential Revenue</span>
          </div>
          <div className="text-6xl font-black text-app-text tracking-tighter">
            ${stats ? formatCurrency(stats.total_potential_revenue) : 0}
          </div>
          <div className="mt-4 text-sm font-mono text-app-text/30 uppercase tracking-widest">
            Monthly Target • Silverback Projection
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-app-accent/10 border border-app-accent/20 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-app-accent/20 text-app-accent">
                <AlertCircle className="w-8 h-8" />
              </div>
              <span className="text-sm font-black text-app-accent uppercase tracking-widest">Community Alerts</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Trash Day</span>
                <span className="text-sm font-black text-app-text uppercase">{property?.trash_day || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Street Sweeping</span>
                <span className="text-sm font-black text-app-text uppercase">{property?.street_sweeping_day || 'N/A'}</span>
              </div>
              <button className="w-full mt-4 py-3 rounded-xl bg-app-accent text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                Send SMS Notice to All
              </button>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-app-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        </div>
      </div>

      {/* Rent Roll Table */}
      <div className="bg-app-card rounded-[3rem] border border-app-border shadow-2xl overflow-hidden transition-colors duration-500">
        <div className="p-10 border-b border-app-border flex items-center justify-between bg-app-text/[0.01]">
          <div>
            <h2 className="text-4xl font-black text-app-text tracking-tighter uppercase">Active Rent Roll</h2>
            <p className="text-app-text/40 font-mono text-xs uppercase tracking-widest mt-1">
              {isOwnerOrAccounting ? 'Owner/Accounting Control Level' : 'GM View Level'} • {data.length} Units Total
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text/30" />
              <input 
                type="text" 
                placeholder="Search units, tenants..."
                className="pl-12 pr-6 py-4 bg-app-text/5 border border-app-border rounded-2xl text-app-text font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-app-accent/50 w-80"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-app-border">
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Unit</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Tenant</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Rent</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Balance</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Last Payment</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Lease End</th>
                <th className="px-10 py-8 text-[11px] font-black text-app-text/30 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {data.map((unit) => (
                <tr 
                  key={unit.id}
                  onClick={() => {
                    setSelectedUnit(unit);
                    setIsDetailOpen(true);
                  }}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-app-text/5 flex items-center justify-center text-2xl font-black text-app-text border border-app-border group-hover:border-app-accent/30 transition-all">
                          {unit.unit_number}
                        </div>
                        {isUnansweredAlert(unit) && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-app-accent rounded-full flex items-center justify-center border-2 border-app-card animate-bounce shadow-lg shadow-app-accent/40">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${
                      unit.status === 'Occupied' 
                        ? 'bg-app-accent/20 text-app-accent border-app-accent/30' 
                        : 'bg-app-text/20 text-app-text/40 border-app-text/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${unit.status === 'Occupied' ? 'bg-app-accent' : 'bg-app-text/40'}`} />
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-6">
                      {unit.tenant_name ? (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-app-accent/20 flex items-center justify-center text-xl font-black text-app-accent border border-app-accent/20 shadow-inner">
                            {unit.tenant_name.charAt(0)}
                          </div>
                          <span className="text-xl font-black text-app-text tracking-tighter">{unit.tenant_name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-app-text/30 italic font-mono font-bold tracking-widest">VACANT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className="text-2xl font-black text-app-text font-mono tracking-tighter">${formatCurrency(unit.rent_amount)}</span>
                  </td>
                  <td className="px-10 py-10">
                    <span className={`text-2xl font-black font-mono tracking-tighter ${(unit.balance_due ?? 0) > 0 ? 'text-app-accent' : 'text-app-text/30'}`}>
                      ${formatCurrency(unit.balance_due)}
                    </span>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-app-text/40 font-mono font-bold">
                        <Clock className="w-4 h-4" />
                        <span className="text-base">{unit.last_payment_date || 'N/A'}</span>
                      </div>
                      {unit.status === 'Occupied' && (
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${unit.last_payment_status === 'Paid' ? 'text-app-accent' : 'text-app-accent'}`}>
                          {unit.last_payment_status || 'Pending'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    {unit.lease_end ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-xl font-black text-app-text font-mono tracking-tighter">
                          {unit.lease_end}
                        </div>
                        {(() => {
                          const days = getDaysRemaining(unit.lease_end);
                          if (days === null) return null;
                          const isExpiringSoon = days >= 0 && days <= 30;
                          const isExpired = days < 0;
                          return (
                            <div className={`text-[10px] font-black uppercase tracking-widest ${isExpiringSoon || isExpired ? 'text-app-accent' : 'text-app-text/40'}`}>
                              {isExpired ? 'Expired' : `${days} Days Remaining`}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-app-text/30 italic font-mono font-bold tracking-widest">N/A</span>
                    )}
                  </td>
                  <td className="px-10 py-10 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {isOwnerOrAccounting && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkOverdue(unit.id);
                          }}
                          className="p-3 text-zinc-500 hover:text-red-400 transition-colors bg-white/5 rounded-xl border border-white/5"
                          title="Mark Overdue"
                        >
                          <AlertCircle className="w-6 h-6" />
                        </button>
                      )}
                      <button className="p-3 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5">
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedUnit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl bg-app-card border border-app-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-app-border flex items-center justify-between bg-app-text/[0.02]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-app-accent/20 flex items-center justify-center text-2xl font-black text-app-accent border border-app-accent/20">
                  #{selectedUnit.unit_number}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-app-text tracking-tighter">Management Module</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-app-text/40 font-mono text-sm uppercase tracking-widest">
                      {selectedUnit.tenant_name || 'VACANT'} • Silverback Intelligence Active
                    </p>
                    <span className="w-1 h-1 rounded-full bg-app-border" />
                    <span className="text-xs font-black text-app-accent uppercase tracking-widest">{selectedUnit.neighborhood || 'Mosswood'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleGenerateReport(selectedUnit.id)}
                  className="flex items-center gap-2 px-6 py-3 bg-app-text/5 border border-app-border rounded-xl font-bold text-sm text-app-text/60 hover:bg-app-text/10 transition-all"
                >
                  <FileText className="w-4 h-4" /> Generate Report
                </button>
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="p-3 bg-app-text/5 rounded-xl text-app-text/40 hover:text-app-text transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
            </div>

            {/* Main Content Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Unit & Tenant Details */}
              <div 
                style={{ width: `${leftPanelWidth}%` }}
                className="border-r border-app-border p-8 overflow-y-auto space-y-8 bg-app-bg/30"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                    <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Monthly Rent</div>
                    <div className="text-xl font-bold text-app-text">${formatCurrency(selectedUnit.rent_amount)}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                    <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Balance Due</div>
                    <div className="text-xl font-bold text-app-accent">${formatCurrency(selectedUnit.balance_due)}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                    <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Lease End</div>
                    <div className="text-xl font-bold text-app-text">{selectedUnit.lease_end || 'N/A'}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-app-text/5 border border-app-border space-y-1">
                    <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest font-mono">Last Payment</div>
                    <div className="text-xl font-bold text-app-accent">{selectedUnit.last_payment_date || 'None'}</div>
                  </div>
                </div>

                {/* GM/Owner Controls: Vacancy & Photos */}
                {(isOwnerOrAccounting || isGM) && (
                  <div className="p-6 rounded-3xl bg-app-text/5 border border-app-border space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-app-text uppercase tracking-widest">Unit Management</h4>
                      <button 
                        onClick={() => {
                          if (isEditingUnit) {
                            handleUpdateUnit();
                          } else {
                            setEditUnitData({ status: selectedUnit.status, photos: selectedUnit.photos || '' });
                            setIsEditingUnit(true);
                          }
                        }}
                        className="px-4 py-2 bg-app-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                      >
                        {isEditingUnit ? 'Save Changes' : 'Edit Unit'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest block mb-2">Occupancy Status</label>
                        <select
                          disabled={!isEditingUnit}
                          value={isEditingUnit ? editUnitData.status : selectedUnit.status}
                          onChange={(e) => setEditUnitData({ ...editUnitData, status: e.target.value })}
                          className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-sm text-app-text disabled:opacity-50"
                        >
                          <option value="Occupied">Occupied</option>
                          <option value="Vacant">Vacant</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest block mb-2">Unit Photos (URLs)</label>
                        <textarea
                          disabled={!isEditingUnit}
                          value={isEditingUnit ? editUnitData.photos : selectedUnit.photos || ''}
                          onChange={(e) => setEditUnitData({ ...editUnitData, photos: e.target.value })}
                          placeholder="Enter comma-separated image URLs..."
                          className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-sm text-app-text disabled:opacity-50 min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Login History */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-app-text/40 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Tenant Activity Log
                  </h4>
                  <div className="p-6 rounded-2xl bg-app-text/5 border border-app-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-app-text/60">Last Login</div>
                      <div className="text-sm font-bold text-app-text">{selectedUnit.last_login_at ? new Date(selectedUnit.last_login_at).toLocaleString() : 'Never'}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-app-text/60">Login Location</div>
                      <div className="text-sm font-mono text-app-text/40">{selectedUnit.last_login_ip || 'N/A'}</div>
                    </div>
                    <div className="pt-2 text-[10px] text-app-text/30 uppercase tracking-widest italic">
                      * Activity logging compliant with local privacy regulations
                    </div>
                  </div>
                </div>

                {/* Maintenance Requests */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-app-text/40 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Maintenance Issues
                    </h4>
                    <button className="text-[10px] font-black text-app-accent uppercase tracking-widest hover:underline">New Request</button>
                  </div>
                  <div className="space-y-3">
                    {maintenance.length > 0 ? (
                      maintenance.map(req => (
                        <div key={req.id} className="p-4 rounded-xl bg-app-text/5 border border-app-border flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-app-text">{req.description}</div>
                            <div className="text-[10px] text-app-text/40 uppercase tracking-widest">{new Date(req.created_at).toLocaleDateString()} • {req.status}</div>
                          </div>
                          {req.photo_url && (
                            <div className="w-10 h-10 rounded-lg bg-app-bg border border-app-border overflow-hidden">
                              <img src={req.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-app-border flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-app-text/5 flex items-center justify-center text-app-text/30">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="text-sm text-app-text/40">No active maintenance issues reported.</div>
                      </div>
                    )}
                    
                    {/* Photo Upload Placeholder */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed border-app-border bg-app-text/[0.01] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-app-text/[0.03] transition-colors ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {isUploading ? (
                        <div className="w-6 h-6 border-2 border-app-text/30 border-t-app-text rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-6 h-6 text-app-text/30" />
                      )}
                      <div className="text-[10px] font-black text-app-text/40 uppercase tracking-widest">
                        {isUploading ? 'Uploading...' : 'Upload Photo / Document'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Log */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-app-text/40 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Communication History
                  </h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-app-text/10 scrollbar-track-transparent">
                    {messages.length > 0 ? (
                      [...messages].reverse().map(msg => (
                        <div key={msg.id} className="p-4 rounded-xl bg-app-text/5 border border-app-border space-y-2 hover:bg-app-text/[0.07] transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${msg.sender === 'Manager' ? 'bg-app-accent' : 'bg-ruby-light'}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${msg.sender === 'Manager' ? 'text-app-accent' : 'text-ruby-light'}`}>
                                {msg.sender}
                              </span>
                            </div>
                            <span className="text-[10px] text-app-text/30 font-mono">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-app-text/60 leading-relaxed">{msg.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-app-border flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-app-text/5 flex items-center justify-center text-app-text/30">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <div className="text-sm text-app-text/40">No communication history recorded.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resize Handle */}
              <div 
                className="w-1 bg-app-border hover:bg-app-accent/50 cursor-col-resize transition-colors"
                onMouseDown={(e) => {
                  const startX = e.pageX;
                  const startWidth = leftPanelWidth;
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const delta = ((moveEvent.pageX - startX) / window.innerWidth) * 100;
                    setLeftPanelWidth(Math.min(Math.max(startWidth + delta, 30), 70));
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              />

              {/* Right Panel: Chat / Communication */}
              <div className="flex-1 flex flex-col bg-app-card">
                <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-text/[0.01]">
                  <h4 className="text-xs font-black text-app-text/40 uppercase tracking-[0.2em] font-mono flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Communication Hub
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-app-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Tenant Online</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'Manager' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                        msg.sender === 'Manager' 
                          ? 'bg-app-accent text-white rounded-tr-none' 
                          : 'bg-app-text/5 text-app-text/60 border border-app-border rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="text-[10px] text-app-text/30 mt-1 uppercase tracking-widest font-mono">
                        {msg.sender} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <MessageSquare className="w-12 h-12 text-app-text/30" />
                      <p className="text-sm text-app-text/40">No message history yet.<br/>Start the conversation below.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-app-border bg-app-text/[0.02]">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message to the tenant..."
                      className="flex-1 bg-app-text/5 border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/50"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-app-accent text-white font-black rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-app-accent/20"
                    >
                      SEND
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[10px] text-app-text/30 font-mono uppercase tracking-widest">
                      Press Enter to send
                    </div>
                    <button className="text-[10px] font-black text-app-text/40 uppercase tracking-widest hover:text-app-text transition-colors">
                      Email Copy to Manager
                    </button>
                  </div>
                </div>

                {/* Unit Management (GM/Owner Only) */}
                {isGMOrOwner && (
                  <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-6">
                    {/* Unit Status/Photos */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-app-text/40 uppercase tracking-widest">Unit Management</h4>
                        <button 
                          onClick={() => {
                            setIsEditingUnit(!isEditingUnit);
                            setEditUnitData({ 
                              status: selectedUnit.status, 
                              photos: selectedUnit.photos || '' 
                            });
                          }}
                          className="text-[10px] font-black text-app-accent uppercase tracking-widest hover:opacity-80 transition-colors"
                        >
                          {isEditingUnit ? 'Cancel' : 'Edit Unit'}
                        </button>
                      </div>

                      {isEditingUnit ? (
                        <div className="space-y-4 bg-app-text/5 p-4 rounded-xl border border-app-border">
                          <div>
                            <label className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Status</label>
                            <select 
                              value={editUnitData.status}
                              onChange={(e) => setEditUnitData({ ...editUnitData, status: e.target.value })}
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold focus:outline-none focus:ring-1 focus:ring-app-accent/50"
                            >
                              <option value="Occupied">Occupied</option>
                              <option value="Vacant">Vacant</option>
                              <option value="Maintenance">Maintenance</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Photo URL</label>
                            <input 
                              type="text"
                              value={editUnitData.photos}
                              onChange={(e) => setEditUnitData({ ...editUnitData, photos: e.target.value })}
                              placeholder="https://..."
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold focus:outline-none focus:ring-1 focus:ring-app-accent/50"
                            />
                          </div>
                          <button 
                            onClick={handleUpdateUnit}
                            className="w-full py-2 bg-app-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-app-text/5 border border-app-border">
                            <span className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Status</span>
                            <span className="text-xs font-bold text-app-text uppercase">{selectedUnit.status}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-app-text/5 border border-app-border">
                            <span className="block text-[8px] font-black text-app-text/40 uppercase tracking-widest mb-1">Photos</span>
                            <span className="text-xs font-bold text-app-text uppercase">{selectedUnit.photos ? 'Available' : 'None'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lease Violations */}
                    {selectedUnit.tenant_id && (
                      <div className="pt-6 border-t border-app-border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black text-app-text/40 uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-3 h-3 text-app-accent" /> Lease Violations
                          </h4>
                          <button 
                            onClick={() => setIsLoggingViolation(!isLoggingViolation)}
                            className="text-[10px] font-black text-app-accent uppercase tracking-widest hover:opacity-80 transition-colors"
                          >
                            {isLoggingViolation ? 'Cancel' : 'Log Violation'}
                          </button>
                        </div>

                        {isLoggingViolation ? (
                          <div className="space-y-4 bg-app-accent/5 p-4 rounded-xl border border-app-accent/10">
                            <input 
                              type="date"
                              value={violationData.violation_date}
                              onChange={(e) => setViolationData({ ...violationData, violation_date: e.target.value })}
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold"
                            />
                            <textarea 
                              value={violationData.description}
                              onChange={(e) => setViolationData({ ...violationData, description: e.target.value })}
                              placeholder="Describe the violation (e.g., unauthorized guest, noise)..."
                              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text font-bold min-h-[80px]"
                            />
                            <button 
                              onClick={handleLogViolation}
                              className="w-full py-2 bg-app-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                            >
                              Log Violation
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {violations.map(v => (
                              <div key={v.id} className="p-3 rounded-lg bg-app-text/5 border border-app-border flex justify-between items-start">
                                <div>
                                  <div className="text-[8px] font-black text-app-accent uppercase tracking-widest mb-1">{v.violation_date}</div>
                                  <div className="text-xs text-app-text/60 leading-relaxed">{v.description}</div>
                                </div>
                                <span className="text-[8px] font-black text-app-text/30 uppercase tracking-widest">{v.status}</span>
                              </div>
                            ))}
                            {violations.length === 0 && (
                              <div className="text-[10px] text-app-text/30 italic">No violations logged.</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Legal Notices Tracking */}
                    {selectedUnit.tenant_id && (
                      <div className="pt-6 border-t border-app-border">
                        <h4 className="text-[10px] font-black text-app-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Gavel className="w-3 h-3 text-app-accent" /> Notice Tracking
                        </h4>
                        <div className="space-y-3">
                          {notices.map(n => (
                            <div key={n.id} className="p-3 rounded-lg bg-app-text/5 border border-app-border">
                              <div className="flex justify-between items-start mb-2">
                                <div className="text-xs font-bold text-app-text">{n.title}</div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                                  n.status === 'Acknowledged' ? 'bg-ruby/20 text-ruby' : 'bg-app-accent/20 text-app-accent'
                                }`}>
                                  {n.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[8px] font-black text-app-text/30 uppercase tracking-widest">
                                <div>Sent: {new Date(n.sent_at).toLocaleDateString()}</div>
                                {n.viewed_at && <div>Viewed: {new Date(n.viewed_at).toLocaleDateString()}</div>}
                                {n.acknowledged_at && <div className="col-span-2 text-emerald-500">Ack: {new Date(n.acknowledged_at).toLocaleString()}</div>}
                                {n.acknowledged_ip && <div className="col-span-2 opacity-50">IP: {n.acknowledged_ip}</div>}
                              </div>
                            </div>
                          ))}
                          {notices.length === 0 && (
                            <div className="text-[10px] text-app-text/30 italic">No notices issued.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Report Modal */}
      {isReportOpen && reportData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-4xl bg-white text-black overflow-y-auto max-h-full p-12 shadow-2xl relative">
            <button 
              onClick={() => setIsReportOpen(false)}
              className="absolute top-8 right-8 p-2 text-zinc-400 hover:text-black print:hidden"
            >
              <Plus className="w-8 h-8 rotate-45" />
            </button>
            
            <div className="print:block">
              <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-12">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase">Unit Performance Report</h1>
                  <p className="text-zinc-500 font-mono text-sm mt-2">Generated on {new Date().toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black">UNIT #{reportData.unit.unit_number}</div>
                  <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">3875 Ruby Street</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <section className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2">Tenant Information</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Name:</span>
                      <span className="font-bold">{reportData.unit.tenant_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <span className="font-bold">{reportData.unit.tenant_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Lease Start:</span>
                      <span className="font-bold">{reportData.unit.lease_start || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Lease End:</span>
                      <span className="font-bold">{reportData.unit.lease_end || 'N/A'}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2">Financial Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Monthly Rent:</span>
                      <span className="font-bold">${formatCurrency(reportData.unit.rent_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Current Balance:</span>
                      <span className={`font-bold ${reportData.unit.balance_due > 0 ? 'text-red-600' : ''}`}>
                        ${formatCurrency(reportData.unit.balance_due)}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
              
              {/* Legal Defense Package */}
              <section className="mb-12 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-black pb-2">Legal Defense Package (Evidence Log)</h2>
                
                <div className="space-y-8">
                  {/* Notice Acknowledgments */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">1. Notice Acknowledgments</h3>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-black/10">
                          <th className="text-left py-2">Notice Title</th>
                          <th className="text-left py-2">Sent</th>
                          <th className="text-left py-2">Viewed</th>
                          <th className="text-left py-2">Acknowledged</th>
                          <th className="text-right py-2">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {reportData.notices.map((n: any) => (
                          <tr key={n.id}>
                            <td className="py-2 font-bold">{n.title}</td>
                            <td className="py-2">{new Date(n.sent_at).toLocaleDateString()}</td>
                            <td className="py-2">{n.viewed_at ? new Date(n.viewed_at).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-2 font-bold text-ruby">{n.acknowledged_at ? new Date(n.acknowledged_at).toLocaleString() : 'PENDING'}</td>
                            <td className="py-2 text-right font-mono text-[10px]">{n.acknowledged_ip || n.viewed_ip || 'N/A'}</td>
                          </tr>
                        ))}
                        {reportData.notices.length === 0 && <tr><td colSpan={5} className="py-4 text-center italic text-zinc-400">No notices issued.</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  {/* Lease Violations */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">2. Documented Lease Violations</h3>
                    <div className="space-y-3">
                      {reportData.violations.map((v: any) => (
                        <div key={v.id} className="p-4 bg-zinc-50 border border-black/5 rounded-lg">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold">{v.violation_date}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{v.status}</span>
                          </div>
                          <p className="text-sm">{v.description}</p>
                        </div>
                      ))}
                      {reportData.violations.length === 0 && <p className="text-sm italic text-zinc-400">No violations documented.</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2 mb-6">Payment History</h2>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5">
                      <th className="py-3 font-bold">Date</th>
                      <th className="py-3 font-bold">Amount</th>
                      <th className="py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {reportData.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-3">{p.payment_date}</td>
                        <td className="py-3">${formatCurrency(p.amount)}</td>
                        <td className="py-3 font-bold">{p.status}</td>
                      </tr>
                    ))}
                    {reportData.payments.length === 0 && (
                      <tr><td colSpan={3} className="py-8 text-center text-zinc-400 italic">No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className="mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2 mb-6">Maintenance Logs</h2>
                <div className="space-y-4">
                  {reportData.maintenance.map((m: any) => (
                    <div key={m.id} className="border-b border-black/5 pb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">{m.description}</span>
                        <span className="text-xs font-mono text-zinc-500">{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs uppercase font-black text-zinc-400">{m.status}</div>
                    </div>
                  ))}
                  {reportData.maintenance.length === 0 && (
                    <div className="py-8 text-center text-zinc-400 italic">No maintenance history found.</div>
                  )}
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b border-black/10 pb-2 mb-6">Communication Transcript</h2>
                <div className="space-y-4">
                  {reportData.messages.map((msg: any) => (
                    <div key={msg.id} className="text-sm">
                      <span className="font-bold uppercase text-[10px] mr-2">{msg.sender}:</span>
                      <span className="text-zinc-600">{msg.content}</span>
                      <span className="text-[10px] text-zinc-400 ml-2 font-mono">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                  {reportData.messages.length === 0 && (
                    <div className="py-8 text-center text-zinc-400 italic">No communication history found.</div>
                  )}
                </div>
              </section>

              <div className="mt-24 pt-8 border-t border-black/10 text-[10px] font-bold uppercase tracking-[0.5em] text-center text-zinc-400">
                Official Document • Silverback Intelligence System • 3875 Ruby St
              </div>
            </div>

            <div className="mt-12 flex justify-center print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-12 py-4 bg-black text-white font-black rounded-2xl hover:bg-zinc-800 transition-all flex items-center gap-3"
              >
                <CreditCard className="w-5 h-5" /> Print Official Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
