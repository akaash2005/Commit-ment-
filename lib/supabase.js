import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rtuxsfdroqdnhtagttmj.supabase.co'
const supabaseKey = 'sb_publishable_MkAinQ_yxq2HqGfakMEREg_YguVKGX6'

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
})

// Chat service for messaging functionality
export const chatService = {
  async sendMessage(chatId, senderId, receiverId, message) {
    try {
      const { data, error } = await supabase
        .from('Chat')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          receiver_id: receiverId,
          message: message
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error sending message:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Chat service error:', error)
      throw error
    }
  },

  async getMessages(chatId) {
    try {
      const { data, error } = await supabase
        .from('Chat')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Chat service error:', error)
      throw error
    }
  },

  async getChatsForUser(userId) {
    try {
      const { data, error } = await supabase
        .from('Chat')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching chats for user:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Chat service error:', error)
      throw error
    }
  }
}

// Authentication service
export const authService = {
  async signInWithEmailPassword(email, password) {
    try {
      // Find the student by email and password
      const { data: student, error: studentError } = await supabase
        .from('Students')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single()
      
      if (studentError || !student) {
        throw new Error('Invalid email or password')
      }
      
      return { user: student, error: null }
    } catch (error) {
      console.error('Auth service error:', error)
      return { user: null, error: error.message }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error.message }
    }
  }
}
