import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale } from '../utils/responsive';

const upgradeSchema = z.object({
  documentType: z.enum(['aadhaar', 'pan'], { message: 'Please select a document type' }),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentImage: z.string().min(1, 'Document image is required'),
});

type UpgradeFormData = z.infer<typeof upgradeSchema>;

export const UpgradeRequestScreen = () => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'provider'>('owner');

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<UpgradeFormData>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: {
      documentType: 'aadhaar',
      documentNumber: '',
      documentImage: '',
    }
  });

  const selectedType = watch('documentType');
  const documentImage = watch('documentImage');

  const pickImage = async (useCamera: boolean) => {
    const permissionMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionMethod();
    if (status !== 'granted') {
      Alert.alert('Permission Required', `${useCamera ? 'Camera' : 'Gallery'} permission is needed to upload documents.`);
      return;
    }

    const launchMethod = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        const base64Prefix = `data:${asset.mimeType || 'image/jpeg'};base64,`;
        setValue('documentImage', base64Prefix + asset.base64, { shouldValidate: true });
      } else {
        setValue('documentImage', asset.uri, { shouldValidate: true });
      }
    }
  };

  const showImageOptions = () => {
    Alert.alert('Upload Document', 'Choose how you want to upload your document', [
      { text: 'Take Photo', onPress: () => pickImage(true) },
      { text: 'Choose from Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onSubmit = async (data: UpgradeFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/users/upgrade-request', {
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentImage: data.documentImage,
        role: selectedRole,
      });
      await AsyncStorage.setItem('pendingUpgradeRole', selectedRole);
      Alert.alert(
        'Success',
        'KYC request submitted. You will be notified after verification.',
        [{ text: 'OK', onPress: () => navigation.navigate('ProfileHome') }],
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Error',
        err.response?.data?.error?.message || 'Failed to submit request',
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Become Host/Provider</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Verification Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Verification Type</Text>
          <View style={styles.roleGrid}>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'owner' && styles.roleCardActive]}
              onPress={() => setSelectedRole('owner')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="home-outline"
                size={24}
                color={selectedRole === 'owner' ? COLORS.surface : COLORS.primary}
              />
              <Text style={[styles.roleCardTitle, selectedRole === 'owner' && styles.roleCardTitleActive]}>
                House Owner
              </Text>
              <Text style={[styles.roleCardText, selectedRole === 'owner' && styles.roleCardTextActive]}>
                Submit KYC to verify your house owner profile.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'provider' && styles.roleCardActive]}
              onPress={() => setSelectedRole('provider')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="construct-outline"
                size={24}
                color={selectedRole === 'provider' ? COLORS.surface : COLORS.primary}
              />
              <Text style={[styles.roleCardTitle, selectedRole === 'provider' && styles.roleCardTitleActive]}>
                Service Provider
              </Text>
              <Text style={[styles.roleCardText, selectedRole === 'provider' && styles.roleCardTextActive]}>
                Submit KYC to verify your service provider profile.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Document Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Type</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'aadhaar' && styles.activeTab]}
              onPress={() => setValue('documentType', 'aadhaar')}
            >
              <Ionicons name="card-outline" size={20} color={selectedType === 'aadhaar' ? COLORS.surface : COLORS.text} />
              <Text style={[styles.tabText, selectedType === 'aadhaar' && styles.activeTabText]}>Aadhaar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedType === 'pan' && styles.activeTab]}
              onPress={() => setValue('documentType', 'pan')}
            >
              <Ionicons name="card-outline" size={20} color={selectedType === 'pan' ? COLORS.surface : COLORS.text} />
              <Text style={[styles.tabText, selectedType === 'pan' && styles.activeTabText]}>PAN</Text>
            </TouchableOpacity>
          </View>
          {errors.documentType && <Text style={styles.errorText}>{errors.documentType.message}</Text>}
        </View>

        {/* Document Number Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Number</Text>
          <Controller
            control={control}
            name="documentNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.documentNumber && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter document number"
                autoCapitalize="characters"
                placeholderTextColor={COLORS.textMuted}
              />
            )}
          />
          {errors.documentNumber && <Text style={styles.errorText}>{errors.documentNumber.message}</Text>}
        </View>

        {/* Document Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Image *</Text>
          <Controller
            control={control}
            name="documentImage"
            render={({ field: { value } }) => (
              <>
                {value ? (
                  <View style={styles.previewContainer}>
                    <Image
                      source={{ uri: value }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => setValue('documentImage', '', { shouldValidate: true })}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={28} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions} activeOpacity={0.7}>
                    <Ionicons name="cloud-upload-outline" size={36} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Tap to upload document</Text>
                    <Text style={styles.uploadHint}>Take a photo or choose from gallery</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          />
          {errors.documentImage && <Text style={styles.errorText}>{errors.documentImage.message}</Text>}
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Submitting request...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: COLORS.primary }]}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {selectedRole === 'owner' ? 'Submit Owner KYC Request' : 'Submit Provider KYC Request'}
              </Text>
            </TouchableOpacity>
          )}
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
  roleGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(128),
  },
  roleCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleCardTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  roleCardTitleActive: {
    color: COLORS.surface,
  },
  roleCardText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
  roleCardTextActive: {
    color: COLORS.surface,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeTabText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  uploadText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  uploadHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  previewContainer: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: moderateScale(200),
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.border,
  },
  removeBtn: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  submitContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
