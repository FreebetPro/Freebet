import React from 'react';
import { Shield, Check, CreditCard, Lock, Clock, AlertTriangle, Zap, Award, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine, {
      preset: "stars"
    });
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log(container);
  }, []);

  const features = {
    basic: [
      'Crie sua Banca',
      'Registro Operação Profissional', 
      'Controle de CPF\'s profissional',
      'Balanço Financeiro de contas',
      'Cadastro Emprestador',
      'Criação Tarefas Emprestador',
      'Painel Kanban Organização',
      'Calculadoras (Aumento, Lay, Dutching, Surebet)',
      'Painel e Acesso a Afiliação',
      'Grupo Telegram de Notificações',
    ],
    pro: [
      'TODAS AS FUNÇÕES DO PLANO BÁSICO',
      'DEPÓSITO QR CODE AUTOMÁTICO',
      'ALERTA TAREFAS EMPRESTADOR WHATSAPP',
      'Gestão de múltiplas casas',
      'Suporte prioritário',
      'Relatório Semanal de Operações',
    ],
    enterprise: [
      'TODAS AS FUNÇÕES DO PLANO BÁSICO E UPGRADE 1',
      'COPYTRADE AUTOMÁTICO',
      'CALENDÁRIO DE PROMOÇÕES',
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
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
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Painel</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
        </div>

        

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Basic Plan */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-blue-50">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-blue-600" />
                Painel Iniciante
              </h3>
              <p className="text-gray-600 mb-6">Comece sua jornada profissional com todas as ferramentas essenciais para seu sucesso.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$ 79,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <button
                onClick={() => navigate('/checkout/basic')}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                Assinar Agora
              </button>
            </div>
            <div className="bg-gray-50 p-8">
              <ul className="space-y-4">
                {features.basic.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform scale-105 relative z-20 border-2 border-blue-200">
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                Mais Popular
              </span>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Upgrade 1 - Intermediário
              </h3>
              <p className="text-gray-600 mb-6 mt-8">Automatize suas operações e escale seus resultados com ferramentas avançadas.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$ 119,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <button
                onClick={() => navigate('/checkout/pro')}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-lg hover:from-green-700 hover:to-green-500 transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl font-bold text-lg"
              >
                Assinar Agora
              </button>
            </div>
            <div className="bg-gray-50 p-8">
              <ul className="space-y-4">
                {features.pro.map((feature, index) => (
                  <li key={index} className={`flex items-center gap-3 ${[0, 1, 2].includes(index) ? 'font-bold text-blue-700' : ''}`}>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-blue-50">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                Upgrade 2 - Profissional
              </h3>
              <p className="text-gray-600 mb-6">Maximize seus resultados com nossa solução mais completa e exclusiva para profissionais.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$ 169,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <button
                onClick={() => navigate('/checkout/enterprise')}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-medium"
              >
                Assinar Agora
              </button>
            </div>
            <div className="bg-gray-50 p-8">
              <ul className="space-y-4">
                {features.enterprise.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 font-bold text-gray-900">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-green-50 rounded-xl p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-green-900">Pagamento 100% Seguro</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-green-600" />
              <span className="text-green-900">Dados Criptografados</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-green-600" />
              <span className="text-green-900">7 Dias de Garantia</span>
            </div>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="bg-yellow-50 rounded-xl p-6 mb-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <span className="text-yellow-900 font-bold">MODO DE TESTE ATIVO</span>
            </div>
            <div className="text-yellow-800 text-center">
              <p className="mb-2">Use os seguintes cartões para testar:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="font-bold">Pagamento Aprovado</p>
                  <p className="text-sm">5031 4332 1540 6351</p>
                  <p className="text-xs text-gray-600">Qualquer data futura e CVV</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="font-bold">Pagamento Recusado</p>
                  <p className="text-sm">5031 4332 1540 6351</p>
                  <p className="text-xs text-gray-600">Qualquer data futura e CVV</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="font-bold">Erro de Processamento</p>
                  <p className="text-sm">5031 4332 1540 6351</p>
                  <p className="text-xs text-gray-600">Qualquer data futura e CVV</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;