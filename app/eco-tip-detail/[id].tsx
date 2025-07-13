import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
  Modal
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { ExternalLink, Share2, User, MoreVertical, Pencil, Trash2 } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { fetchUserDataFromFirebase } from '@/utils/firebase-helpers';
import { database } from '@/config/firebase';
import { ref, get, set } from 'firebase/database';
import { useUserStore } from '@/store/user-store';

export default function EcoTipDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tip, setTip] = useState(null);
  const [author, setAuthor] = useState(null);
  const [relatedTips, setRelatedTips] = useState([]);
  const { user } = useUserStore();
  const [menuVisible, setMenuVisible] = useState(false);
  
  useEffect(() => {
    const fetchTipData = async () => {
      if (!id) return;
      
      try {
        const tipRef = ref(database, `learn/${id}`);
        const snapshot = await get(tipRef);
        
        if (snapshot.exists()) {
          const tipData = snapshot.val();
          // Don't show deleted tips
          if (tipData.isDeleted === true) {
            router.back();
            return;
          }
          setTip({ id, ...tipData });
        }
      } catch (error) {
        console.error('Error fetching tip:', error);
      }
    };

    fetchTipData();
  }, [id]);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (tip?.userId) {
        const authorData = await fetchUserDataFromFirebase(tip.userId);
        if (authorData) {
          setAuthor(authorData);
        }
      }
    };

    fetchAuthor();
  }, [tip?.userId]);

  useEffect(() => {
    const fetchRelatedTips = async () => {
      if (!tip?.category) return;

      try {
        const learnRef = ref(database, 'learn');
        const snapshot = await get(learnRef);
        
        if (snapshot.exists()) {
          const allTips = Object.entries(snapshot.val())
            .map(([key, value]: [string, any]) => ({ id: key, ...value }))
            .filter(t => t.id !== id && t.category === tip.category && !t.isDeleted)
            .slice(0, 2);
          
          setRelatedTips(allTips);
        }
      } catch (error) {
        console.error('Error fetching related tips:', error);
      }
    };

    fetchRelatedTips();
  }, [tip?.category, id]);
  
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:\?v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderVideoPlayer = () => {
    if (tip?.resourceType === 'video' && tip.videoLink) {
      const videoId = getYouTubeVideoId(tip.videoLink);
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      return (
        <View style={styles.videoContainer}>
          <WebView
            style={styles.video}
            source={{ uri: embedUrl }}
            allowsFullscreenVideo
            javaScriptEnabled
          />
        </View>
      );
    }
    return null;
  };
  
  if (!tip) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${tip.title}\n\n${tip.content}\n\nSource: ${tip.source || 'EcoBloom App'}`,
        title: tip.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDeleteTip = async () => {
    Alert.alert(
      "Delete Eco Tip",
      "Are you sure you want to delete this eco tip?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const tipRef = ref(database, `learn/${id}`);
              await set(tipRef, {
                ...tip,
                isDeleted: true,
                deletedAt: new Date().toISOString()
              });
              router.back();
            } catch (error) {
              console.error('Error deleting tip:', error);
              Alert.alert('Error', 'Failed to delete eco tip');
            }
          }
        }
      ]
    );
  };
  
  const getCategoryColor = () => {
    switch (tip.category) {
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

  const renderHeaderRight = () => {
    if (user?.id === tip?.userId) {
      return (
        <TouchableOpacity 
          onPress={() => setMenuVisible(true)}
          style={styles.headerButton}
        >
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity 
        onPress={handleShare}
        style={styles.headerButton}
      >
        <Share2 size={24} color={colors.text} />
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Eco Tip',
          headerTitleStyle: styles.headerTitle,
          headerRight: renderHeaderRight,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tip.imageUrl && (
          <Image 
            source={{ uri: tip.imageUrl }} 
            style={styles.image} 
            resizeMode="cover" 
          />
        )}
        
        {renderVideoPlayer()}
        
        <View style={styles.content}>
          <View 
            style={[
              styles.categoryBadge, 
              { backgroundColor: getCategoryColor() }
            ]}
          >
            <Text style={styles.categoryText}>
              {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
            </Text>
          </View>
          
          <Text style={styles.title}>{tip.title}</Text>
          <Text style={styles.tipContent}>{tip.content}</Text>
          
          {tip.userId && author && (
            <View style={styles.authorContainer}>
              <Image 
                source={{ 
                  uri: author.avatar || require('@/assets/images/default-avatar.png')
                }} 
                style={styles.authorAvatar} 
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{author.name || 'Anonymous'}</Text>
                <Text style={styles.authorSubtext}>Author</Text>
              </View>
            </View>
          )}
          
          {tip.source && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceLabel}>Source:</Text>
              <View style={styles.sourceContent}>
                <Text style={styles.sourceText}>{tip.source}</Text>
                <ExternalLink size={16} color={colors.textSecondary} />
              </View>
            </View>
          )}
          
          <View style={styles.relatedTipsContainer}>
            <Text style={styles.relatedTipsTitle}>Related Tips</Text>
            
            {relatedTips.map(relatedTip => (
              <TouchableOpacity 
                key={relatedTip.id}
                style={styles.relatedTipItem}
                onPress={() => router.push(`/eco-tip-detail/${relatedTip.id}`)}
              >
                <Text style={styles.relatedTipTitle}>{relatedTip.title}</Text>
                <Text style={styles.relatedTipContent} numberOfLines={2}>
                  {relatedTip.content}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push(`/edit-eco-tip/${id}`);
              }}
            >
              <Pencil size={20} color={colors.text} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleDeleteTip();
              }}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleShare();
              }}
            >
              <Share2 size={20} color={colors.text} />
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.heading3,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 200,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  video: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    ...typography.heading2,
    marginBottom: 16,
  },
  tipContent: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: 24,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  authorSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sourceContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sourceLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 4,
  },
  sourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceText: {
    ...typography.body,
    fontStyle: 'italic',
  },
  relatedTipsContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  relatedTipsTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  relatedTipItem: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  relatedTipTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 4,
  },
  relatedTipContent: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuText: {
    ...typography.body,
  },
});