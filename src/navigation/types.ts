export type MainTabParamList = {
  All: undefined;
  UploadPhoto: undefined;
  PhotoDetail: {
    photo: {
      id: string;
      eventName: string;
      url: string;
      uploadedAt: Date;
      width: number;
      height: number;
      fontSize: number;
      tags: string[];
    };
  };
};
