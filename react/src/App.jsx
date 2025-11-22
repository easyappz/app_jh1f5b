import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';
import { Home } from './components/Home';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Profile } from './components/Profile';
import { getCurrentMember } from './api/profile';

function App() {
  const [authToken, setAuthToken] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/login', '/register', '/profile']);
    }
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      if (typeof window === 'undefined' || !window.localStorage) {
        setIsAuthLoading(false);
        return;
      }
      const storedToken = window.localStorage.getItem('authToken');
      const storedMember = window.localStorage.getItem('currentMember');
      if (storedToken) {
        setAuthToken(storedToken);
        if (storedMember) {
          try {
            const parsedMember = JSON.parse(storedMember);
            setCurrentMember(parsedMember);
          } catch (error) {
            setCurrentMember(null);
          }
        }
        try {
          const freshMember = await getCurrentMember();
          setCurrentMember(freshMember);
          window.localStorage.setItem('currentMember', JSON.stringify(freshMember));
        } catch (error) {
          setAuthToken(null);
          setCurrentMember(null);
          window.localStorage.removeItem('authToken');
          window.localStorage.removeItem('currentMember');
        }
      }
      setIsAuthLoading(false);
    }
    initializeAuth();
  }, []);

  const handleLogin = useCallback((token, memberData) => {
    setAuthToken(token);
    setCurrentMember(memberData);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('authToken', token);
      window.localStorage.setItem('currentMember', JSON.stringify(memberData));
    }
  }, []);

  const handleLogout = useCallback(() => {
    setAuthToken(null);
    setCurrentMember(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('currentMember');
    }
    navigate('/');
  }, [navigate]);

  const handleProfileUpdate = useCallback((memberData) => {
    setCurrentMember(memberData);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('currentMember', JSON.stringify(memberData));
    }
  }, []);

  const isAuthenticated = Boolean(authToken);

  return (
    <ErrorBoundary>
      <div className="app-root" data-easytag="id1-react/src/App.jsx">
        <header className="app-header">
          <div className="app-brand">Групповой чат</div>
          <nav className="app-nav">
            <div className="app-nav-left">
              <Link to="/" className="app-nav-link">
                Главная
              </Link>
              <Link to="/profile" className="app-nav-link">
                Профиль
              </Link>
            </div>
            <div className="app-nav-right">
              {isAuthenticated && currentMember ? (
                <div className="app-nav-auth">
                  <span className="app-nav-username">{currentMember.username}</span>
                  <button type="button" className="app-button app-button-outline" onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="app-nav-auth">
                  <Link to="/login" className="app-nav-link">
                    Войти
                  </Link>
                  <Link to="/register" className="app-nav-link app-nav-link-primary">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main className="app-main">
          {isAuthLoading ? (
            <div className="app-loading">Загрузка...</div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={<Home isAuthenticated={isAuthenticated} currentMember={currentMember} />}
              />
              <Route
                path="/login"
                element={<Login onLogin={handleLogin} isAuthenticated={isAuthenticated} />}
              />
              <Route
                path="/register"
                element={<Register isAuthenticated={isAuthenticated} onLogin={handleLogin} />}
              />
              <Route
                path="/profile"
                element={
                  <Profile
                    isAuthenticated={isAuthenticated}
                    currentMember={currentMember}
                    onLogout={handleLogout}
                    onProfileUpdate={handleProfileUpdate}
                  />
                }
              />
            </Routes>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
