import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';
import EcoTipCard from '@/components/EcoTipCard';
import { BookOpen, Lightbulb, Video, Plus } from 'lucide-react-native';

export default function LearnScreen() {
  const router = useRouter();
  const [learnContent, setLearnContent] = useState([]);
  const [selectedType, setSelectedType] = useState('eco tip');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;

    const fetchLearnContent = async () => {
      try {
        console.log('Fetching learn content...');
        const learnRef = ref(database, 'learn');
        const snapshot = await get(learnRef);
        
        if (snapshot.exists() && isMounted) {
          const rawData = snapshot.val();
          // Filter out deleted tips
          const data = Object.entries(rawData)
            .filter(([_, value]: [string, any]) => value.isDeleted !== true)
            .map(([key, value]: [string, any]) => ({
              ...value,
              id: key
            }));
          
          setLearnContent(data);
        } else {
          console.log('No data found in learn node');
          setLearnContent([]);
        }
      } catch (error) {
        console.error('Error fetching learn content:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLearnContent();
    return () => { isMounted = false; };
  }, []);

  const resourceTypes = [
    { id: 'eco tip', icon: <Lightbulb size={24} color={colors.primary} />, title: 'Eco Tips' },
    { id: 'article', icon: <BookOpen size={24} color={colors.primary} />, title: 'Articles' },
    { id: 'video', icon: <Video size={24} color={colors.primary} />, title: 'Videos' },
  ];

  const filteredContent = learnContent.filter(item => 
    item.resourceType?.toLowerCase() === selectedType.toLowerCase()
  );

  const renderContent = ({ item }) => (
    <EcoTipCard 
      tip={item}
      onPress={(tip) => router.push(`/eco-tip-detail/${tip.id}`)}
    />
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Learn',
          headerTitleStyle: styles.headerTitle,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/add-eco-tip')}
              style={styles.addButton}
            >
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.resourceTypesContainer}>
        {resourceTypes.map((type) => (
          <TouchableOpacity 
            key={type.id}
            style={[
              styles.resourceTypeButton,
              selectedType === type.id && styles.resourceTypeButtonActive
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <View style={[
              styles.resourceTypeIcon,
              selectedType === type.id && styles.resourceTypeIconActive
            ]}>
              {type.icon}
            </View>
            <Text style={[
              styles.resourceTypeTitle,
              selectedType === type.id && styles.resourceTypeTitleActive
            ]}>{type.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>
          {resourceTypes.find(type => type.id === selectedType)?.title || 'Featured Content'}
        </Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={filteredContent}
            keyExtractor={(item) => item.id}
            renderItem={renderContent}
            contentContainerStyle={styles.tipsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No content available</Text>
            }
          />
        )}
      </View>
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
  resourceTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.card,
  },
  resourceTypeButton: {
    alignItems: 'center',
    flex: 1,
  },
  resourceTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '15', // Primary color with 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceTypeTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  tipsList: {
    paddingBottom: 16,
  },
  resourceTypeButtonActive: {
    opacity: 1,
  },
  resourceTypeIconActive: {
    backgroundColor: colors.primary + '30',
  },
  resourceTypeTitleActive: {
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  addButton: {
    padding: 8,
  },
});