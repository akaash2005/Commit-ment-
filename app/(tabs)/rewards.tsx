import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Student, Reward, Redemption } from '../../types/database';

const { width: screenWidth } = Dimensions.get('window');

// ---------------------- Types ----------------------
// Using types from database.ts

// ---------------------- Custom Components ----------------------
const AnimatedCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const ProgressBar: React.FC<{ value: number; color?: string }> = ({ value, color = '#6366F1' }) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(value / 100, { duration: 1000 });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressBar, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
};

const Badge: React.FC<{ label: string; color?: string }> = ({ label, color = '#10B981' }) => (
  <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const GradientButton: React.FC<{
  title: string;
  onPress: () => void;
  disabled?: boolean;
  colors?: string[];
  style?: any;
}> = ({ title, onPress, disabled = false, colors = ['#6366F1', '#8B5CF6'], style }) => (
  <TouchableOpacity
    style={[styles.buttonContainer, style]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={disabled ? ['#9CA3AF', '#9CA3AF'] : colors}
      style={styles.gradientButton}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={[styles.buttonText, { opacity: disabled ? 0.6 : 1 }]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// ---------------------- Main Component ----------------------
const RewardsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('progress');
  const [student, setStudent] = useState<Student | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemed, setRedeemed] = useState<Redemption[]>([]);
  const [cart, setCart] = useState<Reward[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Fetch student, rewards, and redemption data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data: studentData } = await supabase
          .from('Students')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: rewardsData } = await supabase.from('Rewards').select('*');

        const { data: redeemedData } = await supabase
          .from('Redemptions')
          .select('*, Rewards(*)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (studentData) {
          setStudent(studentData);
          setCredits(studentData.monthly_credits || 0);
        }

        if (rewardsData) setRewards(rewardsData);
        if (redeemedData) setRedeemed(redeemedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // ---------------------- Cart & Redemption Logic ----------------------
  const addToCart = (reward: Reward) => {
    if (!cart.find((r) => r.id === reward.id)) {
      setCart([...cart, reward]);
    }
  };

  const removeFromCart = (rewardId: number) => {
    setCart(cart.filter((r) => r.id !== rewardId));
  };

  const checkoutCart = async () => {
    if (!student || !user?.id) return;
    const totalCost = cart.reduce((acc, r) => acc + r.cost, 0);
    if (totalCost > credits) {
      Alert.alert('Insufficient Credits', 'You do not have enough credits for this purchase.');
      return;
    }

    try {
      // Insert into redemptions table
      for (const reward of cart) {
        await supabase.from('Redemptions').insert({
          student_id: user.id,
          reward_id: reward.id,
        });
      }

      // Deduct credits
      const { error } = await supabase
        .from('Students')
        .update({ monthly_credits: credits - totalCost })
        .eq('id', user.id);

      if (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to process redemption. Please try again.');
      } else {
        setCredits(credits - totalCost);
        setRedeemed([
          ...redeemed,
          ...cart.map((r) => ({
            reward: r,
            id: Date.now(),
            redeemed_at: new Date().toISOString(),
          })),
        ]);
        setCart([]);
        Alert.alert('Success!', 'Rewards redeemed successfully!');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  // ---------------------- Data Processing ----------------------
  const nudges = student
    ? [
        student.attendance_pct < 75
          ? '⚠️ Try to attend regularly! Aim for 90% this month.'
          : '✅ Great job on attendance! Keep it up!',
        student.marks_pct < 60
          ? '📖 Spend 30 minutes daily revising — it will help boost marks.'
          : '🎉 You are doing well in academics!',
        student.remedial_participation
          ? '👏 Attended remedial sessions — extra effort counts!'
          : 'Consider joining a remedial session for bonus credits.',
      ]
    : [];

  const chartData = student
    ? [
        {
          name: 'Attendance',
          population: student.attendance_pct,
          color: COLORS[0],
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        },
        {
          name: 'Marks',
          population: student.marks_pct,
          color: COLORS[1],
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        },
        {
          name: 'Remedial',
          population: student.remedial_participation ? 10 : 0,
          color: COLORS[2],
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        },
      ]
    : [];

  const badges = student
    ? [
        { label: 'Consistent Learner', condition: student.attendance_pct >= 90, color: '#10B981' },
        { label: 'Active Participant', condition: student.remedial_participation, color: '#F59E0B' },
        { label: 'Scholar in Progress', condition: student.marks_pct >= 75, color: '#8B5CF6' },
      ]
    : [];

  const tabs = [
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'nudges', label: 'AI Tips', icon: '🤖' },
    { id: 'impact', label: 'Impact', icon: '📈' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Please log in to view rewards</Text>
          <Text style={styles.noDataSubtext}>You need to be authenticated to access the rewards dashboard</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------- Render Functions ----------------------
  const renderProgressTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard>
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.headerGradient}>
          <Text style={styles.cardTitle}>Smart Progress Tracking</Text>
          <Text style={styles.cardSubtitle}>Track your learning journey</Text>
        </LinearGradient>
        
        {student && (
          <View style={styles.cardContent}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>📚 Attendance</Text>
                <Text style={styles.progressValue}>{student.attendance_pct}%</Text>
              </View>
              <ProgressBar value={student.attendance_pct} color="#10B981" />
            </View>

            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>🎯 Marks</Text>
                <Text style={styles.progressValue}>{student.marks_pct}%</Text>
              </View>
              <ProgressBar value={student.marks_pct} color="#F59E0B" />
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>
                🔥 Remedial: {student.remedial_participation ? 'Active' : 'Inactive'}
              </Text>
            </View>

            <View style={styles.creditsContainer}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.creditsGradient}>
                <Text style={styles.creditsLabel}>Total Credits</Text>
                <Text style={styles.creditsValue}>{credits}</Text>
              </LinearGradient>
            </View>

            <View style={styles.badgesContainer}>
              {badges.map(
                (badge, i) =>
                  badge.condition && (
                    <Badge key={i} label={badge.label} color={badge.color} />
                  )
              )}
            </View>
          </View>
        )}
      </AnimatedCard>
    </ScrollView>
  );

  const renderRewardsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.headerGradient}>
          <Text style={styles.cardTitle}>Redeem Rewards</Text>
          <Text style={styles.cardSubtitle}>Credits Available: {credits}</Text>
        </LinearGradient>

        <View style={styles.cardContent}>
          <FlatList
            data={rewards}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.rewardItem}>
                <LinearGradient colors={['#F3F4F6', '#E5E7EB']} style={styles.rewardCard}>
                  <Text style={styles.rewardTitle}>{item.title}</Text>
                  <Text style={styles.rewardCost}>{item.cost} credits</Text>
                  <GradientButton
                    title={cart.find((c) => c.id === item.id) ? '✓ Added' : 'Add to Cart'}
                    onPress={() => addToCart(item)}
                    disabled={cart.find((c) => c.id === item.id) !== undefined}
                    style={styles.addButton}
                    colors={cart.find((c) => c.id === item.id) ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
                  />
                </LinearGradient>
              </View>
            )}
          />

          {cart.length > 0 && (
            <AnimatedCard style={styles.cartContainer}>
              <Text style={styles.cartTitle}>🛒 Cart ({cart.length} items)</Text>
              {cart.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View>
                    <Text style={styles.cartItemName}>{item.title}</Text>
                    <Text style={styles.cartItemCost}>{item.cost} credits</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.cartFooter}>
                <Text style={styles.cartTotal}>
                  Total: {cart.reduce((sum, r) => sum + r.cost, 0)} credits
                </Text>
                <GradientButton
                  title="Checkout"
                  onPress={checkoutCart}
                  colors={['#10B981', '#059669']}
                />
              </View>
            </AnimatedCard>
          )}

          {redeemed.length > 0 && (
            <View style={styles.redeemedSection}>
              <Text style={styles.sectionTitle}>✅ Redeemed Rewards</Text>
              {redeemed.slice(0, 5).map((item, i) => (
                <View key={i} style={styles.redeemedItem}>
                  <Text style={styles.redeemedText}>{item.reward.title}</Text>
                  <Text style={styles.redeemedDate}>
                    {new Date(item.redeemed_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderNudgesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.headerGradient}>
          <Text style={styles.cardTitle}>AI Nudges</Text>
          <Text style={styles.cardSubtitle}>Personalized tips for success</Text>
        </LinearGradient>

        <View style={styles.cardContent}>
          {nudges.map((nudge, i) => (
            <View key={i} style={styles.nudgeItem}>
              <Text style={styles.nudgeText}>{nudge}</Text>
            </View>
          ))}
          
          <GradientButton
            title="📱 Share with Parents via SMS"
            onPress={() => Alert.alert('Feature Coming Soon', 'SMS sharing will be available soon!')}
            style={styles.shareButton}
            colors={['#059669', '#047857']}
          />
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderImpactTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard>
        <LinearGradient colors={['#EC4899', '#BE185D']} style={styles.headerGradient}>
          <Text style={styles.cardTitle}>Impact Dashboard</Text>
          <Text style={styles.cardSubtitle}>September Learning Impact</Text>
        </LinearGradient>

        <View style={styles.cardContent}>
          {chartData.some(item => item.population > 0) ? (
            <>
              <PieChart
                data={chartData.filter(item => item.population > 0)}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
              <View style={styles.impactSummary}>
                <LinearGradient colors={['#F3F4F6', '#E5E7EB']} style={styles.summaryCard}>
                  <Text style={styles.summaryText}>
                    🎉 This month you earned {credits} credits!
                  </Text>
                  <Text style={styles.summarySubtext}>
                    Keep up the great work and continue your learning journey!
                  </Text>
                </LinearGradient>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>📊 No data available yet</Text>
              <Text style={styles.noDataSubtext}>
                Start attending classes and completing assignments to see your impact!
              </Text>
            </View>
          )}
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'progress':
        return renderProgressTab();
      case 'rewards':
        return renderRewardsTab();
      case 'nudges':
        return renderNudgesTab();
      case 'impact':
        return renderImpactTab();
      default:
        return renderProgressTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>🎁 Rewards Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your learning journey</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

// ---------------------- Styles ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    marginTop: 4,
  },
  tabContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 4,
  },
  cardContent: {
    padding: 20,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  creditsContainer: {
    marginVertical: 20,
  },
  creditsGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  creditsLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  creditsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardItem: {
    flex: 1,
    margin: 8,
  },
  rewardCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  rewardCost: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    marginTop: 8,
  },
  cartContainer: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cartItemCost: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  redeemedSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  redeemedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  redeemedText: {
    fontSize: 14,
    color: '#374151',
  },
  redeemedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  nudgeItem: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  nudgeText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  shareButton: {
    marginTop: 16,
  },
  impactSummary: {
    marginTop: 20,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  summarySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default RewardsDashboard;