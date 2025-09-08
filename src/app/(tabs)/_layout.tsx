import { Tabs } from "expo-router";
import { AntDesign } from "@expo/vector-icons";


export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aimentor"
        options={{
          title: "AI Mentor",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="girlsfirst"
        options={{
          title: "Girls First",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="woman" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="career"
        options={{
          title: "Career Guide",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="message1" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}