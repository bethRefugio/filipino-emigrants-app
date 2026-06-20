import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../services/register';
import loginPhoto from '../assets/login-photo.svg';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await registerUser(form);
      setSuccess("Account created successfully!");
      setTimeout(() => {
        navigate('/login');
      }, 1500);
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
            Join our platform to access comprehensive emigration analytics and contribute to data-driven policy making for Philippine emigrants worldwide.
          </p>
          <div className="flex justify-center">
            <img 
              src={loginPhoto} 
              alt="Register Illustration" 
              className="w-[500px] max-w-full drop-shadow-2xl transform hover:scale-105 transition-transform duration-300" 
            />
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex flex-col justify-center flex-1 bg-gradient-to-br from-cyan-500 to-cyan-700 p-10 overflow-y-auto">
        <div className="bg-white p-10 rounded-3xl w-[520px] mx-auto shadow-2xl my-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join the PhilEmigrants community</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* First Name Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                First Name
              </label>
              <input
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                placeholder="Enter first name"
                required
              />
            </div>

            {/* Last Name Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Last Name
              </label>
              <input
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                placeholder="Enter last name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Username Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                placeholder="Choose a username"
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Role Field */}
            <div className="relative">
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Select a Role</option>
                <option value="user">User</option>
                <option value="government official">Government Official</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold py-4 rounded-xl mt-2 hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              Sign Up
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-cyan-600 hover:text-cyan-700 transition-colors underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}