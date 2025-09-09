// Database schema types for Supabase integration

export interface Chat {
  id: string;
  chat_id: string;
  sender_id: string | null;
  receiver_id: string | null;
  message: string | null;
  created_at: string | null;
  amount_funded: number | null;
}

export interface Redemption {
  id: string;
  student_id: string;
  reward_id: string | null;
  timestamp: string | null;
}

export interface Reward {
  id: string;
  title: string;
  type: string | null;
  cost: number | null;
  sponsor_id: string | null;
  local_only: boolean | null;
}

export interface Sponsor {
  id: string;
  name: string;
  password: string | null;
}

export interface Student {
  id: string;
  name: string;
  attendance_pct: number | null;
  marks_pct: number | null;
  remedial_participation: boolean | null;
  monthly_credits: number | null;
  redeemed_this_month: number | null;
  parent_id: string | null;
  career_goal: string | null;
  amount: number | null;
  amount_required: number | null;
  amount_received: number | null;
  gender: string | null;
  password: string | null;
  email: string | null;
  user_id?: string; // Optional for backward compatibility
}

// Legacy interfaces for backward compatibility
export interface Swipe {
  id: number;
  sponsor_id: string;
  student_id: string | null;
  sponsor: boolean | null;
  created_at: string | null;
}

export interface Match {
  id: string;
  sponsor_id: string;
  student_id: string;
  created_at: string;
}

// Alias for Chat interface
export interface Message extends Chat {}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  is_online?: boolean;
}

export interface ChatScreenProps {
  student_id: string;
  match_id?: string;
}

export interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  senderName?: string;
}

export interface Database {
  public: {
    Tables: {
      Chat: {
        Row: Chat;
        Insert: Omit<Chat, 'id' | 'created_at'>;
        Update: Partial<Omit<Chat, 'id'>>;
      };
      Redemptions: {
        Row: Redemption;
        Insert: Omit<Redemption, 'id' | 'timestamp'>;
        Update: Partial<Omit<Redemption, 'id'>>;
      };
      Rewards: {
        Row: Reward;
        Insert: Omit<Reward, 'id'>;
        Update: Partial<Omit<Reward, 'id'>>;
      };
      Sponsors: {
        Row: Sponsor;
        Insert: Omit<Sponsor, 'id'>;
        Update: Partial<Omit<Sponsor, 'id'>>;
      };
      Students: {
        Row: Student;
        Insert: {
          name: string;
          user_id?: string;
          email?: string | null;
          password?: string | null;
          attendance_pct?: number | null;
          marks_pct?: number | null;
          remedial_participation?: boolean | null;
          monthly_credits?: number | null;
          redeemed_this_month?: number | null;
          parent_id?: string | null;
          career_goal?: string | null;
          amount?: number | null;
          amount_required?: number | null;
          amount_received?: number | null;
          gender?: string | null;
        };
        Update: Partial<Student>;
      };
      // Legacy tables for backward compatibility
      Swipe: {
        Row: Swipe;
        Insert: Omit<Swipe, 'id' | 'created_at'>;
        Update: Partial<Omit<Swipe, 'id'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at'>;
        Update: Partial<Omit<Match, 'id'>>;
      };
    };
  };
}