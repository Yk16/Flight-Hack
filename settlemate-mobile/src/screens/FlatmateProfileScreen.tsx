import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale } from '../utils/responsive';
import { 
  getFlatmateProfile, 
  updateFlatmateProfile, 
  FlatmateProfile,
  UpdateFlatmateProfileInput 
} from '../api/flatmateApi';

export const FlatmateProfileScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();

  const [profile, setProfile] = useState<FlatmateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateFlatmateProfileInput>({
    budget: 0,
    lifestyle: [],
    lookingFor: [],
    occupation: '',
    bio: '',
    moveInDate: '',
    city: '',
    state: '',
    preferredLocation: '',
  });

  // Load profile when screen is focused
  useEffect(() => {
    if (isFocused) {
      loadProfile();
    }
  }, [isFocused]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getFlatmateProfile();
      setProfile(data);
      setFormData({
        budget: data.budget || 0,
        lifestyle: data.lifestyle || [],
        lookingFor: data.lookingFor || [],
        occupation: data.occupation || '',
        bio: data.bio || '',
        moveInDate: data.moveInDate || '',
        city: data.city || '',
        state: data.state || '',
        preferredLocation: data.preferredLocation || '',
      });
    } catch (error) {
      console.error('Error loading flatmate profile:', error);
      Alert.alert('Error', 'Failed to load your flatmate profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateFlatmateProfile(formData);
      Alert.alert('Success', 'Your flatmate profile has been updated successfully!');
      loadProfile();
    } catch (error) {
      console.error('Error saving flatmate profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormField = (key: keyof UpdateFlatmateProfileInput, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flatmate Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Form */}
        <View style={styles.formCard}>
          {/* Budget */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Monthly Budget (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your budget"
              value={formData.budget?.toString() || ''}
              onChangeText={(text) => updateFormField('budget', parseInt(text) || 0)}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Occupation */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your occupation"
              value={formData.occupation || ''}
              onChangeText={(text) => updateFormField('occupation', text)}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Bio */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>About You</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself..."
              value={formData.bio || ''}
              onChangeText={(text) => updateFormField('bio', text)}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.textMuted}
              textAlignVertical="top"
            />
          </View>

          {/* Lifestyle Preferences */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lifestyle Preferences</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Early riser, quiet, social (comma-separated)"
              value={formData.lifestyle?.join(', ') || ''}
              onChangeText={(text) => updateFormField('lifestyle', text.split(',').map(s => s.trim()).filter(s => s))}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Looking For */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Looking For in a Flatmate</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., quiet, tidy, professional (comma-separated)"
              value={formData.lookingFor?.join(', ') || ''}
              onChangeText={(text) => updateFormField('lookingFor', text.split(',').map(s => s.trim()).filter(s => s))}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Move In Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Move-In Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.moveInDate || ''}
              onChangeText={(text) => updateFormField('moveInDate', text)}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* City */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your city"
              value={formData.city || ''}
              onChangeText={(text) => updateFormField('city', text)}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* State */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your state"
              value={formData.state || ''}
              onChangeText={(text) => updateFormField('state', text)}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Preferred Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your preferred location/area"
              value={formData.preferredLocation || ''}
              onChangeText={(text) => updateFormField('preferredLocation', text)}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Save Button */}
          <View style={styles.formButtonContainer}>
            <TouchableOpacity
              style={[styles.formButton, { backgroundColor: COLORS.primary }]}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <Text style={styles.formButtonText}>Save Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
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
  formCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: moderateScale(16),
  },
  bioInput: {
    minHeight: moderateScale(100),
    textAlignVertical: 'top',
  },
  formButtonContainer: {
    marginTop: SPACING.lg,
  },
  formButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formButtonText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
