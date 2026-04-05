export interface DeviceRegisterRequest {
  id: string;
  lastLoginUserId: string;
  eDeviceType: number;
  manufacturer: string;
  brand: string;
  model: string;
  board: string;
  serialNo: string;
  deviceId: string;
  screenResolution: string;
  screenDensity: string;
  bootLoader: string;
  user: string;
  host: string;
  apiLevel: string;
  buildID: string;
}
