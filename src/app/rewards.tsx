import React, { useEffect, useState, useRef } from 'react';
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
  Modal,
  Animated,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ---------------------- Supabase Setup ----------------------
const supabase = createClient(
  'https://rtuxsfdroqdnhtagttmj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXhzZmRyb3Fkbmh0YWd0dG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMTI4ODAsImV4cCI6MjA0Njg4ODg4MH0.MkAinQ_yxq2HqGfakMEREg_YguVKGX6cZXmYRNgtyZQ'
);

// ---------------------- Types ----------------------
interface Student {
  id: number;
  name: string;
  attendance_pct: number;
  marks_pct: number;
  remedial_participation: boolean;
  monthly_credits: number;
  redeemed_this_month: number;
  gender: string;
  career_goal?: string;
  password?: string;
  total_credits_earned?: number;
  level?: number;
}

interface Reward {
  id: number;
  title: string;
  type: string;
  cost: number;
  sponsor_id: string;
  local_only: boolean;
  description?: string;
  icon?: string;
  stock?: number;
}

interface Redemption {
  id: number;
  reward: Reward;
  redeemed_at: string;
  status?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  completed: boolean;
}

// ---------------------- Enhanced Components ----------------------
const AnimatedCard = ({ children, style = {}, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const ProgressBar = ({ value, color = '#6366F1', height = 8, animated = true }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: value,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [value]);

  return (
    <View style={[styles.progressContainer, { height }]}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: color,
            width: animated ? animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }) : `${value}%`,
          },
        ]}
      />
    </View>
  );
};

