import { ApiResponse, EventStatusType } from './common.types';

export interface EventDetailType {
  eventId: string;
  name: string;
  eventCode: string;
  description: string | null;
  eventDate: string;
  location: null;
  bannerUrl: string | null;
  eventStatus: EventStatusType;
  isDownloadPhoto: boolean;
  isSharePhoto: boolean;
  shareLink: string | null;
  shareToken: string | null;
  qrCodeBase64: string | null;
}

export type EventDetailResponse = ApiResponse<EventDetailType>;
