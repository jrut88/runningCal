import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Text } from 'react-native';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import AllEventsScreen from '../screens/events/AllEventsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { GroupStack } from './GroupStack';
import type { AppTabParamList, EventsStackParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();
const EventsStack = createStackNavigator<EventsStackParamList>();

const headerStyle = {
  headerStyle: { backgroundColor: '#16a34a' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const },
};

function EventsNavigator() {
  return (
    <EventsStack.Navigator screenOptions={headerStyle}>
      <EventsStack.Screen name="AllEvents" component={AllEventsScreen} options={{ title: 'Upcoming Events' }} />
      <EventsStack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
    </EventsStack.Navigator>
  );
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
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 18 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 18 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: focused ? 22 : 18 }}>👤</Text>,
          headerShown: true,
          headerTitle: 'Profile',
          ...headerStyle,
        }}
      />
    </Tab.Navigator>
  );
}
