'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader, User } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import MVP1ApiClient from '@/lib/graphqlApiClient';
import { toast } from 'sonner';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

      toast.success('Chào mừng bạn trở lại! 🎉');
      
      setTimeout(() => {
        onAuthSuccess(authData.token, {
          id: authData.playerId,
          username: authData.username,
          email: formData.email,
          level: authData.level,
        });
      }, 500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // Handle Demo Login
  const handleDemoLogin = async () => {
    setLoading(true);
    const demoEmail = 'demo@katagame.vn';
    const demoPass = 'Demo1234!';
    const demoUsername = 'Người chơi Demo';

    try {
      let result = await MVP1ApiClient.login(demoEmail, demoPass);

      if (!result.success) {
        const regResult = await MVP1ApiClient.register(demoEmail, demoPass, demoUsername);
        if (regResult.success) {
          result = await MVP1ApiClient.login(demoEmail, demoPass);
        } else {
          throw new Error(regResult.message || 'Không thể tạo tài khoản demo');
        }
      }

      if (result.success && result.data) {
        const authData = result.data as any;
        
        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('user', JSON.stringify({
          id: authData.playerId,
          username: authData.username,
          email: demoEmail,
          level: authData.level,
        }));

        toast.success('Đang vào thế giới Demo... 🚀');
        
        setTimeout(() => {
          onAuthSuccess(authData.token, {
            id: authData.playerId,
            username: authData.username,
            email: demoEmail,
            level: authData.level,
          });
        }, 500);
      } else {
        throw new Error(result.message || 'Lỗi đăng nhập demo');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khởi tạo Demo');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const result = await MVP1ApiClient.register(formData.email, formData.password, formData.username);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Đăng ký thất bại');
      }

      const authData = result.data as any;

      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('user', JSON.stringify({
        id: authData.playerId,
        username: authData.username,
        email: formData.email,
        level: authData.level,
      }));

      toast.success('Đăng ký thành công! Chào tân thủ 🎉');

      setTimeout(() => {
        onAuthSuccess(authData.token, {
          id: authData.playerId,
          username: authData.username,
          email: formData.email,
          level: authData.level,
        });
      }, 500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fafafa] dark:bg-[#09090b] text-foreground transition-colors duration-500 font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mx-auto h-20 w-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-200 dark:shadow-none rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white text-4xl font-black">🇻🇳</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight mt-6">
            Đất Việt <span className="text-red-600">Truyền Thuyết</span>
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 font-medium">Hành trình về nguồn cội văn sử Việt</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 dark:shadow-none animate-in fade-in zoom-in-95 duration-500 delay-150">
          {/* Tab Selection */}
          <div className="flex p-1 bg-gray-50 dark:bg-zinc-900 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                isLogin 
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Tên anh hùng</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    name="username"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-red-600/20 focus:bg-white dark:focus:bg-zinc-950 outline-none rounded-2xl transition-all font-medium"
                    placeholder="Tên của bạn trong game"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-red-600/20 focus:bg-white dark:focus:bg-zinc-950 outline-none rounded-2xl transition-all font-medium"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Mật mã</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-red-600/20 focus:bg-white dark:focus:bg-zinc-950 outline-none rounded-2xl transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin h-5 w-5" /> : (isLogin ? 'Đăng Nhập Ngay' : 'Khai Cuộc Hành Trình')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black">
              <span className="bg-white dark:bg-zinc-950 px-4 text-gray-400">Hoặc</span>
            </div>
          </div>

          <div className="grid gap-3">
            <button
              onClick={handleDemoLogin}
              className="w-full py-4 px-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <span className="text-xl">🚀</span> Truy Cập Demo Nhanh
            </button>
            <GoogleSignInButton />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 font-medium pb-8">
          Bằng việc tham gia, bạn đồng ý với Điều khoản của Đất Việt Truyền Thuyết.
        </p>
      </div>
    </div>
  );
}
