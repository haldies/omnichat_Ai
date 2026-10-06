import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      // Redirect to login if not authenticated
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Show nothing while checking auth
  if (!token || !user) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
