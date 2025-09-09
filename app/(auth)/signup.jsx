import React, { useState } from "react"
import { View, TextInput, Button, Text, ActivityIndicator, Picker } from "react-native"
import { Link, router } from "expo-router"
import { supabase } from "@/lib/supabase.ts"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [studentId, setStudentId] = useState("")
  const [gender, setGender] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setError(null)
    setLoading(true)
    
    if (!name.trim() || !email.trim() || !password.trim() || !gender.trim()) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      // Check if email already exists
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from("Students")
        .select("email")
        .eq("email", email.trim())
        .single()

      if (existingEmail) {
        setError("Email already exists")
        setLoading(false)
        return
      }
      
      // Check if student ID already exists (if provided)
      if (studentId.trim()) {
        const { data: existingId, error: idCheckError } = await supabase
          .from("Students")
          .select("id")
          .eq("id", studentId.trim())
          .single()

        if (existingId) {
          setError("Student ID already exists")
          setLoading(false)
          return
        }
      }

      // Create new student record with provided ID or auto-generated UUID
      const studentData = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        gender: gender.trim(),
        attendance_pct: 85.5,
        marks_pct: 90.0
      }
      
      // If student ID is provided, use it; otherwise let database auto-generate UUID
      if (studentId.trim()) {
        studentData.id = studentId.trim()
      }
      
      const { data, error } = await supabase.from("Students").insert([studentData])

      if (error) {
        setError(error.message)
      } else {
        console.log("Student registered successfully")
        router.replace("/login")
      }
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
        Student Registration
      </Text>
      
      <TextInput 
        placeholder="Full Name" 
        onChangeText={setName} 
        value={name}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 }}
      />
      
      <TextInput 
        placeholder="Email" 
        onChangeText={setEmail} 
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
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
      
      <TextInput 
        placeholder="Student ID (optional - leave blank to auto-generate)" 
        onChangeText={setStudentId} 
        value={studentId}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 }}
      />
      
      <TextInput 
        placeholder="Gender (Male/Female/Other)" 
        onChangeText={setGender} 
        value={gender}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 }}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />
      ) : (
        <Button title="Sign Up" onPress={handleSignup} />
      )}
      
      {error && <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>{error}</Text>}

      <Link href="/login" style={{ marginTop: 20, color: "blue", textAlign: "center" }}>
        Already have an account? Login
      </Link>
    </View>
  )
}
