import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ErrorBoundary } from "./error-boundary";
import { useUserStore } from "@/store/user-store";
import { useQuestsStore } from "@/store/challenges-store";
import { useCreativeSubmissionsStore } from "@/store/creative-submissions-store";
import { useLeaderboardStore } from "@/store/leaderboard-store";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const segments = useSegments();
  const router = useRouter();
  const { user, initializeUser } = useUserStore();
  
  // Check if the user is authenticated
  useEffect(() => {
    if (!loaded) return;
    
    const inAuthGroup = segments[0] === 'auth';
    
    if (!user && !inAuthGroup) {
      // Redirect to the sign-in page if not authenticated
      router.replace('/auth/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect to the home page if already authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, loaded]);
  
  // Initialize data on app load
  useEffect(() => {
    if (loaded) {
      // Hide splash screen
      SplashScreen.hideAsync();
      
      // We'll load data in the individual screens to avoid state updates on unmounted components
    }
  }, [loaded]);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}