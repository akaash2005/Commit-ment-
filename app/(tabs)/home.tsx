import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const Home = () => {
  const { student, loading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        // Redirect to login page
        router.replace('/(auth)/login');
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to view your dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') {
      return 'NA';
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 75) return '#FF9800'; // Orange
    if (percentage >= 60) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  const getPerformanceLabel = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(student.name || 'Unknown User')}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.studentName}>{student.name || 'Unknown User'}</Text>
              <Text style={styles.studentEmail}>{student.email || 'No email provided'}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <View style={styles.statIcon}>
                <Ionicons name="school" size={24} color="#1976D2" />
              </View>
              <Text style={styles.statValue}>{student.marks_pct?.toFixed(1) || 'N/A'}%</Text>
              <Text style={styles.statLabel}>Academic Score</Text>
              <Text style={[styles.statStatus, { color: getPerformanceColor(student.marks_pct || 0) }]}>
                {getPerformanceLabel(student.marks_pct || 0)}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={24} color="#388E3C" />
              </View>
              <Text style={styles.statValue}>{student.attendance_pct?.toFixed(1) || 'N/A'}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
              <Text style={[styles.statStatus, { color: getPerformanceColor(student.attendance_pct || 0) }]}>
                {getPerformanceLabel(student.attendance_pct || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Information */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Student Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{student.name}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{student.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="people" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{student.gender || 'Not specified'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="id-card" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Student ID</Text>
                  <Text style={styles.infoValue}>{student.id?.slice(0, 8)}...</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Academic Performance</Text>
                <Text style={[styles.performancePercentage, { color: getPerformanceColor(student.marks_pct || 0) }]}>
                  {student.marks_pct?.toFixed(1) || 'N/A'}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${student.marks_pct || 0}%`,
                      backgroundColor: getPerformanceColor(student.marks_pct || 0)
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.performanceItem}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Attendance Rate</Text>
                <Text style={[styles.performancePercentage, { color: getPerformanceColor(student.attendance_pct || 0) }]}>
                  {student.attendance_pct?.toFixed(1) || 'N/A'}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${student.attendance_pct || 0}%`,
                      backgroundColor: getPerformanceColor(student.attendance_pct || 0)
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  statsContainer: {
    padding: 20,
    marginTop: -15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  performanceContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 30,
  },
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceItem: {
    marginBottom: 20,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  performancePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

});

export default Home;
  
