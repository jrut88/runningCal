import React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={ss.wrapper}>
      {label ? <Text style={ss.label}>{label}</Text> : null}
      <TextInput
        style={[ss.input, error ? ss.inputError : null, style]}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error ? <Text style={ss.error}>{error}</Text> : null}
    </View>
  );
}

const ss = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
    minHeight: 48,
  },
  inputError: { borderColor: '#dc2626' },
  error: { fontSize: 12, color: '#dc2626', marginTop: 4 },
});
