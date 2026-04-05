import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CountryCodePicker } from 'react-native-country-codes-picker';
import MaterialIcon from '@react-native-vector-icons/material-icons';

interface PhoneInputProps {
  label: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (text: string) => void;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: countryCode || '+1',
    flag: '🇺🇸',
    name: 'USA',
  });

  const handleCountrySelect = (country: any) => {
    setSelectedCountry({
      code: country.dial_code,
      flag: country.flag,
      name: country.name,
    });
    onCountryCodeChange(country.dial_code);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.phoneContainer, error && styles.inputError]}>
        <TouchableOpacity
          style={styles.countryCodeButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCode}>{selectedCountry.code}</Text>
          <MaterialIcon name="arrow-drop-down" size={20} color="#666" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={onPhoneNumberChange}
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <CountryCodePicker
        show={showPicker}
        pickerButtonOnPress={handleCountrySelect}
        onBackdropPress={() => setShowPicker(false)}
        lang="en"
        style={{
          modal: {
            height: Platform.OS === 'ios' ? '90%' : '80%',
          },
          countryButtonStyles: {
            height: 60,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f44336',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
});

export default PhoneInput;