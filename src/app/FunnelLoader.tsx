import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Building } from 'lucide-react';

import CreditCards from '../funnels/CreditCards';
import Mortgage from '../funnels/Mortgage';
import Loans from '../funnels/Loans';
import Savings from '../funnels/Savings';
import Interest from '../funnels/Interest';
import GrowthBonds from '../funnels/GrowthBonds';
import Investments from '../funnels/Investments';

const FunnelLoader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const renderFunnel = () => {
    switch (id) {
      case 'credit-cards': return <CreditCards />;
      case 'mortgages': return <Mortgage />;
      case 'loans': return <Loans />;
      case 'savings': return <Savings />;
      case 'interest': return <Interest />;
      case 'growth-bonds': return <GrowthBonds />;
      case 'investments': return <Investments />;
      default: return <div className="text-center text-red-500 font-bold p-8">Unknown Funnel Identifier</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-xl hover:bg-gray-800 transition text-sm font-semibold"
        >
          <ChevronLeft size={16} /> Return to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-red-600 animate-pulse" />
          <h1 className="text-md font-bold tracking-tight">Flagstar Institutional</h1>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col justify-center">
        {renderFunnel()}
      </main>
    </div>
  );
};

export default FunnelLoader;
