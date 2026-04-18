export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface VerifyMobileData {
  otp: string;
  refId: string;
}

export type VerifyMobileResponse = VerifyMobileData;

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

export type EventStatusType = 1 | 2 | 3 | 4;

export interface EventItemType {
  eventId: string;
  eventName: string;
  eventCode: string;
  eventDate: string;
  location: null;
  eventStatus: EventStatusType;
  eventUserId: string;
  isMatched: boolean;
  joinedDate: string;
}

export type UserEventsResponse = ApiResponse<EventItemType[]>;
