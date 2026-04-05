import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet, StatusBar } from "react-native";
import { FitnessContext } from "@/context/FitnessContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="student/[id]" 
        options={{ 
          headerShown: true,
          title: "Student Details"
        }} 
      />
    </Stack>
  );
}

function AppContent() {
  const { colors, isDark, isLoaded } = useTheme();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <RootLayoutNav />
    </View>
  );
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FitnessContext>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AppContent />
            </GestureHandlerRootView>
          </FitnessContext>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
