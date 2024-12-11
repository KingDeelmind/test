import React, { useState } from 'react';
import axios from 'axios';

function Login({ setLoggedIn }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        axios.post('http://127.0.0.1:5000/login', { username, password })
            .then(response => {
                alert(response.data.message);
                setLoggedIn(true);
            })
            .catch(error => alert(error.response.data.message));
    };

    return (
        <div>
            <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;
