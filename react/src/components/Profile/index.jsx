import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateCurrentMember } from '../../api/profile';

export const Profile = ({ isAuthenticated, currentMember, onLogout, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(currentMember ? currentMember.username : '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (currentMember && currentMember.username) {
      setUsername(currentMember.username);
    }
  }, [currentMember]);

  if (!isAuthenticated) {
    return (
      <div className="profile-page" data-easytag="id1-react/src/components/Profile/index.jsx">
        <div className="profile-card">
          <p className="profile-message">Для просмотра профиля необходимо войти в систему.</p>
          <button
            type="button"
            className="app-button app-button-primary"
            onClick={() => navigate('/login')}
          >
            Перейти к входу
          </button>
        </div>
      </div>
    );
  }

  const createdAtValue = currentMember && (currentMember.date_joined || currentMember.created_at);
  let createdAtText = '';
  if (createdAtValue) {
    const date = new Date(createdAtValue);
    if (!Number.isNaN(date.getTime())) {
      createdAtText = date.toLocaleString('ru-RU');
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentMember) {
      return;
    }
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const payload = {};
    if (trimmedUsername && trimmedUsername !== currentMember.username) {
      payload.username = trimmedUsername;
    }
    if (trimmedPassword) {
      payload.password = trimmedPassword;
    }
    if (!payload.username && !payload.password) {
      setSuccess('Изменения не внесены.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      const updatedMember = await updateCurrentMember(payload);
      if (typeof onProfileUpdate === 'function') {
        onProfileUpdate(updatedMember);
      }
      setPassword('');
      setSuccess('Профиль успешно обновлён.');
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail) {
        setError(String(e.response.data.detail));
      } else {
        setError('Не удалось обновить профиль. Попробуйте ещё раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page" data-easytag="id1-react/src/components/Profile/index.jsx">
      <div className="profile-card">
        <h1 className="profile-title">Профиль</h1>
        {currentMember ? (
          <div className="profile-info">
            <div className="profile-row">
              <span className="profile-label">Текущий логин:</span>
              <span className="profile-value">{currentMember.username}</span>
            </div>
            {createdAtText ? (
              <div className="profile-row">
                <span className="profile-label">Дата регистрации:</span>
                <span className="profile-value">{createdAtText}</span>
              </div>
            ) : null}
          </div>
        ) : null}
        {error ? (
          <div className="profile-message-error">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="profile-message-success">
            {success}
          </div>
        ) : null}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-username">
              Новое имя пользователя
            </label>
            <input
              id="profile-username"
              type="text"
              className="profile-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-password">
              Новый пароль
            </label>
            <input
              id="profile-password"
              type="password"
              className="profile-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="profile-actions">
            <button
              type="submit"
              className="app-button app-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button
              type="button"
              className="app-button app-button-outline"
              onClick={onLogout}
            >
              Выйти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
