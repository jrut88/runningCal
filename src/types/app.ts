import type { MemberRole, PaymentRequestStatus, PaymentStatus, RsvpStatus } from './supabase';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  sport: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  user?: Profile;
}

export interface GroupWithRole extends Group {
  role: MemberRole;
}

export interface Event {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  max_players: number | null;
  cost_per_head: number;
  currency: string;
  created_by: string;
  created_at: string;
}

export interface Rsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  updated_at: string;
  user?: Profile;
}

export interface PaymentRequest {
  id: string;
  event_id: string;
  created_by: string;
  amount: number;
  currency: string;
  description: string | null;
  status: PaymentRequestStatus;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  payment_request_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider_ref: string | null;
  paid_at: string | null;
  created_at: string;
  user?: Profile;
}

export { MemberRole, PaymentRequestStatus, PaymentStatus, RsvpStatus };
