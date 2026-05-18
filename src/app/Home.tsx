import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import CustomerLoginButton from '../components/CustomerLoginButton';
import Footer from '../components/Footer';
import FlagstarLogo from '../components/FlagstarLogo';
import { 
  CreditCard, Home as HomeIcon, Landmark, PiggyBank, BarChart3, LineChart, PieChart,
  Sun, Moon, MapPin, Phone, Search, Shield, Calendar, FileText, ArrowRight
} from 'lucide-react';

export const FUNNELS = [
  { id: 'credit-cards', name: 'Credit Cards', desc: 'Premium rewards, up to 5% cash back.', img: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=800&q=80', icon: CreditCard },
  { id: 'mortgages', name: 'Mortgages', desc: 'Secure custom home loan fixed rates.', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', icon: HomeIcon },
  { id: 'loans', name: 'Loans', desc: 'Personal & Auto credit capital.', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', icon: Landmark },
  { id: 'savings', name: 'Savings Vault', desc: 'Maximize yields at 4.50% APY.', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80', icon: PiggyBank },
  { id: 'interest', name: 'Interest Rates', desc: 'Fixed vs Variable index calculations.', img: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80', icon: BarChart3 },
  { id: 'growth-bonds', name: 'Growth Bonds', desc: 'AA-rated government coupon assets.', img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', icon: LineChart },
  { id: 'investments', name: 'Capital Wealth', desc: 'Diversify dynamic risk-managed portfolios.', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', icon: PieChart }
];

const Home: React.FC = () => {
  const { isAdmin, isCustomer } = useAppStore();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleRegisterAlert = () => {
    alert("Mortgage enrollment is automated! Please use your account number FL-100200 and access PIN 1234 to authenticate your institutional profile.");
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#001D38] text-white' : 'bg-[#F9FBFC] text-[#334155]'}`}>
      
      {/* Top Utility Bar */}
      <div className={`py-2 px-6 md:px-12 flex justify-between items-center text-xs font-semibold ${
        isDarkMode ? 'bg-[#002D38] text-gray-300 border-b border-[#003B49]' : 'bg-[#002D38] text-white'
      }`}>
        <div className="flex items-center gap-6">
          <span className="hover:text-[#F15A24] cursor-pointer transition-colors">Personal Banking</span>
          <span className="hover:text-[#F15A24] cursor-pointer transition-colors">Business Banking</span>
          <span className="hover:text-[#F15A24] cursor-pointer font-black text-[#F15A24] border-b-2 border-[#F15A24] pb-0.5">Mortgage Servicing</span>
          <span className="hover:text-[#F15A24] cursor-pointer transition-colors">Wealth Management</span>
        </div>
        
        <div className="hidden md:flex items-center gap-5">
          <span className="flex items-center gap-1.5 hover:text-[#F15A24] cursor-pointer transition-colors">
            <MapPin size={12} className="text-[#FFB81C]" />
            Locations
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#F15A24] cursor-pointer transition-colors">
            <Phone size={12} className="text-[#FFB81C]" />
            MyLoans Support: 800-968-7700
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#F15A24] cursor-pointer transition-colors">
            <Search size={12} />
            Search
          </span>
        </div>
      </div>
      
      {/* Main Navigation Bar */}
      <header className={`py-4 px-6 md:px-12 flex justify-between items-center border-b sticky top-0 z-30 shadow-sm ${
        isDarkMode ? 'bg-[#001D38]/95 border-[#003B49] backdrop-blur-md' : 'bg-white border-gray-100 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-12">
          {/* Logo top-left */}
          <FlagstarLogo className="h-9 w-9" textSize="text-2xl" light={isDarkMode} />
          
          <nav className="hidden lg:flex items-center gap-8 font-bold text-sm">
            <span className={`hover:text-[#F15A24] cursor-pointer transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Banking</span>
            <span className="text-[#F15A24] border-b-2 border-[#F15A24] pb-1 cursor-pointer">Borrow</span>
            <span className={`hover:text-[#F15A24] cursor-pointer transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Invest</span>
            <span className={`hover:text-[#F15A24] cursor-pointer transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Resources</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-full border transition min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isDarkMode ? 'border-[#004B5C] hover:bg-[#002D38] text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
            title="Toggle theme mode"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          {(isAdmin || isCustomer) ? (
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-5 py-2.5 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 active:ring-2 active:ring-[#FFB81C] text-white rounded-full font-bold text-sm shadow transition min-h-[44px]"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRegisterAlert}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition min-h-[44px] ${
                  isDarkMode ? 'border-gray-600 text-white hover:bg-white/5' : 'border-gray-300 text-[#004B5C] hover:bg-gray-50'
                }`}
              >
                Register
              </button>
              <CustomerLoginButton 
                buttonText="Sign In" 
                buttonClassName="px-5 py-2 bg-[#F15A24] hover:bg-[#D9431E] active:scale-95 active:ring-2 active:ring-[#FFB81C] text-white rounded-full font-bold text-sm shadow transition min-h-[44px]" 
              />
            </div>
          )}
        </div>
      </header>
      
      {/* Hero Section: Orange-to-Yellow Gradient Background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#F15A24] via-[#F26E3B] to-[#FFB81C] text-white border-b border-orange-500/20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 text-[#FFF] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/30 backdrop-blur-sm">
              <Shield size={12} className="text-[#FFB81C]" />
              Verified Institutional Servicing Portal
            </div>
            
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
              Welcome to Flagstar Institutional Banking
            </h1>
            
            <p className="text-sm md:text-base leading-relaxed text-gray-800 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/25 shadow-lg max-w-xl font-medium">
              Enjoy 24/7 direct access to manage your home financing and portfolio balances. Configure secure transactions, perform staged clearance compliance validation, and analyze ledger balance audits seamlessly in the MyLoans simulation vault.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              {(isAdmin || isCustomer) ? (
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="px-8 py-4 bg-[#002D38] hover:bg-[#003B49] text-white rounded-full font-black text-base shadow-lg hover:shadow-xl transition-all duration-300 text-center uppercase tracking-wider active:scale-95 active:ring-2 active:ring-[#FFB81C] min-h-[44px]"
                >
                  Enter Wealth Dashboard
                </button>
              ) : (
                <>
                  <CustomerLoginButton 
                    buttonText="Access MyLoans" 
                    buttonClassName="px-8 py-4 bg-[#002D38] hover:bg-[#003B49] text-white rounded-full font-black text-base shadow-lg hover:shadow-xl transition-all duration-300 text-center uppercase tracking-wider active:scale-95 active:ring-2 active:ring-[#FFB81C] min-h-[44px]" 
                  />
                  <button 
                    onClick={handleRegisterAlert}
                    className="px-8 py-4 bg-transparent hover:bg-white/10 text-white rounded-full font-bold text-base border border-white/40 transition text-center active:scale-95 min-h-[44px]"
                  >
                    Register Account
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Right Showcase Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative border border-white/20 rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur p-2.5">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" 
                alt="Flagstar Premium Finance" 
                className="w-full h-auto object-cover rounded-2xl aspect-[4/3] brightness-95"
              />
              
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl text-gray-800 flex justify-between items-center border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Staged Vault Routing</p>
                  <p className="text-lg font-black text-[#F15A24]">100% Secure <span className="text-xs text-gray-500 font-semibold">MFA Enabled</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Compliance Status</p>
                  <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1 font-mono">
                    COT • TAX • IRS Passed
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Cards/Product Highlights Section with White BG, Thin Orange Top Border, and Yellow Shadow on Hover */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#002D38]'}`}>
            Online Mortgage Services Made Simple
          </h2>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Replicate premium mortgage account control using the MyLoans compliance tools and audit log integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Mortgage Loans */}
          <div className="p-8 rounded-3xl bg-white border-t-4 border-t-[#F15A24] border border-gray-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#FFB81C]/20 hover:-translate-y-1 group">
            <div className="space-y-5">
              <div className="p-4 bg-[#F15A24]/10 text-[#F15A24] rounded-2xl w-fit">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#002D38]">
                Mortgage Loans
              </h3>
              <p className="text-xs leading-relaxed text-gray-500 font-medium">
                Set up automated monthly drafts (AutoPay) or schedule secure, direct one-time electronic payments. Review statements, download critical Form 1098 documents, and keep accounts active under fully compliant audits.
              </p>
            </div>
            <div className="pt-6">
              <CustomerLoginButton 
                buttonText="Access Mortgage Portal" 
                buttonClassName="w-full py-3.5 border-2 border-[#F15A24] text-[#F15A24] hover:bg-[#FFB81C] hover:text-black hover:border-[#FFB81C] transition active:scale-95 active:ring-2 active:ring-[#FFB81C] font-black uppercase tracking-widest rounded-full text-center text-xs min-h-[44px] flex items-center justify-center"
              />
            </div>
          </div>

          {/* Card 2: Personal Borrowing */}
          <div className="p-8 rounded-3xl bg-white border-t-4 border-t-[#F15A24] border border-gray-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#FFB81C]/20 hover:-translate-y-1 group">
            <div className="space-y-5">
              <div className="p-4 bg-[#F15A24]/10 text-[#F15A24] rounded-2xl w-fit">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#002D38]">
                Personal Borrowing
              </h3>
              <p className="text-xs leading-relaxed text-gray-500 font-medium">
                Access secure fixed-rate personal loans and revolving lines of credit. Model borrowing parameters using custom wealth calculative tools and dynamic ledger simulation dashboards.
              </p>
            </div>
            <div className="pt-6">
              <CustomerLoginButton 
                buttonText="View Rates Options" 
                buttonClassName="w-full py-3.5 border-2 border-[#F15A24] text-[#F15A24] hover:bg-[#FFB81C] hover:text-black hover:border-[#FFB81C] transition active:scale-95 active:ring-2 active:ring-[#FFB81C] font-black uppercase tracking-widest rounded-full text-center text-xs min-h-[44px] flex items-center justify-center"
              />
            </div>
          </div>

          {/* Card 3: Secure Portal */}
          <div className="p-8 rounded-3xl bg-white border-t-4 border-t-[#F15A24] border border-gray-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#FFB81C]/20 hover:-translate-y-1 group">
            <div className="space-y-5">
              <div className="p-4 bg-[#F15A24]/10 text-[#F15A24] rounded-2xl w-fit">
                <Landmark size={24} />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#002D38]">
                Secure Portal
              </h3>
              <p className="text-xs leading-relaxed text-gray-500 font-medium">
                Utilize our staged clearance compliance engine for transaction authorization. Provide your COT, TAX, and IRS codes sequentially to clear amortization drafts and secure transfers.
              </p>
            </div>
            <div className="pt-6">
              <CustomerLoginButton 
                buttonText="Enter Secure Portal" 
                buttonClassName="w-full py-3.5 border-2 border-[#F15A24] text-[#F15A24] hover:bg-[#FFB81C] hover:text-black hover:border-[#FFB81C] transition active:scale-95 active:ring-2 active:ring-[#FFB81C] font-black uppercase tracking-widest rounded-full text-center text-xs min-h-[44px] flex items-center justify-center"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Calculators Slider */}
      <section className={`py-20 px-6 md:px-12 border-t ${
        isDarkMode ? 'bg-[#002D38] border-[#003B49]' : 'bg-[#F4F7F9] border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto w-full space-y-12">
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-[#F15A24] tracking-widest">Flagstar Core</span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#002D38]'}`}>
                Interactive Wealth & Credit Simulators
              </h2>
              <p className="text-xs mt-1 max-w-xl leading-relaxed text-gray-500">
                Explore and model your financial plans using our custom pre-built compound calculators, Government Growth bond yield graphs, and loan amortization tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FUNNELS.map((f) => {
              const Icon = f.icon;
              return (
                <div 
                  key={f.id}
                  onClick={() => navigate(`/funnel/${f.id}`)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex flex-col h-full ${
                    isDarkMode ? 'bg-[#001D38] border-[#003B49] hover:border-[#F15A24]/50' : 'bg-white border-gray-200/60 hover:border-[#F15A24]/30 shadow-sm'
                  }`}
                >
                  <div className="h-40 relative overflow-hidden">
                    <img 
                      src={f.img} 
                      alt={f.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                      <div className="p-1.5 bg-[#F15A24] rounded-lg">
                        <Icon size={14} />
                      </div>
                      <span className="font-extrabold text-xs tracking-wide">{f.name}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs leading-relaxed mb-4 text-gray-500 font-medium">
                      {f.desc}
                    </p>
                    <span className="text-[9px] font-black uppercase text-[#F15A24] tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Launch Calculator <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
