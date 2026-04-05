import { AxiosResponse } from 'axios';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T = unknown> extends AxiosResponse {
  data: {
    statusCode: number;
    message: string;
    data: T;
  };
}

export interface VerifyMobileData {
  otp: string;
  refId: string;
}

export type VerifyMobileResponse = ApiResponse<VerifyMobileData>;

export interface VerifyOTPData {
  designationId: string | null;
  designationName: string | null;
  f_year: string;
  firstName: string | null;
  lastName: string | null;
  jwtToken: string;
  refreshToken: string;
  rollId: string | null;
  rollName: string | null;
  sessionId: string | null;
  userId: string;
  userName: string;
}

export type VerifyOTPResponse = ApiResponse<VerifyOTPData>;
