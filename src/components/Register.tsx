import React, { useState, useCallback } from 'react';
import { UserPlus, Loader, Search } from 'lucide-react';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import axios from 'axios';
import { formatCPF, formatPhone, formatCEP } from '../utils/formatters';

interface RegisterProps {
  onRegister: (userData: {
    fullName: string;
    cpf: string;
    birthDate: string;
    whatsapp: string;
    zipCode: string;
    address: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  switchToLogin: () => void;
  isLoading: boolean;
}

const Register: React.FC<RegisterProps> = ({ onRegister, switchToLogin, isLoading: externalLoading }) => {
  const handleSwitchToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    switchToLogin();
  };
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Particle initialization functions remain the same
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine, {
      preset: "stars"
    });
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log(container);
  }, []);

  // Handler functions remain the same
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value));
  };

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedZip = formatCEP(e.target.value);
    setZipCode(formattedZip);
    
    const value = formattedZip.replace(/\D/g, '');
    
    // If we have a complete CEP (8 digits), fetch address data
    if (value.length === 8) {
      try {
        setIsLoadingCep(true);
        const response = await axios.get(`https://viacep.com.br/ws/${value}/json/`);
        
        if (response.data && !response.data.erro) {
          const addressData = response.data;
          const formattedAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`;
          setAddress(formattedAddress);
        }
      } catch (error) {
        console.error('Error fetching address from CEP:', error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Updated submit handler to use the onRegister prop passed from App.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!fullName || !cpf || !birthDate || !whatsapp || !zipCode || !address) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      
      // Use the onRegister function passed from App.tsx
      const success = await onRegister({
        fullName,
        cpf,
        birthDate,
        whatsapp,
        zipCode,
        address,
        email,
        password
      });

      if (success) {
        // Registration successful - the App component will handle redirection
        alert('Registro realizado com sucesso! Por favor, verifique seu email para confirmar sua conta.');
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao se conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Use either the local loading state or the external loading prop
  const showLoading = isLoading || externalLoading;

  // JSX remains mostly the same, with minor adjustments
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
            <div className="bg-green-500 p-2 rounded-full inline-flex justify-center mb-3">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Criar Conta</h2>
            <p className="mt-1 text-sm text-gray-600">Preencha os dados para se registrar</p>
          </div>
          
          {error && (
            <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite seu nome completo"
                  required
                  disabled={showLoading}
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="cpf">
                  CPF
                </label>
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={handleCPFChange}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="000.000.000-00"
                  required
                  disabled={showLoading}
                  maxLength={14}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="birthDate">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  disabled={showLoading}
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="whatsapp">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  value={whatsapp}
                  onChange={handlePhoneChange}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="(00) 00000-0000"
                  required
                  disabled={showLoading}
                  maxLength={15}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="zipCode">
                  CEP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="zipCode"
                    value={zipCode}
                    onChange={handleZipCodeChange}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="00000-000"
                    required
                    disabled={showLoading}
                    maxLength={9}
                  />
                  {isLoadingCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Search className="w-4 h-4 text-gray-400 animate-pulse" />
                    </div>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">Digite o CEP para autocompletar</p>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite seu email"
                  required
                  disabled={showLoading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                Endereço Completo
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Rua, número, bairro, cidade, estado"
                required
                disabled={showLoading || isLoadingCep}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                  required
                  disabled={showLoading}
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                  required
                  disabled={showLoading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
              disabled={showLoading}
            >
              {showLoading ? (
                <>
                  <Loader className="animate-spin w-5 h-5 mr-2" />
                  Processando...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
            
            <div className="text-center mt-2 text-xs sm:text-sm">
              <p className="text-gray-600">
                Já possui uma conta?{' '}
                <button 
                  type="button" 
                  onClick={handleSwitchToLogin}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Faça login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;