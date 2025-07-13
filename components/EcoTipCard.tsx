import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { fetchUserDataFromFirebase } from '@/utils/firebase-helpers';

interface EcoTip {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  sourceLink?: string;
  imageUrl: string;
  type: string;
  userId: string | null;
  isDeleted: string;
  authorName?: string;
  authorAvatar?: string;
}

interface EcoTipCardProps {
  tip: EcoTip;
  onPress?: (tip: EcoTip) => void;
}

const EcoTipCard: React.FC<EcoTipCardProps> = ({ tip, onPress }) => {
  const [author, setAuthor] = useState<any>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (tip.userId) {
        const authorData = await fetchUserDataFromFirebase(tip.userId);
        if (authorData) {
          setAuthor(authorData);
        }
      }
    };

    fetchAuthor();
  }, [tip.userId]);

  if (!tip || !tip.title || !tip.content) {
    console.warn('Invalid tip data:', tip);
    return null;
  }

  const { title, content, category = 'other', source, imageUrl } = tip;

  const getCategoryColor = () => {
    switch (category) {
      case 'energy':
        return '#FFC107';
      case 'waste':
        return '#4CAF50';
      case 'food':
        return '#FF5722';
      case 'transport':
        return '#2196F3';
      case 'water':
        return '#03A9F4';
      case 'advocacy':
        return '#9C27B0';
      case 'education':
        return '#3F51B5';
      default:
        return colors.primary;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(tip);
    }
  };

  const handleSourcePress = () => {
    if (tip.sourceLink) {
      Linking.openURL(tip.sourceLink).catch(err => 
        console.error('Error opening source link:', err)
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}
      
      <View style={styles.content}>
        <View 
          style={[
            styles.categoryBadge, 
            { backgroundColor: getCategoryColor() }
          ]}
        >
          <Text style={styles.categoryText}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.tipContent} numberOfLines={3}>{content}</Text>
        
        {tip.userId && author && (
          <View style={styles.authorContainer}>
            <Image 
              source={{ 
                uri: author.avatar || require('@/assets/images/default-avatar.png')
              }} 
              style={styles.authorAvatar} 
            />
            <Text style={styles.authorName}>{author.name || 'Anonymous'}</Text>
          </View>
        )}
        
        {source && (
          <TouchableOpacity 
            style={styles.sourceContainer}
            onPress={handleSourcePress}
            disabled={!tip.sourceLink}
          >
            <Text style={styles.source}>Source: {source}</Text>
            <ExternalLink size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    ...typography.heading4,
    marginBottom: 8,
  },
  tipContent: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  source: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default EcoTipCard;