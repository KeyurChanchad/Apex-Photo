import { Alert } from 'react-native';
import { useEffect, useRef } from 'react';

export const useAlert = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const showAlert = (title: string, message?: string, buttons?: any[]) => {
    if (isMounted.current) {
      // Small delay to ensure Activity is attached
      setTimeout(() => {
        Alert.alert(title, message, buttons);
      }, 100);
    }
  };

  return { showAlert };
};
