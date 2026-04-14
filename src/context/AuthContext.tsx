import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { DeviceRegisterRequest } from '../types/user.types';
import {
  ApiResponse,
  VerifyMobileResponse,
  VerifyOTPResponse,
} from '../types/common.types';

interface AuthContextType {
  loading: boolean;
  isAuthenticated: boolean;
  loginLoading: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  registerDevice: (data: DeviceRegisterRequest) => Promise<void>;
  verifyMobileNo: (
    countryCode: string,
    mobileNo: string,
  ) => Promise<string | null>;
  logout: () => Promise<void>;
  verifyOTP: (
    refId: string,
    otp: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  resendOTP: (mobileNumber: string) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (data: DeviceRegisterRequest) => {
    try {
      console.log('DeviceRegisterRequest data ', data);
      const response = await api.post('/CommonApi/DeviceRegistration', data);
      console.log('Device register successfully ', response.data);

      // Store device ID for later use
      await AsyncStorage.setItem('deviceId', response.data.data);
    } catch (error: unknown) {
      console.log('Error to register device  ', error);
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyMobileNo = async (
    countryCode: string,
    mobileNo: string,
  ): Promise<string | null> => {
    try {
      setLoginLoading(true);
      setError(null);
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        setError('Device id not found');
        return null;
      }
      console.log('verify mobile data ', { countryCode, mobileNo, deviceId });
      const response: VerifyMobileResponse = await api.post(
        '/AccountApi/MobileNoVerify',
        {
          countryCode,
          mobileNo,
          deviceId,
        },
      );
      if (response.data.statusCode !== 200) {
        setError(response.data.message);
      }
      console.log('response verify mobile ', response.data);
      return response.data.data.refId as string;
    } catch (error: unknown) {
      console.log('Error to verify mobile ', error);
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setError(null);
    }
  };

  const verifyOTP = async (
    refId: string,
    otp: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      setError(null);
      const response: VerifyOTPResponse = await api.post(
        '/AccountApi/OTPVerify',
        {
          refId,
          otp,
        },
      );
      if (response.data.statusCode !== 200) {
        return { success: false, message: response.data.message };
      }
      console.log('response of verify otp ', response.data);
      await AsyncStorage.setItem('token', response.data.data.jwtToken);
      await AsyncStorage.setItem(
        'refreshToken',
        response.data.data.refreshToken,
      );
      await AsyncStorage.setItem('userId', response.data.data.userId);
      await AsyncStorage.setItem('mobileNo', response.data.data.userName);
      setIsAuthenticated(true);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'OTP verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resendOTP = async (mobileNumber: string) => {
    try {
      setError(null);
      await api.post('/auth/resend-otp', { mobileNumber });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to resend OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        loginLoading,
        isAuthenticated,
        error,
        setIsAuthenticated,
        registerDevice,
        verifyMobileNo,
        logout,
        verifyOTP,
        resendOTP,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
