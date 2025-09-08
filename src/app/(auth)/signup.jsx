import React, { useState } from "react"
import { View, TextInput, Button, Text } from "react-native"
import { Link } from "expo-router"
import { supabase } from "@/lib/supabase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [error, setError] = useState(null)

  const handleSignup = async () => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, gender } },
    })
    if (error) return setError(error.message)

    if (data.user) {
      await supabase.from("Student").insert([
        {
          id: data.user.id,
          email,
          name,
          gender,
          attendance_pct: 0,
          marks_pct: 0,
          remedial_participation: false,
          monthly_credits: 0,
          redeemed_this_month: 0,
          amount: 0,
          amount_required: 0,
          amount_received: 0,
        },
      ])
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
      <TextInput placeholder="Name" onChangeText={setName} value={name} />
      <TextInput placeholder="Gender" onChangeText={setGender} value={gender} />
      <Button title="Sign Up" onPress={handleSignup} />
      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <Link href="/login" style={{ marginTop: 20, color: "blue" }}>
        Already have an account? Login
      </Link>
    </View>
  )
}
