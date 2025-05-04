import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log(container);
  }, []);

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

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tudo Certo!</h1>
          
          <p className="text-lg text-gray-700 mb-6">
            Sua escolha foi registrada com sucesso. Você pode acessar seu painel a qualquer momento utilizando suas credenciais.
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-8 text-left">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">Informações Importantes:</h2>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Utilize o <strong>mesmo email e senha</strong> que você cadastrou durante o registro no painel</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Todas as suas configurações e dados estão preservados</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Você pode atualizar seu plano a qualquer momento através da seção "Assinaturas" no painel</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-600 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Acessar o Painel
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;