import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/apiService';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    // Redirect to login page (root path), saving the location they were trying to access
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user is pending approval
  if (user.status === 'pending') {
    return <Navigate to="/waiting" replace />;
  }

  if (requireAdmin) {
    // Check if user has admin permissions (admin@bureaupro.com or has viewDashboard permission)
    const isAdmin = user.email === 'admin@bureaupro.com' || user.role === 'admin';
    const hasDashboardAccess = user.permissions?.viewDashboard || false;
    
    if (!isAdmin && !hasDashboardAccess) {
      // Redirect to catalogue if user doesn't have dashboard access
      return <Navigate to="/catalogue" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

