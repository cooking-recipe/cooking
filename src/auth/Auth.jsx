import './Auth.css';
import { useAuth } from './useAuth';
// import { useNavigate } from 'react-router-dom';
export default function Auth() {
  const {
    isLogin,
    loading,
    error,
    formData,
    signOut,
    // navigate,
    handleChange,
    handleSubmit,
    toggleAuthMode,
    showAdditionalFields
  } = useAuth();

  return (
    <div className="auth-container">
      <button onClick={signOut}>exit</button>
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      <form onSubmit={handleSubmit} className='auth-form'>
        
        {showAdditionalFields && (
          <div>
            <label>Ваше имя:</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя"
            />
          </div>
        )}

        <div>
          <label>Email:</label>
          <input
            type="email"
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder="Введите email"
            required
          />
        </div>

        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={formData.password}
            name='password'
            placeholder={isLogin ? "Введите пароль" : "Придумайте пароль"}
            onChange={handleChange}
            required
          />
        </div>

        {showAdditionalFields && (
          <div>
            <label>Подтвердите пароль:</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
              required
            />
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
        </button>
      </form>

      <p>
        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}<br />
        <a onClick={toggleAuthMode}>
           {isLogin ? 'Зарегистрироваться' : 'Войти'}
        </a>
      </p>
    </div>
  );
}