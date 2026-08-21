import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Image, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../store/authStore';
import { createService, CreateServiceInput } from '../api/createServiceApi';
import { uploadImages } from '../api/uploadApi';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

export const AddServiceScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    const onBackPress = () => {
      navigation.navigate('Services');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isFocused, navigation]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateServiceInput>({
    type: 'MAID',
    title: '',
    description: '',
    price: 0,
    pricingModel: 'PER_MONTH',
    images: [''],
    city: '',
    state: '',
  });

  const handleInputChange = (key: keyof CreateServiceInput, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...(prev.images ?? []), ''] }));
  };

  const updateImageField = (index: number, value: string) => {
    setFormData((prev) => {
      const nextImages = [...(prev.images ?? [])];
      nextImages[index] = value;
      return { ...prev, images: nextImages };
    });
  };

  const removeImageField = (index: number) => {
    setFormData((prev) => {
      const nextImages = (prev.images ?? []).filter((_, currentIndex) => currentIndex !== index);
      return { ...prev, images: nextImages.length ? nextImages : [''] };
    });
  };

  const pickAndUploadImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) {
      return;
    }

    try {
      setLoading(true);
      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert('Upload failed', 'No image selected');
        return;
      }

      const uploaded = await uploadImages([uri]);
      if (uploaded.length) {
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images ?? []).filter(Boolean), uploaded[0]],
        }));
      }
    } catch (error) {
      console.error('Image upload failed', error);
      Alert.alert('Upload failed', 'Unable to upload image');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!formData.title || !formData.title.trim()) {
      Alert.alert('Error', 'Please enter a service title');
      return;
    }

    if (formData.title.length < 3) {
      Alert.alert('Error', 'Service title must be at least 3 characters');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const response = await createService({
        ...formData,
        images: (formData.images ?? []).map((image) => image.trim()).filter(Boolean),
      });
      console.log('Service created:', response);
      Alert.alert('Success', 'Service created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Services') }
      ]);
    } catch (err: any) {
      console.error('Submit error', err);
      const errorMessage = err?.response?.data?.error?.message 
        || err?.response?.data?.message 
        || err?.message 
        || 'Failed to create service';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.textMuted} />
          <Text style={styles.errorTitle}>Not Logged In</Text>
          <Text style={styles.errorText}>Please log in to add services.</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (user?.status !== 'VERIFIED') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.textMuted} />
          <Text style={styles.errorTitle}>Account Not Verified</Text>
          <Text style={styles.errorText}>You must verify your KYC to add services.</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileHome' })}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!user?.isProvider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="business" size={64} color={COLORS.textMuted} />
          <Text style={styles.errorTitle}>Not a Provider</Text>
          <Text style={styles.errorText}>You must be registered as a provider to add services.</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileHome' })}
          >
            <Text style={styles.buttonText}>Upgrade to Provider</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Services')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Add Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.formContainer}>
          {/* Service Type */}
          <Text style={styles.label}>Service Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(v: any) => handleInputChange('type', v)}
              style={styles.picker}
            >
              <Picker.Item label="Maid" value="MAID" />
              <Picker.Item label="Cook" value="COOK" />
              <Picker.Item label="Laundry" value="LAUNDRY" />
              <Picker.Item label="Furniture" value="FURNITURE" />
              <Picker.Item label="Appliance" value="APPLIANCE" />
            </Picker>
          </View>

          {/* Title */}
          <Text style={styles.label}>Service Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Professional Cleaning"
            value={formData.title}
            onChangeText={(v) => handleInputChange('title', v)}
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: verticalScale(100) }]}
            placeholder="Describe your service..."
            multiline
            value={formData.description}
            onChangeText={(v) => handleInputChange('description', v)}
          />

          {/* Price */}
          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount in INR"
            keyboardType="numeric"
            value={String(formData.price || '')}
            onChangeText={(v) => handleInputChange('price', parseInt(v) || 0)}
          />

          {/* Pricing Model */}
          <Text style={styles.label}>Pricing Model *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.pricingModel}
              onValueChange={(v: any) => handleInputChange('pricingModel', v)}
              style={styles.picker}
            >
              <Picker.Item label="Per Month" value="PER_MONTH" />
              <Picker.Item label="Per Job" value="PER_JOB" />
              <Picker.Item label="One Time" value="ONE_TIME" />
            </Picker>
          </View>

          {/* Service Location */}
          <Text style={styles.sectionLabel}>Service Location</Text>
          <Text style={styles.sectionHint}>Let customers know where you are available</Text>
          <TextInput
            style={styles.input}
            placeholder="City (e.g. Mumbai)"
            value={formData.city}
            onChangeText={(v) => handleInputChange('city', v)}
          />
          <TextInput
            style={styles.input}
            placeholder="State (e.g. Maharashtra)"
            value={formData.state}
            onChangeText={(v) => handleInputChange('state', v)}
          />

          {/* Service Photos */}
          <Text style={styles.label}>Service Photos</Text>
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={pickAndUploadImage}>
              <Ionicons name="image" size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Pick & upload photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={addImageField}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Add photo URL</Text>
            </TouchableOpacity>
          </View>

          {(formData.images ?? []).map((image, index) => (
            <View key={`service-image-${index}`} style={styles.imageRow}>
              <TextInput
                style={[styles.input, styles.imageInput]}
                placeholder={index === 0 ? 'Paste image URL or upload above' : 'Additional image URL'}
                value={image}
                onChangeText={(value) => updateImageField(index, value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {(formData.images ?? []).length > 1 && (
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImageField(index)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.thumbRow}>
            {(formData.images ?? []).filter(Boolean).map((uri, index) => (
              <View key={`${index}-${uri}`} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} />
                <TouchableOpacity style={styles.thumbRemove} onPress={() => removeImageField(index)}>
                  <Ionicons name="close" size={14} color={COLORS.surface} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.buttonText}>Add Service</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
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
  topBarTitle: { ...TYPOGRAPHY.h3, fontWeight: '700', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  header: { marginBottom: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.textMuted },
  formContainer: { marginBottom: SPACING.xl },
  label: { ...TYPOGRAPHY.body1, color: COLORS.text, marginBottom: SPACING.xs, fontWeight: '600' },
  sectionLabel: { ...TYPOGRAPHY.body1, color: COLORS.text, fontWeight: '700', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  sectionHint: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  picker: { height: verticalScale(50) },
  photoActions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: SPACING.sm },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  secondaryButtonText: { color: COLORS.primary, fontWeight: '600' },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  imageInput: { flex: 1 },
  removeImageButton: {
    width: verticalScale(44),
    height: verticalScale(44),
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  thumbWrap: {
    width: verticalScale(84),
    height: verticalScale(84),
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  thumb: { width: '100%', height: '100%' },
  thumbRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonText: { color: COLORS.surface, ...TYPOGRAPHY.body1, fontWeight: '700' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg },
  errorTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.lg },
  errorText: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginVertical: SPACING.md, textAlign: 'center' },
});
