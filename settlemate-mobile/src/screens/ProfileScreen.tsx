import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Get user role
  const getUserRole = () => {
    if (user?.isAdmin) return 'Admin';
    if (user?.isOwner) return 'Owner';
    if (user?.isProvider) return 'Provider';
    return 'Member';
  };

  const profileUser = (user as any)?.data ?? user;
  const displayName =
    profileUser?.name ||
    [profileUser?.firstName, profileUser?.lastName].filter(Boolean).join(' ') ||
    profileUser?.email?.split('@')[0] ||
    'User';
  const userRole = getUserRole();
  const isVerified = profileUser?.status === 'VERIFIED';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase();

  // Refresh profile when returning to this screen so KYC/status are accurate
  React.useEffect(() => {
    let mounted = true;
    const refreshProfile = async () => {
      try {
        const res = await apiClient.get('/users/me');
        const profile = res.data?.data ?? res.data;
        await AsyncStorage.setItem('user', JSON.stringify(profile));
        useAuthStore.setState({ user: profile });
      } catch (e) {
        // ignore
      }
    };

    if (isFocused && mounted) {
      refreshProfile();
    }

    return () => {
      mounted = false;
    };
  }, [isFocused]);

  // Profile actions
  const quickActions = [
    {
      id: 'favorites',
      label: 'Saved / Favourites',
      icon: 'heart',
      color: '#EF4444',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      id: 'transactions',
      label: 'Transaction History',
      icon: 'card',
      color: '#10B981',
      onPress: () => navigation.navigate('TransactionHistory'),
    },
    {
      id: 'flatmate',
      label: 'Flatmate Profile',
      icon: 'people',
      color: '#F59E0B',
      onPress: () => navigation.navigate('FlatmateProfile'),
    },
    {
      id: 'provider',
      label: 'Become Host/Provider',
      icon: 'home',
      color: '#8B5CF6',
      onPress: () => {
        navigation.navigate('UpgradeRequest');
      },
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'help-circle',
      color: '#EC4899',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'log-out',
      color: COLORS.error,
      onPress: () => {
        setShowLogoutModal(true);
      },
    },
  ];

  // Responsive values
  const headerFontSize = moderateScale(28);
  const avatarSize = moderateScale(100);
  const usernameFontSize = moderateScale(20);
  const roleFontSize = moderateScale(12);
  const actionIconSize = moderateScale(32);
  const actionLabelSize = moderateScale(14);
  const dynamicPadding = width > 400 ? SPACING.lg : SPACING.md;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingHorizontal: dynamicPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>Profile</Text>
        </View>

        <TouchableOpacity style={styles.userCardContainer} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
          <View style={styles.userCardTopRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.userAvatarPlaceholder,
                  { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                ]}
              >
                {profileUser?.avatar ? (
                  <Image
                    source={{ uri: profileUser.avatar }}
                    style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                  />
                ) : (
                  <Text style={[styles.avatarInitials, { fontSize: avatarSize * 0.4 }]}>
                    {initials || 'U'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userTextColumn}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <Text style={[styles.username, { fontSize: usernameFontSize }]} numberOfLines={1}>
                {displayName}
              </Text>

              <Text style={styles.userHandle} numberOfLines={1}>
                {profileUser?.email?.split('@')[0] || 'user'}
              </Text>

              <View
                style={[
                  styles.roleTag,
                  {
                    backgroundColor:
                      userRole === 'Admin'
                        ? COLORS.primary
                        : userRole === 'Owner'
                          ? '#10B981'
                          : userRole === 'Provider'
                            ? '#F59E0B'
                            : '#6B7280',
                  },
                ]}
              >
                <Text style={[styles.roleTagText, { fontSize: roleFontSize }]}>{userRole}</Text>
              </View>

              {user?.email && (
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.quickActionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Options</Text>
          </View>

          <View style={styles.actionList}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={actionIconSize * 0.8} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { fontSize: actionLabelSize }]} numberOfLines={1}>
                  {action.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalCard}>
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out" size={28} color={COLORS.error} />
            </View>
            <Text style={styles.logoutModalTitle}>Sign Out</Text>
            <Text style={styles.logoutModalDesc}>
              Are you sure you want to sign out of your SettleMate account?
            </Text>

            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={styles.logoutCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmBtn}
                onPress={async () => {
                  setShowLogoutModal(false);
                  try {
                    await logout();
                  } catch (e) {
                    console.error('Logout error:', e);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primary}15`,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    letterSpacing: 0.8,
  },
  headerUser: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  userCardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    alignSelf: 'stretch',
  },
  userCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  userAvatar: {
    borderRadius: 9999,
    backgroundColor: COLORS.primary,
  },
  userAvatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  userTextColumn: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userHandle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.xs,
  },
  roleTagText: {
    color: COLORS.surface,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  verificationBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.xs,
  },
  verificationBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    maxWidth: '90%',
    textAlign: 'left',
  },
  editProfileButton: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  editProfileButtonText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.surface,
    fontWeight: '700',
  },

  quickActionsContainer: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignSelf: 'stretch',
  },

  sectionHeader: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '700',
  },

  actionList: {
    gap: SPACING.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: verticalScale(56),
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionIcon: {
    textAlign: 'center',
  },
  actionLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  actionChevron: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },

  // Custom Logout Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoutModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: `${COLORS.primary}35`,
  },
  logoutModalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  logoutModalDesc: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  logoutModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.md,
  },
  logoutCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCancelText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
  },
  logoutConfirmBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutConfirmText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.surface,
    fontWeight: '700',
  },
});
