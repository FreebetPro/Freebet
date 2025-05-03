import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { lenderAuthService } from '../../services/lenderAuthService';

interface ProtectedLenderRouteProps {
  children: React.ReactNode;
}

const ProtectedLenderRoute: React.FC<ProtectedLenderRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = lenderAuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to lender login page and save current location to return after login
    return <Navigate to="/lender/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedLenderRoute;