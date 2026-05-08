import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RsvpStatus } from '../../types/app';

interface RsvpToggleProps {
  value: RsvpStatus | null;
  onChange: (status: RsvpStatus) => void;
  disabled?: boolean;
}

const OPTIONS: { status: RsvpStatus; label: string; activeColor: string; activeText: string }[] = [
  { status: 'in', label: '✅ In', activeColor: '#16a34a', activeText: '#fff' },
  { status: 'maybe', label: '🤔 Maybe', activeColor: '#f59e0b', activeText: '#fff' },
  { status: 'out', label: '❌ Out', activeColor: '#dc2626', activeText: '#fff' },
];

export function RsvpToggle({ value, onChange, disabled }: RsvpToggleProps) {
  return (
    <View style={ss.row}>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.status;
        return (
          <TouchableOpacity
            key={opt.status}
            style={[ss.btn, isActive && { backgroundColor: opt.activeColor }]}
            onPress={() => onChange(opt.status)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[ss.text, isActive && { color: opt.activeText }]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const ss = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  text: { fontSize: 13, fontWeight: '600', color: '#374151' },
});
