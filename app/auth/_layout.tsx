import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import colors from '@/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: styles.content,
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Sign In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: "Create Account",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Reset Password",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: colors.background,
  },
});