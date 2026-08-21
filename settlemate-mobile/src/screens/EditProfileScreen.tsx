import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();

  // Form states
  const [username, setUsername] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        const profile = response.data?.data ?? response.data;

        if (profile) {
          const mergedProfile = { ...(user ?? {}), ...profile };
          setUsername(mergedProfile?.name ?? '');
          setPhone(mergedProfile?.phone ?? '');
          setEmail(mergedProfile?.email ?? '');

          await AsyncStorage.setItem('user', JSON.stringify(mergedProfile));
          useAuthStore.setState({ user: mergedProfile });
        }
      } catch (error) {
        console.warn('Failed to load profile', error);
      }
    };

    loadProfile();
  }, []);

  const handleSaveChanges = async () => {
    if (!username.trim()) {
      setProfileMessage({
        type: 'error',
        text: 'Username cannot be empty',
      });
      return;
    }
    
    setIsSavingProfile(true);
    try {
      const response = await apiClient.put('/users/me', {
        name: username.trim(),
      });

      const updatedProfile = response.data?.data ?? response.data;
      const mergedProfile = { ...(user ?? {}), ...updatedProfile };
      await AsyncStorage.setItem('user', JSON.stringify(mergedProfile));
      useAuthStore.setState({ user: mergedProfile });

      setProfileMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
      setIsSavingProfile(false);
      setProfileMessage({
        type: 'error',
        text: 'Failed to update profile',
      });
      return;
    }

    setIsSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordMessage({
        type: 'error',
        text: 'All password fields are required',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New passwords do not match',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.post('/users/me/password', {
        currentPassword,
        newPassword,
      });

      setPasswordMessage({
        type: 'success',
        text: 'Password changed successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (error) {
      console.error('Failed to change password', error);
      setIsChangingPassword(false);
      setPasswordMessage({
        type: 'error',
        text: 'Failed to change password',
      });
      return;
    }

    setIsChangingPassword(false);
  };

  const inputFontSize = moderateScale(16);
  const labelFontSize = moderateScale(14);

  // Get user display info
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part: string) => part[0].toUpperCase())
    .join('');

  // Responsive values
  const isWideScreen = width > 600;
  const contentPaddingHorizontal = isWideScreen ? SPACING.xl : SPACING.md;
  const maxSectionWidth = isWideScreen ? 500 : '100%';

  const handleAvatarPress = () => {
    Alert.alert('Change Profile Photo', 'Choose how you want to update your photo', [
      { text: 'Take Photo', onPress: () => pickAvatar(true) },
      { text: 'Choose from Gallery', onPress: () => pickAvatar(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickAvatar = async (useCamera: boolean) => {
    const permissionMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionMethod();
    if (status !== 'granted') {
      Alert.alert('Permission Required', `${useCamera ? 'Camera' : 'Gallery'} permission is needed.`);
      return;
    }

    const launchMethod = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      let avatarValue = asset.uri;
      if (asset.base64) {
        avatarValue = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
      }
      uploadAvatar(avatarValue);
    }
  };

  const uploadAvatar = async (avatarData: string) => {
    setIsUploadingAvatar(true);
    try {
      const response = await apiClient.put('/users/me', { avatar: avatarData });
      const updatedProfile = response.data?.data ?? response.data;
      const mergedProfile = { ...(user ?? {}), ...updatedProfile };
      await AsyncStorage.setItem('user', JSON.stringify(mergedProfile));
      useAuthStore.setState({ user: mergedProfile });
      setProfileMessage({ type: 'success', text: 'Profile photo updated!' });
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error) {
      console.error('Failed to upload avatar', error);
      setProfileMessage({ type: 'error', text: 'Failed to update photo' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Message component
  const MessageBanner = ({
    message,
    type,
  }: {
    message: string;
    type: 'success' | 'error';
  }) => (
    <View
      style={[
        styles.messageBanner,
        {
          backgroundColor: type === 'success' ? COLORS.success : COLORS.error,
        },
      ]}
    >
      <Ionicons
        name={type === 'success' ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color="white"
        style={{ marginRight: SPACING.sm }}
      />
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          isWideScreen && { paddingHorizontal: contentPaddingHorizontal },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View
          style={[
            styles.avatarSection,
            isWideScreen && { alignSelf: 'center', width: maxSectionWidth },
          ]}
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            activeOpacity={0.7}
            disabled={isUploadingAvatar}
          >
            <View style={styles.avatarPlaceholder}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={{ width: moderateScale(96), height: moderateScale(96), borderRadius: moderateScale(48) }}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
              {isUploadingAvatar ? (
                <View style={styles.cameraIconBadge}>
                  <ActivityIndicator size="small" color={COLORS.surface} />
                </View>
              ) : (
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={14} color={COLORS.surface} />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarName}>{displayName}</Text>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Profile Message */}
        {profileMessage && (
          <View
            style={[
              isWideScreen && { alignSelf: 'center', width: maxSectionWidth },
            ]}
          >
            <MessageBanner message={profileMessage.text} type={profileMessage.type} />
          </View>
        )}

        {/* Profile Information Section */}
        <View
          style={[
            styles.section,
            isWideScreen && { alignSelf: 'center', width: maxSectionWidth },
          ]}
        >
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <Text style={styles.sectionSubtitle}>Update your personal information so it stays in sync with your account.</Text>
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={false}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false}
          />
        </View>

        {/* Save Changes Button */}
        <View
          style={[
            isWideScreen && { alignSelf: 'center', width: maxSectionWidth },
          ]}
        >
          <Button
            title={isSavingProfile ? 'Updating...' : 'Update Profile'}
            onPress={handleSaveChanges}
            disabled={isSavingProfile}
            isLoading={isSavingProfile}
            style={[styles.buttonSpacing, styles.primaryActionButton]}
          />
        </View>

        {/* Password Message */}
        {passwordMessage && (
          <View
            style={[
              isWideScreen && { alignSelf: 'center', width: maxSectionWidth },
            ]}
          >
            <MessageBanner message={passwordMessage.text} type={passwordMessage.type} />
          </View>
        )}

        {/* Change Password Section */}
        <View
          style={[
            styles.section,
            isWideScreen && { alignSelf: 'center', width: maxSectionWidth },
          ]}
        >
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showPassword}
          />
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
        </View>

        {/* Change Password Button */}
        <View
          style={[
            isWideScreen && { alignSelf: 'center', width: maxSectionWidth },
          ]}
        >
          <Button
            title={isChangingPassword ? 'Changing Password...' : 'Change Password'}
            onPress={handleChangePassword}
            disabled={isChangingPassword}
            isLoading={isChangingPassword}
            style={styles.buttonSpacing}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.lg,
  },

  /* Avatar Section */
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.lg,
    width: '100%',
  },
  avatarContainer: {
    marginBottom: SPACING.sm,
  },
  avatarPlaceholder: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.surface,
    fontWeight: '700',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  avatarName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },

  /* Message Banner */
  messageBanner: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  messageText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.surface,
    flex: 1,
    fontWeight: '500',
  },

  /* Section Styles */
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },

  /* Button Styles */
  buttonSpacing: {
    marginBottom: SPACING.lg,
  },
  primaryActionButton: {
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary,
  },
});
