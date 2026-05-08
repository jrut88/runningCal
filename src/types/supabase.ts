// Manually written Supabase Database types.
// Regenerate with: npx supabase gen types typescript --project-id <id> > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type MemberRole = 'organiser' | 'member';
export type RsvpStatus = 'in' | 'out' | 'maybe';
export type PaymentRequestStatus = 'open' | 'closed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sport: string;
          invite_code: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sport?: string;
          invite_code?: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          sport?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: MemberRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: MemberRole;
          joined_at?: string;
        };
        Update: {
          role?: MemberRole;
        };
        Relationships: [];
      };
      events: {
        Row: {
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
        };
        Insert: {
          id?: string;
          group_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          max_players?: number | null;
          cost_per_head?: number;
          currency?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          location?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          max_players?: number | null;
          cost_per_head?: number;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: RsvpStatus;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: RsvpStatus;
          updated_at?: string;
        };
        Update: {
          status?: RsvpStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_requests: {
        Row: {
          id: string;
          event_id: string;
          created_by: string;
          amount: number;
          currency: string;
          description: string | null;
          status: PaymentRequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          created_by: string;
          amount: number;
          currency?: string;
          description?: string | null;
          status?: PaymentRequestStatus;
          created_at?: string;
        };
        Update: {
          status?: PaymentRequestStatus;
          description?: string | null;
        };
        Relationships: [];
      };
      payment_records: {
        Row: {
          id: string;
          payment_request_id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: PaymentStatus;
          provider_ref: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_request_id: string;
          user_id: string;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          provider_ref?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: PaymentStatus;
          provider_ref?: string | null;
          paid_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_group: {
        Args: { p_name: string; p_sport: string; p_description: string | null };
        Returns: string;
      };
      join_group_by_invite: {
        Args: { p_invite_code: string };
        Returns: string;
      };
      regenerate_invite_code: {
        Args: { p_group_id: string };
        Returns: string;
      };
    };
    Enums: {
      member_role: MemberRole;
      rsvp_status: RsvpStatus;
      payment_request_status: PaymentRequestStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
