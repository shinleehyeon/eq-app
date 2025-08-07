import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [challengeData, setChallengeData] = useState(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setChallengeData({ id, title: 'Challenge Detail' });
    }, 1000);
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: "Challenge",
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!challengeData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: "Challenge",
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Challenge not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Challenge Detail",
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      <View style={styles.content}>
        <Text style={styles.title}>Challenge Detail</Text>
        <Text style={styles.subtitle}>ID: {id}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  headerTitle: {
    ...typography.heading3,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.heading2,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});