export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  eventId?: string;
  eventName?: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags?: string[];
}

export interface UploadPhotoData {
  photo: {
    uri: string;
    type: string;
    name: string;
  };
  eventId?: string;
}