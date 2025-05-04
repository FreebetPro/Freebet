import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Users, ClipboardList, Kanban as LayoutKanban, LogOut, Wallet, Calculator, Crown, 
  ChevronDown, ChevronRight, CircleDollarSign, LineChart, QrCode, Copy, ChevronLeft, ChevronLeft as ChevronDoubleLeft, 
  ChevronRight as ChevronDoubleRight, CreditCard, XCircle, Clock, ShoppingCart, Percent, Plus, TrendingUp, UserIcon, 
  ClipboardCheck, BarChart, Menu, X } from 'lucide-react';
import { Bot, Clipboard } from 'lucide-react';
import { useTheme } from '../utils/themecontext';
import ThemeToggleButton from '../utils/ThemeToggleButton';

interface Bank {
  id: string;
  name: string;
  initialCapital: number;
  roi: number;
  grossProfit: number;
}

interface SidebarProps {
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  menuButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onLogout, 
  isCollapsed, 
  onToggleCollapse,
  menuButtonPosition = 'top-left'
}) => {
  const { darkMode } = useTheme();
  const location = useLocation();
  const [calculatorOpen, setCalculatorOpen] = React.useState(false);
  const [banksOpen, setBanksOpen] = React.useState(false);
  const [fintechOpen, setFintechOpen] = React.useState(false);
  const [affiliateOpen, setAffiliateOpen] = React.useState(false);
  const [cpfOpen, setCpfOpen] = React.useState(false);
  const [lenderTasksOpen, setLenderTasksOpen] = React.useState(false);
  const [scaleOpen, setScaleOpen] = React.useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é dispositivo móvel com base na largura da tela
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Fechar menu móvel ao navegar para outra página
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && !isCollapsed) {
      onToggleCollapse();
    } else if (isRightSwipe && isCollapsed) {
      onToggleCollapse();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };
  
  useEffect(() => {
    const savedBanks = localStorage.getItem('banks');
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    }
  }, []);

  const menuItems = [
    {
      icon: Home,
      text: 'Início',
      path: '/'
    },
    { 
      icon: LineChart,
      text: 'Fintech',
      type: 'fintech',
      submenu: [
        { icon: LayoutDashboard, text: 'Dashboard', path: '/fintech' }
      ]
    },
    {
      icon: TrendingUp,
      text: 'Escale sua Operação',
      type: 'scale',
      submenu: [
        { icon: QrCode, text: 'QR Code / Casas', path: '/fintech/qrcode' },
        { icon: Bot, text: 'Bot Abertura Casas', path: '/fintech/bot' },
        { icon: Copy, text: 'Copytrade', path: '/scale/copytrade' }
      ]
    },
    { 
      icon: Wallet, 
      text: 'Minhas Bancas',
      type: 'banks',
      mainPath: '/minhas-bancas',
      submenu: banks.map(bank => ({
        icon: CircleDollarSign,
        text: bank.name,
        path: `/?bank=${bank.id}`
      }))
    },
    { 
      icon: LayoutDashboard, 
      text: 'Registro Operações', 
      path: '/dashboard'
    },
    { 
      icon: Users, 
      text: 'Contas CPF', 
      type: 'cpf',
      mainPath: '/contas-cpf',
      submenu: [
        { icon: BarChart, text: 'CPF Estatísticas', path: '/contas-cpf/estatisticas' },
        { icon: BarChart, text: 'Imposto Por CPF', path: '/contas-cpf/imposto-por-cpf' }
      ]
    },
    { 
      icon: ClipboardList, 
      text: 'Balanço Financeiro', 
      path: '/controle-geral' 
    },
    {
      icon: ClipboardCheck,
      text: 'Tarefas Emprestador',
      path: '/tarefas-emprestador'
    },
    { 
      icon: LayoutKanban, 
      text: 'Organização', 
      path: '/organization' 
    }
  ];

  const bottomMenuItems = [
    {
      icon: Calculator,
      text: 'Calculadoras',
      type: 'calculator',
      submenu: [
        { text: 'Aumento 25%', path: '/calculadoras/aumento' },
        { text: 'Calculadora Surebet', path: '/calculadora-surebet' },
        { text: 'Calculadora Dutching', path: '/calculadora-dutching' },
        { text: 'Calculadora Lay', path: '/calculadora-lay' }
      ]
    },
    { 
      icon: Crown, 
      text: 'Assinaturas', 
      path: '/assinaturas' 
    },
    { 
      icon: Users,
      text: 'Afiliados',
      type: 'affiliate',
      submenu: [
        { icon: LayoutDashboard, text: 'Dashboard', path: '/afiliados' },
        { icon: CreditCard, text: 'Planos Ativos', path: '/afiliados/planos-ativos' },
        { icon: XCircle, text: 'Planos Cancelados', path: '/afiliados/planos-cancelados' },
        { icon: Clock, text: 'Pagamento Pendente', path: '/afiliados/pagamento-pendente' },
        { icon: ShoppingCart, text: 'Checkout Abandonado', path: '/afiliados/checkout-abandonado' }
      ]
    }
  ];

  const isSubmenuOpen = (item: any) => {
    if (item.type === 'fintech') return fintechOpen;
    if (item.type === 'banks') return banksOpen;
    if (item.type === 'cpf') return cpfOpen;
    if (item.type === 'affiliate') return affiliateOpen;
    if (item.type === 'scale') return scaleOpen;
    if (item.type === 'calculator') return calculatorOpen;
    return false;
  };

  const toggleSubmenu = (item: any) => {
    if (item.type === 'fintech') setFintechOpen(!fintechOpen);
    if (item.type === 'banks') setBanksOpen(!banksOpen);
    if (item.type === 'affiliate') setAffiliateOpen(!affiliateOpen);
    if (item.type === 'cpf') setCpfOpen(!cpfOpen);
    if (item.type === 'scale') setScaleOpen(!scaleOpen);
    if (item.type === 'calculator') setCalculatorOpen(!calculatorOpen);
  };

  const isActive = (item: any) => {
    if (item.mainPath && location.pathname === item.mainPath) return true;
    if (item.submenu) {
      return item.submenu.some((subItem: any) => 
        location.pathname === subItem.path || 
        (subItem.path.includes('?') && location.pathname + location.search === subItem.path)
      );
    }
    return location.pathname === item.path;
  };

  // Function to get position classes for the hamburger button
  const getMenuButtonPositionClasses = () => {
    switch (menuButtonPosition) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-left':
      default:
        return 'top-4 left-4';
    }
  };

  // Componente do botão de hambúrguer com posição configurável
  const MobileMenuButton = () => (
    <button
      onClick={toggleMobileMenu}
      className={`fixed ${getMenuButtonPositionClasses()} z-50 p-2 rounded-lg transition-colors duration-200 ${
        darkMode 
          ? isMobileMenuOpen ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white' 
          : isMobileMenuOpen ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-800'
      } shadow-md`}
      aria-label="Toggle menu"
    >
      {isMobileMenuOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <Menu className="w-6 h-6" />
      )}
    </button>
  );

  // Overlay para fechar o menu ao clicar fora
  const MobileOverlay = () => (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
      onClick={toggleMobileMenu}
    />
  );

  // Renderiza o conteúdo da sidebar
  const SidebarContent = () => (
    <>
      <div className={`p-6 flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold transition-opacity duration-300 ${
          isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100'
        } ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Freebet Pro
        </h2>
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className={`p-2 sm:p-3 rounded-lg transition-colors duration-200 cursor-pointer touch-manipulation ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {isCollapsed ? (
              <ChevronDoubleRight className="w-6 h-6 sm:w-8 sm:h-8" />
            ) : (
              <ChevronDoubleLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </button>
        )}
        {isMobile && (
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          item.submenu ? (
            <div key={index} className="touch-manipulation">
              {item.mainPath ? (
                <Link
                  to={item.mainPath}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors duration-200 group ${
                    isActive(item) 
                      ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'
                      : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 min-w-[1.25rem] mr-3" />
                    <span className={`font-medium transition-opacity duration-300 ${isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100'}`}>
                      {item.text}
                    </span>
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <div 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSubmenu(item);
                      }}
                      className="focus:outline-none group-hover:text-blue-500"
                    >
                      {isSubmenuOpen(item) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => (!isCollapsed || isMobile) && toggleSubmenu(item)}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors duration-200 group ${
                    isActive(item) 
                      ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'
                      : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 min-w-[1.25rem] mr-3" />
                    <span className={`font-medium transition-opacity duration-300 ${isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100'}`}>
                      {item.text}
                    </span>
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <div className="focus:outline-none group-hover:text-blue-500">
                      {isSubmenuOpen(item) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </button>
              )}
              {(!isCollapsed || isMobile) && isSubmenuOpen(item) && item.submenu.length > 0 && (
                <div className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  {item.submenu.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`flex items-center pl-14 pr-6 py-3 transition-colors duration-200 ${
                        location.pathname === subItem.path || 
                        (subItem.path.includes('?') && location.pathname + location.search === subItem.path)
                          ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                      }`}
                    >
                      {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                      <span 
                        className="font-medium" 
                        onClick={(e) => {
                          if (subItem.text === 'Criar Tarefa Emprestador') {
                            e.preventDefault();
                            const event = new CustomEvent('openLenderTaskModal');
                            window.dispatchEvent(event);
                          }
                        }}
                      >
                        {subItem.text}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-6 py-4 transition-colors duration-200 ${
                location.pathname === item.path 
                  ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
              }`}
            >
              <item.icon className="w-5 h-5 min-w-[1.25rem] mr-3" />
              <span className={`font-medium transition-opacity duration-300 ${isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {item.text}
              </span>
            </Link>
          )
        ))}

        {bottomMenuItems.map((item, index) => (
          item.submenu ? (
            <div key={index}>
              <button
                onClick={() => (!isCollapsed || isMobile) && toggleSubmenu(item)}
                className={`w-full flex items-center justify-between px-6 py-4 transition-colors duration-200 ${
                  isActive(item) 
                    ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'
                    : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className={`font-medium transition-opacity duration-300 ${isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {item.text}
                  </span>
                </div>
                {(!isCollapsed || isMobile) && (
                  <div>
                    {isSubmenuOpen(item) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>
              {(!isCollapsed || isMobile) && isSubmenuOpen(item) && (
                <div className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  {item.submenu.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`flex items-center pl-14 pr-6 py-3 transition-colors duration-200 ${
                        location.pathname === subItem.path 
                          ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                      }`}
                    >
                      {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                      <span className="font-medium">{subItem.text}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-6 py-4 transition-colors duration-200 ${
                location.pathname === item.path 
                  ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'
                  : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className={`font-medium transition-opacity duration-300 ${isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {item.text}
              </span>
            </Link>
          )
        ))}
      </nav>
      <div className="px-4 py-2">
        <ThemeToggleButton />
      </div>

      <button
        onClick={onLogout}
        className={`flex items-center px-6 py-4 border-t transition-colors duration-200 ${
          darkMode 
            ? 'text-red-400 hover:bg-red-900/30 border-gray-700' 
            : 'text-red-600 hover:bg-red-50 border-gray-100'
        }`}
      >
        <LogOut className="w-5 h-5 mr-3" />
        <span className={`font-medium transition-opacity duration-300 ${isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100'}`}>
          Sair
        </span>
      </button>
    </>
  );

  // Renderização condicional baseada no dispositivo
  if (isMobile) {
    return (
      <>
        <MobileMenuButton />
        <MobileOverlay />
        
        {/* Aqui está a modificação principal: position absolute para remover do fluxo do documento */}
        <div 
          className={`fixed top-0 left-0 h-full w-full max-w-xs flex flex-col z-50 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'transform-none' : '-translate-x-full'
          } ${
            darkMode 
              ? 'bg-gray-900 shadow-lg shadow-gray-800/20' 
              : 'bg-white shadow-lg'
          }`}
          style={{
            visibility: isMobileMenuOpen ? 'visible' : 'hidden' // Oculta completamente quando fechado
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <SidebarContent />
        </div>
      </>
    );
  }

  // Versão desktop
  return (
    <div 
      className={`fixed top-0 left-0 h-full flex flex-col transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16 sm:w-20' : 'w-56 sm:w-64'
      } ${
        darkMode 
          ? 'bg-gray-900 shadow-lg shadow-gray-800/20' 
          : 'bg-white shadow-lg'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SidebarContent />
    </div>
  );
};

export default Sidebar;