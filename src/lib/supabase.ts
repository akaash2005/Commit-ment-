import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase configuration with provided credentials
const supabaseUrl = 'https://rtuxsfdroqdnhtagttmj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXhzZmRyb3Fkbmh0YWd0dG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzE4NzAsImV4cCI6MjA1MTI0Nzg3MH0.MkAinQ_yxq2HqGfakMEREg_YguVKGX6wHhcQJvN-Yt8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  },
});

// Helper functions for chat functionality
export const chatService = {
  // Get all matches for a student
  async getMatches(studentId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get messages for a specific chat
  async getMessages(chatId: string) {
    const { data, error } = await supabase
      .from('Chat')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get all chats for a user (as sender or receiver)
  async getChatsForUser(userId: string) {
    const { data, error } = await supabase
      .from('Chat')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Send a new message
  async sendMessage(chatId: string, senderId: string, receiverId: string, messageContent: string, amountFunded?: number) {
    const messageData = {
      chat_id: chatId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: messageContent,
      amount_funded: amountFunded,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('Chat')
      .insert([messageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to new messages for real-time updates
  subscribeToMessages(chatId: string, callback: (message: Database['public']['Tables']['Chat']['Row']) => void) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Chat',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          callback(payload.new as Database['public']['Tables']['Chat']['Row']);
        }
      )
      .subscribe();
  },
};

// Authentication service using Supabase Auth
export const authService = {
  // Sign up new user with email and password
  async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error.message);
        return null;
      }

      // If signup successful, create student profile
      if (data.user) {
        const studentProfile = await this.createStudentProfile(data.user.id, name, email);
        return { user: data.user, session: data.session, profile: studentProfile };
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return null;
    }
  },

  // Sign in user with email and password (Supabase Auth)
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return null;
      }

      // Get student profile
      if (data.user) {
        const profile = await this.getStudentByUserId(data.user.id);
        return { user: data.user, session: data.session, profile };
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  // Sign in user with student ID and password (direct database lookup)
  async signInWithStudentId(studentId: string, password: string) {
    try {
      // First, get the student record to find the associated email
      const { data: student, error: studentError } = await supabase
        .from('Students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError || !student) {
        console.error('Student not found:', studentError?.message);
        return null;
      }

      // If student has user_id, try to sign in with Supabase Auth using email
      if (student.user_id) {
        // Get the user's email from auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(student.user_id);
        
        if (authUser?.user?.email) {
          return await this.signIn(authUser.user.email, password);
        }
      }

      // Fallback: For students without Supabase Auth, create a mock session
      // This is a temporary solution - in production, all users should have proper auth
      return {
        user: null,
        session: null,
        profile: student
      };
    } catch (error) {
      console.error('Student ID login error:', error);
      return null;
    }
  },

  // Create student profile linked to auth user
  async createStudentProfile(userId: string, name: string, email: string) {
    try {
      const { data, error } = await supabase
        .from('Students')
        .insert([{
          user_id: userId,
          name: name,
          // Add default values for other fields as needed
          attendance_pct: 0,
          marks_pct: 0,
          remedial_participation: false,
          monthly_credits: 0,
          redeemed_this_month: 0,
          amount: 0,
          amount_required: 0,
          amount_received: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Create profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Create profile error:', error);
      return null;
    }
  },

  // Get student by user_id (auth.users.id)
  async getStudentByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('Students')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Get student error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get student error:', error);
      return null;
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  },

  // Listen to auth state changes
   onAuthStateChange(callback: (event: string, session: any) => void) {
     return supabase.auth.onAuthStateChange(callback);
   }
 };

// Real-time subscription service
export const realtimeService = {
  // Subscribe to swipes for real-time updates
  subscribeToSwipes(callback: (payload: any) => void) {
    return supabase
      .channel('student_swipes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Swipes' },
        (payload) => {
          console.log('New swipe:', payload.new);
          callback(payload);
        }
      )
      .subscribe();
  },

  // Subscribe to matches for real-time updates
  subscribeToMatches(callback: (payload: any) => void) {
    return supabase
      .channel('student_matches')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('New match:', payload.new);
          callback(payload);
        }
      )
      .subscribe();
  },

  // Subscribe to messages for real-time chat
  subscribeToMessages(chatId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Chat', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          console.log('New message:', payload.new);
          callback(payload);
        }
      )
      .subscribe();
  },

  // Unsubscribe from a channel
  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  }
 };