import React from 'react';
import { View, Text } from 'react-native';
import { MessageBubbleProps } from '../types/database';

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isCurrentUser, 
  senderName 
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <View 
      className={`mb-3 ${
        isCurrentUser ? 'items-end' : 'items-start'
      }`}
    >
      <View 
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          isCurrentUser 
            ? 'bg-blue-500 rounded-br-md' 
            : 'bg-gray-100 rounded-bl-md'
        }`}
      >
        <Text 
          className={`text-base leading-6 ${
            isCurrentUser ? 'text-white' : 'text-gray-800'
          }`}
        >
          {message.content}
        </Text>
        
        <Text 
          className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

export default MessageBubble;