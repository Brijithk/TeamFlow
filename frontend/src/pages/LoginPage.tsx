import React, { useState, FormEvent, ChangeEvent } from 'react';
import './LoginPage.css';
import wallpaper from '../assets/images/wallpaper.jpg';
import { useLogin } from "../hooks/useLogin";
import useAuth from "../hooks/useAuth";
interface Slide {
  title: string;
  subtitle: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const slides: Slide[] = [
  {
    title: 'Maecenas mattis egestas',
    subtitle: 'Erdum et malesuada fames ac ante ipsum primis in faucibus uspendisse porta.',
  },
  {
    title: 'Connect with your world',
    subtitle: 'Share moments and stay updated with the people who matter most.',
  },
  {
    title: 'Simple & Seamless',
    subtitle: 'Experience a clean, distraction-free space designed for everyday use.',
  },
];

const LoginPage=()=>{
       const {username,setUsername,password,setPassword,
        loading,error,handleLogin} =useLogin()
    
   const {user}=useAuth()
  // const [email, setEmail] = useState<string>('David Brooks');
//   const [password, setPassword] = useState<string>('********');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!username.trim()) {
      newErrors.email = 'Username or email is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 2) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      // setIsLoading(true);
      handleLogin()
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Left Side: Wallpaper Background & Carousel */}
        <div 
          className="login-left"
          style={{ backgroundImage: `url(${wallpaper})` }}
        >
          {/* Dark Overlay to make text readable over any wallpaper */}
          <div className="wallpaper-overlay"></div>

          {/* Content layer above the overlay */}
          <div className="left-content-wrapper">
            <div className="carousel-text">
              <h2>{slides[activeSlide].title}</h2>
              <p>{slides[activeSlide].subtitle}</p>
            </div>

            <div className="carousel-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  className={`dot ${activeSlide === index ? 'active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-right">
          <div className="form-container">
            <h1 className="brand-logo">Teamflow</h1>
            <p className="welcome-text">Welcome to Teamflow</p>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="input-group">
                <label htmlFor="email">Users name or Email</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className={errors.password ? 'input-error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="forgot-password">
                <a href="#forgot">Forgot password?</a>
              </div>

              <button type="submit" className="btn-signin" disabled={loading}>
                {loading ? <span className="spinner"></span> : 'Sign in'}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <p className="signup-prompt">
              New to Teamflow? <a href="#create">Create Account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage