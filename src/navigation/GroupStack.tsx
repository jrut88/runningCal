import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import EventListScreen from '../screens/events/EventListScreen';
import RsvpScreen from '../screens/events/RsvpScreen';
import CreateGroupScreen from '../screens/groups/CreateGroupScreen';
import GroupDetailScreen from '../screens/groups/GroupDetailScreen';
import GroupListScreen from '../screens/groups/GroupListScreen';
import InviteMemberScreen from '../screens/groups/InviteMemberScreen';
import PaymentRequestScreen from '../screens/payments/PaymentRequestScreen';
import PaymentStatusScreen from '../screens/payments/PaymentStatusScreen';
import type { GroupStackParamList } from './types';

const Stack = createStackNavigator<GroupStackParamList>();

const headerStyle = {
  headerStyle: { backgroundColor: '#16a34a' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const },
};

export function GroupStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="GroupList" component={GroupListScreen} options={{ title: 'My Groups' }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Group' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'New Group' }} />
      <Stack.Screen name="InviteMember" component={InviteMemberScreen} options={{ title: 'Invite Members' }} />
      <Stack.Screen name="EventList" component={EventListScreen} options={{ title: 'Events' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'New Event' }} />
      <Stack.Screen name="RsvpScreen" component={RsvpScreen} options={{ title: 'RSVPs' }} />
      <Stack.Screen name="PaymentRequest" component={PaymentRequestScreen} options={{ title: 'Request Payment' }} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} options={{ title: 'Payment Status' }} />
    </Stack.Navigator>
  );
}
