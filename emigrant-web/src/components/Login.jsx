import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../services/login';
import loginPhoto from '../assets/login-photo.svg';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const user = await loginUser(identifier, password);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      {/* Left Side: Title and Illustration */}
      <div className="flex flex-col items-center justify-center flex-1 bg-white px-12 shadow-xl">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            PhilEmigrants<br />
            <span className="text-cyan-600">Data Portal</span>
          </h1>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed max-w-md">
            Your comprehensive platform for tracking and analyzing Philippine emigration data. 
            Access insights, trends, and statistics to support informed decision-making.
          </p>
          <div className="flex justify-center">
            <img 
              src={loginPhoto} 
              alt="Login Illustration" 
              className="w-[500px] max-w-full drop-shadow-2xl transform hover:scale-105 transition-transform duration-300" 
            />
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col justify-center flex-1 bg-gradient-to-br from-cyan-500 to-cyan-700 p-10">
        <div className="bg-white p-10 rounded-3xl w-[500px] mx-auto shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Login to access your dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Email Address
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold py-4 rounded-xl mt-2 hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              Log In
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 mt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-cyan-600 hover:text-cyan-700 transition-colors underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}