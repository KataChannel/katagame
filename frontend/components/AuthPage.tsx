'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import MVP1ApiClient from '@/lib/graphqlApiClient';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validate email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate password
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Vui lòng nhập email và mật khẩu');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Email không hợp lệ');
      }

      const result = await MVP1ApiClient.login(formData.email, formData.password);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Đăng nhập thất bại');
      }

      const authData = result.data as {
        token: string;
        playerId: string;
        username: string;
        level: number;
      };

      // Save token to localStorage
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('user', JSON.stringify({
        id: authData.playerId,
        username: authData.username,
        email: formData.email,
        level: authData.level,
      }));

      setSuccess('Đăng nhập thành công! 🎉');
      setTimeout(() => {
        onAuthSuccess(authData.token, {
          id: authData.playerId,
          username: authData.username,
          email: formData.email,
          level: authData.level,
        });
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.username || !formData.email || !formData.password) {
        throw new Error('Vui lòng điền tất cả các trường');
      }

      if (formData.username.length < 3) {
        throw new Error('Tên người dùng phải có ít nhất 3 ký tự');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Email không hợp lệ');
      }

      if (!validatePassword(formData.password)) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Mật khẩu không khớp');
      }

      const result = await MVP1ApiClient.register(formData.email, formData.password, formData.username);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Đăng ký thất bại');
      }

      const authData = result.data as {
        token: string;
        playerId: string;
        username: string;
        level: number;
      };

      // Save token to localStorage
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('user', JSON.stringify({
        id: authData.playerId,
        username: authData.username,
        email: formData.email,
        level: authData.level,
      }));

      setSuccess('Đăng ký thành công! 🎉');
      setTimeout(() => {
        onAuthSuccess(authData.token, {
          id: authData.playerId,
          username: authData.username,
          email: formData.email,
          level: authData.level,
        });
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-yellow-500 to-orange-400 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-400 rounded-full opacity-10 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full opacity-10 -z-10"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">🎮 Đất Việt Truyền Thuyết</h1>
          <p className="text-red-100">MVP 1: Khởi Nguồn Đất Việt</p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
                setFormData({ username: '', email: '', password: '', confirmPassword: '' });
              }}
              className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                isLogin
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
                setFormData({ username: '', email: '', password: '', confirmPassword: '' });
              }}
              className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                !isLogin
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {/* Username - only for signup */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Tên Người Dùng
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Tối thiểu 3 ký tự"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline mr-2 h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock className="inline mr-2 h-4 w-4" />
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isLogin ? 'Nhập mật khẩu' : 'Tối thiểu 6 ký tự'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password - only for signup */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="inline mr-2 h-4 w-4" />
                  Xác Nhận Mật Khẩu
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">HOẶC</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton onSuccess={onAuthSuccess} />

          {/* Footer text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            {isLogin ? (
              <>
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-red-600 font-semibold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-red-600 font-semibold hover:underline"
                >
                  Đăng nhập
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
