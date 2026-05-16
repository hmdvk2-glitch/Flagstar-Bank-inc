import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Login from '../customer/Login';
import Home from './Home';
import Dashboard from '../customer/Dashboard';
import AdminDashboard from '../admin/AdminDashboard';
import Footer from '../components/Footer';
import { AdminRoute, CustomerRoute } from '../guards/RoleGuards';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans selection:bg-[#C00000]/10">
        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />

            {/* Admin Shield (Hardened) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Customer Terminal (Hardened) */}
            <Route element={<CustomerRoute />}>
              <Route path="/customer/dashboard" element={<Dashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
