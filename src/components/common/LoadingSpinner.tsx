import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';

interface LoadingSpinnerProps {
  visible: boolean;
  transparent?: boolean;
  backgroundColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  transparent = true,
  backgroundColor = 'rgba(0,0,0,0.5)',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={[styles.overlay, { backgroundColor }]}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;
