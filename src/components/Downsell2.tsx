import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Clock, Crown, Gift, HeartHandshake, LifeBuoy, ShieldCheck, ThumbsUp, Bot, Copy, Award, QrCode, UserCheck, Zap, Sparkles, Clock3, Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";

const Downsell2: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    minutes: 10,
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

  const handleDownsellClick = () => {
    window.open("https://pay.cakto.com.br/freebet-copytrade", "_blank", "noopener,noreferrer");
  };

  const handleSkip = () => {
    navigate('/thank-you');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 relative overflow-hidden">
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
              value: "#6b21a8",
            },
            links: {
              color: "#6b21a8",
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
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
            <Bot className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 relative">
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              ÚLTIMA CHANCE - OFERTA FINAL
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 drop-shadow-md">
              Upgrade 2 com 20% de Desconto! <span className="text-green-500">MULTIPLIQUE SEUS RESULTADOS</span>
            </span>
          </h1>
          <div className="bg-purple-900 text-white p-6 rounded-xl max-w-3xl mx-auto mt-4 shadow-lg border-2 border-purple-400">
            <p className="text-xl font-bold mb-3">
              <span className="text-purple-300">Oferta final personalizada:</span> O CopyTrade Automático vai <span className="text-green-400 underline">ECONOMIZAR HORAS DE TRABALHO</span> para você!
            </p>
            <p className="text-lg mb-3">
              Entendemos que você quer automatizar suas operações e <span className="font-bold text-yellow-300">COPIAR DE 1 PARA 500 CONTAS</span> sem esforço. Por isso, preparamos este desconto <span className="underline decoration-purple-300 font-bold">EXCLUSIVO E LIMITADO</span> só para você.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-purple-800 p-3 rounded-lg flex items-start gap-2">
                <Clock className="w-5 h-5 text-purple-300 mt-1" />
                <div>
                  <p className="font-bold text-purple-200">Economize 20+ horas/semana</p>
                  <p className="text-sm text-purple-300">Automatize tarefas repetitivas</p>
                </div>
              </div>
              <div className="bg-purple-800 p-3 rounded-lg flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-purple-300 mt-1" />
                <div>
                  <p className="font-bold text-purple-200">Aumente lucros em 50%+</p>
                  <p className="text-sm text-purple-300">Opere mais contas simultaneamente</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg text-purple-700 font-semibold mt-5">
            ⚡ Economize R$30/mês e transforme sua operação com o CopyTrade Automático! ⚡
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg p-4 mb-12 max-w-md mx-auto text-center shadow-xl border-2 border-white">
          <p className="text-lg font-medium mb-2">Sua Oferta Exclusiva Expira Em:</p>
          <div className="text-3xl font-bold">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <p className="text-sm mt-2 text-purple-100">Esta oferta não será repetida</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade 2 - Plano Profissional Completo</h2>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-800">
                  Economize 20% - Apenas R$119,90/mês em vez de R$149,90/mês!
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Check className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">TODAS AS FUNÇÕES DO PLANO BÁSICO</h3>
                  <p className="text-gray-600">Você mantém acesso a todas as funcionalidades do seu plano atual:</p>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1 pl-4">
                    <li>• Registro de Operações Profissional</li>
                    <li>• Controle de CPFs</li>
                    <li>• Balanço Financeiro</li>
                    <li>• Calculadoras Avançadas</li>
                    <li>• Painel Kanban de Organização</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded-full">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 text-lg">TODAS AS FUNÇÕES DO UPGRADE 1</h3>
                  <p className="text-gray-600">Você também recebe todas as ferramentas de automação do Upgrade 1:</p>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1 pl-4">
                    <li className="flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-blue-600" /> 
                      <span>Depósito QR Code Automático</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-blue-600" /> 
                      <span>Painel do Emprestador</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <Clock3 className="w-3 h-3 text-blue-600" /> 
                      <span>Alertas de Tarefas via WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <Calculator className="w-3 h-3 text-blue-600" /> 
                      <span>Relatórios Semanais Detalhados</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 text-lg">COPYTRADE AUTOMÁTICO - EXCLUSIVO DO PLANO PROFISSIONAL</h3>
                  <p className="text-gray-700">Replique apostas automaticamente em <span className="font-bold">500+ contas simultaneamente</span> com um único clique. <span className="font-bold text-green-600">Economize horas de trabalho manual!</span></p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1 pl-4">
                    <li>• Opere em escala sem esforço adicional</li>
                    <li>• Reduza o tempo de operação de 5 horas para 20 minutos</li>
                    <li>• Aumente o volume de apostas em até 500%</li>
                    <li>• Elimine erros humanos nas operações</li>
                    <li>• Monitore resultados em tempo real</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Copy className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">CALENDÁRIO DE PROMOÇÕES - EXCLUSIVO</h3>
                  <p className="text-gray-600">Acesso antecipado a todas as promoções das casas de apostas, permitindo que você:</p>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1 pl-4">
                    <li>• Planeje suas operações com antecedência</li>
                    <li>• Nunca perca uma oportunidade de promoção</li>
                    <li>• Maximize seus ganhos em cada casa</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-100 p-1 rounded-full">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">GRUPO VIP DE OPERADORES PROFISSIONAIS</h3>
                  <p className="text-gray-600">Participe do nosso grupo exclusivo com os melhores operadores do mercado:</p>
                  <ul className="text-gray-600 text-sm mt-1 space-y-1 pl-4">
                    <li>• Compartilhe estratégias com profissionais</li>
                    <li>• Receba alertas de oportunidades em tempo real</li>
                    <li>• Acesso a webinars exclusivos mensais</li>
                    <li>• Suporte prioritário 24/7</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-5 rounded-lg mb-6 border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3 text-lg">Comparação de Tempo e Resultados:</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Plano Básico:</span>
                  <span className="font-medium">5+ horas de trabalho manual/dia</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Com Upgrade 1:</span>
                  <span className="font-medium">2-3 horas de trabalho/dia</span>
                </div>
                <div className="flex justify-between items-center font-bold text-purple-900">
                  <span>Com Plano Profissional:</span>
                  <span>Apenas 20 minutos/dia!</span>
                </div>
                <div className="pt-2 border-t border-purple-200 mt-2">
                  <p className="font-bold text-green-700 text-center">
                    Economize 95% do seu tempo com o CopyTrade Automático!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Preço Upgrade 2</span>
                <span className="text-gray-500 line-through">R$ 149,90/mês</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-purple-700">Oferta Final (20% OFF)</span>
                <span className="text-purple-700">R$ 119,90/mês</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleDownsellClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-3"
              >
                <Gift className="w-5 h-5" /> APROVEITAR DESCONTO DE 20% AGORA
              </button>
              <p className="text-purple-700 font-medium">Economize R$360 por ano com esta oferta especial!</p>
              <p className="mt-1 text-gray-500 text-sm">Oferta válida apenas durante o contador acima</p>
            </div>
          </div>

          {/* Right Column - Testimonials & Benefits */}
          <div className="space-y-8">
            {/* Why Choose Us */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Por que escolher o Plano Profissional Completo:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-purple-100 p-3 rounded-full mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Economize 20+ horas</h4>
                  <p className="text-sm text-gray-600">Automatize completamente suas operações</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center text-center border border-green-100">
                  <div className="bg-purple-100 p-3 rounded-full mb-3">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-green-800 mb-1">500+ Contas Simultâneas</h4>
                  <p className="text-sm text-green-700">Opere em escala sem esforço adicional</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-purple-100 p-3 rounded-full mb-3">
                    <LifeBuoy className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Suporte 24/7</h4>
                  <p className="text-sm text-gray-600">Ajuda especializada a qualquer momento</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center text-center border border-green-100">
                  <div className="bg-purple-100 p-3 rounded-full mb-3">
                    <ThumbsUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-green-800 mb-1">Aumento de ROI em 50%+</h4>
                  <p className="text-sm text-green-700">Resultados comprovados por usuários reais</p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">O que dizem nossos usuários:</h3>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                <p className="italic text-purple-800">
                  "Eu hesitei muito antes de assinar o Plano Profissional, mas depois que vi o CopyTrade Automático funcionando, percebi que estava perdendo dinheiro todos os dias sem ele. Meu único arrependimento é não ter começado antes!"
                </p>
                <p className="text-right text-purple-900 font-bold mt-2">— Carlos Mendonça</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="italic text-purple-800">
                  "Comecei com o plano básico, depois tentei o intermediário, mas quando finalmente atualizei para o Profissional, minha operação mudou completamente. O CopyTrade Automático é um divisor de águas - consigo operar 10x mais contas no mesmo tempo."
                </p>
                <p className="text-right text-purple-900 font-bold mt-2">— Fernanda Oliveira</p>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 rounded-2xl shadow-lg p-6 border border-amber-200">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Oferta Exclusiva por Tempo Limitado</h3>
                  <p className="text-gray-700 mb-2">
                    Este desconto especial de 20% no Plano Profissional está disponível apenas durante o tempo do contador acima. Após esse período, o preço voltará ao normal de R$149,90/mês.
                  </p>
                  <p className="text-gray-700 font-medium">
                    Não perca esta oportunidade de economizar R$30,00 por mês (R$360/ano) e ter acesso ao CopyTrade Automático para potencializar seus resultados!
                  </p>
                </div>
              </div>
            </div>

            {/* Skip Button */}
            <div className="text-center">
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Não, obrigado. Continuar com o plano atual
              </button>
            </div>
          </div>
        </div>

        {/* Special Offer Popup */}
        {showSpecialOffer && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md border-2 border-purple-500 animate-bounce-slow z-50">
            <div className="absolute -top-3 -left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              OFERTA FINAL - 20% OFF
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
                <h3 className="font-bold text-gray-900 text-lg">Bônus Exclusivo!</h3>
                <p className="text-gray-600 text-sm mb-2">Assine o Plano Profissional com 20% de desconto e ganhe:</p>
                <p className="font-medium text-purple-600">Acesso antecipado ao novo Bot de Abertura de Contas + 30 dias de suporte VIP</p>
              </div>
            </div>
            <button
              onClick={handleDownsellClick}
              className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-600 flex items-center justify-center gap-2"
            >
              Aproveitar Agora <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Downsell2;