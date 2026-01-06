import React, { useState } from 'react';
import { authService } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await authService.login(email, password);
        if (user) {
          onSuccess();
          onClose();
          setEmail('');
          setPassword('');
        } else {
          setError('Email ou mot de passe incorrect');
        }
      } else {
        if (!name.trim()) {
          setError('Le nom est requis');
          setLoading(false);
          return;
        }
        const user = await authService.register(email, password, name, firstName, lastName);
        if (user) {
          // If user is pending, show waiting message
          if (user.status === 'pending') {
            setError('');
            // Don't close modal, show success message
            alert('Votre compte a été créé avec succès. En attente d\'approbation par l\'administrateur.');
            onSuccess();
            onClose();
          } else {
            onSuccess();
            onClose();
          }
          setEmail('');
          setPassword('');
          setName('');
          setFirstName('');
          setLastName('');
        } else {
          setError('Cet email est déjà utilisé');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>

        <h2 className="text-3xl font-black uppercase mb-6 text-bp-black">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </h2>

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-bp-light rounded-xl focus:ring-2 focus:ring-bp-green focus:outline-none transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
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
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggleMode}
            className="text-sm text-bp-medium hover:text-bp-green transition-colors"
          >
            {mode === 'login' 
              ? "Pas encore de compte ? S'inscrire" 
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        {mode === 'login' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-xs text-bp-medium">
            <p className="font-bold mb-2">Compte admin de test :</p>
            <p>Email: admin@bureaupro.com</p>
            <p>Mot de passe: admin123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

