import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
}

const styles: Record<Variant, object> = {
  primary: { backgroundColor: '#16a34a' },
  secondary: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#16a34a' },
  danger: { backgroundColor: '#dc2626' },
  ghost: { backgroundColor: 'transparent' },
};

const textStyles: Record<Variant, object> = {
  primary: { color: '#fff' },
  secondary: { color: '#16a34a' },
  danger: { color: '#fff' },
  ghost: { color: '#16a34a' },
};

export function Button({ title, variant = 'primary', loading = false, disabled, style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[ss.base, styles[variant], (disabled || loading) && ss.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#16a34a' : '#fff'} />
      ) : (
        <Text style={[ss.text, textStyles[variant]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const ss = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
