import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import CopyTrade from './components/CopyTrade';
import Login from './components/Login';
import Register from './components/Register';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import CPFAccounts from './components/CPFAccounts';
import ControleGeral from './components/ControleGeral';
import AffiliateDashboard from './components/affiliate/Dashboard';
import AfiliadoAssinaturasAtivas from './components/affiliate/AfiliadoAssinaturasAtivas';
import AfiliadoAssinaturasCanceladas from './components/affiliate/AfiliadoAssinaturasCanceladas';
import AfiliadoPagamentosPendentes from './components/affiliate/AfiliadoPagamentosPendentes'; 
import AfiliadoCheckoutAbandonado from './components/affiliate/AfiliadoCheckoutAbandonado';
import BettingHousesPage from './pages/BettingHousesPage';
import Subscription from './components/Subscription';
import LenderLogin from './pages/lender/Login';
import LenderDashboard from './pages/lender/Dashboard';
import AumentoCalculator from './components/calculators/AumentoCalculator';
import SurebetCalculator from './components/calculators/SurebetCalculator';
import DutchingCalculator from './components/calculators/DutchingCalculator';
import LayCalculator from './components/calculators/LayCalculator';
import Organization from './components/Organization';
import MinhasBancas from './components/MinhasBancas';
import Fintech from './components/Fintech';
import { authService } from './services/supabaseService';
import Chat from './components/Chat';
import Upsell from './components/Upsell';
import Downsell from './components/Downsell';
import Upsell2 from './components/Upsell2';
import ThankYouPage from './components/ThankYouPage';
import LenderTasksPage from './pages/lender/LenderTasksPage';
import CPFStatistics from './pages/CPFStatistics';
import UpsellxDownsell from './components/UpsellxDownsell';
import Downsell2 from './components/Downsell2';
import UserProfile from './components/UserProfile';
import ProtectedLenderRoute from './pages/lender/ProtectedLenderRoute';
import { ThemeProvider } from './utils/themecontext';
import ControleImposto from './components/Controleimposto';
// Componente de proteção de rotas
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirecionar para login e salvar o local atual para retornar depois do login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Componentes para Login e Register com navegação
const LoginRoute = ({ isAuthenticated, handleLogin, isLoading }) => {
  const navigate = useNavigate();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Login 
      onLogin={handleLogin} 
      switchToRegister={() => navigate('/register')} 
      isLoading={isLoading} 
    />
  );
};

