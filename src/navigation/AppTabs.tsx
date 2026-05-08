import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import AllEventsScreen from '../screens/events/AllEventsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { GroupStack } from './GroupStack';
import type { AppTabParamList, EventsStackParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();

function EventsNavigator() {
  return (
    <EventsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#16a34a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <EventsStack.Screen name="AllEvents" component={AllEventsScreen} options={{ title: 'Upcoming Events' }} />
      <EventsStack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
    </EventsStack.Navigator>
  );
}

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 22 : 18 }}>{emoji}</Text>;
}

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 4 },
      }}
    >
      <Tab.Screen
        name="GroupsTab"
        component={GroupStack}
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Groups" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="Events" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
          headerShown: true,
          headerTitle: 'Profile',
          headerStyle: { backgroundColor: '#16a34a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Tab.Navigator>
  );
}
