import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// 1. 아이콘 팩 직접 불러오기 (에러 방지)
import { Ionicons } from '@expo/vector-icons'; 

// 2. 사용자님 프로젝트 경로에 맞는 훅 불러오기
import { useColorScheme } from '@/hooks/use-color-scheme'; 

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // 3. 파일에서 불러오는 대신 직접 색상 지정 (에러 원천 차단)
  const activeColor = colorScheme === 'dark' ? '#ffffff' : '#007AFF'; 
  const inactiveColor = '#8e8e93';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor, 
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { height: 88 },
          android: { height: 60, paddingBottom: 10 },
        }),
      }}>
      
      {/* 1번 탭: 홈 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2번 탭: 인사이트 */}
      <Tabs.Screen
        name="explore"
        options={{
          title: '인사이트',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}