import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase configuration with provided credentials
const supabaseUrl = 'https://rtuxsfdroqdnhtagttmj.supabase.co';
const supabaseAnonKey = 'sb_publishable_MkAinQ_yxq2HqGfakMEREg_YguVKGX6';

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
  // Get all swipes for a student
  async getSwipesForStudent(studentId: string) {
    const { data, error } = await supabase
      .from('Swipe')
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
      .insert(messageData as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to new messages for real-time updates
  subscribeToMessages(chatId: string, callback: (message: Database['public']['Tables']['Chat']['Row']) => void) {
    return supabase
      .channel(`messages:${chatId}`)
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

  // Create a new swipe
  async createSwipe(sponsorId: string, studentId: string | null, sponsor: boolean) {
    const { data, error } = await supabase
      .from('Swipe')
      .insert({
        sponsor_id: sponsorId,
        student_id: studentId,
        sponsor: sponsor,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Rewards service
export const rewardsService = {
  // Get all rewards
  async getAllRewards() {
    const { data, error } = await supabase
      .from('Rewards')
      .select('*')
      .order('cost', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get rewards by sponsor
  async getRewardsBySponsor(sponsorId: string) {
    const { data, error } = await supabase
      .from('Rewards')
      .select('*')
      .eq('sponsor_id', sponsorId)
      .order('cost', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Create a new reward
  async createReward(title: string, type: string | null, cost: number | null, sponsorId: string | null, localOnly: boolean | null) {
    const { data, error } = await supabase
      .from('Rewards')
      .insert({
        title,
        type,
        cost,
        sponsor_id: sponsorId,
        local_only: localOnly
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a reward
  async updateReward(id: string, updates: Partial<Database['public']['Tables']['Rewards']['Update']>) {
    const { data, error } = await supabase
      .from('Rewards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a reward
  async deleteReward(id: string) {
    const { error } = await supabase
      .from('Rewards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Sponsors service
export const sponsorsService = {
  // Get all sponsors
  async getAllSponsors() {
    const { data, error } = await supabase
      .from('Sponsors')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get sponsor by ID
  async getSponsorById(id: string) {
    const { data, error } = await supabase
      .from('Sponsors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create a new sponsor
  async createSponsor(name: string, password: string | null) {
    const { data, error } = await supabase
      .from('Sponsors')
      .insert({
        name,
        password
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update sponsor
  async updateSponsor(id: string, updates: Partial<Database['public']['Tables']['Sponsors']['Update']>) {
    const { data, error } = await supabase
      .from('Sponsors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Redemptions service
export const redemptionsService = {
  // Get all redemptions for a student
  async getRedemptionsByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('Redemptions')
      .select('*, Rewards(*)')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get all redemptions for a reward
  async getRedemptionsByReward(rewardId: string) {
    const { data, error } = await supabase
      .from('Redemptions')
      .select('*, Students(*)')
      .eq('reward_id', rewardId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create a new redemption
  async createRedemption(studentId: string, rewardId: string | null) {
    const { data, error } = await supabase
      .from('Redemptions')
      .insert({
        student_id: studentId,
        reward_id: rewardId,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Students service
export const studentsService = {
  // Get all students
  async getAllStudents() {
    const { data, error } = await supabase
      .from('Students')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get student by ID
  async getStudentById(id: string) {
    const { data, error } = await supabase
      .from('Students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update student
  async updateStudent(id: string, updates: Partial<Database['public']['Tables']['Students']['Update']>) {
    const { data, error } = await supabase
      .from('Students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
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
      // Authenticate directly against Students table
      const { data: student, error } = await supabase
        .from('Students')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !student) {
        console.error('Login error: Invalid email or password');
        return null;
      }

      // Return student data as both user and profile
      return {
        user: { id: student.id, email: student.email },
        session: null, // No Supabase Auth session needed
        profile: student
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  // Sign in user with student ID and password (direct database lookup)
  async signInWithStudentId(studentId: string, password: string) {
    try {
      // Authenticate directly against Students table using ID and password
      const { data: student, error } = await supabase
        .from('Students')
        .select('*')
        .eq('id', studentId)
        .eq('password', password)
        .single();

      if (error || !student) {
        console.error('Login error: Invalid student ID or password');
        return null;
      }

      // Return student data as both user and profile
      return {
        user: { id: student.id, email: student.email },
        session: null, // No Supabase Auth session needed
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
        .insert({
          user_id: userId,
          name: name,
          email: email,
          // Add default values for other fields as needed
          attendance_pct: null,
          marks_pct: null,
          remedial_participation: null,
          monthly_credits: null,
          redeemed_this_month: null,
          amount: null,
          amount_required: null,
          amount_received: null,
          parent_id: null,
          career_goal: null,
          gender: null,
          password: null
        } as any)
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
        { event: 'INSERT', schema: 'public', table: 'Swipe' },
        (payload) => {
          console.log('New swipe:', payload.new);
          callback(payload);
        }
      )
      .subscribe();
  },

  // Subscribe to swipes for real-time updates
  subscribeToSwipeUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('swipe_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Swipe' },
        (payload) => {
          console.log('New swipe:', payload.new);
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