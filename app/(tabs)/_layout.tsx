import { Tabs } from "expo-router";
import { Users, Plus, TrendingUp, Route } from "lucide-react-native";
import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          borderTopColor: colors.border,
          height: 72,
          paddingBottom: 12,
          paddingTop: 10,
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 14,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Students",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add-test"
        options={{
          title: "Add Test",
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="run"
        options={{
          title: "Live Run",
          tabBarIcon: ({ color, size }) => <Route color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
