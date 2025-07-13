import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/user-store';

export default function Index() {
  const { user } = useUserStore();
  
  // Redirect based on authentication status
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/sign-in" />;
  }
}