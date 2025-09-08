"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------- Supabase Setup ----------------------
const supabase = createClient(
  "https://your-supabase-url.supabase.co", // replace with your URL
  "sb_publishable_MkAinQ_yxq2HqGfakMEREg_YguVKGX6" // your anon key
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

// ---------------------- Main Component ----------------------
const RewardsDashboard: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemed, setRedeemed] = useState<Redemption[]>([]);
  const [cart, setCart] = useState<Reward[]>([]);
  const [credits, setCredits] = useState(0);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  // Fetch student, rewards, and redemption data
  useEffect(() => {
    const fetchData = async () => {
      // Example: using student id 1
      const studentId = 1;

      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

      const { data: rewardsData } = await supabase.from("rewards").select("*");

      const { data: redeemedData } = await supabase
        .from("redemptions")
        .select("*, rewards(*)")
        .eq("student_id", studentId)
        .order("inserted_at", { ascending: false });

      if (studentData) {
        setStudent(studentData);
        setCredits(studentData.monthly_credits);
      }

      if (rewardsData) setRewards(rewardsData);
      if (redeemedData) setRedeemed(redeemedData);
    };

    fetchData();
  }, []);

  // ---------------------- Redeem & Cart ----------------------
  const addToCart = (reward: Reward) => {
    if (!cart.find((r) => r.id === reward.id)) setCart([...cart, reward]);
  };

  const removeFromCart = (rewardId: number) => {
    setCart(cart.filter((r) => r.id !== rewardId));
  };

  const checkoutCart = async () => {
    if (!student) return;
    const totalCost = cart.reduce((acc, r) => acc + r.cost, 0);
    if (totalCost > credits) return alert("Not enough credits!");

    // Insert into redemptions table
    for (const reward of cart) {
      await supabase.from("redemptions").insert({
        student_id: student.id,
        reward_id: reward.id,
      });
    }

    // Deduct credits
    const { error } = await supabase
      .from("students")
      .update({ monthly_credits: credits - totalCost })
      .eq("id", student.id);

    if (error) console.error(error);
    else {
      setCredits(credits - totalCost);
      setRedeemed([...redeemed, ...cart.map((r) => ({ reward: r, id: Date.now(), redeemed_at: new Date().toISOString() }))]);
      setCart([]);
    }
  };

  // ---------------------- AI Nudges ----------------------
  const nudges = student
    ? [
        student.attendance_pct < 75
          ? "⚠️ Try to attend regularly! Aim for 90% this month."
          : "✅ Great job on attendance! Keep it up!",
        student.marks_pct < 60
          ? "📖 Spend 30 minutes daily revising — it will help boost marks."
          : "🎉 You’re doing well in academics!",
        student.remedial_participation
          ? "👏 Attended remedial sessions — extra effort counts!"
          : "Consider joining a remedial session for bonus credits.",
      ]
    : [];

  const impactData = student
    ? [
        { name: "Attendance", value: student.attendance_pct },
        { name: "Marks", value: student.marks_pct },
        { name: "Remedial", value: student.remedial_participation ? 10 : 0 },
      ]
    : [];

  const badges = student
    ? [
        { label: "Consistent Learner", condition: student.attendance_pct >= 90 },
        { label: "Active Participant", condition: student.remedial_participation },
        { label: "Scholar in Progress", condition: student.marks_pct >= 75 },
      ]
    : [];

  // ---------------------- Render ----------------------
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-indigo-600">
        🎁 Rewards Dashboard
      </h1>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-2 bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="rewards">Redeem</TabsTrigger>
          <TabsTrigger value="nudges">AI Nudges</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        {/* ---------------- Progress Tracking ---------------- */}
        <TabsContent value="progress">
          <Card className="shadow-lg border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle>Smart Progress Tracking</CardTitle>
              <CardDescription>
                Track your attendance, marks, and remedial participation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {student && (
                <>
                  <div>
                    <p className="font-semibold">Attendance: {student.attendance_pct}%</p>
                    <Progress value={student.attendance_pct} />
                  </div>
                  <div>
                    <p className="font-semibold">Marks: {student.marks_pct}%</p>
                    <Progress value={student.marks_pct} />
                  </div>
                  <div>
                    <p className="font-semibold">
                      Remedial Participation: {student.remedial_participation ? "Yes" : "No"}
                    </p>
                  </div>
                  <p className="font-bold">Total Credits: {credits}</p>

                  <div className="flex gap-2 mt-2">
                    {badges.map(
                      (b, i) => b.condition && <Badge key={i}>{b.label}</Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Redeem Rewards ---------------- */}
        <TabsContent value="rewards">
          <Card className="shadow-lg border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle>Redeem Rewards</CardTitle>
              <CardDescription>
                Add rewards to your cart and redeem using your credits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-semibold">Credits Available: {credits}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rewards.map((r) => (
                  <motion.div
                    key={r.id}
                    whileHover={{ scale: 1.05 }}
                    className="border p-3 rounded-xl shadow hover:shadow-lg transition"
                  >
                    <h3 className="font-bold">{r.title}</h3>
                    <p>Cost: {r.cost} credits</p>
                    <Button
                      className="mt-2 w-full"
                      onClick={() => addToCart(r)}
                      disabled={cart.find((c) => c.id === r.id)}
                    >
                      {cart.find((c) => c.id === r.id) ? "Added" : "Add to Cart"}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Cart Section */}
              {cart.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Cart</h3>
                  <ul className="space-y-2">
                    {cart.map((r) => (
                      <li
                        key={r.id}
                        className="flex justify-between items-center border p-2 rounded-xl"
                      >
                        <span>{r.title}</span>
                        <span>{r.cost} credits</span>
                                                <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(r.id)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold">
                      Total: {cart.reduce((sum, r) => sum + r.cost, 0)} credits
                    </span>
                    <Button onClick={checkoutCart} className="bg-indigo-600 hover:bg-indigo-700">
                      Checkout
                    </Button>
                  </div>
                </div>
              )}

              {/* Redeemed Rewards */}
              {redeemed.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Redeemed Rewards</h3>
                  <ul className="space-y-2">
                    {redeemed.map((r) => (
                      <li key={r.id} className="flex justify-between items-center border p-2 rounded-xl bg-gray-50">
                        <span>✅ {r.reward.title}</span>
                        <span>{new Date(r.redeemed_at).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- AI Nudges ---------------- */}
        <TabsContent value="nudges">
          <Card className="shadow-lg border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle>AI Nudges</CardTitle>
              <CardDescription>Personalized nudges to improve performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {nudges.map((n, i) => (
                <p key={i} className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  {n}
                </p>
              ))}
              <Button variant="outline" className="mt-4">
                Share with Parents via SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Impact Dashboard ---------------- */}
        <TabsContent value="impact">
          <Card className="shadow-lg border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle>Impact Dashboard</CardTitle>
              <CardDescription>
                Visualize your learning impact for the current month.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={impactData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label
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
              <p className="mt-4 font-bold text-indigo-600">
                This month you earned {credits} credits!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardsDashboard;
