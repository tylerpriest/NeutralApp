import React from 'react';

const AuthPage: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Welcome to NeutralApp</h1>
        <p>Please sign in to continue</p>
        <div className="auth-form">
          <input type="email" placeholder="Email" className="auth-input" />
          <input type="password" placeholder="Password" className="auth-input" />
          <button className="auth-button">Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 