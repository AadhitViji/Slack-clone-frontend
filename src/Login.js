import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken, setUsername }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        if (password.length < 2) {
            setError('Password must be at least 2 characters long');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/auth/login', {
                email,
                password,
            });
            const { token, username } = response.data;  // Assuming the backend returns both token and username
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);  // Store username in localStorage
            setToken(token);  // Set token in state
            setUsername(username);  // Set username in state
            setError('');
        } catch (err) {
            if (err.response) {
                setError(err.response.data.msg || 'Invalid email or password');
            } else {
                setError('Server error, please try again later.');
            }
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