const RegisterRoute = ({ isAuthenticated, handleRegisterWithUserData, isLoading }) => {
  const navigate = useNavigate();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Register
      onRegister={handleRegisterWithUserData}
      switchToLogin={() => navigate('/login')} 
      isLoading={isLoading} 
    />
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{id: string, email: string} | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação ao iniciar o app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify token from localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set user as authenticated immediately based on localStorage
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
          
          // Optionally verify with backend in background
          // This prevents logout on page refresh while still checking token validity
          authService.verifyToken(token)
            .then(response => {
              if (!response.valid) {
                // Token invalid according to backend, log out silently
                console.log("Token invalid, logging out");
                handleLogout();
              }
            })
            .catch(error => {
              console.error("Error verifying token:", error);
              // Don't log out on network errors to prevent unnecessary logouts
            });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", email);
      const response = await authService.login(email, password);
      console.log("Login response:", response);
      
      if (response.success && response.user && response.token) {
        // Salvar informações no localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Atualizar estado
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error("Login failed:", response.message);
        alert(response.message || "Credenciais inválidas!");
        return false;
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      alert("Erro ao tentar fazer login. Tente novamente mais tarde.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register(email, password);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        // Armazenar o token para solicitações futuras
        localStorage.setItem('token', response.token);
        return true;
      } else {
        alert(response.message || "Erro ao criar conta!");
        return false;
      }
    } catch (error) {
      console.error("Erro durante o registro:", error);
      alert("Erro ao tentar criar conta. Tente novamente mais tarde.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterWithUserData = async (userData: {
    fullName: string;
    cpf: string;
    birthDate: string;
    whatsapp: string;
    zipCode: string;
    address: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      // First register the user with email and password
      const response = await authService.register(userData.email, userData.password);
      
      if (response.success && response.user && response.token) {
        // Then store the additional user data
        try {
          // Store the additional user data in the user_profiles table
          const profileResponse = await authService.createUserProfile(response.user.id, {
            fullName: userData.fullName,
            cpf: userData.cpf,
            birthDate: userData.birthDate,
            whatsapp: userData.whatsapp,
            zipCode: userData.zipCode,
            address: userData.address,
          });
          
          if (profileResponse.success) {
            setUser(response.user);
            setIsAuthenticated(true);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('isAuthenticated', 'true');
            return true;
          } else {
            console.error("Error creating user profile:", profileResponse.message);
            return false;
          }
        } catch (error) {
          console.error("Error storing additional user data:", error);
          return false;
        }
      } else {
        alert(response.message || "Erro ao criar conta!");
        return false;
      }
    } catch (error) {
      console.error("Erro durante o registro:", error);
      alert("Erro ao tentar criar conta. Tente novamente mais tarde.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  // Mostrar carregamento inicial
  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Rotas de autenticação */}
          <Route path="/login" element={
            <LoginRoute 
              isAuthenticated={isAuthenticated} 
              handleLogin={handleLogin} 
              isLoading={isLoading} 
            />
          } />

          <Route path="/register" element={
            <RegisterRoute 
              isAuthenticated={isAuthenticated}
              handleRegisterWithUserData={handleRegisterWithUserData}
              isLoading={isLoading}
            />
          } />
          
          {/* Layout com Sidebar para usuários autenticados */}
          <Route path="/" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          } />

<Route path="/contas-cpf/imposto-por-cpf" element={
  <ProtectedRoute isAuthenticated={isAuthenticated}>
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        onLogout={handleLogout} 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        user={user}
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
        <ControleImposto />
      </div>
    </div>
  </ProtectedRoute>
} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <Dashboard user={user} />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/calculadoras/aumento" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <AumentoCalculator />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/calculadora-surebet" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <SurebetCalculator />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/calculadora-dutching" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <DutchingCalculator />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/calculadora-lay" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <LayCalculator />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/perfil" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <UserProfile userId={user?.id || null} />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/afiliados/planos-ativos" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <AfiliadoAssinaturasAtivas />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/afiliados/planos-cancelados" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <AfiliadoAssinaturasCanceladas />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/afiliados/pagamento-pendente" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <AfiliadoPagamentosPendentes />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/afiliados/checkout-abandonado" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <AfiliadoCheckoutAbandonado />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/afiliados" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <AffiliateDashboard onOpenSaqueModal={() => {}} />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Rotas protegidas com layout de Sidebar */}
          <Route path="/fintech" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <Fintech />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/fintech/qrcode" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <BettingHousesPage />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/scale/copytrade" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <div className="flex-1">
                  <div className="flex h-screen">
                    <Sidebar 
                      onLogout={handleLogout} 
                      isCollapsed={isSidebarCollapsed} 
                      onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                      user={user}
                    />
                    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                      <CopyTrade />
                    </div>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/minhas-bancas" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <MinhasBancas />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/contas-cpf" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <CPFAccounts />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/contas-cpf/estatisticas" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                  <CPFStatistics />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/controle-geral" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <ControleGeral />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/tarefas-emprestador" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <LenderTasksPage />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/organization" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-0`}>
                  <Organization />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/assinaturas" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex h-screen bg-gray-100">
                <Sidebar 
                  onLogout={handleLogout} 
                  isCollapsed={isSidebarCollapsed} 
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                  user={user}
                />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-4 md:ml-20' : 'ml-4 md:ml-64'}`}>
                  <Subscription />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/upsell" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Upsell />
            </ProtectedRoute>
          } />
          
          <Route path="/downsell" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Downsell />
            </ProtectedRoute>
          } />
          
          <Route path="/upsell2" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Upsell2 />
            </ProtectedRoute>
          } />
          
          <Route path="/downsell2" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Downsell2 />
            </ProtectedRoute>
          } />
          
          <Route path="/thank-you" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ThankYouPage />
            </ProtectedRoute>
          } />
          
          <Route path="/upsellxdownsell" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UpsellxDownsell />
            </ProtectedRoute>
          } />
          
          {/* Lender Routes */}

          <Route path="/lender/login" element={<LenderLogin />} />
          <Route path="/lender/dashboard" element={
            <ProtectedLenderRoute>
              <div className="min-h-screen bg-gray-50">
                <LenderDashboard />
              </div>
            </ProtectedLenderRoute>
          } />
          
          {/* Redirecionar todas as outras rotas para a página principal */}
          <Route path="*" element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Navigate to="/login" replace />
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;