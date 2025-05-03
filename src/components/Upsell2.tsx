import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Clock, Star, Shield, Gift, ChevronRight, Award, Rocket, Crown, Bot, Copy, Zap, Sparkles, DollarSign } from 'lucide-react';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";

const Upsell2: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    minutes: 15,
    seconds: 0
  });
  const [showSpecialOffer, setShowSpecialOffer] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log(container);
  }, []);

  useEffect(() => {
    // Show special offer after 5 seconds
    const timer = setTimeout(() => {
      setShowSpecialOffer(true);
    }, 5000);

    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds === 0) {
          if (prev.minutes === 0) {
            clearInterval(interval);
            return prev;
          }
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);


    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleUpgradeClick = () => {
    window.open("https://pay.cakto.com.br/freebet-copytrade", "_blank", "noopener,noreferrer");
  };

  const handleSkip = () => {
    navigate('/thank-you');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 relative overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        className="absolute inset-0"
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: "#6d28d9",
            },
            links: {
              color: "#6d28d9",
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-purple-100 rounded-full mb-4">
            <Bot className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 relative">
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              OFERTA EXCLUSIVA PARA VOCÊ
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              Adicione o CopyTrade Automático ao Seu Plano!
            </span>
          </h1>          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 max-w-3xl mx-auto mb-4">
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              Aumente seus lucros em +50% com CopyTrade Automático
            </h2>
            <p className="text-lg text-purple-700">
              Imagine executar <span className="font-bold">50+ contas simultaneamente</span> com apenas 1 clique!
            </p>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-5">
            Você já tem o Upgrade 1. Agora, <span className="font-semibold">libere seu tempo</span> e <span className="font-semibold">maximize seus resultados</span> com nosso sistema de automação completa.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg p-4 mb-12 max-w-md mx-auto text-center shadow-lg">
          <p className="text-lg font-medium mb-2">Oferta Especial Expira Em:</p>
          <div className="text-3xl font-bold">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-full animate-pulse">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade 2 - Plano Profissional</h2>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200 shadow-md">
              <div className="flex items-center gap-2 justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="font-bold text-green-800 text-lg">
                  Pague apenas a diferença: R$50,00/mês!
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">TODAS AS FUNÇÕES DO PLANO BÁSICO E UPGRADE 1</h3>
                  <p className="text-gray-600 text-sm">Continue com todas as funcionalidades que você já tem acesso,
                  incluindo QR Code Automático e Painel do Emprestador.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 text-lg">COPYTRADE AUTOMÁTICO</h3>
                  <p className="text-gray-700 text-sm">Replique apostas automaticamente em <span className="font-bold">50+ contas simultaneamente</span> com um único clique. Economize até <span className="font-bold">20 horas por semana</span> e aumente seus lucros em pelo menos <span className="font-bold">50%</span>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Copy className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">CALENDÁRIO DE PROMOÇÕES</h3>
                  <p className="text-gray-600 text-sm">Acesso antecipado a todas as promoções das casas de apostas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">ACESSO EXCLUSIVO AO GRUPO VIP</h3>
                  <p className="text-gray-600 text-sm">Participe do nosso grupo exclusivo com os melhores operadores.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">AUTOMAÇÃO COMPLETA DE OPERAÇÕES</h3>
                  <p className="text-gray-600 text-sm">Economize horas com nossas ferramentas de automação avançada.</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Seu Plano Atual (Básico + Upgrade 1)</span>
                <span className="text-gray-500">R$ 119,90/mês</span>
              </div>              
              <div className="flex items-center justify-between font-bold">
                <span className="text-purple-700">Upgrade para Plano Profissional</span>
                <span className="text-purple-700">+R$ 50,00/mês</span>
              </div>
              <div className="flex items-center justify-between font-bold mt-2 pt-2 border-t border-purple-200">
                <span className="text-green-700">Total Final</span>
                <span className="text-green-700">R$ 169,90/mês</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleUpgradeClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl mb-4"
              >
                ADICIONAR COPYTRADE POR APENAS R$50/MÊS
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Não quero o CopyTrade agora, seguir para acesso ao painel
              </button>
              <p className="mt-3 text-gray-500 text-sm">Acesso imediato a todas as funcionalidades</p>
            </div>
          </div>

          {/* Right Column - Testimonials & Benefits */}
          <div className="space-y-8">
            {/* Testimonials */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">O que dizem nossos usuários profissionais:</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      RL
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ricardo Lima</p>
                      <div className="flex text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">"O CopyTrade automático mudou completamente minha operação. Consigo gerenciar 50+ contas simultaneamente sem esforço. Meu ROI aumentou 35% no primeiro mês!"</p>
                </div>
                
                <div className="bg-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-purple-800 font-medium italic">
                    "Antes eu passava 5 horas por dia fazendo operações manualmente. Com o CopyTrade Automático, reduzi para apenas 20 minutos e aumentei meus lucros em 57%. É como ter um assistente trabalhando 24/7 para você!"
                  </p>
                  <p className="text-right text-purple-700 font-bold mt-2">— Paulo Mendes, Operador Profissional</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      CF
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Carla Ferreira</p>
                      <div className="flex text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">"O calendário de promoções é incrível! Consigo planejar minhas operações com antecedência e aproveitar todas as oportunidades. Já economizei mais de R$ 3.000 em apenas dois meses."</p>
                </div>
              </div>
            </div>

            {/* ROI Calculator */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Retorno do Investimento</h3>
              <p className="text-gray-600 mb-4">Com as ferramentas avançadas do Plano Profissional:</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Tempo economizado por semana</span>
                  <span className="font-bold text-purple-600">20+ horas</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Aumento médio de ROI</span>
                  <span className="font-bold text-purple-600">+50%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Valor economizado por mês</span>
                  <span className="font-bold text-purple-600">R$ 2.500,00+</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-purple-700 font-medium">Retorno sobre investimento</span>
                  <span className="font-bold text-purple-700">20x o valor adicional</span>
                </div>
              </div>
            </div>

            {/* Skip Button */}
            {/* Skip button moved to below the upgrade card */}
          </div>
        </div>

        {/* Special Offer Popup */}
        {showSpecialOffer && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md border-2 border-purple-500 animate-bounce-slow z-50">
            <div className="absolute -top-3 -left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              BÔNUS EXCLUSIVO
            </div>
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowSpecialOffer(false)}
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Oferta Especial!</h3>
                <p className="text-gray-600 text-sm mb-2">Faça upgrade nos próximos 15 minutos e ganhe:</p>
                <p className="font-medium text-purple-600">Acesso antecipado ao novo Bot de Abertura de Contas + 30 dias de suporte VIP</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleUpgradeClick}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-600 flex items-center justify-center"
              >
                <Bot className="w-5 h-5 mr-2" /> Adicionar CopyTrade por R$50/mês
              </button>
              <p className="text-center text-xs text-purple-600 mt-2 font-medium">Você já tem o Upgrade 1, pague apenas a diferença!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upsell2;