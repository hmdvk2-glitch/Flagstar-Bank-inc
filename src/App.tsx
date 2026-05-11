import React, { useState, useEffect } from 'react';
import Login from './customer/Login';
import Dashboard from './customer/Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for local simulation session
    const storedUser = localStorage.getItem('bank_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  const renderRoute = () => {
    if (!user) return <Login />;
    
    // Simple Router based on role
    const hash = window.location.hash;
    
    if (user.role === 'admin') {
      return <AdminDashboard />;
    }
    
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-red-600/30">
      <div className="flex-1">
        {renderRoute()}
      </div>
      <Footer />
    </div>
  );
};

export default App;
