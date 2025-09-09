import React, { useEffect, useState } from 'react';
import { PieChart, Cell, ResponsiveContainer } from 'recharts';

// Mock Supabase client for demonstration
const mockSupabase = {
  from: (table) => ({
    select: (fields) => ({
      eq: (field, value) => ({
        single: async () => {
          if (table === 'students') {
            return {
              data: {
                id: 1,
                name: 'John Doe',
                attendance_pct: 85,
                marks_pct: 78,
                remedial_participation: true,
                monthly_credits: 150,
                redeemed_this_month: 50,
                gender: 'male',
                career_goal: 'Software Engineer'
              }
            };
          }
          return { data: null };
        }
      }),
      order: (field, options) => Promise.resolve({
        data: [
          {
            id: 1,
            reward: {
              id: 1,
              title: 'Free Lunch',
              type: 'meal',
              cost: 20,
              sponsor_id: 'canteen',
              local_only: true
            },
            redeemed_at: '2024-09-01T10:00:00Z'
          }
        ]
      })
    }),
    insert: (data) => Promise.resolve({ data, error: null }),
    update: (data) => ({
      eq: (field, value) => Promise.resolve({ data, error: null })
    })
  })
};

const mockRewards = [
  { id: 1, title: 'Free Lunch', type: 'meal', cost: 20, sponsor_id: 'canteen', local_only: true },
  { id: 2, title: 'Stationery Kit', type: 'supplies', cost: 30, sponsor_id: 'shop', local_only: false },
  { id: 3, title: 'Movie Ticket', type: 'entertainment', cost: 50, sponsor_id: 'cinema', local_only: true },
  { id: 4, title: 'Book Voucher', type: 'education', cost: 40, sponsor_id: 'bookstore', local_only: false }
];

// Types
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
}

interface Reward {
  id: number;
  title: string;
  type: string;
  cost: number;
  sponsor_id: string;
  local_only: boolean;
}

interface Redemption {
  id: number;
  reward: Reward;
  redeemed_at: string;
}

