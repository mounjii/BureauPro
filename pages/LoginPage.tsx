import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/apiService';
import BurocycleLogo from '../components/BurocycleLogo';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page the user was trying to access
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await authService.login(email, password);
        if (user) {
          // Check if user is pending approval
          if (user.status === 'pending') {
            navigate('/waiting', { replace: true });
            return;
          }
          // All users (including admin) go to catalogue first
          navigate('/catalogue', { replace: true });
        } else {
          // User not found or invalid credentials
          setError('Email ou mot de passe incorrect.');
        }
      } else {
        // Signup mode
        if (!name.trim()) {
          setError('Le nom est requis');
          setLoading(false);
          return;
        }
        const user = await authService.register(email, password, name, firstName, lastName);
        if (user) {
          // If user is pending, redirect to waiting page
          if (user.status === 'pending') {
            navigate('/waiting', { replace: true });
          } else {
            // If somehow approved immediately, redirect to catalogue
            navigate('/catalogue', { replace: true });
          }
        } else {
          setError('Cet email est déjà utilisé');
        }
      }
    } catch (err: any) {
      // If 403 error with pending status, redirect to waiting page
      if (err.status === 403) {
        navigate('/waiting', { replace: true });
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] px-4 py-8">
      <div className="bg-white rounded-2xl sm:rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <BurocycleLogo size="xs" showText={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-bp-black mb-2">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="text-sm text-bp-medium">
            {mode === 'login' 
              ? 'Accédez au tableau de bord d\'administration' 
              : 'Créez votre compte et attendez l\'approbation de l\'administrateur'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-bp-medium mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-bp-light rounded-xl focus:ring-2 focus:ring-bp-green focus:outline-none transition-all"
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-bp-medium mb-2">
                    Prénom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-bp-light rounded-xl focus:ring-2 focus:ring-bp-green focus:outline-none transition-all"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-bp-medium mb-2">
                    Nom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-bp-light rounded-xl focus:ring-2 focus:ring-bp-green focus:outline-none transition-all"
                    placeholder="Nom"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-bp-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-bp-light rounded-xl focus:ring-2 focus:ring-bp-green focus:outline-none transition-all"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-bp-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-bp-light rounded-xl focus:ring-2 focus:ring-bp-green focus:outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bp-medium hover:text-bp-black transition-colors focus:outline-none"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bp-black text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-bp-green transition-all shadow-lg disabled:opacity-50"
          >
            {loading 
              ? (mode === 'login' ? 'Connexion...' : 'Inscription...') 
              : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        {mode === 'signup' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
            <p className="font-bold mb-1">⚠️ Important</p>
            <p>Après votre inscription, votre compte sera en attente d'approbation par l'administrateur. Vous serez redirigé vers la page d'attente.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;

