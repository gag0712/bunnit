import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>캘린더</Text>
      <Text style={styles.subtitle}>일정을 관리하세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
