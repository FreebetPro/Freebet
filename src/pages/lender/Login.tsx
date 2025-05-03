import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Telescope as Envelope, Lock, AtSign as SignIn, AlertCircle } from 'lucide-react';
import { lenderAuthService } from '../../services/lenderAuthService';

const LenderLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (lenderAuthService.isAuthenticated()) {
      navigate('/lender/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      const result = await lenderAuthService.login(email, password);
      
      if (result.success) {
        navigate('/lender/dashboard');
      } else {
        setErrorMessage(result.message || 'Falha na autenticação');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Ocorreu um erro ao tentar fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">
            Área do Emprestador
          </h2>
          <p className="text-gray-600">
            Acesse sua conta para gerenciar CPFs e acompanhar resultados
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Envelope className="w-4 h-4" />
                <span>Email</span>
              </div>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite seu email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Senha</span>
              </div>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Entrando...
              </>
            ) : (
              <>
                <SignIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            <p className="mt-2">
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Esqueceu sua senha?
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LenderLogin;