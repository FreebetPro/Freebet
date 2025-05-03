import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Save, Edit2, AlertCircle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCPF, formatPhone, formatCEP } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../utils/themecontext';
interface UserProfileProps {
  userId: string | null;
}

interface UserProfileData {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  whatsapp: string;
  zip_code: string;
  address: string;
  email: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfileData>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    checkSession();
  }, [userId]);

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        // No active session, redirect to login
        navigate('/login');
        return;
      }

      if (userId) {
        fetchUserProfile(userId);
      } else {
        setLoading(false);
        setError('Usuário não autenticado');
      }
    } catch (err) {
      console.error('Session check error:', err);
      setError('Erro ao verificar sessão');
      setLoading(false);
      navigate('/login');
    }
  };

  const fetchUserProfile = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      // First get the user's email from auth.users
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      // Then get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        const fullProfile = {
          ...profileData,
          email: userData.user.email || '',
          id: uid
        };
        
        setProfile(fullProfile);
        setFormData(fullProfile);
      } else {
        // No profile found, but we still have the email
        setProfile({
          id: uid,
          full_name: '',
          cpf: '',
          birth_date: '',
          whatsapp: '',
          zip_code: '',
          address: '',
          email: userData.user.email || ''
        });
        
        setFormData({
          id: uid,
          full_name: '',
          cpf: '',
          birth_date: '',
          whatsapp: '',
          zip_code: '',
          address: '',
          email: userData.user.email || ''
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Apply formatters for specific fields
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'whatsapp') {
      formattedValue = formatPhone(value);
    } else if (name === 'zip_code') {
      formattedValue = formatCEP(value);
    }
    
    setFormData({ ...formData, [name]: formattedValue });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    
    try {
      setSaveStatus('saving');
      
      // Validate required fields
      if (!formData.full_name || !formData.cpf || !formData.birth_date || !formData.whatsapp) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name,
            cpf: formData.cpf,
            birth_date: formData.birth_date,
            whatsapp: formData.whatsapp,
            zip_code: formData.zip_code,
            address: formData.address
          })
          .eq('user_id', userId)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            full_name: formData.full_name,
            cpf: formData.cpf,
            birth_date: formData.birth_date,
            whatsapp: formData.whatsapp,
            zip_code: formData.zip_code,
            address: formData.address
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Update local state with the result
      setProfile({
        ...result,
        email: formData.email || '',
        id: userId
      });
      
      setSaveStatus('success');
      setIsEditing(false);
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const handleSavePassword = async () => {
    try {
      setPasswordError(null);
      setPasswordSuccess(null);
      
      // Validate passwords
      if (!passwordData.currentPassword) {
        setPasswordError('Por favor, informe sua senha atual');
        return;
      }
      
      if (!passwordData.newPassword) {
        setPasswordError('Por favor, informe a nova senha');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('As senhas não coincidem');
        return;
      }
      
      // First verify the current password
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      // Reset form and show success message
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess('Senha alterada com sucesso!');
      setIsChangingPassword(false);
      
      // Clear success message after a delay
      setTimeout(() => {
        setPasswordSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    }
  };
  const { darkMode } = useTheme();

  // Componente principal com background em tela cheia
  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {loading ? (
        <div className="flex justify-center items-center h-screen p-8">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
        </div>
      ) : error && !profile ? (
        <div className={`${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'} p-4 rounded-lg flex items-start gap-3 max-w-3xl mx-auto my-8`}>
          <AlertCircle className="w-6 h-6 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg">Erro ao carregar perfil</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-6 h-full">
          <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-xl shadow-md overflow-hidden`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Meu Perfil</h1>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`px-4 py-2 ${darkMode ? 'bg-gray-800 text-blue-300 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-blue-50'} rounded-lg transition-colors flex items-center gap-2`}
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar Perfil
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    disabled={saveStatus === 'saving'}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      saveStatus === 'saving'
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : darkMode
                          ? 'bg-gray-800 text-blue-300 hover:bg-gray-700'
                          : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                )}
              </div>
              
              {saveStatus === 'success' && (
                <div className="mt-4 bg-green-500 bg-opacity-80 p-3 rounded-lg flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5" />
                  Perfil atualizado com sucesso!
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="mt-4 bg-red-500 bg-opacity-80 p-3 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-5 h-5" />
                  Erro ao salvar perfil: {error}
                </div>
              )}
            </div>
            
            {/* Profile Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} border-b pb-2`}>Informações Pessoais</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center gap-1`}>
                        <User className="w-4 h-4" />
                        Nome Completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          placeholder="Digite seu nome completo"
                        />
                      ) : (
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{profile?.full_name || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center gap-1`}>
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{profile?.email || 'Não informado'}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>O email não pode ser alterado</p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center gap-1`}>
                        <User className="w-4 h-4" />
                        CPF
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="cpf"
                          value={formData.cpf || ''}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                      ) : (
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{profile?.cpf || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center gap-1`}>
                        <Calendar className="w-4 h-4" />
                        Data de Nascimento
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="birth_date"
                          value={formData.birth_date || ''}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                        />
                      ) : (
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
                          {profile?.birth_date 
                            ? new Date(profile.birth_date).toLocaleDateString('pt-BR')
                            : 'Não informado'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-6">
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} border-b pb-2`}>Informações de Contato</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center gap-1`}>
                        <Phone className="w-4 h-4" />
                        WhatsApp
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="whatsapp"
                          value={formData.whatsapp || ''}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      ) : (
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{profile?.whatsapp || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center gap-1`}>
                        <MapPin className="w-4 h-4" />
                        CEP
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="zip_code"
                          value={formData.zip_code || ''}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          placeholder="00000-000"
                          maxLength={9}
                        />
                      ) : (
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{profile?.zip_code || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center gap-1`}>
                        <MapPin className="w-4 h-4" />
                        Endereço Completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                          placeholder="Rua, número, bairro, cidade, estado"
                        />
                      ) : (
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>{profile?.address || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Password Change Section */}
              <div className="mt-8">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} border-b pb-2 mb-4`}>Segurança da Conta</h2>
                
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Lock className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Alterar Senha</h3>
                    </div>
                    
                    {!isChangingPassword ? (
                      <button 
                        onClick={() => setIsChangingPassword(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Alterar Senha
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsChangingPassword(false)}
                        className={`px-4 py-2 ${darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition-colors`}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                  
                  {isChangingPassword && (
                    <div className="space-y-4 mt-4">
                      {passwordError && (
                        <div className={`${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'} p-3 rounded-lg flex items-center gap-2 text-sm`}>
                          <AlertCircle className="w-5 h-5" />
                          {passwordError}
                        </div>
                      )}
                      
                      {passwordSuccess && (
                        <div className={`${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700'} p-3 rounded-lg flex items-center gap-2 text-sm`}>
                          <CheckCircle className="w-5 h-5" />
                          {passwordSuccess}
                        </div>
                      )}
                      
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          Senha Atual
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 pr-10 ${
                              darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border border-gray-300 text-gray-700'
                            }`}
                            placeholder="Digite sua senha atual"
                          />
                          <button
                            type="button"
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          Nova Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 pr-10 ${
                              darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border border-gray-300 text-gray-700'
                            }`}
                            placeholder="Digite sua nova senha"
                          />
                          <button
                            type="button"
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>A senha deve ter pelo menos 6 caracteres</p>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          Confirmar Nova Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 pr-10 ${
                              darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border border-gray-300 text-gray-700'
                            }`}
                            placeholder="Confirme sua nova senha"
                          />
                          <button
                            type="button"
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={handleSavePassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Salvar Nova Senha
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Account Information */}
              <div className="mt-8">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'} border-b pb-2 mb-4`}>Informações da Conta</h2>
                
                <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-4 rounded-lg`}>
                  <h3 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>Plano Atual</h3>
                  <div className="flex items-center gap-2">
                    <div className={`${darkMode ? 'bg-blue-800' : 'bg-blue-100'} p-2 rounded-full`}>
                      <User className={`w-5 h-5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`font-bold ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>Plano Básico</p>
                      <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Ativo até 15/05/2025</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Gerenciar Assinatura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;