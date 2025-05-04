import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, LineChart, Calculator, Crown, Users, QrCode, MessageCircle } from 'lucide-react';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log(container);
  }, []);

  // Adicionado comunidade do Telegram ao array de produtos
  const products = [
    {
      title: 'FINTECH',
      description: 'Gerencie suas contas e transações financeiras',
      icon: Wallet,
      path: '/fintech',
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-400/20 via-blue-300/10 to-transparent',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'AUTOMAÇÃO QR CODE E COPYTRADE',
      description: 'Automatize operações com QR Code e CopyTrade',
      icon: QrCode,
      path: '/fintech/qrcode',
      color: 'from-rose-500 to-rose-600',
      gradient: 'from-rose-400/20 via-rose-300/10 to-transparent',
      iconBg: 'bg-rose-500'
    },
    {
      title: 'REGISTRO PROFISSIONAL',
      description: 'Controle e acompanhamento detalhado de operações',
      icon: LineChart,
      path: '/dashboard',
      color: 'from-green-500 to-green-600',
      gradient: 'from-green-400/20 via-green-300/10 to-transparent',
      iconBg: 'bg-green-500'
    },
    {
      title: 'CONTROLE DE CONTAS CPF',
      description: 'Gerencie e monitore todas as contas CPF',
      icon: Users,
      path: '/contas-cpf',
      color: 'from-teal-500 to-teal-600',
      gradient: 'from-teal-400/20 via-teal-300/10 to-transparent',
      iconBg: 'bg-teal-500'
    },
    {
      title: 'CALCULADORAS',
      description: 'Ferramentas para cálculos e análises',
      icon: Calculator,
      path: '/calculadoras/aumento',
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-400/20 via-purple-300/10 to-transparent',
      iconBg: 'bg-purple-500'
    },
    {
      title: 'PAINEL AFILIADO',
      description: 'Gerencie suas afiliações e comissões',
      icon: Crown,
      path: '/afiliados',
      color: 'from-amber-500 to-amber-600',
      gradient: 'from-amber-400/20 via-amber-300/10 to-transparent',
      iconBg: 'bg-amber-500'
    },
    {
      title: 'COMUNIDADE TELEGRAM',
      description: 'Participe do nosso grupo no Telegram',
      icon: MessageCircle,
      // Replace with your actual Telegram group URL
      externalLink: 'https://t.me/yourtelegramgroup',
      color: 'from-sky-500 to-sky-600',
      gradient: 'from-sky-400/20 via-sky-300/10 to-transparent',
      iconBg: 'bg-sky-500',
      special: true
    },
    {
      title: 'PLANNER PRO',
      description: 'Organize sua vida financeira com os projetos e atinja suas Metas e Objetivos',
      icon: LineChart,
      path: '/organization',
      color: 'from-indigo-500 to-indigo-600',
      gradient: 'from-indigo-400/20 via-indigo-300/10 to-transparent',
      iconBg: 'bg-indigo-500',
      special: true
    },
    {
      title: 'PROJETOS RENDA EXTRA',
      description: 'Aumente os seus lucros com nossos outros projetos de renda sem risco',
      icon: LineChart,
      path: '/projects',
      color: 'from-emerald-500 to-emerald-600',
      gradient: 'from-emerald-400/20 via-emerald-300/10 to-transparent',
      iconBg: 'bg-emerald-500',
      special: true
    },
  ];

  // Function to handle navigation or external links
  const handleCardClick = (product: any) => {
    if (product.externalLink) {
      window.open(product.externalLink, '_blank');
    } else {
      navigate(product.path);
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#ffffff",
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
              opacity: 0.2,
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
              value: 0.2,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
      />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center py-6 px-3 sm:py-8 sm:px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Bem-vindo ao FreeBet Pro</h1>
            <p className="text-sm sm:text-base text-gray-600">Selecione um módulo para começar</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(product)}
                className={`
                  relative overflow-hidden bg-white rounded-xl sm:rounded-2xl 
                  ${product.special ? 'shadow-xl sm:shadow-2xl border-2 animate-bounce-slow' : 'shadow-lg sm:shadow-xl border border-gray-100'}
                  cursor-pointer transform transition-all duration-300 
                  hover:scale-[1.02] hover:shadow-2xl h-full
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-100`} />
                
                <div className="relative p-4 sm:p-6">
                  <div className={`${product.iconBg} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg mx-auto`}>
                    <product.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <h2 className={`text-base sm:text-lg font-bold bg-gradient-to-r ${product.color} bg-clip-text text-transparent mb-1 sm:mb-2 text-center`}>
                    {product.title}
                  </h2>
                  
                  <p className="text-gray-600 text-xs sm:text-sm text-center">
                    {product.description}
                  </p>
                  
                  <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br ${product.color} opacity-10 blur-2xl rounded-tl-full transform translate-x-12 translate-y-12`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;