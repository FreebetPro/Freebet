import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Clock, Star, Shield, Gift, Award, Rocket, Crown, Bot, Copy, Zap, Sparkles, AlertTriangle, Calculator, QrCode, UserCheck, Clock3, DollarSign, TrendingUp, ChevronRight, CheckCircle2, Layers, Lightbulb } from 'lucide-react';
import { loadSlim } from "tsparticles-slim";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";

const UpsellxDownsell: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    minutes: 10,
    seconds: 0
  });
  const [showSpecialOffer, setShowSpecialOffer] = useState(false);
  const [activeTab, setActiveTab] = useState<'upgrade1' | 'upgrade2'>('upgrade2');

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
    window.open("https://pay.cakto.com.br/k6mtzu4", "_blank", "noopener,noreferrer");
  };

  const handleSkip = () => {
    navigate('/');
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
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4 animate-pulse">
            <Lightbulb className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 relative">
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg">
              ÚLTIMA CHANCE - ESCOLHA SEU UPGRADE
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              Entendemos Suas Necessidades! Escolha a Melhor Opção
            </span>
          </h1>
          <div className="bg-purple-900 text-white p-6 rounded-xl max-w-4xl mx-auto mt-4 shadow-lg border-2 border-purple-400">
            <p className="text-xl font-bold mb-3">
              <span className="text-purple-300">Você rejeitou nossas ofertas anteriores, mas queremos que você tenha sucesso!</span> Escolha a opção que melhor se adapta às suas necessidades:
            </p>
            <div className="mt-4">
              <div className="bg-purple-800 p-4 rounded-lg flex items-start gap-3 max-w-xl mx-auto">
                <Bot className="w-6 h-6 text-purple-300 mt-1" />
                <div>
                  <p className="font-bold text-purple-200 text-lg">Upgrade 2 - Automação Total</p>
                  <p className="text-sm text-purple-300">CopyTrade Automático + todas as funcionalidades premium</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-5">
            Você já tem o Plano Básico. Agora, adicione automação total com o CopyTrade Automático ao seu plano atual.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg p-4 mb-8 max-w-md mx-auto text-center shadow-xl border-2 border-white">
          <p className="text-lg font-medium mb-2">Oferta Especial Expira Em:</p>
          <div className="text-3xl font-bold">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <p className="text-sm mt-2 text-purple-100">Esta oferta não será repetida</p>
        </div>

        {/* Tabs */}

        {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Features */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upgrade 2 - Plano Profissional</h2>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-800">
                    Economize 20% - Apenas R$90,00/mês em vez de R$110,00/mês!
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1 rounded-full">
                    <Layers className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">PACOTE COMPLETO DE AUTOMAÇÃO</h3>
                    <p className="text-gray-600">Você recebe <span className="font-bold">TODAS as funcionalidades</span> do Plano Básico + Upgrade 1 + Upgrade 2 em um único pacote:</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 p-1 rounded-full">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700 text-lg">TODAS AS FUNÇÕES DO UPGRADE 1</h3>
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
                  <div className="mt-1 bg-purple-100 p-1 rounded-full animate-pulse">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 text-lg">COPYTRADE AUTOMÁTICO - EXCLUSIVO DO PLANO PROFISSIONAL</h3>
                    <p className="text-gray-700">Replique apostas automaticamente em <span className="font-bold">500+ contas simultaneamente</span> com um único clique.</p>
                    <div className="bg-purple-50 p-3 rounded-lg mt-2 border border-purple-100">
                      <p className="text-sm text-purple-800">
                        <span className="font-bold">Como funciona:</span> Faça uma aposta na conta principal e o sistema automaticamente replica em todas as contas selecionadas, ajustando stakes e odds conforme necessário.
                      </p>
                    </div>
                    <ul className="text-gray-600 text-sm mt-2 space-y-1 pl-4">
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
                    <span className="font-medium">5+ horas de trabalho/dia</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Com Upgrade 1:</span>
                    <span className="font-medium">2-3 horas de trabalho/dia</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-purple-900">
                    <span>Com Plano Profissional:</span>
                    <span>Apenas 20 minutos/dia</span>
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
                  <span className="text-gray-500 line-through">R$ 169,90/mês</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-purple-700">Apenas a diferença (com desconto)</span>
                  <span className="text-purple-700">R$ 90,00/mês</span>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleUpgradeClick}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-3"
                >
                  <Gift className="w-5 h-5" /> FAZER UPGRADE POR APENAS R$90/MÊS
                </button>
                <p className="text-purple-700 font-medium">Você já tem o plano básico de R$79,90/mês</p>
                <p className="mt-1 text-green-600 font-bold">Pague apenas a diferença de R$90,00/mês!</p>
              </div>
            </div>

            {/* Right Column - Benefits */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Vantagens Exclusivas do CopyTrade Automático:</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800">Economize 20+ Horas/Semana</h4>
                      <p className="text-gray-600">O CopyTrade Automático reduz drasticamente o tempo necessário para operar múltiplas contas, permitindo que você foque em estratégias e análises.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800">Aumente seus Lucros em 50%+</h4>
                      <p className="text-gray-600">Ao operar mais contas simultaneamente, você multiplica seus resultados sem esforço adicional, maximizando seu ROI.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800">Elimine Erros Humanos</h4>
                      <p className="text-gray-600">O sistema automatizado garante precisão em cada operação, eliminando erros comuns que ocorrem durante operações manuais repetitivas.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Depoimentos de Usuários do Plano Profissional:</h3>
                
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
                    <p className="text-gray-700 font-medium text-center mt-3">
                      <span className="text-green-700 font-bold text-lg">Plano Básico: R$79,90/mês (já assinado)</span><br/>
                      <span className="text-purple-700 font-bold text-lg">Upgrade 2: +R$90,00/mês (apenas a diferença)</span><br/>
                      <span className="text-blue-700 font-bold text-lg mt-2 block">Total: R$169,90/mês</span>
                    </p>
                  </div>
                </div>
              </div>
              
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
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 max-w-md border-2 border-purple-500 animate-bounce-slow z-50">
            <div className="absolute -top-3 -left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              OFERTA FINAL - ÚLTIMA CHANCE
            </div>
            <button 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowSpecialOffer(false)}
            >
              ✕
            </button>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Bônus Exclusivo!</h3>
                <p className="text-gray-600 mb-2">Assine qualquer upgrade nos próximos 10 minutos e ganhe:</p>
                <p className="font-medium text-purple-600 mb-3">Acesso antecipado ao novo Bot de Abertura de Contas + 30 dias de suporte VIP</p>
                <button 
                  onClick={handleUpgradeClick}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Bot className="w-5 h-5" /> Pagar Apenas R$90/mês
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpsellxDownsell;