import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post("http://127.0.0.1:5000/login", { // Corrected the URL syntax
      username: username,
      password: password
    })
    .then((response) => {
      const session_id = response.data.session_id;
      localStorage.setItem("session_id", session_id);
      console.log(session_id);
      alert("Login successful");
      navigate("/products");
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Incorrect username or password");
      } else {
        setErrorMessage("Login failed, please try again later");
      }
    });
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">Login</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default LoginPage;