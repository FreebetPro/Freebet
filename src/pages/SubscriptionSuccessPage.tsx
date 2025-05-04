import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pagamento Processado!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sua assinatura foi ativada com sucesso. Você será redirecionado para o dashboard em alguns segundos.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Próximos Passos</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Acesse todas as funcionalidades do seu plano
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Configure suas preferências no dashboard
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Explore os recursos disponíveis
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 