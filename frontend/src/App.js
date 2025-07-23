import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
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
import EditProduct from "./pages/EditProduct";
import EditDetectionMethod from "./pages/EditDetectionMethod";
import EditSetupGuide from "./pages/EditSetupGuide";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
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