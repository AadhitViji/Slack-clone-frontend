// src/Register.js
import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ setToken, setUsername }) => {
    const [username, setUsernameInput] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        if (username.trim().length === 0) {
            setError('Username cannot be empty');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/auth/register', {
                username,
                email,
                password,
            });
            const { token, username: registeredUsername } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('username', registeredUsername);
            setToken(token);
            setUsername(registeredUsername);
            setSuccess('User registered successfully!');
            setError('');
            setUsernameInput('');
            setEmail('');
            setPassword('');
        } catch (err) {
            console.error('Registration error:', err.response ? err.response.data : err.message);
            setError('Failed to register');
            setSuccess('');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
