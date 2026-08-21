import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale } from '../utils/responsive';

const schema = z.object({
  documentType: z.enum(['aadhaar','pan']),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentImage: z.string().min(1, 'Document image is required'),
});

type FormData = z.infer<typeof schema>;

export const ProviderKycScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { documentType: 'aadhaar', documentNumber: '', documentImage: '' },
  });

  const documentImage = watch('documentImage');

  useFocusEffect(
    useCallback(() => {
      const beforeRemove = (e: any) => {
        e.preventDefault();
        navigation.navigate('ProfileHome');
      };
      navigation.addListener('beforeRemove', beforeRemove as any);
      return () => navigation.removeListener('beforeRemove', beforeRemove as any);
    }, [navigation])
  );

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

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await apiClient.post('/users/upgrade-request', { ...data, role: 'provider' });
      await AsyncStorage.setItem('pendingUpgradeRole', 'provider');
      Alert.alert('Success', 'Provider KYC submitted. You will be notified after verification.', [
        { text: 'OK', onPress: () => navigation.navigate('ProfileHome') },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider KYC</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Document Type</Text>
          <Controller control={control} name="documentType" render={({ field: { value, onChange } }) => (
            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => onChange('aadhaar')} style={[styles.tab, value === 'aadhaar' && styles.tabActive]}>
                <Ionicons name="card-outline" size={20} color={value === 'aadhaar' ? COLORS.surface : COLORS.text} />
                <Text style={[styles.tabText, value === 'aadhaar' && styles.tabTextActive]}>Aadhaar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onChange('pan')} style={[styles.tab, value === 'pan' && styles.tabActive]}>
                <Ionicons name="card-outline" size={20} color={value === 'pan' ? COLORS.surface : COLORS.text} />
                <Text style={[styles.tabText, value === 'pan' && styles.tabTextActive]}>PAN</Text>
              </TouchableOpacity>
            </View>
          )} />

          <Text style={styles.label}>Document Number</Text>
          <Controller control={control} name="documentNumber" render={({ field: { value, onChange } }) => (
            <TextInput value={value} onChangeText={onChange} placeholder="Enter document number" placeholderTextColor={COLORS.textMuted} autoCapitalize="characters" style={styles.input} />
          )} />

          <Text style={styles.label}>Document Image *</Text>
          <Controller control={control} name="documentImage" render={({ field: { value } }) => (
            <>
              {value ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: value.startsWith('data:') ? value : value }} style={styles.previewImage} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setValue('documentImage', '', { shouldValidate: true })} activeOpacity={0.7}>
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
          )} />
        </View>

        <View style={styles.submitContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.submitButton} activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>Submit KYC</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderKycScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
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
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.h3, fontWeight: '700', color: COLORS.text },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { ...TYPOGRAPHY.body2, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.md },
  tabRow: { flexDirection: 'row', gap: SPACING.sm },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.body2, fontWeight: '600', color: COLORS.text },
  tabTextActive: { color: COLORS.surface },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: moderateScale(15),
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  uploadText: { ...TYPOGRAPHY.body2, fontWeight: '600', color: COLORS.primary, marginTop: SPACING.sm },
  uploadHint: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: SPACING.xs },
  previewContainer: { position: 'relative', borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  previewImage: { width: '100%', height: moderateScale(200), borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.border },
  removeBtn: { position: 'absolute', top: SPACING.xs, right: SPACING.xs },
  submitContainer: { marginTop: SPACING.lg, alignItems: 'center' },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: { ...TYPOGRAPHY.body1, fontWeight: '700', color: COLORS.surface },
});
