import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student } from '../types/database';
import { authService, supabase } from './supabase';

interface AuthContextType {
  student: Student | null;
  user: any | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithStudentId: (studentId: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateStudent: (updates: Partial<Student>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STUDENT_STORAGE_KEY = '@student_data';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session and student data on app start
  useEffect(() => {
    initializeAuth();
    
    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Get student profile
        const profile = await authService.getStudentByUserId(session.user.id);
        setStudent(profile);
        if (profile) {
          await saveStudentToStorage(profile);
        }
      } else {
        setStudent(null);
        await AsyncStorage.removeItem(STUDENT_STORAGE_KEY);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const session = await authService.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Get student profile
        const profile = await authService.getStudentByUserId(session.user.id);
        setStudent(profile);
      } else {
        // Try to load from storage as fallback
        const storedStudent = await AsyncStorage.getItem(STUDENT_STORAGE_KEY);
        if (storedStudent) {
          const parsedStudent = JSON.parse(storedStudent);
          setStudent(parsedStudent);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStudentToStorage = async (studentData: Student) => {
    try {
      await AsyncStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(studentData));
    } catch (error) {
      console.error('Error saving student to storage:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      if (!result) {
        throw new Error('Login failed');
      }
      
      setUser(result.user);
      setSession(result.session);
      setStudent(result.profile);
      
      if (result.profile) {
        await saveStudentToStorage(result.profile);
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithStudentId = async (studentId: string, password: string) => {
    try {
      const result = await authService.signInWithStudentId(studentId, password);
      if (!result) {
        throw new Error('Login failed');
      }
      
      setUser(result.user);
      setSession(result.session);
      setStudent(result.profile);
      
      if (result.profile) {
        await saveStudentToStorage(result.profile);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await authService.signUp(email, password, name);
      if (!result) {
        throw new Error('Signup failed');
      }
      
      setUser(result.user);
      setSession(result.session);
      setStudent(result.profile);
      
      if (result.profile) {
        await saveStudentToStorage(result.profile);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      await AsyncStorage.removeItem(STUDENT_STORAGE_KEY);
      setStudent(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateStudent = async (updates: Partial<Student>) => {
    if (!student) return;
    
    try {
      // Update student profile in Supabase
      const { data, error } = await supabase
        .from('Students')
        .update(updates)
        .eq('id', student.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setStudent(data);
      await saveStudentToStorage(data);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    student,
    user,
    session,
    isLoading,
    isAuthenticated: !!student,
    login,
    loginWithStudentId,
    signUp,
    logout,
    updateStudent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;