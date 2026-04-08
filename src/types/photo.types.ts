// types/photo.types.ts

export interface UploadPhotoData {
  photo: {
    uri: string;
    type: string;
    name: string;
  };
  eventId?: string;
}

export interface Face {
  faceId: string;
  photos: Photo[];
  count: number;
}

export interface GetFacesResponse {
  faces: Face[];
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
  eventId: string;
  faceId?: string;
}

export interface GetMyPhotosParams {
  eventId: string;
  photo?: any; // Define proper type based on your photo filter criteria
}
