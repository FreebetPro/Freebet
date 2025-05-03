import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, ArrowRight, Clock, Star, Shield, Gift, ChevronRight, Award, Rocket, Crown, QrCode, AlertCircle, Clock3, UserCheck } from 'lucide-react';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";

const Upsell: React.FC = () => {
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
    window.open("https://pay.cakto.com.br/freebet-qrcode", "_blank", "noopener,noreferrer");
  };

  const handleSkip = () => {
    navigate('/downsell');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
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
              value: "#4f46e5",
            },
            links: {
              color: "#4f46e5",
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
          <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
            <Crown className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 drop-shadow-sm">
              Parabéns! Seu Plano Básico está Ativo
            </span>
          </h1>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-3xl mx-auto mb-4">
            <div className="flex items-center gap-2 text-green-700 font-bold">
              <Check className="w-5 h-5 text-green-600" />
              <span>Seu acesso ao Painel Iniciante está garantido!</span>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-2">
            <span className="font-semibold">Oportunidade única:</span> Potencialize seus resultados com automação e economize <span className="font-bold text-indigo-600">horas de trabalho manual</span> todos os dias.
          </p>
        </div>

        {/* Key Benefits Banner */}
        <div className="bg-indigo-900 text-white rounded-xl p-6 max-w-4xl mx-auto mb-12 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Economize Tempo e Aumente seus Resultados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-700 p-3 rounded-full">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-indigo-200">Depósito QR Automático</h3>
                <p className="text-indigo-100">Faça depósitos em 500+ contas sem precisar logar em cada casa de apostas. Economize <span className="font-bold text-white">10+ horas por semana</span>.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-indigo-700 p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-indigo-200">Painel do Emprestador</h3>
                <p className="text-indigo-100">Seus emprestadores podem fazer verificações KYC a qualquer hora, sem sua intervenção. <span className="font-bold text-white">Nunca mais perca uma oportunidade</span>.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg p-4 mb-8 max-w-md mx-auto text-center shadow-lg border-2 border-white">
          <p className="text-lg font-medium mb-2">Oferta Especial Expira Em:</p>
          <div className="text-3xl font-bold">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <p className="text-sm mt-2 text-blue-100">Esta oferta não será repetida</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Rocket className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade 1 - Automação Qr Code + Painel Emprestador</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 p-1 rounded-full">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">SEU PLANO BÁSICO CONTINUA GARANTIDO</h3>
                  <p className="text-gray-600">Você já tem acesso ao Painel Iniciante. Este upgrade <span className="font-semibold">adiciona automação</span> ao seu plano atual.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-100 p-1 rounded-full animate-pulse">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-700 text-lg">DEPÓSITO QR CODE AUTOMÁTICO</h3>
                  <p className="text-gray-700">Faça depósitos em centenas de contas <span className="font-bold">sem precisar logar em cada casa</span>. Economize mais de 10 horas por semana de trabalho manual.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-100 p-1 rounded-full animate-pulse">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-700 text-lg">PAINEL DO EMPRESTADOR</h3>
                  <p className="text-gray-700">Seus emprestadores podem fazer verificações KYC a qualquer hora, <span className="font-bold">sem depender da sua disponibilidade</span>. Nunca mais perca uma oportunidade por indisponibilidade do emprestador.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-100 p-1 rounded-full">
                  <Clock3 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ALERTA TAREFAS EMPRESTADOR WHATSAPP</h3>
                  <p className="text-gray-600">Receba notificações instantâneas para nunca perder uma oportunidade de verificação.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-100 p-1 rounded-full">
                  <Star className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gestão de múltiplas casas</h3>
                  <p className="text-gray-600">Gerencie todas as suas casas de apostas em um único lugar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-100 p-1 rounded-full">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Suporte prioritário</h3>
                  <p className="text-gray-600">Tenha suas dúvidas respondidas com prioridade máxima.</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg mb-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Plano Básico (Já Ativo)</span>
                <span className="text-gray-500">R$ 79,90/mês</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-indigo-700">Upgrade 1 - Intermediário</span>
                <span className="text-indigo-700">+ R$ 40,00/mês</span>
              </div>
              <div className="flex items-center justify-between font-bold mt-2 text-lg">
                <span className="text-green-700">Total com Desconto</span>
                <span className="text-green-700">R$ 119,90/mês</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleUpgradeClick}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-blue-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl mb-4"
              >
                ADICIONAR AUTOMAÇÃO AO MEU PLANO
              </button>
              <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Acesso imediato a todas as funcionalidades</span>
              </div>
            </div>
          </div>

          {/* Right Column - Testimonials & Benefits */}
          <div className="space-y-8">
            {/* Testimonials */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">O que nossos usuários dizem sobre a automação:</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      MS
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Marcos Silva</p>
                      <div className="flex text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">"Depois que adicionei o Upgrade 1, minha produtividade aumentou em 300%. O depósito QR automático economiza mais de 3 horas do meu dia! Consigo operar muito mais contas no mesmo tempo."</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      AR
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ana Rodrigues</p>
                      <div className="flex text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">"O painel do emprestador mudou tudo! Antes eu perdia oportunidades porque meus emprestadores não estavam disponíveis quando eu precisava. Agora eles fazem tudo sozinhos a qualquer hora!"</p>
                </div>
              </div>
            </div>

            {/* ROI Calculator */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Calculadora de Retorno</h3>
              <p className="text-gray-600 mb-4">Com as ferramentas avançadas do Plano Intermediário:</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-700">Tempo economizado por semana com QR automático</span>
                  <span className="font-bold text-indigo-600">10+ horas</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-700">Tempo economizado com painel do emprestador</span>
                  <span className="font-bold text-indigo-600">5+ horas</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-700">Aumento de contas operadas</span>
                  <span className="font-bold text-indigo-600">+200%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span className="text-indigo-700 font-medium">Valor do seu tempo economizado por mês</span>
                  <span className="font-bold text-indigo-700">R$ 1.500,00+</span>
                </div>
              </div>
            </div>

            {/* Skip Button */}
            <div className="text-center">
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Não, obrigado. Continuar apenas com o plano básico
              </button>
            </div>
          </div>
        </div>

        {/* Special Offer Popup */}
        {showSpecialOffer && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md border-2 border-indigo-500 animate-bounce-slow z-50">
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
              <div className="bg-indigo-100 p-3 rounded-full">
                <Gift className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Bônus Exclusivo!</h3>
                <p className="text-gray-600 text-sm mb-2">Adicione a automação nos próximos 15 minutos e ganhe:</p>
                <p className="font-medium text-indigo-600">1 mês de suporte VIP via WhatsApp + Treinamento exclusivo de automação</p>
              </div>
            </div>
            <button
              onClick={handleUpgradeClick}
              className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-blue-600"
            >
              Aproveitar Agora <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upsell;