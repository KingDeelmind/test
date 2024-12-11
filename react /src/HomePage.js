import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to the Online Shopping Mall</h1>
      <div className="auth-buttons">
        <Link to="/login" className="auth-button">Login</Link>
        <Link to="/register" className="auth-button">Register</Link>
      </div>
    </div>
  );
}

export default HomePage;