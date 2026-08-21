import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';
import { CHAT_CONVERSATIONS } from '../data/chatData';

const FILTERS: Array<'All' | 'Unread' | 'Pinned' | 'Support'> = ['All', 'Unread', 'Pinned', 'Support'];

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getPreviewText = (text?: string) => (text ? text : 'No messages yet');

export const ChatListScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Pinned' | 'Support'>('All');

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CHAT_CONVERSATIONS.filter((conversation) => {
      const matchesQuery =
        !query ||
        conversation.participantName.toLowerCase().includes(query) ||
        conversation.lastMessage?.content.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Unread' && conversation.unreadCount > 0) ||
        (activeFilter === 'Pinned' && conversation.isPinned) ||
        (activeFilter === 'Support' && conversation.type === 'SUPPORT');

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, searchQuery]);

  const unreadCount = CHAT_CONVERSATIONS.reduce((total, conversation) => total + conversation.unreadCount, 0);
  const pinnedCount = CHAT_CONVERSATIONS.filter((conversation) => conversation.isPinned).length;
  const supportCount = CHAT_CONVERSATIONS.filter((conversation) => conversation.type === 'SUPPORT').length;

  const openConversation = (roomId: string) => {
    navigation.navigate('ChatThread', { roomId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Messages</Text>
              <Text style={styles.headerUser}>{user?.name || user?.firstName || 'You'}</Text>
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
              <Text style={styles.sectionTitle}>Recent conversations</Text>
              <Text style={styles.sectionMeta}>{filteredConversations.length} visible</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No chats found</Text>
            <Text style={styles.emptyText}>
              Try another search term or switch to a different filter.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openConversation(item.roomId)}
            style={({ pressed }) => [styles.conversationRow, pressed && styles.conversationRowPressed]}
          >
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, item.type === 'SUPPORT' && styles.supportAvatar]}>
                <Text style={styles.avatarText}>{getInitials(item.participantName)}</Text>
              </View>
              {item.isOnline ? <View style={styles.onlineDot} /> : null}
            </View>

            <View style={styles.conversationBody}>
              <View style={styles.conversationTopRow}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {item.participantName}
                </Text>
                <Text style={styles.timeText}>{item.lastMessageAt}</Text>
              </View>

              <View style={styles.conversationMetaRow}>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{item.type === 'SUPPORT' ? 'Support' : 'Direct'}</Text>
                </View>
                {item.isPinned ? <Ionicons name="pin" size={14} color={COLORS.primary} /> : null}
                {item.unreadCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.messagePreview} numberOfLines={1}>
                {getPreviewText(item.lastMessage?.content)}
              </Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  headerUser: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: verticalScale(50),
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  filtersRow: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.surface,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    minWidth: '22%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  sectionMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  conversationRowPressed: {
    opacity: 0.96,
  },
  separator: {
    height: SPACING.sm,
  },
  avatarWrap: {
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  avatar: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportAvatar: {
    backgroundColor: COLORS.secondary,
  },
  avatarText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: moderateScale(15),
  },
  onlineDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.success,
    marginTop: -SPACING.xs,
  },
  conversationBody: {
    flex: 1,
    minWidth: 0,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  conversationName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  conversationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  rolePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rolePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: moderateScale(22),
    height: moderateScale(22),
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '700',
  },
  messagePreview: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    lineHeight: moderateScale(18),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
    marginTop: SPACING.xs,
    maxWidth: '80%',
  },
});
