// Database schema types for Supabase integration

export interface Swipe {
  id: string;
  sponsor_id: string;
  student_id: string;
  direction: 'left' | 'right';
  created_at?: string;
}

export interface Match {
  id: string;
  sponsor_id: string;
  student_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  amount_funded?: number;
}

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
      swipes: {
        Row: Swipe;
        Insert: Omit<Swipe, 'id' | 'created_at'>;
        Update: Partial<Omit<Swipe, 'id'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at'>;
        Update: Partial<Omit<Match, 'id'>>;
      };
      Chat: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id'>>;
      };
    };
  };
}