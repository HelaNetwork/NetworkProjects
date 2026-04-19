
// These MUST be at the very top, before any other imports
import { Buffer } from "buffer";
import "react-native-get-random-values";
import "../src/polyfills";
global.Buffer = global.Buffer || Buffer;

import { WalletProvider } from "@/context/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="connect" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="buy/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="sell/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="claim" options={{ headerShown: false }} />
      <Stack.Screen name="list/step1" options={{ headerShown: false }} />
      <Stack.Screen name="list/step2" options={{ headerShown: false }} />
      <Stack.Screen name="list/step3" options={{ headerShown: false }} />
      <Stack.Screen name="list/review" options={{ headerShown: false }} />
      <Stack.Screen name="list/draft/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </WalletProvider>
    </QueryClientProvider>
  );
}
