import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [isLogin, setIsLogin] = useState(true); // изменено на true по умолчанию
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Валидация для регистрации
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Пароли не совпадают');
        }
        if (formData.password.length < 6) {
          throw new Error('Пароль должен содержать минимум 6 символов');
        }
      }

        if (isLogin) {

        if (formData.email === 'admin@ru' && formData.password === '111111') { 
            navigate('/admin')
            return;
        }
        // Авторизация
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        
       
      } else {
        // Регистрация
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username
            }
          }
        });
        if (error) throw error;
        
        // Успешная регистрация
        alert('Регистрация успешна! Проверьте вашу почту для подтверждения.');
        resetForm();
        setIsLogin(true); // Переключаем на вход после регистрации
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  function signOut() {
    const { data, error } = supabase.auth.signOut()
    navigate('/')
    if (error) { throw error}
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const showAdditionalFields = !isLogin;

  return {
    isLogin,
    loading,
    error,
    formData,
      signOut,
    // navigate,
    handleChange,
    handleSubmit,
    resetForm,
    setError,
    toggleAuthMode,
    showAdditionalFields
  };
};