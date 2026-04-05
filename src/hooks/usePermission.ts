import { useEffect, useState } from 'react';
import { Platform, PermissionsAndroid, Permission } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

type PermissionType = 'camera' | 'storage' | 'photo';

export const usePermission = (type: PermissionType) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const getPermissionName = () => {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'camera':
          return PERMISSIONS.IOS.CAMERA;
        case 'photo':
          return PERMISSIONS.IOS.PHOTO_LIBRARY;
        default:
          return PERMISSIONS.IOS.PHOTO_LIBRARY;
      }
    } else {
      switch (type) {
        case 'camera':
          return PERMISSIONS.ANDROID.CAMERA;
        case 'storage':
          return PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
        case 'photo':
          // For Android 13+, use READ_MEDIA_IMAGES
          if (Number(Platform.Version) >= 33) {
            return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
          }
          return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        default:
          return PERMISSIONS.ANDROID.CAMERA;
      }
    }
  };

  const checkPermission = async () => {
    try {
      const permission = getPermissionName();
      const result = await check(permission);
      setHasPermission(result === RESULTS.GRANTED);
    } catch (error) {
      console.error('Permission check error:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = getPermissionName();
      const result = await request(permission);
      const granted = result === RESULTS.GRANTED;
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return { hasPermission, loading, requestPermission, checkPermission };
};

// Android-specific permission request for images only
export const requestAndroidImagePermissions = async () => {
  if (Platform.OS !== 'android') return true;

  const permissions: Permission[] = [];
  
  // Camera permission
  permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
  
  // Storage permissions based on Android version
  if (Platform.Version >= 33) {
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
  } else {
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple(permissions as Permission[]);
    
    const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
    
    let storageGranted = false;
    if (Platform.Version >= 33) {
      storageGranted = granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      storageGranted = granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
                       granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
    }
    
    return cameraGranted && storageGranted;
  } catch (err) {
    console.warn(err);
    return false;
  }
};