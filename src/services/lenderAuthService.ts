import { supabase } from '../services/supabaseService';

export interface Lender {
  id: string;
  email: string;
  nome?: string;
  created_at?: string;
  additionalData?: any;
}

export const lenderAuthService = {
  /**
   * Verify if lender is logged in
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('lender_token');
    const lenderData = localStorage.getItem('lender_data');
    return !!token && !!lenderData;
  },

  /**
   * Get current logged in lender data
   */
  getCurrentLender: (): Lender | null => {
    try {
      const lenderData = localStorage.getItem('lender_data');
      return lenderData ? JSON.parse(lenderData) : null;
    } catch (error) {
      console.error('Error parsing lender data:', error);
      return null;
    }
  },

  /**
   * Login lender with email and password
   */
  login: async (email: string, password: string) => {
    try {
      // Check if lender exists in the emprestadores table
      const { data: emprestador, error: emprestadorError } = await supabase
        .from('emprestadores')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
        
      if (emprestadorError || !emprestador) {
        return {
           success: false,
           message: 'Email ou senha inválidos'
         };
      }
        
      // Verify password (in production, you should use hashed passwords)
      if (emprestador.password !== password) {
        return {
           success: false,
           message: 'Email ou senha inválidos'
         };
      }
        
      // Fetch additional lender data from related table if needed
      const { data: additionalData } = await supabase
        .from('emprestador_details') // Replace with your actual related table
        .select('*')
        .eq('emprestador_id', emprestador.id)
        .single();
        
      // Create a simple token (in production use a proper JWT)
      const token = 'lender_' + Date.now();
        
      // Store lender data and token
      localStorage.setItem('lender_token', token);
      localStorage.setItem('lender_data', JSON.stringify({
        ...emprestador,
        additionalData: additionalData || null
      }));
        
      return {
        success: true,
        lender: emprestador,
        additionalData,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao tentar fazer login'
      };
    }
  },

  /**
   * Logout lender
   */
  logout: () => {
    localStorage.removeItem('lender_token');
    localStorage.removeItem('lender_data');
    return true;
  }
};