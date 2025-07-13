import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { User } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface UserListItemProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  onPress: () => void;
}

export default function UserListItem({ user, onPress }: UserListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {user.avatar ? (
        <Image 
          source={{ uri: user.avatar }} 
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User size={20} color={colors.textSecondary} />
        </View>
      )}
      <Text style={styles.name}>{user.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    ...typography.body,
    color: colors.text,
  },
});