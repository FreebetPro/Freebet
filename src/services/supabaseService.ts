import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não definidas!');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
const SALT_ROUNDS = 10;

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Structure the response to match what App component expects
      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email
        },
        token: data.session.access_token,
        message: 'Login bem-sucedido'
      };
    } catch (error) {
      console.error('Erro durante login:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Credenciais inválidas'
      };
    }
  },

  register: async (email: string, password: string) => {
    try {
      // Make sure the authentication registration happens properly
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Make sure a user record is created properly
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{ 
          id: authData.user?.id, 
          email,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (userError) throw userError;

      // Store auth data
      const token = authData.session?.access_token;

      return {
        success: true,
        user: {
          id: authData.user?.id || '',
          email
        },
        token,
        message: 'Registro concluído com sucesso!'
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao se registrar'
      };
    }
  },
  
  async createUserProfile(userId: string, profileData: {
    fullName: string;
    cpf: string;
    birthDate: string;
    whatsapp: string;
    zipCode: string;
    address: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          full_name: profileData.fullName,
          cpf: profileData.cpf,
          birth_date: profileData.birthDate,
          whatsapp: profileData.whatsapp,
          zip_code: profileData.zipCode,
          address: profileData.address
        }])
        .select();

      if (error) {
        console.error('Error creating user profile:', error);
        return { success: false, message: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return { 
        success: false, 
        message: 'Erro ao criar perfil de usuário: ' + (error instanceof Error ? error.message : String(error)) 
      };
    }
  },

  // Verificar se o token é válido
  verifyToken() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { valid: false };
      }
      
      const decoded = JSON.parse(atob(token));
      
      if (!decoded || !decoded.id || !decoded.email) {
        return { valid: false };
      }
      
      return { 
        valid: true, 
        user: {
          id: decoded.id,
          email: decoded.email
        }
      };
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return { valid: false };
    }
  },

  async updateUser(userId: string, updates: { email?: string, password?: string }) {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (updates.email) {
        // Verificar se o novo email já está em uso
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('email', updates.email)
          .neq('id', userId)
          .maybeSingle();
  
        if (checkError) {
          throw new Error('Erro ao verificar email: ' + checkError.message);
        }
  
        if (existingUser) {
          throw new Error('Este email já está em uso');
        }
        
        updateData.email = updates.email;
      }
      
      if (updates.password) {
        // Hash da nova senha com bcryptjs
        updateData.encrypted_password = await bcrypt.hash(updates.password, SALT_ROUNDS);
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select();
      
      if (error) {
        throw error;
      }
      
      return { success: true, user: data[0] };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { 
        success: false, 
        message: 'Erro ao atualizar usuário: ' + (error instanceof Error ? error.message : String(error)) 
      };
    }
  },
  
  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return { 
        success: false, 
        message: 'Erro ao excluir usuário: ' + (error instanceof Error ? error.message : String(error)) 
      };
    }
  }
};