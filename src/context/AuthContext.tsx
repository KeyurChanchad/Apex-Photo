import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { DeviceRegisterRequest } from '../types/user.types';

interface AuthContextType {
  loading: boolean;
  isAuthenticated: boolean;
  loginLoading: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  registerDevice: (data: DeviceRegisterRequest) => Promise<void>;
  verifyMobileNo: (
    countryCode: string,
    mobileNo: string,
    name: string,
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

  // useEffect(() => {
  //   checkAuthStatus();
  // }, []);

  // const checkAuthStatus = async () => {
  //   try {
  //     setLoading(true);
  //     const token = await AsyncStorage.getItem('token');
  //     if (token) {
  //       console.log(api);

  //       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //     }
  //   } catch (error) {
  //     console.error('Auth check failed:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const registerDevice = async (data: DeviceRegisterRequest) => {
    try {
      const response = await api.post('/CommonApi/DeviceRegistration', data);
      console.log('Device register successfully ', response.data);

      // Store device ID for later use
      await AsyncStorage.setItem('deviceId', response.data);
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
    name: string,
  ): Promise<string | null> => {
    try {
      setLoginLoading(true);
      setError(null);
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        setError('Device id not found');
        return null;
      }
      console.log('verify mobile data ', {
        countryCode,
        mobileNo,
        deviceId,
        name,
      });
      const response = await api.post('/AccountApi/MobileNoVerify', {
        countryCode,
        mobileNo,
        deviceId,
        name,
      });
      if (response.data.statusCode !== 200) {
        setError(response.data.message);
      }
      console.log('response verify mobile ', response.data);
      return response.data.refId as string;
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
      // await api.post('/auth/logout').catch(() => {});
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
      const response = await api.post('/AccountApi/OTPVerify', {
        refId,
        otp,
      });
      console.log('response of verify otp ', response.data);
      if (response.statusCode !== 200) {
        return { success: false, message: response.message };
      }
      await AsyncStorage.setItem('token', response.data.jwtToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('userId', response.data.userId);
      await AsyncStorage.setItem('mobileNo', response.data.userName);
      setIsAuthenticated(true);
      return { success: true, message: response.message };
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
