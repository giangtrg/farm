import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

// IMPORT FILE ẢNH VÀO ĐÂY
// Sửa lại đường dẫn '../assets/background.jpg' cho đúng với thư mục chứa ảnh của mày
import bgImage from '../assets/background.jpg'; 

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check password match for registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    const url = isLogin 
      ? 'http://127.0.0.1:8000/api/login/'
      : 'http://127.0.0.1:8000/api/register/';

    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : { 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.detail || data.error || (data.username ? `Username: ${data.username}` : null) || 'An error occurred!';
        throw new Error(errorText);
      }

      if (isLogin) {
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('username', data.username || formData.username);
        
        if (data.needs_setup) {
          navigate('/setup');
        } else {
          navigate('/dashboard');
        }

      } else {
        alert('Registration successful! Please sign in.');
        setIsLogin(true);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }

    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* TRUYỀN ẢNH VÀO STYLE CỦA BANNER */}
      <div 
        className="auth-banner" 
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      <div className="auth-form-section">
        <div className="auth-form-box">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>

          <form onSubmit={handleSubmit}>
            
            <div className="auth-form-group">
              <label>Username</label>
              <input 
                type="text" 
                name="username" 
                className="auth-input" 
                placeholder="Enter your username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
              />
            </div>

            {!isLogin && (
              <div className="auth-form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  className="auth-input" 
                  placeholder="abc@gmail.con" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            )}

            <div className="auth-form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                className="auth-input" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>

            {!isLogin && (
              <div className="auth-form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            )}

            {isLogin && (
              <div style={{textAlign: 'right', marginBottom: '20px'}}>
                <a href="#" style={{fontSize: '0.85rem', color: '#10b981', textDecoration: 'none', fontWeight: 600}}>Forgot Password?</a>
              </div>
            )}

            <button type="submit" className="auth-btn-submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} style={{cursor: 'pointer', color: '#10b981', fontWeight: 'bold'}}>
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;