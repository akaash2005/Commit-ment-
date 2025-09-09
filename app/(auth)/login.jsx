import React, { useState } from "react"
import { View, TextInput, Button, Text, ActivityIndicator } from "react-native"
import { Link, router } from "expo-router"
import { useAuth } from "../../context/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const { signInWithEmailPassword, loading } = useAuth()

  const handleLogin = async () => {
    setError(null)

    const trimmedEmail = (email || "").trim()
    const trimmedPassword = (password || "").trim()
    
    if (!trimmedEmail) {
      setError("Please enter your email")
      return
    }
    
    if (!trimmedPassword) {
      setError("Please enter your password")
      return
    }

    const result = await signInWithEmailPassword(trimmedEmail, trimmedPassword)

    if (result.success) {
      console.log("Logged in successfully")
      router.replace("/(tabs)/home")
    } else {
      setError(result.error || "Login failed")
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
        Student Login
      </Text>

      <TextInput 
        placeholder="Email" 
        onChangeText={setEmail} 
        value={email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 }}
      />
      
      <TextInput 
        placeholder="Password" 
        onChangeText={setPassword} 
        value={password}
        secureTextEntry={true}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      {error && <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>{error}</Text>}

      <Link href="/(auth)/signup" style={{ marginTop: 20, color: "blue", textAlign: "center" }}>
        Don't have an account? Sign up
      </Link>
    </View>
  )
}
