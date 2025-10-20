import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTab } from './MainTab';

// Root Stack의 파라미터 타입 정의
export type RootStackParamList = {
  MainTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root Stack Navigator
export function RootStack() {
  return (
    <Stack.Navigator 
      initialRouteName="MainTab"
      screenOptions={{
        headerShown: false, // MainTab에서 자체 헤더를 사용하므로 숨김
      }}
    >
      <Stack.Screen
        name="MainTab"
        component={MainTab}
      />
    </Stack.Navigator>
  );
}
