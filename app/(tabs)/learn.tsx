import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import EcoTipCard from "@/components/EcoTipCard";
import { BookOpen, Lightbulb, Video, Plus } from "lucide-react-native";

import { useUserStore } from "@/store/user-store";
import { apiClient } from "@/lib/api/client";

export default function LearnScreen() {
  const router = useRouter();
  const { accessToken } = useUserStore();
  const [learnContent, setLearnContent] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("eco_tips");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLearnContent = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    if (!append) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await apiClient.getLearningList(
        selectedType,
        pageNum,
        10,
        accessToken || undefined
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "학습 콘텐츠를 불러오지 못했습니다.");
      }

      const { data, pagination } = response.data;
      const apiHasMore = pagination.hasNext;

      const transformedItems = data.map((item: any) => ({
        ...item,
        id: item.uuid,
        source: item.links?.[0] || "",
        imageUrl: item.thumbnail || item.links?.[0] || "",
        type: item.category || selectedType,
        userId: item.author?.uuid || "unknown",
        isDeleted: "false",
      }));

      if (append) {
        setLearnContent((prev) => [...prev, ...transformedItems]);
      } else {
        setLearnContent(transformedItems);
      }

      setHasMore(apiHasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching learn content:", error);
      if (!append) {
        setLearnContent([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLearnContent(1, false);
  }, [selectedType]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchLearnContent(page + 1, true);
    }
  };

  const resourceTypes = [
    {
      id: "eco_tips",
      icon: <Lightbulb size={24} color={colors.primary} />,
      title: "Eco Tips",
    },
    {
      id: "articles",
      icon: <BookOpen size={24} color={colors.primary} />,
      title: "Articles",
    },
    {
      id: "videos",
      icon: <Video size={24} color={colors.primary} />,
      title: "Videos",
    },
  ];

  const renderContent = ({ item }: { item: any }) => {
    return (
      <EcoTipCard
        tip={item}
        onPress={() => router.push(`/learning-detail/${item.uuid}`)}
      />
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Learn" }} />

      <View style={styles.tabContainer}>
        {resourceTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.tab, selectedType === type.id && styles.activeTab]}
            onPress={() => {
              setSelectedType(type.id);
              setPage(1);
            }}
          >
            {type.icon}
            <Text
              style={[
                styles.tabText,
                selectedType === type.id && styles.activeTabText,
              ]}
            >
              {type.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !learnContent || learnContent.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {selectedType}s available yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-eco-tip")}
          >
            <Plus size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add First {selectedType}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={learnContent}
          renderItem={renderContent}
          keyExtractor={(item) => item.uuid || item.id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary + "20",
  },
  tabText: {
    ...typography.bodySmall,
    marginLeft: 8,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    ...typography.body,
    color: colors.white,
    marginLeft: 8,
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
