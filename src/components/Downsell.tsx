import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Clock, Crown, Gift, HeartHandshake, LifeBuoy, ShieldCheck, ThumbsUp, Zap, Award, QrCode, UserCheck, Clock3, Calculator } from 'lucide-react';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";

const Downsell: React.FC = () => {
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
    window.open("https://pay.cakto.com.br/freebet-qrcode", "_blank", "noopener,noreferrer");
  };

  const handleSkip = () => {
    navigate('/upsellxdownsell');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <HeartHandshake className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 relative">
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              OFERTA FINAL - ECONOMIZE R$10/MÊS
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 drop-shadow-sm">
              Última Chance: Upgrade 1 por Apenas R$30/mês!
            </span>
          </h1>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 max-w-3xl mx-auto mb-4">
            <p className="text-lg text-blue-800 font-medium">
              Entendemos que você quer mais recursos, mas o preço pode ser um desafio. Por isso, estamos oferecendo o Upgrade 1 por apenas <span className="font-bold">R$30/mês adicional</span> em vez de R$40/mês!
            </p>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            <span className="font-semibold text-blue-600">Oferta por tempo limitado:</span> Adicione automação ao seu plano atual e <span className="underline decoration-blue-500">economize R$10 todo mês</span> enquanto multiplica seus resultados.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg p-4 mb-8 max-w-md mx-auto text-center shadow-xl border-2 border-white">
          <p className="text-lg font-medium mb-2">Sua Oferta Exclusiva Expira Em:</p>
          <div className="text-3xl font-bold">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <p className="text-sm mt-2 text-blue-100">Após este tempo, o preço volta para R$40/mês adicional</p>
        </div>

        {/* Price Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto mb-8 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-center mb-4">Compare os Valores:</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <p className="font-medium text-gray-700">Plano Básico</p>
              <p className="text-xl font-bold text-gray-900">R$79,90/mês</p>
              <p className="text-sm text-gray-500">(seu plano atual)</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="font-medium text-blue-700">Upgrade Normal</p>
              <p className="text-xl font-bold text-blue-800">+R$40,00/mês</p>
              <p className="text-sm text-blue-600">Preço regular</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300">
              <p className="font-medium text-green-700">Oferta Especial</p>
              <p className="text-xl font-bold text-green-800">+R$30,00/mês</p>
              <p className="text-sm text-green-600 font-medium">Economize R$10/mês!</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="font-bold text-lg text-blue-700">Total com desconto: R$109,90/mês</p>
            <p className="text-sm text-gray-600">(em vez de R$119,90/mês)</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-full">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade 1 - Automação Qr Code + Painel Emprestador</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded-full">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">TODAS AS FUNÇÕES DO PLANO BÁSICO</h3>
                  <p className="text-gray-600">Continue com todas as funcionalidades que você já tem acesso no seu plano atual.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded-full animate-pulse">
                  <QrCode className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 text-lg">DEPÓSITO QR CODE AUTOMÁTICO</h3>
                  <p className="text-gray-700">Automatize completamente seus depósitos em <span className="font-bold">centenas de contas simultaneamente</span>. Economize mais de 10 horas por semana de trabalho manual repetitivo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded-full animate-pulse">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 text-lg">PAINEL DO EMPRESTADOR</h3>
                  <p className="text-gray-700">Seus emprestadores podem fazer verificações KYC a qualquer hora, <span className="font-bold">sem depender da sua disponibilidade</span>. Nunca mais perca uma oportunidade por indisponibilidade.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded-full">
                  <Clock3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ALERTA TAREFAS EMPRESTADOR WHATSAPP</h3>
                  <p className="text-gray-600">Receba notificações instantâneas para nunca perder uma oportunidade de verificação.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 p-1 rounded-full">
                  <Calculator className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Relatório Semanal de Operações</h3>
                  <p className="text-gray-600">Receba análises detalhadas para otimizar seus resultados e maximizar lucros.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium">Plano Básico (Atual)</span>
                <span className="text-gray-900 font-bold">R$79,90/mês</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium">Upgrade 1 (Preço Normal)</span>
                <span className="text-gray-500 line-through">+R$40,00/mês</span>
              </div>
              <div className="flex items-center justify-between mb-3 font-bold">
                <span className="text-blue-700">Upgrade 1 (Com Desconto)</span>
                <span className="text-blue-700">+R$30,00/mês</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-blue-200 font-bold text-lg">
                <span className="text-green-700">Total com Desconto</span>
                <span className="text-green-700">R$109,90/mês</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleDownsellClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-cyan-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-3"
              >
                <Gift className="w-5 h-5" /> APROVEITAR DESCONTO DE R$10/MÊS AGORA
              </button>
              <p className="text-blue-600 font-medium">Economize R$120 por ano com esta oferta especial!</p>
              <p className="mt-1 text-gray-500 text-sm">Oferta válida apenas durante o contador acima</p>
            </div>
          </div>

          {/* Right Column - Testimonials & Benefits */}
          <div className="space-y-8">
            {/* Why Choose Us */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Por que adicionar automação ao seu plano:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Segurança Garantida</h4>
                  <p className="text-sm text-gray-600">Seus dados sempre protegidos</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-3">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Economize 15+ Horas/Semana</h4>
                  <p className="text-sm text-gray-600">Automatize tarefas repetitivas e foque no que importa</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    <LifeBuoy className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Suporte Dedicado</h4>
                  <p className="text-sm text-gray-600">Ajuda quando você precisar</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3 animate-pulse">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">ROI de 500%+</h4>
                  <p className="text-sm text-gray-600">Retorno muito superior ao investimento mensal</p>
                </div>
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
                    Este desconto especial de R$10/mês no Upgrade 1 está disponível apenas durante o tempo do contador acima. Após esse período, o preço voltará ao normal de R$40/mês adicional.
                  </p>
                  <p className="text-gray-700 font-medium">
                    Não perca esta oportunidade de economizar R$120,00 por ano e ter acesso a todas as ferramentas de automação para potencializar seus resultados!
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
                Não, obrigado. Continuar com o plano básico
              </button>
            </div>
          </div>
        </div>

        {/* Special Offer Popup */}
        {showSpecialOffer && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md border-2 border-blue-500 animate-bounce-slow z-50">
            <div className="absolute -top-3 -left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              OFERTA FINAL - ECONOMIZE R$10/MÊS
            </div>
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowSpecialOffer(false)}
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Última Chance!</h3>
                <p className="text-gray-600 text-sm mb-2">Adicione o Upgrade 1 por apenas R$30/mês e ganhe:</p>
                <p className="font-medium text-blue-600">1 mês de suporte VIP via WhatsApp + Treinamento de Automação GRÁTIS</p>
              </div>
            </div>
            <button
              onClick={handleDownsellClick}
              className="mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold hover:from-blue-700 hover:to-cyan-600"
            >
              Aproveitar Desconto de R$10/mês Agora <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Downsell;