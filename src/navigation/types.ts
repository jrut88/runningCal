import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type GroupStackParamList = {
  GroupList: undefined;
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  InviteMember: { groupId: string };
  EventList: { groupId: string; groupName: string };
  EventDetail: { eventId: string; groupId: string };
  CreateEvent: { groupId: string };
  RsvpScreen: { eventId: string };
  PaymentRequest: { eventId: string; groupId: string };
  PaymentStatus: { paymentRequestId: string; eventTitle: string };
};

export type EventsStackParamList = {
  AllEvents: undefined;
  EventDetail: { eventId: string; groupId: string };
};

export type AppTabParamList = {
  GroupsTab: NavigatorScreenParams<GroupStackParamList>;
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  ProfileTab: undefined;
};
