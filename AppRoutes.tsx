import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Product } from './types';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './pages/LoginPage';
import WaitingPage from './components/WaitingPage';
import ProtectedRoute from './components/ProtectedRoute';
import App from './App';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/waiting" element={<WaitingPage />} />
      <Route
        path="/catalogue"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminRoute />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Admin Route Component
const AdminRoute: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    // This will be handled by AdminDashboard
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <AdminDashboard
        onProductClick={(product) => setSelectedProduct(product)}
        selectedProduct={selectedProduct}
        onProductsChange={loadProducts}
      />
    </div>
  );
};

export default AppRoutes;

