import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import GitHubLogin from './components/GitHubLogin';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Products from './pages/Products';
import Methods from './pages/Methods';
import SetupGuides from './pages/SetupGuides';
import Search from './pages/Search';
import BulkOperations from './pages/BulkOperations';
import CVESearch from './pages/CVESearch';
import Profile from './pages/Profile';
import Users from './pages/Users';
import AdminPanel from './pages/AdminPanel';
import EditProduct from "./pages/EditProduct";
import EditDetectionMethod from "./pages/EditDetectionMethod";
import EditSetupGuide from "./pages/EditSetupGuide";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cyber relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative text-center">
          <div className="loading-spinner mx-auto mb-6 h-16 w-16"></div>
          <h3 className="text-2xl font-bold text-slate-100 mb-2">Initializing Security Platform</h3>
          <p className="text-slate-400">Loading cybersecurity intelligence...</p>
          <div className="mt-4 flex justify-center">
            <div className="terminal text-xs">
              <div className="text-matrix-green">$ systemctl start version-intel</div>
              <div className="text-cyber-400">Loading... Please wait</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<GitHubLogin />} />
        <Route path="/auth/github/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/products" element={<Products />} />
        <Route path="/methods" element={<Methods />} />
        <Route path="/setup-guides" element={<SetupGuides />} />
        <Route path="/search" element={<Search />} />
        <Route path="/bulk" element={<BulkOperations />} />
        <Route path="/cve-search" element={<CVESearch />} />
        <Route path="/profile" element={<Profile />} />
        {user.role === 'admin' && <Route path="/users" element={<Users />} />}
        {user.role === 'admin' && <Route path="/admin" element={<AdminPanel />} />}
        <Route path="/products/:id/edit" element={<EditProduct />} />
        <Route path="/methods/:id/edit" element={<EditDetectionMethod />} />
        <Route path="/setup-guides/:id/edit" element={<EditSetupGuide />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return <AppContent />;
}

export default App; 