// src/App.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import './App.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
    } else {
      window.location.href = 'login.html'; // Redirect to login if not authenticated
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    window.location.href = 'login.html'; // Redirect to login page on logout
  };

  if (!token) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="App">
      <h1>Slack-like Chat App</h1>
      <Chat username={username} />
      <button onClick={handleLogout} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
};

export default App;
