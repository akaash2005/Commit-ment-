import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase configuration with provided credentials
const supabaseUrl = 'https://rtuxsfdroqdnhtagttmj.supabase.co';
const supabaseAnonKey = 'sb_publishable_MkAinQ_yxq2HqGfakMEREg_YguVKGX6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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