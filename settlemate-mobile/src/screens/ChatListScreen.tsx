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
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';

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
  const [activePeople, setActivePeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Support'>('All');
  const [globalMenuVisible, setGlobalMenuVisible] = useState(false);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [convMenuVisible, setConvMenuVisible] = useState(false);
  const [confirmDeleteConv, setConfirmDeleteConv] = useState<any>(null);
  const [isDeletingConv, setIsDeletingConv] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleMarkAllAsRead = async () => {
    setGlobalMenuVisible(false);
    try {
      await Promise.all(
        conversations.map((c) => apiClient.post(`/chat/${c.roomId}/read`).catch(() => {}))
      );
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
      showToast('All messages marked as read');
    } catch {
      showToast('Action completed');
    }
  };

  const handleDeleteConversation = async () => {
    if (!confirmDeleteConv) return;
    setIsDeletingConv(true);
    try {
      await apiClient.delete(`/chat/rooms/${confirmDeleteConv.roomId}/messages`);
      setConversations((prev) => prev.filter((c) => c.roomId !== confirmDeleteConv.roomId));
      setConfirmDeleteConv(null);
      showToast('Conversation deleted');
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || 'Failed to delete chat', true);
    } finally {
      setIsDeletingConv(false);
    }
  };

  const handleMuteToggle = (conv: any) => {
    setConvMenuVisible(false);
    showToast(`Notifications ${conv?.isMuted ? 'unmuted' : 'muted'}`);
    setConversations((prev) =>
      prev.map((c) => (c.roomId === conv?.roomId ? { ...c, isMuted: !c.isMuted } : c))
    );
  };

  const loadConversations = async () => {
    try {
      const [chatRes, flatmatesRes] = await Promise.all([
        apiClient.get('/chat/rooms'),
        apiClient.get('/flatmates?limit=10').catch(() => ({ data: { data: { profiles: [] } } })),
      ]);

      const liveRooms = chatRes.data?.data || chatRes.data || [];
      const flatmateData = flatmatesRes.data?.data || flatmatesRes.data || {};
      const profiles = flatmateData.profiles || flatmateData || [];

      // Filter out current user from flatmates list
      const otherPeople = (Array.isArray(profiles) ? profiles : []).filter((p: any) => p.user?.id !== Number(user?.id));
      setActivePeople(otherPeople);

      // Set strictly to legitimate database rooms
      setConversations(liveRooms);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
      setConversations([]);
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

  const startChatWithPerson = (person: any) => {
    const targetUserId = person.user?.id || person.userId;
    const currentUserId = Number(user?.id || 1);
    const generatedRoomId = `chat-${Math.min(currentUserId, targetUserId)}-${Math.max(currentUserId, targetUserId)}`;
    const personName = person.user?.name || person.user?.firstName || 'Flatmate';

    navigation.navigate('ChatThread', {
      roomId: generatedRoomId,
      recipientName: personName,
      participantId: targetUserId,
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.headerUser}>{user?.name || 'You'}</Text>
                <TouchableOpacity
                  style={styles.threeDotBtn}
                  onPress={() => setGlobalMenuVisible(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
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
              <Ionicons name="chatbubbles-outline" size={44} color={COLORS.primary} />
              <Text style={styles.emptyTitle}>Start Chat with Flatmates</Text>
              <Text style={styles.emptyText}>
                Connect with active flatmates looking for shared spaces nearby.
              </Text>

              {activePeople.length > 0 && (
                <View style={styles.quickStartFlatmatesList}>
                  {activePeople.slice(0, 3).map((person) => {
                    const name = person.user?.name || person.user?.firstName || 'Flatmate';
                    const avatar = person.user?.avatar;
                    const location = person.preferredLocation || person.city || 'Ahmedabad';
                    const budget = person.budget ? `₹${Number(person.budget).toLocaleString('en-IN')}/mo` : '₹15,000/mo';

                    return (
                      <View key={`quick-${person.id}`} style={styles.quickStartCard}>
                        {avatar ? (
                          <Image source={{ uri: avatar }} style={styles.quickAvatarImg} />
                        ) : (
                          <View style={styles.quickAvatar}>
                            <Text style={styles.quickAvatarText}>{getInitials(name)}</Text>
                          </View>
                        )}
                        <View style={styles.quickInfo}>
                          <View style={styles.quickTopRow}>
                            <Text style={styles.quickName} numberOfLines={1}>{name}</Text>
                            <Text style={styles.quickBudgetText} numberOfLines={1}>{budget}</Text>
                          </View>
                          <Text style={styles.quickRole} numberOfLines={1}>
                            {person.occupation || 'Professional'} • {location.split('/')[0].trim()}
                          </Text>
                        </View>
                        <View style={styles.quickActionGroup}>
                          <TouchableOpacity
                            style={styles.quickProfileBtn}
                            onPress={() => navigation.navigate('FlatmateViewProfile', { profile: person })}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="person-outline" size={13} color={COLORS.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.quickChatBadge}
                            onPress={() => startChatWithPerson(person)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="chatbubble" size={12} color={COLORS.surface} />
                            <Text style={styles.quickChatBadgeText}>Chat</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  {/* Find More Flatmates Button */}
                  <TouchableOpacity
                    style={styles.findMoreBtn}
                    onPress={() => navigation.navigate('FlatmateBrowse')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="compass-outline" size={18} color={COLORS.surface} />
                    <Text style={styles.findMoreBtnText}>Find More Flatmates</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.surface} />
                  </TouchableOpacity>
                </View>
              )}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {item.isMuted ? (
                      <Ionicons name="volume-mute" size={13} color={COLORS.textMuted} />
                    ) : null}
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                </View>

                <View style={styles.conversationBottomRow}>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {lastMsg}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {item.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.itemThreeDotBtn}
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        setSelectedConv(item);
                        setConvMenuVisible(true);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="ellipsis-vertical" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Global Inbox Three-Dot Menu Modal */}
      <Modal
        visible={globalMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGlobalMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setGlobalMenuVisible(false)}>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-done-outline" size={18} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Mark all as read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setGlobalMenuVisible(false);
                navigation.navigate('FlatmateBrowse');
              }}
            >
              <Ionicons name="people-outline" size={18} color={COLORS.text} />
              <Text style={styles.menuItemText}>Find new flatmates</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setGlobalMenuVisible(false);
                loadConversations();
                showToast('Refreshed chats');
              }}
            >
              <Ionicons name="refresh-outline" size={18} color={COLORS.text} />
              <Text style={styles.menuItemText}>Refresh messages</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Individual Conversation Three-Dot Menu Modal */}
      <Modal
        visible={convMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConvMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setConvMenuVisible(false)}>
          <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderTitle} numberOfLines={1}>
                {selectedConv?.participantName || 'Conversation'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setConvMenuVisible(false);
                if (selectedConv) {
                  openConversation(selectedConv);
                }
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Open Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setConvMenuVisible(false);
                if (selectedConv?.participantId) {
                  navigation.navigate('FlatmateViewProfile', {
                    profile: {
                      id: selectedConv.participantId,
                      user: {
                        id: selectedConv.participantId,
                        name: selectedConv.participantName,
                        avatar: selectedConv.participantAvatar,
                      },
                    },
                  });
                } else {
                  showToast('Profile unavailable');
                }
              }}
            >
              <Ionicons name="person-outline" size={18} color={COLORS.text} />
              <Text style={styles.menuItemText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMuteToggle(selectedConv)}
            >
              <Ionicons
                name={selectedConv?.isMuted ? 'volume-high-outline' : 'volume-mute-outline'}
                size={18}
                color={COLORS.text}
              />
              <Text style={styles.menuItemText}>
                {selectedConv?.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
              </Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: 10 }]}
              onPress={() => {
                setConvMenuVisible(false);
                setConfirmDeleteConv(selectedConv);
              }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error, fontWeight: '700' }]}>
                Delete Chat
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Branded Delete Confirmation Modal */}
      <Modal
        visible={!!confirmDeleteConv}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteConv(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="trash" size={28} color={COLORS.error} />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Conversation?</Text>
            <Text style={styles.deleteModalDesc}>
              Are you sure you want to delete all messages with{' '}
              <Text style={{ fontWeight: '700', color: COLORS.text }}>
                "{confirmDeleteConv?.participantName || 'this user'}"
              </Text>
              ? This action cannot be undone.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setConfirmDeleteConv(null)}
                disabled={isDeletingConv}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleDeleteConversation}
                disabled={isDeletingConv}
              >
                {isDeletingConv ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View
          style={[
            styles.toastBanner,
            toastMessage.isError && { backgroundColor: '#7F1D1D' },
          ]}
        >
          <Ionicons
            name={toastMessage.isError ? 'alert-circle' : 'checkmark-circle'}
            size={16}
            color={toastMessage.isError ? '#FCA5A5' : '#10B981'}
          />
          <Text
            style={[
              styles.toastText,
              toastMessage.isError && { color: '#FEF2F2' },
            ]}
          >
            {toastMessage.text}
          </Text>
        </View>
      )}
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
    ...TYPOGRAPHY.body2,
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
    ...TYPOGRAPHY.body2,
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

  // Active People Strip Styles
  activeSection: {
    marginBottom: SPACING.md,
  },
  activeListContent: {
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  activePersonCard: {
    alignItems: 'center',
    width: 68,
  },
  activeAvatarWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  activeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  activeAvatarText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  activeGreenDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  activePersonRole: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Nearby Flatmate Card Styles
  nearbyFlatmateCard: {
    width: 140,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nearbyAvatarWrap: {
    position: 'relative',
    marginBottom: 6,
  },
  nearbyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nearbyAvatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nearbyName: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  nearbyRole: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 2,
  },
  nearbyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  nearbyLocationText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  nearbyBudgetBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 6,
  },
  nearbyBudgetText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  nearbyChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  nearbyChatBtnText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },

  // Quick start flatmates list in empty state
  quickStartFlatmatesList: {
    width: '100%',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  quickStartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  quickAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}18`,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  quickAvatarText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quickInfo: {
    flex: 1,
    minWidth: 0,
  },
  quickTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickName: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 14,
    flexShrink: 1,
  },
  quickRole: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  quickAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexShrink: 0,
  },
  quickBudgetText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    flexShrink: 0,
  },
  quickActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  quickProfileBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickChatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  quickChatBadgeText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  findMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  findMoreBtnText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.surface,
  },
  threeDotBtn: {
    padding: 6,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemThreeDotBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  menuCard: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuHeaderTitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  deleteIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  deleteModalTitle: {
    ...TYPOGRAPHY.h3,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  deleteModalDesc: {
    ...TYPOGRAPHY.body2,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: '#475569',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDeleteText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toastBanner: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BORDER_RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 9999,
  },
  toastText: {
    ...TYPOGRAPHY.caption,
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 13,
  },
});
