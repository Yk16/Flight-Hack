import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';

export const FlatmateBrowseScreen = () => {
  const navigation = useNavigation<any>();
  const { user: currentUser } = useAuthStore();
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  // Always return to the main chat screen (header button or Android gesture)
  const handleGoBack = () => {
    navigation.navigate('Chat', { screen: 'ChatInbox' });
  };

  useEffect(() => {
    if (!isFocused) return;
    const onBackPress = () => {
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isFocused, navigation]);

  useEffect(() => {
    loadFlatmates();
  }, []);

  const loadFlatmates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/flatmates?limit=50');
      const data = res.data?.data || res.data || {};
      const list = data.profiles || data || [];
      const others = (Array.isArray(list) ? list : []).filter(
        (p: any) => p.user?.id !== Number(currentUser?.id)
      );
      setProfiles(others);
    } catch (e) {
      console.warn('Failed to load flatmates:', e);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return profiles.filter((p) => {
      const name = (p.user?.name || '').toLowerCase();
      const loc = (p.preferredLocation || p.city || '').toLowerCase();
      const occ = (p.occupation || '').toLowerCase();
      const matchSearch = !query || name.includes(query) || loc.includes(query) || occ.includes(query);
      return matchSearch;
    });
  }, [profiles, searchQuery]);

  const handleStartChat = (profile: any) => {
    const targetUserId = profile.user?.id || profile.userId;
    const currentUserId = Number(currentUser?.id || 1);
    const roomId = `chat-${Math.min(currentUserId, targetUserId)}-${Math.max(currentUserId, targetUserId)}`;
    const recipientName = profile.user?.name || profile.user?.firstName || 'Flatmate';

    navigation.navigate('Chat', {
      screen: 'ChatThread',
      params: {
        roomId,
        recipientName,
        participantId: targetUserId,
      },
    });
  };

  const handleViewProfile = (profile: any) => {
    navigation.navigate('FlatmateViewProfile', { profile });
  };

  const getInitials = (name: string) => {
    return (name || 'U')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Find Flatmates</Text>
        </View>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>{filtered.length} active</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, location, or job..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding flatmates nearby...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => `flatmate-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No flatmates found</Text>
              <Text style={styles.emptySub}>Try adjusting your search criteria.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const name = item.user?.name || item.user?.firstName || 'Flatmate';
            const avatar = item.user?.avatar;
            const location = item.preferredLocation || item.city || 'Ahmedabad, Gujarat';
            const budget = item.budget ? `₹${Number(item.budget).toLocaleString('en-IN')}/mo` : '₹15,000/mo';
            const occupation = item.occupation || 'Professional';
            const traits = Array.isArray(item.lifestyle) && item.lifestyle.length > 0
              ? item.lifestyle.slice(0, 3)
              : ['Clean', 'Non-smoker', 'Professional'];

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>{getInitials(name)}</Text>
                    </View>
                  )}

                  <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>{name}</Text>
                      <View style={styles.budgetBadge}>
                        <Text style={styles.budgetText}>{budget}</Text>
                      </View>
                    </View>

                    <Text style={styles.role} numberOfLines={1}>{occupation}</Text>

                    <View style={styles.locRow}>
                      <Ionicons name="location-sharp" size={12} color={COLORS.textMuted} />
                      <Text style={styles.locText} numberOfLines={1}>{location}</Text>
                    </View>
                  </View>
                </View>

                {/* Traits Badges */}
                <View style={styles.traitsRow}>
                  {traits.map((t: string, i: number) => (
                    <View key={`trait-${i}`} style={styles.traitBadge}>
                      <Text style={styles.traitText}>✓ {t}</Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.viewProfileBtn}
                    onPress={() => handleViewProfile(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="person-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.viewProfileText}>View Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() => handleStartChat(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble" size={16} color={COLORS.surface} />
                    <Text style={styles.chatBtnText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexShrink: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    flexShrink: 1,
  },
  headerPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  searchWrap: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${COLORS.primary}18`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarFallbackText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  budgetBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  budgetText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  role: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  traitBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  traitText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  viewProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  viewProfileText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  chatBtnText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.surface,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.xs,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  emptySub: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
  },
});
