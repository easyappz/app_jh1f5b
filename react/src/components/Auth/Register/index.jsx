import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, login } from '../../../api/auth';

export const Register = ({ isAuthenticated, onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      await register({ username: username.trim(), password: password.trim() });
      const data = await login({ username: username.trim(), password: password.trim() });
      const token = data.token;
      const member = data.member || data.user || data;
      if (token && member) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('authToken', token);
          window.localStorage.setItem('currentMember', JSON.stringify(member));
        }
        if (typeof onLogin === 'function') {
          onLogin(token, member);
        }
        navigate('/');
      } else {
        navigate('/login', { state: { fromRegistration: true } });
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail) {
        setError(String(e.response.data.detail));
      } else {
        setError('Ошибка при регистрации. Попробуйте ещё раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page" data-easytag="id1-react/src/components/Auth/Register/index.jsx">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        {error ? (
          <div className="auth-message-error">
            {error}
          </div>
        ) : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-username">
              Имя пользователя
            </label>
            <input
              id="register-username"
              type="text"
              className="auth-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-password">
              Пароль
            </label>
            <input
              id="register-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="app-button app-button-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="auth-footer">
          <span className="auth-footer-text">Уже есть аккаунт?</span>
          <Link to="/login" className="auth-footer-link">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
};
