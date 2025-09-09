import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authService } from '../lib/supabase.ts';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext({});

// Simple UUID v4 validator (case-insensitive)
const isValidUuid = (value) => {
  if (typeof value !== 'string') return false;
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value.trim());
};

// Storage utility that works on both web and native
const storage = {
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on app start
    const checkStoredSession = async () => {
      try {
        const storedStudentId = await storage.getItem('studentId');
        if (isValidUuid(storedStudentId)) {
          await fetchStudentData(storedStudentId.trim());
        } else if (storedStudentId) {
          // Remove legacy/invalid values like numeric IDs or 'NaN'
          await storage.removeItem('studentId');
        }
      } catch (error) {
        console.error('Error checking stored session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStoredSession();
  }, []);

  const fetchStudentData = async (studentId) => {
    try {
      if (!isValidUuid(studentId)) {
        throw new Error('Invalid student UUID in session');
      }

      const { data: studentData, error } = await supabase
        .from('Students')
        .select('*')
        .eq('id', studentId.trim())
        .single();
      
      if (error) {
        console.error('Error fetching student data:', error);
        throw error;
      }
      
      setStudent(studentData);
      setUser({ id: studentData.id });
      
      // Store session
      await storage.setItem('studentId', String(studentData.id));
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Clear any invalid stored session
      await storage.removeItem('studentId');
      setStudent(null);
      setUser(null);
    }
  };

  const signInWithEmailPassword = async (email, password) => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        return { success: false, error: 'Please enter both email and password' };
      }

      const result = await authService.signIn(email, password);
      
      if (!result) {
        throw new Error('Login failed');
      }
      
      const { user: studentUser, profile } = result;
      
      if (studentUser) {
        setStudent(profile || studentUser);
        setUser({ id: studentUser.id });
        
        // Store session securely using the student's UUID
        await storage.setItem('studentId', String(studentUser.id));
        
        return { success: true };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear stored session
      await storage.removeItem('studentId');
      
      // Clear state
      setUser(null);
      setStudent(null);
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    student,
    loading,
    signInWithEmailPassword,
    signOut,
    fetchStudentData,
    isAuthenticated: !!student,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};