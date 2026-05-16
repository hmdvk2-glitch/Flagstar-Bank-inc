import React, { useState } from 'react';
import { 
  Shield, 
  ArrowRight, 
  CreditCard, 
  Home as HomeIcon, 
  Briefcase, 
  TrendingUp, 
  Car, 
  Wallet, 
  Coins,
  CheckCircle2,
  Lock,
  Globe,
  Zap,
  X,
  ChevronRight
} from 'lucide-react';
import Login from '../customer/Login';

const Home: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<any>(null);

  const funnels = [
    {
      id: 'cc',
      title: "Credit Cards",
      desc: "Premium credit access with flexible limits and elite rewards.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974&auto=format&fit=crop",
      icon: <CreditCard className="text-[#C00000]" size={24} />,
      benefits: ["Unlimited Cashback", "Airport Lounge Access", "Fraud Protection"],
      details: "Experience the pinnacle of purchasing power. Flagstar Infinite provides seamless global liquidity with an emphasis on security and premium lifestyle perks."
    },
    {
      id: 'mortgage',
      title: "Home Mortgage Loans",
      desc: "Low-rate financing solutions for your next real estate acquisition.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop",
      icon: <HomeIcon className="text-[#C00000]" size={24} />,
      benefits: ["Fixed Rates", "Zero Closing Costs", "Fast Approvals"],
      details: "Your dream home is within reach. Our digital mortgage portal offers transparent terms and lightning-fast closing sequences."
    },
    {
      id: 'personal',
      title: "Personal Loans",
      desc: "Unlock immediate liquidity for life's significant moments.",
      image: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2022&auto=format&fit=crop",
      icon: <Coins className="text-[#C00000]" size={24} />,
      benefits: ["Next-day Funding", "No Collateral", "Fixed Payments"],
      details: "From debt consolidation to home renovation, our personal liquidity terminal provides the capital you need with predictable repayment structures."
    },
    {
      id: 'savings',
      title: "Savings Programs",
      desc: "High-yield wealth preservation with daily interest accrual.",
      image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=2070&auto=format&fit=crop",
      icon: <Wallet className="text-[#C00000]" size={24} />,
      benefits: ["4.50% APY", "Zero Monthly Fees", "Instant Transfers"],
      details: "Make your money work harder. Our high-yield savings infrastructure utilizes institutional-grade liquidity pools to maximize your returns."
    },
    {
      id: '401k',
      title: "401K Investment Plan",
      desc: "Algorithmic retirement growth for long-term financial security.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
      icon: <TrendingUp className="text-[#C00000]" size={24} />,
      benefits: ["Tax Advantages", "Employer Match", "Auto-Rebalancing"],
      details: "Secure your legacy. Our investment platform combines AI-driven portfolio management with traditional financial wisdom for consistent retirement growth."
    },
    {
      id: 'auto',
      title: "Auto Loans",
      desc: "Seamless vehicle financing for the road ahead.",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
      icon: <Car className="text-[#C00000]" size={24} />,
      benefits: ["Low APR", "Flexible Terms", "Apply in Minutes"],
      details: "Acquire your next vehicle with confidence. Our rapid decision engine provides instant quotes and competitive rates tailored to your financial profile."
    },
    {
      id: 'business',
      title: "Business Banking",
      desc: "Enterprise-grade liquidity management for commercial growth.",
      image: "https://images.unsplash.com/photo-1454165833767-02a6e4d2716a?q=80&w=2070&auto=format&fit=crop",
      icon: <Briefcase className="text-[#C00000]" size={24} />,
      benefits: ["Merchant Services", "Lines of Credit", "Payroll Tools"],
      details: "Power your enterprise. We provide the robust financial infrastructure necessary for modern businesses to scale effectively in a global market."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      {/* Hero Header */}
      <header className="relative pt-32 pb-24 px-6 overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-40">
           <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-[#C00000]/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-[#C00000]/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C00000]/5 border border-[#C00000]/10 mb-8 animate-slide-up">
            <Shield size={14} className="text-[#C00000]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C00000]">Secure Banking Simulation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Flagstar <span className="text-[#C00000]">Digital</span><br />
            Banking Platform
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl font-medium mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Experience the future of financial management. Secure, deterministic, and built for the modern digital era.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => setShowLogin(true)}
              className="px-12 py-5 bg-[#C00000] hover:bg-[#A00000] text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-[#C00000]/20 flex items-center gap-3 group"
            >
              Secure Login
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-12 py-5 bg-white hover:bg-gray-50 text-[#111827] rounded-2xl font-black uppercase tracking-widest border border-gray-200 transition-all">
              Discover Offers
            </button>
          </div>
        </div>
      </header>

      {/* 7 Funnel Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4 uppercase">Premier Banking Services</h2>
          <div className="h-1 w-20 bg-[#C00000]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {funnels.map((funnel, i) => (
            <div 
              key={i}
              onClick={() => setSelectedFunnel(funnel)}
              className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#C00000]/5 transition-all duration-500 cursor-pointer flex flex-col h-full animate-slide-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                 <img src={funnel.image} alt={funnel.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      Learn More <ChevronRight size={14} />
                    </span>
                 </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#C00000]/5 rounded-lg">
                      {funnel.icon}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">{funnel.title}</h3>
                 </div>
                 <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                   {funnel.desc}
                 </p>
                 <div className="space-y-2 mb-8">
                    {funnel.benefits.map((b, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#C00000]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{b}</span>
                      </div>
                    ))}
                 </div>
                 <button className="w-full py-4 bg-gray-50 group-hover:bg-[#C00000] text-gray-400 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Explore Offer
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
           <div className="space-y-4">
              <Zap size={32} className="text-[#C00000] mx-auto" />
              <h4 className="text-4xl font-bold tracking-tighter">99.9%</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">System Uptime</p>
           </div>
           <div className="space-y-4">
              <Lock size={32} className="text-[#C00000] mx-auto" />
              <h4 className="text-4xl font-bold tracking-tighter">AES-256</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Data Encryption</p>
           </div>
           <div className="space-y-4">
              <Globe size={32} className="text-[#C00000] mx-auto" />
              <h4 className="text-4xl font-bold tracking-tighter">Global</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Liquidity Access</p>
           </div>
        </div>
      </section>

      {/* Experiential Modal */}
      {selectedFunnel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-slide-up">
              <button 
                onClick={() => setSelectedFunnel(null)}
                className="absolute top-8 right-8 z-20 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="w-full md:w-1/2 relative h-64 md:h-auto">
                 <img src={selectedFunnel.image} alt={selectedFunnel.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#C00000]/80 to-transparent flex flex-col justify-end p-12">
                    <h2 className="text-4xl font-bold text-white tracking-tight uppercase mb-2">{selectedFunnel.title}</h2>
                    <p className="text-white/70 font-black uppercase tracking-widest text-[10px]">Flagstar Premium Experience</p>
                 </div>
              </div>

              <div className="w-full md:w-1/2 p-12 space-y-8 flex flex-col">
                 <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#C00000]">Product Overview</h3>
                    <p className="text-gray-500 leading-relaxed">
                      {selectedFunnel.details}
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#C00000]">Key Privileges</h3>
                    <div className="grid grid-cols-1 gap-3">
                       {selectedFunnel.benefits.map((b: any, j: any) => (
                         <div key={j} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <CheckCircle2 size={16} className="text-[#C00000]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{b}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4 mt-auto">
                    <button 
                      onClick={() => { setSelectedFunnel(null); setShowLogin(true); }}
                      className="w-full bg-[#C00000] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#C00000]/20 flex items-center justify-center gap-3 group transition-all"
                    >
                      Continue to Secure Access
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Login Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowLogin(false)}
                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                Back to Home <X size={16} />
              </button>
              <div className="bg-white rounded-[3rem] p-4 shadow-2xl">
                <Login hideBackground={true} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
