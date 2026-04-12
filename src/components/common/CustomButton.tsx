import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import MaterialIcons from '@react-native-vector-icons/material-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  leftIcon?: string;
  rightIcon?: string;
  iconColor?: TextStyle['color'];
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  type = 'primary',
  style,
  textStyle,
  leftIcon,
  rightIcon,
  iconColor,
}) => {
  const { colors } = useTheme();
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.primary,
        };
      case 'success':
        return {
          backgroundColor: colors.success,
        };
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'secondary':
        return {
          color: colors.primary,
        };
      case 'danger':
        return {
          color: colors.white,
        };
      default:
        return {
          color: colors.white,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.row}>
          {leftIcon && (
            <MaterialIcons
              name={leftIcon || 'arrow-left'}
              size={26}
              color={iconColor || colors.text}
              style={{ marginRight: 2 }}
            />
          )}
          <Text style={[styles.buttonText, getTextStyle(), textStyle]}>
            {title}
          </Text>
          {rightIcon && (
            <MaterialIcons
              name={rightIcon || 'arrow-right-alt'}
              size={26}
              color={iconColor || colors.text}
              style={{ marginLeft: 2 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
});

export default CustomButton;
