// ThemeContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Interface para o contexto do tema
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Interface para as props do provider
interface ThemeProviderProps {
  children: ReactNode;
}

// Valor padrão para o contexto
const defaultThemeContext: ThemeContextType = {
  darkMode: false,
  toggleDarkMode: () => {}
};

// Criando o contexto de tema
const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

// Provider que será usado no componente raiz da aplicação
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Verifica o localStorage primeiro, depois a preferência do sistema
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplica o modo escuro ao documento quando alterado
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Função para alternar entre os modos
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar o tema
export const useTheme = (): ThemeContextType => useContext(ThemeContext);