import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client setup with your credentials
const supabaseUrl = "https://rtuxsfdroqdnhtagttmj.supabase.co";
const supabaseAnonKey = "sb_publishable_MkAinQ_yxq2HqGfakMEREg_YguVKGX6";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Rewards: React.FC = () => {
  const [activeTab, setActiveTab] = useState("progress");
  const [studentId, setStudentId] = useState<number>(1); // TODO: replace with logged-in student's ID
  const [credits, setCredits] = useState(0);
  const [attendance, setAttendance] = useState(0);
  const [marks, setMarks] = useState(0);
  const [remedial, setRemedial] = useState(0);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeemed, setRedeemed] = useState<any[]>([]);
  const [impactMonth, setImpactMonth] = useState("September");
  const [loading, setLoading] = useState(true);

  // ✅ Load student + rewards from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // get student data
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("credits, attendance, marks, remedial_sessions")
          .eq("id", studentId)
          .single();

        if (studentError) {
          console.error("Error fetching student:", studentError);
        } else if (student) {
          setCredits(student.credits || 0);
          setAttendance(student.attendance || 0);
          setMarks(student.marks || 0);
          setRemedial(student.remedial_sessions || 0);
        }

        // get rewards list
        const { data: rewardList, error: rewardsError } = await supabase
          .from("rewards")
          .select("*");
        
        if (rewardsError) {
          console.error("Error fetching rewards:", rewardsError);
        } else {
          setRewards(rewardList || []);
        }

        // get redeemed rewards
        const { data: redeemedList, error: redeemedError } = await supabase
          .from("redemptions")
          .select("id, redeemed_at, rewards(name, cost)")
          .eq("student_id", studentId)
          .order("redeemed_at", { ascending: false });

        if (redeemedError) {
          console.error("Error fetching redeemed rewards:", redeemedError);
        } else {
          setRedeemed(redeemedList || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // ✅ Redeem reward
  const handleRedeem = async (reward: any) => {
    if (credits < reward.cost) {
      alert("Not enough credits!");
      return;
    }

    try {
      // insert redemption
      const { error: redeemError } = await supabase.from("redemptions").insert({
        student_id: studentId,
        reward_id: reward.id,
      });

      if (redeemError) {
        console.error("Error redeeming reward:", redeemError);
        alert("Failed to redeem reward. Please try again.");
        return;
      }

      // deduct credits
      const { error: creditError } = await supabase
        .from("students")
        .update({ credits: credits - reward.cost })
        .eq("id", studentId);

      if (creditError) {
        console.error("Error updating credits:", creditError);
        alert("Failed to update credits. Please contact support.");
        return;
      }

      // refresh local state
      setCredits(credits - reward.cost);
      setRedeemed([{ rewards: reward }, ...redeemed]);
      alert(`Successfully redeemed ${reward.name}!`);
    } catch (error) {
      console.error("Unexpected error during redemption:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const nudges = [
    attendance < 75
      ? "⚠️ Try to attend regularly! Aim for 90% this month."
      : "✅ Great job on attendance! Keep it up!",
    marks < 60
      ? "📖 Spend 30 minutes daily revising — it will help boost marks."
      : "🎉 You're doing well in academics!",
    remedial > 0
      ? "👏 Attended remedial sessions — extra effort counts!"
      : "Consider joining a remedial session for bonus credits.",
  ];

  const impactData = [
    { name: "Attendance", value: attendance },
    { name: "Marks", value: marks },
    { name: "Remedial", value: remedial * 10 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const badges = [
    { label: "Consistent Learner", condition: attendance >= 90 },
    { label: "Active Participant", condition: remedial >= 2 },
    { label: "Scholar in Progress", condition: marks >= 75 },
  ];

  const tabs = [
    { id: "progress", label: "Progress" },
    { id: "rewards", label: "Redeem" },
    { id: "nudges", label: "AI Nudges" },
    { id: "impact", label: "Impact" }
  ];

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">🎁 Rewards Dashboard</h1>
        <div className="mt-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 grid gap-4">
      <h1 className="text-2xl font-bold">🎁 Rewards Dashboard</h1>

      {/* Custom Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {/* ✅ Progress Tracking */}
        {activeTab === "progress" && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-xl font-semibold">Smart Progress Tracking</h2>
              <div className="space-y-3">
                <div>
                  <p className="mb-1">Attendance: {attendance}%</p>
                  <Progress value={attendance} className="h-2" />
                </div>
                <div>
                  <p className="mb-1">Marks: {marks}%</p>
                  <Progress value={marks} className="h-2" />
                </div>
                <p>Remedial Sessions: {remedial}</p>
                <p className="font-bold text-lg">Total Credits: {credits}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {badges.map(
                  (badge, i) =>
                    badge.condition && (
                      <Badge key={i} className="bg-green-100 text-green-800">
                        {badge.label}
                      </Badge>
                    )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ Redeem Rewards */}
        {activeTab === "rewards" && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-xl font-semibold">Redeem Rewards</h2>
              <p className="text-lg font-medium">Credits Available: {credits}</p>
              
              {rewards.length === 0 ? (
                <p className="text-gray-500">No rewards available at the moment.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((r) => (
                    <div
                      key={r.id}
                      className="border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-lg">{r.name}</h3>
                      <p className="text-gray-600 mb-3">Cost: {r.cost} credits</p>
                      <Button
                        onClick={() => handleRedeem(r)}
                        disabled={credits < r.cost}
                        className="w-full"
                      >
                        {credits < r.cost ? "Insufficient Credits" : "Redeem"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {redeemed.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Redeemed Rewards:</h3>
                  <div className="space-y-2">
                    {redeemed.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <span>{r.rewards?.name || "Unknown reward"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ✅ AI Nudges */}
        {activeTab === "nudges" && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-xl font-semibold">AI Nudges</h2>
              <div className="space-y-3">
                {nudges.map((nudge, i) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p>{nudge}</p>
                  </div>
                ))}
              </div>
              
            </CardContent>
          </Card>
        )}

        {/* ✅ Sponsor Impact */}
        {activeTab === "impact" && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">
                Impact Dashboard ({impactMonth})
              </h2>
              
              {impactData.some(item => item.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={impactData.filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}${name === 'Attendance' || name === 'Marks' ? '%' : ''}`}
                      >
                        {impactData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="mt-4 text-center font-medium">
                    This month you earned {credits} credits!
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No data available yet. Start attending classes and completing assignments to see your impact!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Rewards;