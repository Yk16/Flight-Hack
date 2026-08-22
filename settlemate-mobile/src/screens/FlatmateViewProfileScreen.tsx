import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';

const formatInr = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const FlatmateViewProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user: currentUser } = useAuthStore();
  const profile = route.params?.profile;

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const user = profile.user || {};
  const name = user.name || 'Flatmate';
  const avatar = user.avatar;
  const budget = profile.budget || 15000;
  const occupation = profile.occupation || user.occupation || 'Professional';
  const bio = profile.bio || `Hi, I'm ${name}! Looking for clean, friendly flatmates in the city.`;
  const location = profile.preferredLocation || profile.city || 'Ahmedabad, Gujarat';
  const lifestyles = Array.isArray(profile.lifestyle) ? profile.lifestyle : ['Non-smoker', 'Vegetarian', 'Professional'];
  const lookingFor = Array.isArray(profile.lookingFor) ? profile.lookingFor : ['Clean', 'Working', 'Respectful'];

  const handleStartChat = () => {
    const targetUserId = user.id || profile.userId;
    const currentUserId = Number(currentUser?.id || 1);
    const roomId = `chat-${Math.min(currentUserId, targetUserId)}-${Math.max(currentUserId, targetUserId)}`;

    navigation.navigate('Chat', {
      screen: 'ChatThread',
      params: {
        roomId,
        recipientName: name,
        participantId: targetUserId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <TouchableOpacity
          onPress={() => {
            const shareUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:8081';
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(shareUrl);
              window.alert('Profile link copied to clipboard!');
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="share-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={48} color={COLORS.primary} />
              </View>
            )}
            <View style={styles.activeDot} />
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.occupation}>{occupation}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>{location}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Max Budget</Text>
              <Text style={styles.statValue}>{formatInr(budget)}/mo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Move-in Date</Text>
              <Text style={styles.statValue}>Flexible / Immediate</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.card}>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        </View>

        {/* Lifestyle Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle & Habits</Text>
          <View style={styles.chipsRow}>
            {lifestyles.map((item: string, idx: number) => (
              <View key={idx} style={styles.chip}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Roommate Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking for in a Flatmate</Text>
          <View style={styles.chipsRow}>
            {lookingFor.map((item: string, idx: number) => (
              <View key={idx} style={[styles.chip, { backgroundColor: `${COLORS.primary}10`, borderColor: `${COLORS.primary}30` }]}>
                <Ionicons name="people" size={14} color={COLORS.primary} />
                <Text style={[styles.chipText, { color: COLORS.primary }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatButton} onPress={handleStartChat} activeOpacity={0.85}>
          <Ionicons name="chatbubbles" size={20} color={COLORS.surface} />
          <Text style={styles.chatButtonText}>Message {name.split(' ')[0]}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textMuted,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  name: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: 2,
  },
  occupation: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  locationText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  statValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    lineHeight: 22,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  chipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  chatButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
