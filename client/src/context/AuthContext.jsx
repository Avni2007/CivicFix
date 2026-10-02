import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civicfix_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('[AuthContext] Token verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('civicfix_token', res.data.token);
          setToken(res.data.token);
          setUser(res.data.user);
        }
        return res.data;
      }
    } catch (error) {
      if (error.requiresVerification) {
        return error;
      }
      throw error;
    }
  };

  const municipalLogin = async (email, password) => {
    const res = await authAPI.municipalLogin({ email, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem('civicfix_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await authAPI.verifyOTP({ email, otp });
    return res.data;
  };

  const resendOTP = async (email) => {
    const res = await authAPI.resendOTP({ email });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await authAPI.forgotPassword({ email });
    return res.data;
  };

  const verifyResetOTP = async (email, otp) => {
    const res = await authAPI.verifyResetOTP({ email, otp });
    return res.data;
  };

  const resetPassword = async (payload) => {
    const res = await authAPI.resetPassword(payload);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('civicfix_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        municipalLogin,
        register,
        verifyOTP,
        resendOTP,
        forgotPassword,
        verifyResetOTP,
        resetPassword,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
