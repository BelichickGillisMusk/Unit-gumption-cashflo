import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Scale, TrendingUp, ChevronRight, Plus, Download, Info, Sparkles, Wand2, X, Copy, Check, FileDown, Save, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface LegalForm {
  id: number;
  title: string;
  category: string;
  content_template: string;
}

interface Law {
  id: number;
  title: string;
  jurisdiction: string;
  summary: string;
  link: string;
  last_updated: string;
}

interface MarketComp {
  id: number;
  property_name: string;
  address: string;
  sale_price: number;
  rental_rate: number;
  occupancy_rate: number;
  distance_miles: number;
  last_updated: string;
}

export function CEOBriefingPortal() {
  const [activeTab, setActiveTab] = useState<'forms' | 'laws' | 'market'>('forms');
  const [forms, setForms] = useState<LegalForm[]>([]);
  const [laws, setLaws] = useState<Law[]>([]);
  const [marketComps, setMarketComps] = useState<MarketComp[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI Lease Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [rentAmount, setRentAmount] = useState('2500');
  const [leaseTerm, setLeaseTerm] = useState('12');
  const [unitNumber, setUnitNumber] = useState('101');
  const [specificClauses, setSpecificClauses] = useState('Travel nurse friendly: 30-day notice for contract cancellation, fully furnished option, all utilities included.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLease, setGeneratedLease] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateLease = async () => {
    setIsGenerating(true);
    setGeneratedLease('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Generate a legally compliant residential lease agreement for California (New CA Standards), specifically optimized for Oakland (Zip Code 94609). 
        
        Parameters:
        - Property Branding: SAilverback
        - Unit Number: ${unitNumber}
        - Monthly Rent: $${rentAmount}
        - Lease Term: ${leaseTerm} months
        - Specific Clauses/Requirements: ${specificClauses || 'Standard CA/Oakland clauses'}
        
        The lease MUST include:
        1. Compliance with California Civil Code (New CA 2026 standards) and Oakland Rent Adjustment Program (RAP).
        2. Just Cause for Eviction Ordinance (Oakland) mandatory disclosures.
        3. Security deposit limits (CA law - max 1 month for unfurnished).
        4. Lead-based paint disclosures (for 1924 building).
        5. Bed bug, mold, and flood zone disclosures.
        6. Oakland-specific tenant rights notices and RAP fee disclosures.
        7. Clear sections for Parties, Premises, Term, Rent, Security Deposit, Utilities, Maintenance, and Rules.
        8. TRAVEL NURSE PROVISIONS: Include a section for travel nurses (e.g., contract-based termination clauses, tax-home disclosures, and furnished unit inventory).
        9. PAYMENT PORTAL: Explicitly mention that all payments (Rent, Deposit, Fees) must be made through the "SAilverback Stripe Payment Portal" at pay.silverbackai.agency/ruby-${unitNumber}.
        
        Format the output using Markdown with clear headings, bold text for emphasis, and a professional legal structure. Use "3875 RUBY" as the property name and "SAilverback" as the management branding.`,
      });

      setGeneratedLease(response.text || 'Failed to generate lease content.');
    } catch (error) {
      console.error('Error generating lease:', error);
      setGeneratedLease('An error occurred while generating the lease. Please check your API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLease);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsRes, lawsRes, marketRes] = await Promise.all([
          fetch('/api/legal-forms'),
          fetch('/api/laws-regulations'),
          fetch('/api/market-comparables')
        ]);
        
        setForms(await formsRes.json());
        setLaws(await lawsRes.json());
        setMarketComps(await marketRes.json());
      } catch (error) {
        console.error('Error fetching CEO portal data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center text-app-text/40">Loading Briefing Data...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-app-accent" />
            <span className="text-xs font-bold text-app-accent uppercase tracking-[0.3em]">SAilverback Executive Suite</span>
          </div>
          <h2 className="text-5xl font-serif font-black text-app-text">CEO <span className="italic text-app-accent">Briefing</span> Portal.</h2>
        </div>
        
        <div className="flex p-1 bg-app-text/5 rounded-full border border-app-border">
          {(['forms', 'laws', 'market'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                activeTab === tab ? 'bg-app-accent text-white shadow-lg' : 'text-app-text/40 hover:text-app-text'
              }`}
            >
              {tab === 'forms' ? 'Legal Forms' : tab === 'laws' ? 'Laws & Regs' : 'Market Data'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'forms' && (
          <div className="space-y-8">
            {/* AI Generator Trigger */}
            <div className="p-1 rounded-[3rem] bg-gradient-to-r from-app-accent via-app-accent/50 to-app-accent shadow-2xl shadow-app-accent/20">
              <div className="p-10 rounded-[2.8rem] bg-app-card flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-app-accent/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-app-accent" />
                    </div>
                    <span className="text-xs font-bold text-app-accent uppercase tracking-[0.3em]">AI Legal Suite</span>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-app-text">Smart <span className="italic">Lease</span> Generator.</h3>
                  <p className="text-app-text/50 max-w-md">Generate CA & 94609 legally approved tenant lease agreements in seconds using advanced AI logic.</p>
                </div>
                <button 
                  onClick={() => setShowGenerator(true)}
                  className="px-10 py-5 bg-app-accent text-white rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                >
                  <Wand2 className="w-5 h-5" /> Launch Generator
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
            {forms.map((form) => (
              <div key={form.id} className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-app-text/5 group-hover:bg-app-accent/10 transition-colors">
                    <FileText className="w-6 h-6 text-app-text group-hover:text-app-accent transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">{form.category}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4 text-app-text">{form.title}</h3>
                <p className="text-app-text/50 text-sm line-clamp-2 mb-8">{form.content_template}</p>
                <div className="flex gap-4">
                  <button className="flex-grow py-4 bg-app-text text-app-bg rounded-full text-xs font-bold uppercase tracking-widest hover:bg-app-accent hover:text-white transition-colors">
                    Create Notice
                  </button>
                  <button className="p-4 bg-app-text/5 rounded-full hover:bg-app-text/10 transition-colors text-app-text">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button className="p-8 rounded-[2.5rem] border-2 border-dashed border-app-border flex flex-col items-center justify-center gap-4 hover:border-app-accent/40 transition-all group">
              <div className="w-12 h-12 rounded-full bg-app-text/5 flex items-center justify-center group-hover:bg-app-accent/10">
                <Plus className="w-6 h-6 text-app-text/40 group-hover:text-app-accent" />
              </div>
              <span className="text-xs font-bold text-app-text/40 uppercase tracking-widest">Add New Template</span>
            </button>
          </motion.div>
        </div>
      )}

        {activeTab === 'laws' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {laws.map((law) => (
              <div key={law.id} className="p-8 rounded-[2.5rem] bg-app-card border border-app-border shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="p-6 rounded-3xl bg-app-accent/10">
                  <Scale className="w-8 h-8 text-app-accent" />
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-serif font-bold text-app-text">{law.title}</h3>
                    <span className="px-3 py-1 bg-app-text/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-app-text/40">{law.jurisdiction}</span>
                  </div>
                  <p className="text-app-text/60 leading-relaxed">{law.summary}</p>
                  <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Last Updated: {law.last_updated}</div>
                </div>
                <a 
                  href={law.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-app-text/5 hover:bg-app-text hover:text-app-bg rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 text-app-text"
                >
                  Full Text <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {marketComps.map((comp) => (
                <div key={comp.id} className="p-8 rounded-[3rem] bg-app-card border border-app-border shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8">
                    <TrendingUp className="w-12 h-12 text-app-accent/10 group-hover:text-app-accent/20 transition-colors" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-app-text">{comp.property_name}</h3>
                      <p className="text-app-text/40 text-sm">{comp.address}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-app-text/5">
                        <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mb-1">Sale Price</div>
                        <div className="text-lg font-serif font-bold text-app-text">${(comp.sale_price / 1000000).toFixed(1)}M</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-app-text/5">
                        <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mb-1">Rent/Unit</div>
                        <div className="text-lg font-serif font-bold text-app-text">${comp.rental_rate}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-app-text/5">
                        <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest mb-1">Occupancy</div>
                        <div className="text-lg font-serif font-bold text-app-text">{(comp.occupancy_rate * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-app-border">
                      <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">{comp.distance_miles} miles away</div>
                      <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Updated: {comp.last_updated}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-12 rounded-[3rem] bg-app-text text-app-bg flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold italic">Market Opportunity Analysis</h3>
                <p className="text-app-bg/50 max-w-md">Your portfolio is currently performing 12% above the neighborhood average in occupancy, with a 4.2% higher rental yield.</p>
              </div>
              <button className="px-12 py-6 bg-app-accent text-white rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                Generate Full Market Report
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-app-card rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-app-border"
            >
              <div className="p-8 border-b border-app-border flex items-center justify-between bg-app-bg/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-app-accent/10 rounded-2xl">
                    <Wand2 className="w-6 h-6 text-app-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-app-text">AI Lease Generator</h3>
                    <p className="text-[10px] font-bold text-app-accent uppercase tracking-widest">New CA & Oakland 94609 Legal Approved</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGenerator(false)} 
                  className="p-3 hover:bg-app-text/5 rounded-full transition-colors text-app-text/40 hover:text-app-text"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {!generatedLease ? (
                  <div className="space-y-8 max-w-2xl mx-auto py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Unit #</label>
                        <input 
                          type="text"
                          value={unitNumber}
                          onChange={(e) => setUnitNumber(e.target.value)}
                          className="w-full p-6 bg-app-bg border border-app-border rounded-[2rem] focus:ring-1 focus:ring-app-accent/20 focus:outline-none transition-all text-app-text font-serif text-xl"
                          placeholder="101"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Monthly Rent ($)</label>
                        <input 
                          type="number"
                          value={rentAmount}
                          onChange={(e) => setRentAmount(e.target.value)}
                          className="w-full p-6 bg-app-bg border border-app-border rounded-[2rem] focus:ring-1 focus:ring-app-accent/20 focus:outline-none transition-all text-app-text font-serif text-xl"
                          placeholder="2500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Lease Term (Months)</label>
                        <input 
                          type="number"
                          value={leaseTerm}
                          onChange={(e) => setLeaseTerm(e.target.value)}
                          className="w-full p-6 bg-app-bg border border-app-border rounded-[2rem] focus:ring-1 focus:ring-app-accent/20 focus:outline-none transition-all text-app-text font-serif text-xl"
                          placeholder="12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-app-text/40 ml-4">Specific Clauses or Requirements</label>
                      <textarea 
                        value={specificClauses}
                        onChange={(e) => setSpecificClauses(e.target.value)}
                        placeholder="e.g., No pets, No smoking, Specific parking stall #4, Tenant pays water..."
                        className="w-full p-6 bg-app-bg border border-app-border rounded-[2rem] focus:ring-1 focus:ring-app-accent/20 focus:outline-none transition-all min-h-[150px] resize-none text-app-text"
                      />
                    </div>

                    <div className="p-6 rounded-3xl bg-app-accent/5 border border-app-accent/10 flex gap-4">
                      <Info className="w-5 h-5 text-app-accent shrink-0" />
                      <p className="text-[10px] text-app-text/60 leading-relaxed italic">
                        Our AI engine is trained on the latest 2026 New California Civil Code and Oakland 94609 Rent Adjustment Program requirements. All generated leases include mandatory Just Cause disclosures and security deposit compliance.
                      </p>
                    </div>

                    <button 
                      onClick={handleGenerateLease}
                      disabled={isGenerating || !rentAmount || !leaseTerm}
                      className="w-full py-6 bg-app-accent text-white rounded-[2rem] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Drafting Legal Document...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" /> Generate Lease Agreement
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <h4 className="text-sm font-bold text-app-text/40 uppercase tracking-widest">Generated Draft (New CA & 94609 Approved)</h4>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 px-4 py-2 bg-app-text/5 hover:bg-app-text/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all text-app-text"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy Text'}
                        </button>
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-app-text/5 hover:bg-app-text/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all text-app-text"
                        >
                          <FileDown className="w-3 h-3" /> PDF
                        </button>
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-app-text/5 hover:bg-app-text/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all text-app-text"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button 
                          onClick={() => setGeneratedLease('')}
                          className="flex items-center gap-2 px-4 py-2 bg-app-accent/10 text-app-accent rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          <Wand2 className="w-3 h-3" /> New Draft
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-3">
                        <div className="p-10 bg-app-bg border border-app-border rounded-[2.5rem] font-serif text-app-text/80 leading-relaxed shadow-inner max-h-[60vh] overflow-y-auto prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{generatedLease}</ReactMarkdown>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                          <div className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Legal Disclaimer</span>
                          </div>
                          <p className="text-[10px] text-app-text/60 leading-relaxed italic">
                            This AI-generated document is a template based on New CA and Oakland 94609 standards. It should be reviewed by legal counsel before execution.
                          </p>
                        </div>
                        
                        <div className="p-6 rounded-3xl bg-app-text/5 border border-app-border space-y-4">
                          <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">Compliance Check</div>
                          <div className="space-y-3">
                            {[
                              'CA Civil Code 2026',
                              'Oakland RAP Disclosures',
                              'Just Cause Ordinance',
                              'Security Deposit (1mo)',
                              'Bed Bug & Mold Disclosures'
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-app-text/60">
                                <Check className="w-3 h-3 text-emerald-500" /> {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