const Badge = ({ label, color = '#10B981', icon = '🏆' }) => (
  <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
    <Text style={styles.badgeIcon}>{icon}</Text>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

const GradientButton = ({
  title,
  onPress,
  disabled = false,
  colors = ['#6366F1', '#8B5CF6'],
  style = {},
  icon = null,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: disabled ? '#9CA3AF' : colors[0],
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
        <Text style={[styles.buttonText, { opacity: disabled ? 0.6 : 1 }]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ---------------------- Main Component ----------------------
const RewardsDashboard = () => {
  const [activeTab, setActiveTab] = useState('progress');
  const [student, setStudent] = useState<Student | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemed, setRedeemed] = useState<Redemption[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cart, setCart] = useState<Reward[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const COLORS = {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  };

  // Enhanced fetch with real database integration
  const fetchData = async () => {
    try {
      setLoading(true);
      const studentId = 1; // This should come from auth context

      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) {
        console.error('Supabase student error:', studentError);
      } else if (studentData) {
        setStudent(studentData);
        setCredits(studentData.monthly_credits || 0);
        // Achievements are generated based on the real data
        generateAchievements(studentData);
      }

      // Fetch rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .order('cost', { ascending: true });

      if (rewardsError) {
        console.error('Supabase rewards error:', rewardsError);
      } else if (rewardsData) {
        setRewards(rewardsData);
      }

      // Fetch redemptions
      const { data: redeemedData, error: redeemedError } = await supabase
        .from('redemptions')
        .select(`
          id,
          redeemed_at,
          status,
          reward:rewards(*)
        `)
        .eq('student_id', studentId)
        .order('redeemed_at', { ascending: false })
        .limit(10);

      if (redeemedError) {
        console.error('Supabase redeemed error:', redeemedError);
        setRedeemed([]);
      } else if (redeemedData) {
        setRedeemed(redeemedData);
      }
      
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('student_id', studentId);

      if (goalsError) {
        console.error('Supabase goals error:', goalsError);
        setGoals([]);
      } else if (goalsData) {
        setGoals(goalsData);
      }

      if (studentData) {
        generateAchievements(studentData);
      } else {
        setAchievements([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateAchievements = (studentData: any) => {
    const achievementsList: Achievement[] = [
      {
        id: '1',
        title: 'Attendance Champion',
        description: 'Maintain 90% attendance',
        icon: '📅',
        unlocked: studentData.attendance_pct >= 90,
        progress: studentData.attendance_pct,
        target: 90,
      },
      {
        id: '2',
        title: 'Academic Star',
        description: 'Score above 80% in tests',
        icon: '⭐',
        unlocked: studentData.marks_pct >= 80,
        progress: studentData.marks_pct,
        target: 80,
      },
      {
        id: '3',
        title: 'Credit Master',
        description: 'Earn 500 total credits',
        icon: '💎',
        unlocked: (studentData.total_credits_earned || 0) >= 500,
        progress: studentData.total_credits_earned || 0,
        target: 500,
      },
      {
        id: '4',
        title: 'Consistent Learner',
        description: 'Complete 30 days streak',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        target: 30,
      },
    ];
    setAchievements(achievementsList);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const addToCart = (reward: Reward) => {
    if (!cart.find((r) => r.id === reward.id)) {
      setCart([...cart, reward]);
    }
  };

  const removeFromCart = (rewardId: number) => {
    setCart(cart.filter((r) => r.id !== rewardId));
  };

  const checkoutCart = async () => {
    if (!student) return;
    const totalCost = cart.reduce((acc, r) => acc + r.cost, 0);
    
    if (totalCost > credits) {
      Alert.alert(
        '❌ Insufficient Credits',
        `You need ${totalCost - credits} more credits for this purchase.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      '🛒 Confirm Purchase',
      `Redeem ${cart.length} items for ${totalCost} credits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            try {
              for (const reward of cart) {
                await supabase.from('redemptions').insert({
                  student_id: student.id,
                  reward_id: reward.id,
                  status: 'pending',
                });
              }

              const newCredits = credits - totalCost;
              await supabase
                .from('students')
                .update({ 
                  monthly_credits: newCredits,
                  redeemed_this_month: (student.redeemed_this_month || 0) + totalCost 
                })
                .eq('id', student.id);

              setCredits(newCredits);
              setCart([]);
              
              Alert.alert(
                '🎉 Success!',
                'Your rewards have been redeemed successfully! Check your email for details.',
                [{ text: 'Great!', style: 'default' }]
              );
              
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to process redemption. Please try again.');
            }
          },
        },
      ]
    );
  };

  const generateNudges = () => {
    if (!student) return [];
    
    const nudges = [];
    
    if (student.attendance_pct < 75) {
      nudges.push({
        type: 'critical',
        icon: '⚠️',
        message: 'Your attendance is below 75%. Attend all classes this week to earn bonus credits!',
        action: 'Set Reminder',
      });
    } else if (student.attendance_pct >= 90) {
      nudges.push({
        type: 'success',
        icon: '🌟',
        message: 'Excellent attendance! You\'re on track for the Attendance Champion badge.',
        action: 'View Progress',
      });
    }
    
    if (student.marks_pct < 60) {
      nudges.push({
        type: 'warning',
        icon: '📚',
        message: 'Focus on studies! Join tomorrow\'s remedial class for extra credits.',
        action: 'Book Session',
      });
    }
    
    if (!student.remedial_participation) {
      nudges.push({
        type: 'info',
        icon: '💡',
        message: 'Remedial sessions offer 20 bonus credits per session. Join one this week!',
        action: 'View Schedule',
      });
    }
    
    if (student.monthly_credits > 100) {
      nudges.push({
        type: 'reward',
        icon: '🎁',
        message: `You have ${student.monthly_credits} credits! Check out new rewards in the store.`,
        action: 'Browse Rewards',
      });
    }
    
    return nudges;
  };

  const nudges = generateNudges();

  const tabs = [
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'rewards', label: 'Store', icon: '🛍️' },
    { id: 'achievements', label: 'Badges', icon: '🏆' },
    { id: 'nudges', label: 'AI Coach', icon: '🤖' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderProgressTab = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {student && (
        <>
          <AnimatedCard delay={0}>
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {student.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{student.name}</Text>
                <Text style={styles.profileGoal}>🎯 {student.career_goal || 'Future Leader'}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Level {student.level || 1}</Text>
                </View>
              </View>
            </View>
          </AnimatedCard>
          <View style={styles.statsGrid}>
            <AnimatedCard style={styles.statCard} delay={100}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{student.attendance_pct}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
              <ProgressBar value={student.attendance_pct} color={COLORS.success} height={4} />
            </AnimatedCard>
            <AnimatedCard style={styles.statCard} delay={200}>
              <Text style={styles.statIcon}>📝</Text>
              <Text style={styles.statValue}>{student.marks_pct}%</Text>
              <Text style={styles.statLabel}>Marks</Text>
              <ProgressBar value={student.marks_pct} color={COLORS.warning} height={4} />
            </AnimatedCard>
          </View>
          <AnimatedCard delay={300}>
            <View style={[styles.creditsCard, { backgroundColor: COLORS.primary }]}>
              <View style={styles.creditsHeader}>
                <Text style={styles.creditsTitle}>💰 Available Credits</Text>
                <Text style={styles.creditsAmount}>{credits}</Text>
              </View>
              <View style={styles.creditsDivider} />
              <View style={styles.creditsStats}>
                <View style={styles.creditStat}>
                  <Text style={styles.creditStatLabel}>Earned This Month</Text>
                  <Text style={styles.creditStatValue}>
                    +{student.monthly_credits + (student.redeemed_this_month || 0)}
                  </Text>
                </View>
                <View style={styles.creditStat}>
                  <Text style={styles.creditStatLabel}>Spent This Month</Text>
                  <Text style={styles.creditStatValue}>-{student.redeemed_this_month || 0}</Text>
                </View>
              </View>
            </View>
          </AnimatedCard>
          <View style={styles.quickActions}>
            <GradientButton
              title="View History"
              icon="📜"
              onPress={() => setActiveTab('achievements')}
              colors={[COLORS.info, COLORS.primary]}
              style={styles.quickActionButton}
            />
            <GradientButton
              title="Earn More"
              icon="➕"
              onPress={() => setActiveTab('nudges')}
              colors={[COLORS.success, '#059669']}
              style={styles.quickActionButton}
            />
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderRewardsTab = () => (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {['All', 'Meals', 'Education', 'Entertainment', 'Sports', 'Supplies'].map((category) => (
            <TouchableOpacity key={category} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <FlatList
          data={rewards}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <AnimatedCard style={styles.rewardCard} delay={index * 50}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedReward(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.rewardIcon}>{item.icon || '🎁'}</Text>
                <Text style={styles.rewardTitle}>{item.title}</Text>
                <Text style={styles.rewardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.rewardFooter}>
                  <Text style={styles.rewardCost}>{item.cost} credits</Text>
                  {item.stock && item.stock < 10 && (
                    <Text style={styles.rewardStock}>Only {item.stock} left!</Text>
                  )}
                </View>
                <GradientButton
                  title={cart.find((c) => c.id === item.id) ? 'In Cart ✓' : 'Add to Cart'}
                  onPress={() => addToCart(item)}
                  disabled={cart.find((c) => c.id === item.id) !== undefined}
                  style={styles.addToCartButton}
                  colors={cart.find((c) => c.id === item.id) ? [COLORS.success] : [COLORS.primary]}
                />
              </TouchableOpacity>
            </AnimatedCard>
          )}
        />
      </ScrollView>
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => {
            Alert.alert(
              `🛒 Cart (${cart.length} items)`,
              `Total: ${cart.reduce((sum, r) => sum + r.cost, 0)} credits\n\nItems:\n${cart.map(r => `• ${r.title}`).join('\n')}`,
              [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'Clear Cart', style: 'destructive', onPress: () => setCart([]) },
                { text: 'Checkout', onPress: checkoutCart },
              ]
            );
          }}
        >
          <View style={styles.floatingCartBadge}>
            <Text style={styles.floatingCartBadgeText}>{cart.length}</Text>
          </View>
          <Text style={styles.floatingCartIcon}>🛒</Text>
          <Text style={styles.floatingCartTotal}>
            {cart.reduce((sum, r) => sum + r.cost, 0)} ©
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAchievementsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>🏆 Your Achievements</Text>
      
      {achievements.length > 0 ? (
        achievements.map((achievement, index) => (
          <AnimatedCard key={achievement.id} delay={index * 100}>
            <View style={[
              styles.achievementCard,
              achievement.unlocked && styles.achievementUnlocked
            ]}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <View style={styles.achievementProgress}>
                  <ProgressBar 
                    value={(achievement.progress / achievement.target) * 100}
                    color={achievement.unlocked ? COLORS.success : COLORS.warning}
                    height={6}
                  />
                  <Text style={styles.achievementProgressText}>
                    {achievement.progress}/{achievement.target}
                  </Text>
                </View>
              </View>
              {achievement.unlocked && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementBadgeText}>✓</Text>
                </View>
              )}
            </View>
          </AnimatedCard>
        ))
      ) : (
        <Text style={styles.emptyText}>No achievements to display yet. Keep up the great work!</Text>
      )}


      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📜 Recent Redemptions</Text>
      {redeemed.length > 0 ? (
        redeemed.slice(0, 5).map((item, index) => (
          <AnimatedCard key={index} delay={index * 50}>
            <View style={styles.historyItem}>
              <Text style={styles.historyIcon}>{item.reward?.icon || '🎁'}</Text>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>{item.reward?.title || 'Unknown'}</Text>
                <Text style={styles.historyDate}>
                  {new Date(item.redeemed_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.historyStatus,
                { backgroundColor: item.status === 'delivered' ? COLORS.success : COLORS.warning }
              ]}>
                <Text style={styles.historyStatusText}>
                  {item.status || 'Pending'}
                </Text>
              </View>
            </View>
          </AnimatedCard>
        ))
      ) : (
        <Text style={styles.emptyText}>No redemptions yet. Start shopping!</Text>
      )}
    </ScrollView>
  );

  const renderNudgesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AnimatedCard>
        <View style={styles.aiCoachHeader}>
          <Text style={styles.aiCoachTitle}>🤖 Your AI Learning Coach</Text>
          <Text style={styles.aiCoachSubtitle}>
            Personalized tips to maximize your success
          </Text>
        </View>
      </AnimatedCard>
      
      {nudges.length > 0 ? (
        nudges.map((nudge, index) => (
          <AnimatedCard key={index} delay={index * 100}>
            <View style={[
              styles.nudgeCard,
              nudge.type === 'critical' && styles.nudgeCritical,
              nudge.type === 'success' && styles.nudgeSuccess,
              nudge.type === 'warning' && styles.nudgeWarning,
              nudge.type === 'reward' && styles.nudgeReward,
            ]}>
              <Text style={styles.nudgeIcon}>{nudge.icon}</Text>
              <View style={styles.nudgeContent}>
                <Text style={styles.nudgeMessage}>{nudge.message}</Text>
                <TouchableOpacity style={styles.nudgeAction}>
                  <Text style={styles.nudgeActionText}>{nudge.action} →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedCard>
        ))
      ) : (
        <AnimatedCard delay={100}>
          <View style={styles.noNudgesCard}>
            <Text style={styles.noNudgesText}>Your progress is looking good!</Text>
            <Text style={styles.noNudgesSubText}>No active nudges at this time. Keep up the great work. ✨</Text>
          </View>
        </AnimatedCard>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🎯 Weekly Goals</Text>
      <AnimatedCard delay={400}>
        <View style={styles.goalCard}>
          {goals.length > 0 ? (
            goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Text style={styles.goalText}>{goal.title}</Text>
                <View style={styles.goalProgressContainer}>
                  <ProgressBar 
                    value={(goal.progress / goal.target) * 100}
                    color={COLORS.primary}
                    height={6}
                  />
                  <Text style={styles.goalProgressText}>{goal.progress}/{goal.target}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No goals set yet.</Text>
          )}
          <GradientButton title="Add a Goal" onPress={() => Alert.alert('Add New Goal', 'This feature is coming soon!')} style={{ marginTop: 16 }} />
        </View>
      </AnimatedCard>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'progress':
        return renderProgressTab();
      case 'rewards':
        return renderRewardsTab();
      case 'achievements':
        return renderAchievementsTab();
      case 'nudges':
        return renderNudgesTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Hub</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={styles.tabText}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>{renderContent()}</View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <AnimatedCard style={styles.modalContent}>
            {selectedReward && (
              <>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalIcon}>{selectedReward.icon}</Text>
                <Text style={styles.modalTitle}>{selectedReward.title}</Text>
                <Text style={styles.modalDescription}>{selectedReward.description}</Text>
                <Badge label={selectedReward.type} color={COLORS.primary} icon="🏷️" />
                <View style={styles.modalPrice}>
                  <Text style={styles.modalPriceText}>Cost: </Text>
                  <Text style={styles.modalPriceValue}>{selectedReward.cost} credits</Text>
                </View>
                {selectedReward.stock !== undefined && (
                  <Text style={styles.modalStock}>
                    {selectedReward.stock > 0 ? `${selectedReward.stock} in stock` : 'Out of stock'}
                  </Text>
                )}
                <GradientButton
                  title={cart.find((c) => c.id === selectedReward.id) ? 'In Cart' : 'Add to Cart'}
                  onPress={() => {
                    addToCart(selectedReward);
                    setModalVisible(false);
                  }}
                  disabled={cart.find((c) => c.id === selectedReward.id) !== undefined || selectedReward.stock === 0}
                  style={{ marginTop: 20 }}
                />
              </>
            )}
          </AnimatedCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ---------------------- Stylesheet ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
    backgroundColor: '#6366F1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshIcon: {
    fontSize: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 20,
    marginTop: -20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: '#E0E7FF',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4338CA',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileGoal: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginRight: 8,
    padding: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  creditsCard: {
    padding: 24,
  },
  creditsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.8,
  },
  creditsAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  creditsDivider: {
    height: 1,
    backgroundColor: '#9CA3AF',
    marginVertical: 16,
    opacity: 0.3,
  },
  creditsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditStat: {
    alignItems: 'center',
  },
  creditStatLabel: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  creditStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingLeft: 20,
    marginBottom: 10,
  },
  categoryChip: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  rewardCard: {
    flex: 1,
    margin: 8,
    padding: 16,
  },
  rewardIcon: {
    fontSize: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  rewardDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 4,
    height: 32,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rewardCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  rewardStock: {
    fontSize: 12,
    color: '#EF4444',
  },
  addToCartButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingCartBadge: {
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingCartIcon: {
    fontSize: 20,
    color: '#fff',
  },
  floatingCartTotal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  achievementUnlocked: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 8,
  },
  achievementBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  historyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  aiCoachHeader: {
    marginBottom: 16,
  },
  aiCoachTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  aiCoachSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  nudgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nudgeCritical: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  nudgeSuccess: {
    borderColor: '#34D399',
    backgroundColor: '#ECFDF5',
  },
  nudgeWarning: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  nudgeReward: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  nudgeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  nudgeContent: {
    flex: 1,
  },
  nudgeMessage: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  nudgeAction: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  nudgeActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.85,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#6B7280',
  },
  modalIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: 10,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalPriceText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalPriceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalStock: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  goalCard: {
    padding: 20,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 8,
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  noNudgesCard: {
    padding: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  noNudgesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    textAlign: 'center',
  },
  noNudgesSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default RewardsDashboard;