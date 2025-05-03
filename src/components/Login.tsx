import React, { useState, useCallback } from 'react';
import { KeyRound, Loader } from 'lucide-react';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  switchToRegister: () => void;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, switchToRegister, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // Optional callback
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Falha ao fazer login. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Erro ao se conectar com o servidor. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        className="absolute inset-0"
        options={{
          background: {
            color: {
              value: "#000000",
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: "#6b7280",
            },
            links: {
              color: "#6b7280",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.4,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1.5, max: 4 },
            },
          },
          detectRetina: true,
        }}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Acesse o seu Painel</h2>
            <p className="mt-1 text-sm text-gray-600">Faça login para continuar</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Digite seu email"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin w-5 h-5 mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </button>
            
            <div className="text-center mt-3 text-xs sm:text-sm">
              <p className="text-gray-600">
                Não possui uma conta? {' '}
                <button
                  type="button" 
                  onClick={switchToRegister}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Registre-se
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;