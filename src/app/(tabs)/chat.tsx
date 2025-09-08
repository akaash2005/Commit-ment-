import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, chatService } from '../../lib/supabase';
import { Match, Message, ChatUser } from '../../types/database';

// Current student ID - this would come from authentication/props in real app
const CURRENT_STUDENT_ID = '550e8400-e29b-41d4-a716-446655440000';

// Interface for chat data with Supabase integration
interface ChatData {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Array<{
    id: string;
    message: string;
    isSent: boolean;
    timestamp: string;
    amount_funded?: number;
  }>;
  match_id: string;
  sponsor_id: string;
}
// Helper function to format timestamp
const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes} min ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const ChatListScreen = ({ chats, onChatPress, searchQuery, onSearchChange, loading, error, onRetry }) => {
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.lastMessage}
        </Text>
      </View>
      
      <View style={styles.chatMeta}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}

      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>{searchQuery ? '🔍' : '💭'}</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No chats found' : 'No chats yet'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery 
          ? `No conversations match "${searchQuery}"`
          : 'Start swiping to find matches and begin conversations'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#128c7e" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Chats</Text>
            <Text style={styles.headerSubtitle}>
              {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search chats..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Chat List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25d366" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>⚠️</Text>
          </View>
          <Text style={styles.emptyTitle}>Connection Error</Text>
          <Text style={styles.emptyMessage}>{error}</Text>
          {onRetry && (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          style={styles.chatList}
        />
      )}
    </SafeAreaView>
  );
};

const ChatScreen = ({ chat, onBack, onSendMessage, newMessage, setNewMessage }) => {
  const scrollViewRef = useRef();

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chat.messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage();
    }
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isSent ? styles.sentMessage : styles.receivedMessage
      ]}
    >
      <View style={[
        styles.messageBubble,
        message.isSent ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isSent ? styles.sentText : styles.receivedText
        ]}>
          {message.message}
        </Text>
        {message.amount_funded && (
          <Text style={styles.fundingAmount}>
            💰 ${message.amount_funded} funded
          </Text>
        )}
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            message.isSent ? styles.sentTime : styles.receivedTime
          ]}>
            {message.timestamp}
          </Text>

        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.chatContainer}>
      <StatusBar backgroundColor="#128c7e" barStyle="light-content" />
      
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.chatHeaderAvatar}>
          <Text style={styles.chatHeaderAvatarText}>{chat.avatar}</Text>
        </View>
        
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{chat.name}</Text>
          <Text style={styles.chatHeaderStatus}>
            {chat.isOnline ? 'online' : 'last seen recently'}
          </Text>
        </View>
        

      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.messagesContent}>
          {chat.messages.map(renderMessage)}
        </View>
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: newMessage.trim() ? '#25d366' : '#9CA3AF' }
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default function ChatApp() {
  const [view, setView] = useState('list'); // 'list' or 'chat'
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [chats, setChats] = useState<ChatData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chats and convert to chat format
  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all chat messages for the current user
      const allMessages = await chatService.getChatsForUser(CURRENT_STUDENT_ID);
      
      // Group messages by chat_id
      const chatGroups = allMessages.reduce((groups, message) => {
        const chatId = message.chat_id;
        if (!groups[chatId]) {
          groups[chatId] = [];
        }
        groups[chatId].push(message);
        return groups;
      }, {} as Record<string, typeof allMessages>);
      
      // Convert grouped messages to chat format
      const chatData = Object.entries(chatGroups).map(([chatId, messages]) => {
        // Sort messages by timestamp
        const sortedMessages = messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Get the other user (sponsor) - assume current user is receiver, sponsor is sender
        const sponsorId = sortedMessages.find(msg => msg.sender_id !== CURRENT_STUDENT_ID)?.sender_id;
        const sponsorName = sponsorId ? `Sponsor ${sponsorId.slice(0, 8)}` : 'Unknown Sponsor';
        
        // Format messages
        const formattedMessages = sortedMessages.map(msg => ({
          id: msg.id,
          message: msg.message || '',
          isSent: msg.sender_id === CURRENT_STUDENT_ID,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount_funded: msg.amount_funded
        }));
        
        // Get last message
        const lastMessage = sortedMessages.length > 0 
          ? sortedMessages[sortedMessages.length - 1].message || 'No message content'
          : 'No messages yet';
        
        return {
          id: chatId,
          name: sponsorName,
          avatar: getInitials(sponsorName),
          lastMessage,
          timestamp: sortedMessages.length > 0 
            ? formatTimestamp(sortedMessages[sortedMessages.length - 1].created_at)
            : '',
          unreadCount: 0, // You'd calculate this based on read status
          isOnline: Math.random() > 0.5, // Random for demo - implement real presence
          messages: formattedMessages,
          match_id: chatId, // Using chat_id as match_id for compatibility
          sponsor_id: sponsorId || ''
        };
      });
      
      setChats(chatData);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  const handleChatPress = (chat) => {
    setSelectedChat(chat);
    setView('chat');
    
    // Mark messages as read
    if (chat.unreadCount > 0) {
      setChats(prev => prev.map(c => 
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  };

  const handleBackPress = () => {
    setView('list');
    setSelectedChat(null);
    setNewMessage('');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      // Send message to Supabase
      await chatService.sendMessage(
        selectedChat.id,
        CURRENT_STUDENT_ID,
        selectedChat.sponsor_id,
        newMessage.trim()
      );
      
      // Add message to local state immediately for better UX
      const message = {
        id: Date.now().toString(),
        message: newMessage.trim(),
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Update the selected chat's messages
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, message],
        lastMessage: message.message,
        timestamp: 'now'
      };

      setSelectedChat(updatedChat);
      
      // Update chats list
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id ? updatedChat : chat
      ));

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // You might want to show an error toast here
    }
  };

  if (view === 'list') {
    return (
      <ChatListScreen
        chats={chats}
        onChatPress={handleChatPress}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
        error={error}
        onRetry={fetchChats}
      />
    );
  }

  return (
    <ChatScreen
      chat={selectedChat}
      onBack={handleBackPress}
      onSendMessage={handleSendMessage}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
    />
  );
}

const styles = {
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#128c7e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Search Styles
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  
  // Chat List Styles
  chatList: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#25d366',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#25d366',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  messageStatus: {
    fontSize: 14,
    color: '#25d366',
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    backgroundColor: '#e0f2fe',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 40,
  },
  retryButton: {
    backgroundColor: '#128c7e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  
  // Chat Screen Styles
  chatHeader: {
    backgroundColor: '#128c7e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatHeaderAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  chatHeaderActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  
  // Messages Styles
  messagesContainer: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 8,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sentBubble: {
    backgroundColor: '#dcf8c6',
    borderBottomRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sentText: {
    color: '#333',
  },
  receivedText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  sentTime: {
    color: '#667781',
  },
  receivedTime: {
    color: '#667781',
  },
  
  // Input Styles
  inputContainer: {
    backgroundColor: '#f0f2f5',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundingAmount: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
};