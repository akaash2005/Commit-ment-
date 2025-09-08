import React, { useState } from "react"
import { View, TextInput, Button, Text } from "react-native"
import { Link } from "expo-router"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return setError(error.message)
    console.log("Logged in:", data.user)
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Login" onPress={handleLogin} />
      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <Link href="/signup" style={{ marginTop: 20, color: "blue" }}>
        Don’t have an account? Sign up
      </Link>
    </View>
  )
}
