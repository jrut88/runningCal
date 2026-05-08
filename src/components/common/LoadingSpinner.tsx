import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function LoadingSpinner() {
  return (
    <View style={ss.container}>
      <ActivityIndicator size="large" color="#16a34a" />
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
