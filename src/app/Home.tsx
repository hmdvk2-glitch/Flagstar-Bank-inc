import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import CustomerLoginButton from '../components/CustomerLoginButton';
import Footer from '../components/Footer';
import { 
  Building, CreditCard, Home as HomeIcon, Landmark, PiggyBank, BarChart3, LineChart, PieChart,
  Sun, Moon
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
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`py-4 px-6 md:px-12 flex justify-between items-center border-b ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Building className="h-8 w-8 text-red-600 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">Flagstar <span className="text-red-600">Bank</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-full border transition ${isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'}`}
            title="Toggle appearance"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {(isAdmin || isCustomer) ? (
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-sm transition"
            >
              Go to Dashboard
            </button>
          ) : (
            <CustomerLoginButton />
          )}
        </div>
      </header>
      
      {/* Hero section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-16 w-full space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Secure, Global, <span className="text-red-600">Reliable Banking.</span>
          </h2>
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Experience institutional grade wealth creation and credit management. Model real-time loan configurations or deploy high APY deposits below.
          </p>
        </div>

        {/* 7 Funnels Grid */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Select a Financial Service</h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Explore and interact directly with our custom banking product simulators.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FUNNELS.map((f) => {
              const Icon = f.icon;
              return (
                <div 
                  key={f.id}
                  onClick={() => navigate(`/funnel/${f.id}`)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full ${isDarkMode ? 'bg-gray-900/60 border-gray-800 hover:border-red-600/50' : 'bg-white border-gray-100 hover:border-red-600/20 shadow-sm'}`}
                >
                  <div className="h-44 relative overflow-hidden">
                    <img 
                      src={f.img} 
                      alt={f.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                      <div className="p-2 bg-red-600 rounded-lg">
                        <Icon size={16} />
                      </div>
                      <span className="font-extrabold text-sm tracking-wide">{f.name}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{f.desc}</p>
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Learn & Apply &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer containing Admin Shield */}
      <Footer />
    </div>
  );
};

export default Home;
