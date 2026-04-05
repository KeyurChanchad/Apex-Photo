import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { generateUUID } from '../utils/uuid';
import { DeviceRegisterRequest } from '../types/user.types';

export const useDeviceInfo = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const getDeviceInfo = async () => {
    try {
      // Get screen dimensions
      const { width, height } = Dimensions.get('window');

      const deviceInfo: DeviceRegisterRequest = {
        id: generateUUID(), // or generate UUID
        lastLoginUserId: generateUUID(), // Empty initially
        eDeviceType: Platform.OS === 'ios' ? 2 : 1, // 1: Android, 2: iOS
        manufacturer: 'string', //await DeviceInfo.getManufacturer(),
        brand: 'string', //DeviceInfo.getBrand(),
        model: 'string', //DeviceInfo.getModel(),
        board: 'string', //DeviceInfo.getDeviceId(),
        serialNo: 'string', //await DeviceInfo.getSerialNumber(),
        deviceId: 'string', //DeviceInfo.getDeviceId(),
        screenResolution: 'string', //`${width}x${height}`,
        screenDensity: 'string', // DeviceInfo.getFontScale().toString(),
        bootLoader: 'string', //Platform.OS === 'android' ? await DeviceInfo.getBootloader() : 'N/A',
        user: 'string', //await DeviceInfo.getDeviceName(),
        host: 'string', //Platform.OS === 'android' ? await DeviceInfo.getHost() : 'N/A',
        apiLevel: 'string',
        buildID: 'string', //await DeviceInfo.getBuildId(),
      };

      return deviceInfo;
    } catch (error) {
      console.error('Error getting device info:', error);
      throw error;
    }
  };

  return { getDeviceInfo };
};