// Custom Components
const AnimatedCard = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 transform ${
      isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
    } ${className}`}>
      {children}
    </div>
  );
};

const ProgressBar = ({ value, color = '#6366F1' }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-1000 ease-out rounded-full"
        style={{ 
          width: `${animatedValue}%`, 
          backgroundColor: color 
        }}
      />
    </div>
  );
};

const Badge = ({ label, color = '#10B981' }) => (
  <span
    className="inline-block px-3 py-1 text-xs font-semibold rounded-full border"
    style={{
      backgroundColor: `${color}20`,
      borderColor: color,
      color: color
    }}
  >
    {label}
  </span>
);

const GradientButton = ({ 
  title, 
  onClick, 
  disabled = false, 
  colors = ['#6366F1', '#8B5CF6'], 
  className = '' 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    style={{
      background: disabled 
        ? '#9CA3AF' 
        : `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`
    }}
  >
    {title}
  </button>
);

// Main Component
const RewardsDashboard = () => {
  const [activeTab, setActiveTab] = useState('progress');
  const [student, setStudent] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [redeemed, setRedeemed] = useState([]);
  const [cart, setCart] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock API calls
        const studentData = await mockSupabase.from('students').select('*').eq('id', 1).single();
        
        if (studentData.data) {
          setStudent(studentData.data);
          setCredits(studentData.data.monthly_credits || 0);
        }

        setRewards(mockRewards);
        
        const redeemedData = await mockSupabase.from('redemptions').select('*, rewards(*)').eq('student_id', 1).order('inserted_at', { ascending: false });
        if (redeemedData.data) setRedeemed(redeemedData.data);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cart & Redemption Logic
  const addToCart = (reward) => {
    if (!cart.find((r) => r.id === reward.id)) {
      setCart([...cart, reward]);
    }
  };

  const removeFromCart = (rewardId) => {
    setCart(cart.filter((r) => r.id !== rewardId));
  };

  const checkoutCart = async () => {
    if (!student) return;
    const totalCost = cart.reduce((acc, r) => acc + r.cost, 0);
    
    if (totalCost > credits) {
      alert('Insufficient Credits: You do not have enough credits for this purchase.');
      return;
    }

    try {
      // Mock redemption process
      const newCredits = credits - totalCost;
      setCredits(newCredits);
      
      const newRedemptions = cart.map((r) => ({
        reward: r,
        id: Date.now() + Math.random(),
        redeemed_at: new Date().toISOString(),
      }));
      
      setRedeemed([...redeemed, ...newRedemptions]);
      setCart([]);
      alert('Success! Rewards redeemed successfully!');
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error: An unexpected error occurred.');
    }
  };

  // Data Processing
  const nudges = student ? [
    student.attendance_pct < 75
      ? '⚠️ Try to attend regularly! Aim for 90% this month.'
      : '✅ Great job on attendance! Keep it up!',
    student.marks_pct < 60
      ? '📖 Spend 30 minutes daily revising — it will help boost marks.'
      : '🎉 You are doing well in academics!',
    student.remedial_participation
      ? '👏 Attended remedial sessions — extra effort counts!'
      : 'Consider joining a remedial session for bonus credits.',
  ] : [];

  const chartData = student ? [
    { name: 'Attendance', value: student.attendance_pct, color: COLORS[0] },
    { name: 'Marks', value: student.marks_pct, color: COLORS[1] },
    { name: 'Remedial', value: student.remedial_participation ? 10 : 0, color: COLORS[2] },
  ].filter(item => item.value > 0) : [];

  const badges = student ? [
    { label: 'Consistent Learner', condition: student.attendance_pct >= 90, color: '#10B981' },
    { label: 'Active Participant', condition: student.remedial_participation, color: '#F59E0B' },
    { label: 'Scholar in Progress', condition: student.marks_pct >= 75, color: '#8B5CF6' },
  ] : [];

  const tabs = [
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'nudges', label: 'AI Tips', icon: '🤖' },
    { id: 'impact', label: 'Impact', icon: '📈' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderProgressTab = () => (
    <div className="space-y-4">
      <AnimatedCard>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h3 className="text-xl font-bold">Smart Progress Tracking</h3>
          <p className="text-indigo-100 mt-1">Track your learning journey</p>
        </div>
        
        {student && (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">📚 Attendance</span>
                <span className="font-bold text-indigo-600">{student.attendance_pct}%</span>
              </div>
              <ProgressBar value={student.attendance_pct} color="#10B981" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">🎯 Marks</span>
                <span className="font-bold text-indigo-600">{student.marks_pct}%</span>
              </div>
              <ProgressBar value={student.marks_pct} color="#F59E0B" />
            </div>

            <div>
              <span className="font-semibold text-gray-700">
                🔥 Remedial: {student.remedial_participation ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white text-center">
              <p className="text-green-100">Total Credits</p>
              <p className="text-3xl font-bold mt-1">{credits}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {badges.map((badge, i) =>
                badge.condition && (
                  <Badge key={i} label={badge.label} color={badge.color} />
                )
              )}
            </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-4">
      <AnimatedCard>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <h3 className="text-xl font-bold">Redeem Rewards</h3>
          <p className="text-orange-100 mt-1">Credits Available: {credits}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {rewards.map((item) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-xl text-center">
                <h4 className="font-semibold text-gray-700 mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm mb-4">{item.cost} credits</p>
                <GradientButton
                  title={cart.find((c) => c.id === item.id) ? '✓ Added' : 'Add to Cart'}
                  onClick={() => addToCart(item)}
                  disabled={cart.find((c) => c.id === item.id) !== undefined}
                  colors={cart.find((c) => c.id === item.id) ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
                />
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <AnimatedCard className="bg-gray-50">
              <div className="p-6">
                <h4 className="font-bold text-gray-700 mb-4">🛒 Cart ({cart.length} items)</h4>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-700">{item.title}</p>
                        <p className="text-gray-500 text-sm">{item.cost} credits</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <span className="font-bold text-gray-700">
                    Total: {cart.reduce((sum, r) => sum + r.cost, 0)} credits
                  </span>
                  <GradientButton
                    title="Checkout"
                    onClick={checkoutCart}
                    colors={['#10B981', '#059669']}
                  />
                </div>
              </div>
            </AnimatedCard>
          )}

          {redeemed.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-gray-700 mb-4">✅ Redeemed Rewards</h4>
              <div className="space-y-2">
                {redeemed.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{item.reward.title}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(item.redeemed_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );

  const renderNudgesTab = () => (
    <div className="space-y-4">
      <AnimatedCard>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <h3 className="text-xl font-bold">AI Nudges</h3>
          <p className="text-purple-100 mt-1">Personalized tips for success</p>
        </div>

        <div className="p-6 space-y-4">
          {nudges.map((nudge, i) => (
            <div key={i} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p className="text-yellow-800">{nudge}</p>
            </div>
          ))}
          
          <GradientButton
            title="📱 Share with Parents via SMS"
            onClick={() => alert('Feature Coming Soon: SMS sharing will be available soon!')}
            className="w-full mt-4"
            colors={['#059669', '#047857']}
          />
        </div>
      </AnimatedCard>
    </div>
  );

  const renderImpactTab = () => (
    <div className="space-y-4">
      <AnimatedCard>
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-6 text-white">
          <h3 className="text-xl font-bold">Impact Dashboard</h3>
          <p className="text-pink-100 mt-1">September Learning Impact</p>
        </div>

        <div className="p-6">
          {chartData.length > 0 ? (
            <>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <p className="font-bold text-gray-700">
                  🎉 This month you earned {credits} credits!
                </p>
                <p className="text-gray-600 mt-2">
                  Keep up the great work and continue your learning journey!
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">📊 No data available yet</p>
              <p className="text-gray-500 mt-2">
                Start attending classes and completing assignments to see your impact!
              </p>
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'progress': return renderProgressTab();
      case 'rewards': return renderRewardsTab();
      case 'nudges': return renderNudgesTab();
      case 'impact': return renderImpactTab();
      default: return renderProgressTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
        <h1 className="text-3xl font-bold text-center">🎁 Rewards Dashboard</h1>
        <p className="text-indigo-100 text-center mt-2">Track your learning journey</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto p-4 space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default RewardsDashboard;
