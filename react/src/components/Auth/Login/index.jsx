import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../../../api/auth';

export const Login = ({ onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fromRegistration = Boolean(location.state && location.state.fromRegistration);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Введите имя пользователя и пароль.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      const data = await login({ username: username.trim(), password: password.trim() });
      const token = data.token;
      const member = data.member || data.user || data;
      if (!token || !member) {
        setError('Не удалось выполнить вход. Проверьте введённые данные.');
        return;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
        window.localStorage.setItem('currentMember', JSON.stringify(member));
      }
      if (typeof onLogin === 'function') {
        onLogin(token, member);
      }
      navigate('/');
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail) {
        setError(String(e.response.data.detail));
      } else {
        setError('Ошибка при входе. Попробуйте ещё раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page" data-easytag="id1-react/src/components/Auth/Login/index.jsx">
      <div className="auth-card">
        <h1 className="auth-title">Вход</h1>
        {fromRegistration && !error && (
          <div className="auth-message-success">
            Регистрация прошла успешно. Теперь вы можете войти.
          </div>
        )}
        {error ? (
          <div className="auth-message-error">
            {error}
          </div>
        ) : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-username">
              Имя пользователя
            </label>
            <input
              id="login-username"
              type="text"
              className="auth-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="app-button app-button-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div className="auth-footer">
          <span className="auth-footer-text">Нет аккаунта?</span>
          <Link to="/register" className="auth-footer-link">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};
