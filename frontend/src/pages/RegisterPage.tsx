import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import wallpaper from "../assets/images/wallpaper.jpg";
import "./RegisterPage.css";
import axios from "axios";
interface Slide {
  title: string;
  subtitle: string;
}


const slides: Slide[] = [
  {
    title: "Manage Tasks with Clarity",
    subtitle:
      "Create, assign, and track tasks effortlessly. Keep every project organized and deadlines under control.",
  },
  {
    title: "Bring Your Team Together",
    subtitle:
      "Connect team leads and employees in one workspace. Make collaboration and task coordination simple.",
  },
  {
    title: "Stay Focused. Get More Done.",
    subtitle:
      "Track progress, monitor task history, and keep everyone aligned with your team's goals.",
  },
];


const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!username.trim() || !email.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 4 || confirmPassword.length < 8) {
      setError("Password must contain atleast 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password doesn't match");
      return;
    }

    try {
      setLoading(true);
      await registerUser(username, email, password);
      setSuccess("Account created successfully!");
      navigate("/login");
    } catch (e) {
      if(axios.isAxiosError(e) && e.response?.data.username?.[0] === "A user with that username already exists.")
      {
        setError("A user with that username already exists.")
      }
      else if(axios.isAxiosError(e) && e.response?.data.email?.[0] === "user with this email already exists.")
      {
        setError("user with this email already exists.")
      }
      else{
      setError("Error while making api call");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        {/* Left Side: Wallpaper Background & Carousel */}
        <div
          className="register-left"
          style={{ backgroundImage: `url(${wallpaper})` }}
        >
          <div className="wallpaper-overlay"></div>

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
                  className={`dot ${activeSlide === index ? "active" : ""}`}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="register-right">
          <div className="form-container">
            <h1 className="brandlogo">Teamflow</h1>
            <p className="welcome-text">Create your Teamflow account</p>

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="feedback-text feedback-error" role="alert">
                  {error}
                </p>
              )}
              {success && (
                <p className="feedback-text feedback-success" role="status">
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="btn-register"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            <br />
{/* 
            <div className="divider">
              <span>or</span>
            </div> */}

            <p className="login-prompt">
              Already have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;