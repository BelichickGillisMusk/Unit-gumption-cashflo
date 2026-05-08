import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Search, FileSpreadsheet, ArrowRight, ShieldCheck } from 'lucide-react';

interface Transaction {
  id: number;
  transaction_date: string;
  description: string;
  amount: number;
  matched_unit_id: number | null;
  status: 'Matched' | 'Unmatched' | 'Ignored';
}

export function SFPlusModule() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState<number | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/bank-transactions');
      setTransactions(await res.json());
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (transactionId: number, unitId: number) => {
    setMatching(transactionId);
    try {
      await fetch('/api/bank-transactions/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, unitId })
      });
      await fetchTransactions();
    } catch (error) {
      console.error('Error matching transaction:', error);
    } finally {
      setMatching(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-app-text/40">Connecting to Chase Bank...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="text-xs font-bold text-app-accent uppercase tracking-[0.3em]">SF Plus Integration</div>
          <h2 className="text-5xl font-serif font-black text-app-text">Chase <span className="italic text-app-accent">Direct</span> Deposit.</h2>
        </div>
        
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-app-card border border-app-border rounded-full font-bold text-xs uppercase tracking-widest text-app-text hover:bg-app-text hover:text-app-bg transition-all shadow-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Import CSV
          </button>
          <button className="px-8 py-4 bg-app-accent text-white rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-md flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Sync Chase Bank
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-bold italic text-app-text">Transaction Feed</h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text/30" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="pl-12 pr-6 py-3 bg-app-text/5 rounded-full text-xs font-bold uppercase tracking-widest text-app-text focus:outline-none focus:ring-2 focus:ring-app-accent/20 w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-6 rounded-3xl bg-app-text/5 flex items-center justify-between group hover:bg-app-card hover:shadow-xl transition-all border border-transparent hover:border-app-border">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.status === 'Matched' ? 'bg-ruby/10 text-ruby' : 'bg-app-accent/10 text-app-accent'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-app-text">{tx.description}</div>
                      <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">{tx.transaction_date}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                    <div className="text-xl font-serif font-bold text-app-text">${tx.amount.toFixed(2)}</div>
                    
                    {tx.status === 'Matched' ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-ruby/10 text-ruby rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle className="w-3 h-3" /> Matched Unit {tx.matched_unit_id}
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleMatch(tx.id, 101)} // Simulation: Match to Unit 101
                        disabled={matching === tx.id}
                        className="px-6 py-3 bg-app-text text-app-bg rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-app-accent hover:text-white transition-colors flex items-center gap-2"
                      >
                        {matching === tx.id ? 'Matching...' : 'Auto-Match'} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-10 rounded-[2.5rem] bg-app-text text-app-bg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-app-accent uppercase tracking-[0.3em]">Bank Status</div>
                <h3 className="text-3xl font-serif font-bold italic">Chase Business</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-app-bg/5 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-app-bg/40">Connection</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-ruby">Active</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-app-bg/5 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-app-bg/40">Last Sync</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-app-bg/60">12 mins ago</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-app-bg/5 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-app-bg/40">Unmatched</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-app-accent">3 Items</span>
                </div>
              </div>

              <button className="w-full py-5 bg-app-bg text-app-text rounded-full text-xs font-bold uppercase tracking-widest hover:bg-app-accent hover:text-white transition-all">
                Re-Authenticate Bank
              </button>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm space-y-6">
            <h3 className="text-xl font-serif font-bold italic text-app-text">CSV Auto-Matching</h3>
            <p className="text-sm text-app-text/50 leading-relaxed">Our AI matches bank descriptions to tenant names and unit numbers with 98.4% accuracy.</p>
            <div className="flex items-center gap-4 p-4 bg-app-text/5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-app-accent/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-app-accent" />
              </div>
              <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">324 Matches this month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
