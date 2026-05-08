import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: number;
}

export function Avatar({ name, url, size = 40 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[ss.base, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[ss.base, ss.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[ss.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const ss = StyleSheet.create({
  base: { overflow: 'hidden' },
  fallback: { backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});
