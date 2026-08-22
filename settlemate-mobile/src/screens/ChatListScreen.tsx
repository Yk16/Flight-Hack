import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';
import { CHAT_CONVERSATIONS } from '../data/chatData';

const FILTERS: Array<'All' | 'Unread' | 'Support'> = ['All', 'Unread', 'Support'];

const getInitials = (name: string) =>
  (name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const ChatListScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Support'>('All');

  const loadConversations = async () => {
    try {
      const res = await apiClient.get('/chat/rooms');
      const liveRooms = res.data?.data || res.data || [];

      if (liveRooms.length > 0) {
        setConversations(liveRooms);
      } else {
        // Fallback to sample conversations if no live chats yet
        setConversations(CHAT_CONVERSATIONS);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
      setConversations(CHAT_CONVERSATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadConversations();
    }
  }, [isFocused]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const name = conversation.participantName || 'User';
      const lastText = conversation.lastMessage?.content || '';

      const matchesQuery =
        !query ||
        name.toLowerCase().includes(query) ||
        lastText.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Unread' && (conversation.unreadCount || 0) > 0) ||
        (activeFilter === 'Support' && conversation.type === 'SUPPORT');

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, searchQuery, conversations]);

  const openConversation = (conv: any) => {
    navigation.navigate('ChatThread', {
      roomId: conv.roomId,
      recipientName: conv.participantName,
      participantId: conv.participantId,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredConversations}
        keyExtractor={(item, index) => item.roomId || `conv-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Messages</Text>
              <Text style={styles.headerUser}>{user?.name || 'You'}</Text>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search chats"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={FILTERS}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
              renderItem={({ item }) => {
                const isActive = item === activeFilter;
                return (
                  <TouchableOpacity
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveFilter(item)}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Conversations</Text>
              <Text style={styles.sectionMeta}>{filteredConversations.length} active</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No chats found</Text>
              <Text style={styles.emptyText}>
                Send a message to a property owner or flatmate to start chatting.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const name = item.participantName || 'User';
          const lastMsg = item.lastMessage?.content || item.lastMessageText || 'Tap to chat';
          const time = item.updatedAt
            ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recently';

          return (
            <Pressable
              onPress={() => openConversation(item)}
              style={({ pressed }) => [styles.conversationRow, pressed && styles.conversationRowPressed]}
            >
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(name)}</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.conversationBody}>
                <View style={styles.conversationTopRow}>
                  <Text style={styles.conversationName} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.timeText}>{time}</Text>
                </View>

                <View style={styles.conversationBottomRow}>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {lastMsg}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  headerUser: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filtersRow: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.surface,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text,
    fontWeight: '700',
  },
  sectionMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  center: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  conversationRowPressed: {
    backgroundColor: COLORS.background,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  conversationBody: {
    flex: 1,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  conversationBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    fontSize: 13,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
});
