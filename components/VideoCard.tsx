import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface VideoCardProps {
  title: string;
  videoLink: string;
  description?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, videoLink, description }) => {
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:\?v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(videoLink);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <WebView
          style={styles.video}
          source={{ uri: embedUrl }}
          allowsFullscreenVideo
          javaScriptEnabled
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  video: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    ...typography.heading4,
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default VideoCard;
