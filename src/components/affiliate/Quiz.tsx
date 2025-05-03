import React, { useState } from 'react';

const questions = [
  {
    question: "Qual é sua experiência com marketing digital?",
    options: [
      "Sou iniciante, nunca trabalhei com isso",
      "Tenho alguma experiência, mas nada profissional",
      "Já trabalho na área há algum tempo"
    ]
  },
  {
    question: "Quanto tempo você pode dedicar ao trabalho como afiliado?",
    options: [
      "Menos de 1 hora por dia",
      "Entre 1 e 3 horas por dia",
      "Mais de 3 horas por dia"
    ]
  },
  {
    question: "Qual seu principal objetivo como afiliado?",
    options: [
      "Renda extra",
      "Substituir minha renda atual",
      "Construir um negócio online"
    ]
  }
];

const Quiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-6">
          Parabéns! Você está pronto para começar sua jornada como afiliado.
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Para aprender mais e fazer sua primeira venda, acesse nosso Mini Curso Gratuito:
        </p>
        <div className="text-center">
          <a
            href="https://www.freebet.pro.br/mini-curso-afiliado"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Acessar Mini Curso
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-8">
        Quiz: Descubra seu Potencial como Afiliado
      </h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">
          {questions[currentQuestion].question}
        </h3>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full p-4 text-left rounded-lg transition-colors ${
                selectedOption === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`px-6 py-2 rounded-lg transition-colors ${
            selectedOption === null
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;