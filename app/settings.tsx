import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  TextInput,
  Modal
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { 
  Bell, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Info, 
  Lock, 
  Mail, 
  MessageSquare, 
  Moon, 
  User, 
  UserX, 
  KeyRound 
} from 'lucide-react-native';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateSettings } = useUserStore();
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const { settings } = user;
  
  const handleToggleNotifications = () => {
    updateSettings({ notifications: !settings.notifications });
  };
  
  const handleToggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };
  
  const handleTogglePrivateProfile = () => {
    updateSettings({ privateProfile: !settings.privateProfile });
  };
  
  const handleToggleHideEmail = () => {
    updateSettings({ hideEmail: !settings.hideEmail });
  };
  
  const handleToggleHideAuthoredQuests = () => {
    updateSettings({ hideAuthoredQuests: !settings.hideAuthoredQuests });
  };
  
  const handleAboutPress = () => {
    Alert.alert(
      "About EcoQuest",
      "EcoQuest is an app designed to help you make a positive impact on the environment through fun, engaging quests and challenges. Track your progress, earn badges, and connect with like-minded individuals on your journey to a more sustainable lifestyle.\n\nVersion 1.0.0",
      [{ text: "OK" }]
    );
  };
  
  const handleHelpPress = () => {
    Alert.alert(
      "Help & Support",
      "Need help with EcoQuest? Check out our FAQ section or contact our support team for assistance.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "View FAQ", onPress: () => console.log("View FAQ") },
        { text: "Contact Support", onPress: () => console.log("Contact Support") }
      ]
    );
  };
  
  const handleContactPress = () => {
    Alert.alert(
      "Contact Us",
      "Have questions, feedback, or suggestions? We'd love to hear from you!",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Email", onPress: () => Linking.openURL("mailto:support@ecoquest.com") },
        { text: "Visit Website", onPress: () => Linking.openURL("https://ecoquest.com") }
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      
      Alert.alert('Success', 'Password updated successfully');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Settings',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={settings.notifications ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Moon size={20} color={colors.primary} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={settings.darkMode ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Lock size={20} color={colors.primary} />
              <Text style={styles.settingText}>Private Profile</Text>
            </View>
            <Switch
              value={settings.privateProfile}
              onValueChange={handleTogglePrivateProfile}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={settings.privateProfile ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Mail size={20} color={colors.primary} />
              <Text style={styles.settingText}>Hide Email Address</Text>
            </View>
            <Switch
              value={settings.hideEmail}
              onValueChange={handleToggleHideEmail}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={settings.hideEmail ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <UserX size={20} color={colors.primary} />
              <Text style={styles.settingText}>Hide Authored Quests</Text>
            </View>
            <Switch
              value={settings.hideAuthoredQuests}
              onValueChange={handleToggleHideAuthoredQuests}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={settings.hideAuthoredQuests ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <KeyRound size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Change Password</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleAboutPress}
          >
            <View style={styles.menuIconContainer}>
              <Info size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>About the App</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleHelpPress}
          >
            <View style={styles.menuIconContainer}>
              <HelpCircle size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleContactPress}
          >
            <View style={styles.menuIconContainer}>
              <MessageSquare size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Contact Us</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>EcoQuest v1.0.0</Text>
        </View>

        <Modal
          visible={passwordModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Password</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setPasswordModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleChangePassword}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.heading2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    ...typography.body,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    ...typography.body,
    flex: 1,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    ...typography.heading3,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    ...typography.body,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});