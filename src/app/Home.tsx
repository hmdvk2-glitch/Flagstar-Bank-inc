import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import CustomerLoginButton from '../components/CustomerLoginButton';
import AdminShield from '../components/AdminShield';
import { Building } from 'lucide-react';

const Home: React.FC = () => {
  const { isAdmin, isCustomer } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin || isCustomer) {
      navigate('/dashboard');
    }
  }, [isAdmin, isCustomer, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Flagstar <span className="text-red-600">Bank</span></h1>
        </div>
        <CustomerLoginButton />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Secure, Global, <span className="text-red-600">Reliable.</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-10">
          Experience the next generation of digital banking. Manage your wealth, execute transfers, and track transactions with unparalleled security.
        </p>
      </main>

      <AdminShield />
    </div>
  );
};

export default Home;
