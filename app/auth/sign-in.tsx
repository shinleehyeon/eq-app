import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import Button from '@/components/Button';
import { apiClient } from '@/lib/api/client';

export default function SignInScreen() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignIn = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      setError('');
      try {
        const result = await apiClient.signIn(email, password);

        if (result.success && result.data) {
          setUser({
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name,
            avatar: '',
          }, result.data.accessToken);

          router.replace('/(tabs)');
        } else {
          setEmailError('Invalid email or password');
          setPasswordError('Invalid email or password');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('Failed to sign in. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/splash-icon.png')}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your eco journey</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                onBlur={() => validateEmail(email)}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  onBlur={() => validatePassword(password)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Sign In"
              onPress={handleSignIn}
              style={styles.signInButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </Button>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F1',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 240,
    height: 240,
    borderRadius: 20,
  },
  appName: {
    ...typography.heading2,
    marginTop: 8,
    color: colors.primary,
  },
  title: {
    ...typography.heading1,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    ...typography.body,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  passwordContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    ...typography.body,
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  signInButton: {
    marginBottom: 24,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signUpLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});