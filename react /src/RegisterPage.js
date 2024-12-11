import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // Send the username and password to the backend registration endpoint
    axios.post("http://127.0.0.1:5000/register", { // Corrected the URL syntax
      username: username,
      password: password,
    })
    .then((response) => {
      alert("Registration successful, please log in!");
      navigate("/login");  // Navigate to the login page after successful registration
    })
    .catch((error) => {
      // Display error message
      if (error.response && error.response.status === 409) {
        setErrorMessage("Username already exists, please choose a different username.");
      } else {
        setErrorMessage("Registration failed, please try again later.");
      }
    });
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
        <button type="submit" className="submit-button">Register</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default RegisterPage;