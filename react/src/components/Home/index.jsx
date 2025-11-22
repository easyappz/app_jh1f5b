import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchMessages, sendMessage } from '../../api/chat';

export const Home = ({ isAuthenticated, currentMember }) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!isAuthenticated) {
      setMessages([]);
      return;
    }
    try {
      setMessagesError('');
      setIsLoadingMessages(true);
      const data = await fetchMessages();
      if (Array.isArray(data)) {
        setMessages(data);
      } else if (data && Array.isArray(data.results)) {
        setMessages(data.results);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessagesError('Не удалось загрузить сообщения.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let intervalId;
    if (isAuthenticated) {
      loadMessages();
      intervalId = setInterval(loadMessages, 4000);
    } else {
      setMessages([]);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, loadMessages]);

  const handleMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      return;
    }
    const trimmed = newMessage.trim();
    if (!trimmed) {
      return;
    }
    try {
      setIsSending(true);
      setMessagesError('');
      await sendMessage({ content: trimmed });
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      setMessagesError('Не удалось отправить сообщение. Попробуйте ещё раз.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-page" data-easytag="id1-react/src/components/Home/index.jsx">
      <div className="chat-main">
        <div className="chat-header">
          <h1 className="chat-title">Групповой чат</h1>
          <p className="chat-subtitle">Общайтесь в реальном времени с другими участниками</p>
        </div>
        <div className="chat-content">
          <div className="chat-messages-container">
            {!isAuthenticated ? (
              <div className="chat-locked">
                <p className="chat-locked-text">
                  Только авторизованные пользователи могут пользоваться чатом.
                </p>
                <div className="chat-locked-actions">
                  <Link to="/login" className="app-button app-button-primary">
                    Войти
                  </Link>
                  <Link to="/register" className="app-button app-button-outline">
                    Регистрация
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {messagesError && (
                  <div className="chat-error">
                    {messagesError}
                  </div>
                )}
                <div className="chat-messages">
                  {isLoadingMessages && messages.length === 0 && (
                    <div className="chat-status">Загрузка сообщений...</div>
                  )}
                  {!isLoadingMessages && messages.length === 0 && (
                    <div className="chat-status">Сообщений пока нет. Напишите первое сообщение.</div>
                  )}
                  {messages.map((message) => {
                    const author =
                      message.member_username ||
                      message.username ||
                      message.author ||
                      'Неизвестный пользователь';
                    let createdAtText = '';
                    if (message.created_at) {
                      const date = new Date(message.created_at);
                      if (!Number.isNaN(date.getTime())) {
                        createdAtText = date.toLocaleString('ru-RU');
                      }
                    }
                    return (
                      <div
                        key={message.id || `${author}-${createdAtText}-${message.content}`}
                        className="chat-message"
                      >
                        <div className="chat-message-meta">
                          <span className="chat-message-author">{author}</span>
                          {createdAtText ? (
                            <span className="chat-message-time">{createdAtText}</span>
                          ) : null}
                        </div>
                        <div className="chat-message-text">{message.content}</div>
                      </div>
                    );
                  })}
                </div>
                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={handleMessageChange}
                    disabled={!isAuthenticated || isSending}
                  />
                  <button
                    type="submit"
                    className="app-button app-button-primary chat-send-button"
                    disabled={!isAuthenticated || isSending || !newMessage.trim()}
                  >
                    Отправить
                  </button>
                </form>
              </>
            )}
          </div>
          <aside className="chat-sidebar">
            <div className="chat-sidebar-card">
              <h2 className="chat-sidebar-title">Статус пользователя</h2>
              {isAuthenticated && currentMember ? (
                <div className="chat-sidebar-content">
                  <div className="chat-sidebar-row">
                    <span className="chat-sidebar-label">Имя пользователя:</span>
                    <span className="chat-sidebar-value">{currentMember.username}</span>
                  </div>
                  <div className="chat-sidebar-row">
                    <span className="chat-sidebar-label">Статус:</span>
                    <span className="chat-sidebar-value chat-sidebar-value-online">Онлайн</span>
                  </div>
                </div>
              ) : (
                <div className="chat-sidebar-content">
                  <p className="chat-sidebar-text">
                    Вы не авторизованы. Войдите или зарегистрируйтесь, чтобы участвовать в чате.
                  </p>
                  <div className="chat-sidebar-actions">
                    <Link to="/login" className="app-button app-button-primary">
                      Войти
                    </Link>
                    <Link to="/register" className="app-button app-button-outline">
                      Регистрация
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
