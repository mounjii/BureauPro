import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

const WaitingPage: React.FC = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // If no user or user is already approved, redirect
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

      if (user.status === 'approved') {
      // User is already approved, redirect to catalogue or admin
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/catalogue', { replace: true });
      }
      return;
    }

    // Check user status periodically
    const checkStatus = async () => {
      if (!user || user.status === 'approved') return;

      try {
        setChecking(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`);

        if (response.ok) {
          const updatedUser = await response.json();
          
          if (updatedUser.status === 'approved') {
            // User has been approved! Show success message and redirect
            setMessage('Votre compte a été approuvé ! Redirection en cours...');
            
            // Save updated user
            authService.setCurrentUser(updatedUser);
            
            // Redirect after a short delay
            setTimeout(() => {
              if (updatedUser.role === 'admin') {
                navigate('/admin', { replace: true });
              } else {
                navigate('/catalogue', { replace: true });
              }
            }, 2000);
          } else if (updatedUser.status === 'rejected') {
            setMessage('Votre compte a été rejeté. Veuillez contacter l\'administrateur.');
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      } finally {
        setChecking(false);
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-2xl w-full shadow-xl text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-bp-black mb-3">
            En attente d'approbation
          </h1>
          <p className="text-bp-medium text-lg">
            Votre compte est en attente de validation par l'administrateur
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 animate-pulse"></div>
              <div>
                <p className="font-bold text-bp-black mb-1">Compte créé avec succès</p>
                <p className="text-sm text-bp-medium">
                  Email: <span className="font-semibold">{user?.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 animate-pulse"></div>
              <div>
                <p className="font-bold text-bp-black mb-1">En attente de validation</p>
                <p className="text-sm text-bp-medium">
                  L'administrateur va examiner votre demande et vous donnera accès sous peu.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 animate-pulse"></div>
              <div>
                <p className="font-bold text-bp-black mb-1">Vérification automatique</p>
                <p className="text-sm text-bp-medium">
                  Votre statut est vérifié automatiquement. Une fois approuvé, vous pourrez vous connecter et accéder à l'application.
                </p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${
            message.includes('approuvé') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : message.includes('rejeté')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-gray-300 transition-all"
          >
            Se déconnecter
          </button>
          <button
            onClick={() => {
              // Try to reconnect to check status
              if (user) {
                navigate('/');
              } else {
                window.location.reload();
              }
            }}
            disabled={checking}
            className="px-6 py-3 bg-bp-green text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-bp-black transition-all disabled:opacity-50"
          >
            {checking ? 'Vérification...' : 'Se reconnecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;

