import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Image, useWindowDimensions, Platform, BackHandler } from "react-native";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { uploadImages } from '../api/uploadApi';
import { useAuthStore } from "../store/authStore";
import { createHouse, CreateHouseInput } from "../api/createHouseApi";
import { fetchHouseById, updateHouse } from "../api/housingApi";
import { House } from "../types/housing";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../theme/colors";
import { verticalScale } from "../utils/responsive";

type FormValues = {
  title: string;
  description: string;
  type: CreateHouseInput["type"];
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  rent: string;
  deposit: string;
  maintenanceCharges: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  totalFloors: string;
  furnishing: NonNullable<CreateHouseInput["furnishing"]>;
  amenities: string;
  images: string[];
  preferredTenants: string[];
  petsAllowed: boolean;
  availableFrom: string;
};

const PROPERTY_TYPES: CreateHouseInput["type"][] = ["APARTMENT", "INDEPENDENT_HOUSE", "VILLA"];
const FURNISHING_OPTIONS: NonNullable<CreateHouseInput["furnishing"]>[] = ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"];
const TENANT_OPTIONS = ["FAMILY", "BACHELOR"];

const emptyForm = (): FormValues => ({
  title: "",
  description: "",
  type: "APARTMENT",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  rent: "",
  deposit: "",
  maintenanceCharges: "",
  bedrooms: "1",
  bathrooms: "1",
  area: "",
  floor: "",
  totalFloors: "",
  furnishing: "UNFURNISHED",
  amenities: "",
  images: [""],
  preferredTenants: [],
  petsAllowed: false,
  availableFrom: "",
});

const joinList = (value?: string[]) => (value ?? []).join(", ");

const toInt = (value: string) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toRequiredInt = (value: string, label: string) => {
  const parsed = toInt(value);
  if (parsed === undefined) {
    throw new Error(`${label} is required`);
  }
  return parsed;
};

const formatDateDisplay = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDisplayDate = (value: string) => {
  if (!value.trim()) return undefined;
  const [day, month, year] = value.split('-').map((part) => Number(part));
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Available from must be a valid date');
  }
  return parsed.toISOString();
};

const toArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeHouseToForm = (house: House): FormValues => ({
  title: house.title ?? "",
  description: house.description ?? "",
  type: (house.type && ["APARTMENT", "INDEPENDENT_HOUSE", "VILLA"].includes(house.type) ? house.type : "APARTMENT") as CreateHouseInput["type"],
  addressLine1: house.addressLine1 ?? "",
  addressLine2: house.addressLine2 ?? "",
  city: house.city ?? "",
  state: house.state ?? "",
  pincode: house.pincode ?? "",
  latitude: house.latitude !== undefined ? String(house.latitude) : "",
  longitude: house.longitude !== undefined ? String(house.longitude) : "",
  rent: String(house.rent ?? ""),
  deposit: String(house.deposit ?? ""),
  maintenanceCharges: house.maintenanceCharges !== undefined ? String(house.maintenanceCharges) : "",
  bedrooms: String(house.bedrooms ?? 1),
  bathrooms: String(house.bathrooms ?? 1),
  area: house.area !== undefined ? String(house.area) : "",
  floor: house.floor !== undefined ? String(house.floor) : "",
  totalFloors: house.totalFloors !== undefined ? String(house.totalFloors) : "",
  furnishing: house.furnishing ?? "UNFURNISHED",
  amenities: joinList(house.amenities),
  images: house.images?.length ? house.images : [""],
  preferredTenants: house.preferredTenants ?? [],
  petsAllowed: Boolean(house.petsAllowed),
  availableFrom: house.availableFrom ? formatDateDisplay(new Date(house.availableFrom)) : "",
});

export const AddHouseScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [formData, setFormData] = useState<FormValues>(emptyForm());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isCompact = width < 390;

  const editingHouseId = useMemo(() => route?.params?.house?.id ?? route?.params?.houseId, [route?.params]);
  const passedHouse = route?.params?.house as House | undefined;

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    const onBackPress = () => {
      navigation.navigate('Property Listing');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isFocused, navigation]);

  useEffect(() => {
    if (passedHouse) {
      setFormData(normalizeHouseToForm(passedHouse));
      return;
    }

    if (!editingHouseId) {
      setFormData(emptyForm());
      return;
    }

    setInitialLoading(true);
    fetchHouseById(String(editingHouseId))
      .then((house) => {
        if (house) {
          setFormData(normalizeHouseToForm(house));
        }
      })
      .finally(() => setInitialLoading(false));
  }, [editingHouseId, passedHouse]);

  const updateField = (key: keyof FormValues, value: string | boolean | string[]) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const togglePreferredTenant = (value: string) => {
    setFormData((previous) => {
      const exists = previous.preferredTenants.includes(value);
      return {
        ...previous,
        preferredTenants: exists
          ? previous.preferredTenants.filter((item) => item !== value)
          : [...previous.preferredTenants, value],
      };
    });
  };

  const addImageField = () => {
    setFormData((previous) => ({ ...previous, images: [...previous.images, ""] }));
  };

  const updateImageField = (index: number, value: string) => {
    setFormData((previous) => {
      const nextImages = [...previous.images];
      nextImages[index] = value;
      return { ...previous, images: nextImages };
    });
  };

  const removeImageField = (index: number) => {
    setFormData((previous) => {
      const nextImages = previous.images.filter((_, currentIndex) => currentIndex !== index);
      return { ...previous, images: nextImages.length ? nextImages : [""] };
    });
  };

  const buildPayload = (): CreateHouseInput => {
    return {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || undefined,
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      latitude: toInt(formData.latitude),
      longitude: toInt(formData.longitude),
      rent: toRequiredInt(formData.rent, "Rent"),
      deposit: toRequiredInt(formData.deposit, "Deposit"),
      maintenanceCharges: toInt(formData.maintenanceCharges),
      bedrooms: toRequiredInt(formData.bedrooms, "Bedrooms"),
      bathrooms: toRequiredInt(formData.bathrooms, "Bathrooms"),
      area: toInt(formData.area),
      floor: toInt(formData.floor),
      totalFloors: toInt(formData.totalFloors),
      furnishing: formData.furnishing,
      amenities: toArray(formData.amenities),
      images: formData.images.map((image) => image.trim()).filter(Boolean),
      preferredTenants: formData.preferredTenants,
      petsAllowed: formData.petsAllowed,
      availableFrom: parseDisplayDate(formData.availableFrom),
    };
  };

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const onSubmit = async () => {
    if (!formData.title.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setToastMessage({ text: "Please fill all required fields", isError: true });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      const payload = buildPayload();
      setLoading(true);

      if (editingHouseId) {
        await updateHouse(String(editingHouseId), payload);
        setToastMessage({ text: "🎉 Property updated successfully!" });
        setTimeout(() => {
          setToastMessage(null);
          navigation.navigate("Property Listing");
        }, 1200);
      } else {
        await createHouse(payload);
        setToastMessage({ text: "🎉 Property listed successfully!" });
        setTimeout(() => {
          setToastMessage(null);
          navigation.navigate("Property Listing");
        }, 1200);
      }
    } catch (error: any) {
      console.error("Submit error", error);
      const errMsg = error?.message || error?.response?.data?.message || "Failed to save property";
      setToastMessage({ text: `⚠️ ${errMsg}`, isError: true });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  if (user?.status !== "VERIFIED") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.textMuted} />
          <Text style={styles.errorTitle}>Account Not Verified</Text>
          <Text style={styles.errorText}>You must verify your KYC to add properties.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Profile", { screen: "ProfileHome" })}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.errorText}>Loading property...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Property Listing')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{editingHouseId ? 'Edit Property' : 'Add Property'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Property Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2BHK in Downtown"
            value={formData.title}
            onChangeText={(value) => updateField("title", value)}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe your property..."
            multiline
            value={formData.description}
            onChangeText={(value) => updateField("description", value)}
          />

          <Text style={styles.label}>Property Type *</Text>
          <View style={styles.optionGrid}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionChip, formData.type === type && styles.optionChipActive]}
                onPress={() => updateField("type", type)}
              >
                <Text style={[styles.optionText, formData.type === type && styles.optionTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput style={styles.input} placeholder="Street address" value={formData.addressLine1} onChangeText={(value) => updateField("addressLine1", value)} />

          <Text style={styles.label}>Address Line 2</Text>
          <TextInput style={styles.input} placeholder="Apartment, floor, landmark" value={formData.addressLine2} onChangeText={(value) => updateField("addressLine2", value)} />

          <View style={[styles.row, isCompact && styles.stackRow]}>
            <View style={styles.column}>
              <Text style={styles.label}>City *</Text>
              <TextInput style={styles.input} placeholder="e.g., Mumbai" value={formData.city} onChangeText={(value) => updateField("city", value)} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>State *</Text>
              <TextInput style={styles.input} placeholder="e.g., Maharashtra" value={formData.state} onChangeText={(value) => updateField("state", value)} />
            </View>
          </View>

          <View style={[styles.row, isCompact && styles.stackRow]}>
            <View style={styles.column}>
              <Text style={styles.label}>Pincode *</Text>
              <TextInput style={styles.input} placeholder="6-digit pincode" keyboardType="numeric" value={formData.pincode} onChangeText={(value) => updateField("pincode", value.replace(/[^0-9]/g, ""))} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Available From</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)} activeOpacity={0.85}>
                <Text style={[styles.dateButtonText, !formData.availableFrom && styles.datePlaceholder]} numberOfLines={1}>
                  {formData.availableFrom || 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.availableFrom ? new Date(formData.availableFrom.split('-').reverse().join('-')) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      updateField('availableFrom', formatDateDisplay(selectedDate));
                    }
                  }}
                />
              )}
            </View>
          </View>

          <View style={[styles.row, isCompact && styles.stackRow]}>
            <View style={styles.column}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput style={styles.input} placeholder="Optional" keyboardType="numeric" value={formData.latitude} onChangeText={(value) => updateField("latitude", value)} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput style={styles.input} placeholder="Optional" keyboardType="numeric" value={formData.longitude} onChangeText={(value) => updateField("longitude", value)} />
            </View>
          </View>

          <Text style={styles.label}>Monthly Rent *</Text>
          <TextInput style={styles.input} placeholder="Amount in INR" keyboardType="numeric" value={formData.rent} onChangeText={(value) => updateField("rent", value.replace(/[^0-9]/g, ""))} />

          <Text style={styles.label}>Deposit *</Text>
          <TextInput style={styles.input} placeholder="Security deposit in INR" keyboardType="numeric" value={formData.deposit} onChangeText={(value) => updateField("deposit", value.replace(/[^0-9]/g, ""))} />

          <Text style={styles.label}>Maintenance Charges</Text>
          <TextInput style={styles.input} placeholder="Monthly maintenance in INR" keyboardType="numeric" value={formData.maintenanceCharges} onChangeText={(value) => updateField("maintenanceCharges", value.replace(/[^0-9]/g, ""))} />

          <View style={[styles.row, isCompact && styles.stackRow]}>
            <View style={styles.column}>
              <Text style={styles.label}>Bedrooms *</Text>
              <TextInput style={styles.input} placeholder="e.g. 1, 2, 3" keyboardType="numeric" value={formData.bedrooms} onChangeText={(value) => updateField("bedrooms", value.replace(/[^0-9]/g, ""))} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Bathrooms *</Text>
              <TextInput style={styles.input} placeholder="e.g. 1, 2, 3" keyboardType="numeric" value={formData.bathrooms} onChangeText={(value) => updateField("bathrooms", value.replace(/[^0-9]/g, ""))} />
            </View>
          </View>

          <View style={[styles.row, isCompact && styles.stackRow]}>
            <View style={styles.column}>
              <Text style={styles.label}>Area (sq ft)</Text>
              <TextInput style={styles.input} placeholder="Optional" keyboardType="numeric" value={formData.area} onChangeText={(value) => updateField("area", value.replace(/[^0-9]/g, ""))} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Floor</Text>
              <TextInput style={styles.input} placeholder="Optional" keyboardType="numeric" value={formData.floor} onChangeText={(value) => updateField("floor", value.replace(/[^0-9]/g, ""))} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Total Floors</Text>
              <TextInput style={styles.input} placeholder="Optional" keyboardType="numeric" value={formData.totalFloors} onChangeText={(value) => updateField("totalFloors", value.replace(/[^0-9]/g, ""))} />
            </View>
          </View>

          <Text style={styles.label}>Furnishing</Text>
          <View style={styles.optionGrid}>
            {FURNISHING_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, formData.furnishing === option && styles.optionChipActive]}
                onPress={() => updateField("furnishing", option)}
              >
                <Text style={[styles.optionText, formData.furnishing === option && styles.optionTextActive]}>{option.replaceAll("_", " ")}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Amenities</Text>
          <TextInput style={styles.input} placeholder="WiFi, Parking, Lift" value={formData.amenities} onChangeText={(value) => updateField("amenities", value)} />

          <Text style={styles.label}>Preferred Tenants</Text>
          <View style={styles.optionGrid}>
            {TENANT_OPTIONS.map((tenant) => (
              <TouchableOpacity
                key={tenant}
                style={[styles.optionChip, formData.preferredTenants.includes(tenant) && styles.optionChipActive]}
                onPress={() => togglePreferredTenant(tenant)}
              >
                <Text style={[styles.optionText, formData.preferredTenants.includes(tenant) && styles.optionTextActive]}>{tenant}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Pets Allowed</Text>
          <TouchableOpacity style={[styles.booleanChip, formData.petsAllowed && styles.booleanChipActive]} onPress={() => updateField("petsAllowed", !formData.petsAllowed)}>
            <Text style={[styles.booleanText, formData.petsAllowed && styles.booleanTextActive]}>{formData.petsAllowed ? "Allowed" : "Not Allowed"}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>House Photos</Text>
          <View style={[styles.pickerRow, isCompact && styles.stackRow]}>
            <TouchableOpacity style={styles.secondaryButton} onPress={async () => {
              // Launch image picker
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

              if (result.canceled) return;

              try {
                setLoading(true);
                const uri = result.assets?.[0]?.uri;
                if (!uri) {
                  Alert.alert('Upload failed', 'No image selected');
                  return;
                }
                const uploaded = await uploadImages([uri]);
                if (uploaded.length) {
                  updateField('images', [...formData.images.filter(Boolean), uploaded[0]]);
                }
              } catch (e) {
                console.error('Image upload failed', e);
                Alert.alert('Upload failed', 'Unable to upload image');
              } finally {
                setLoading(false);
              }
            }}>
              <Ionicons name="image" size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Pick & upload photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={addImageField}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Add photo URL</Text>
            </TouchableOpacity>
          </View>

          {formData.images.map((image, index) => (
            <View key={`image-${index}`} style={styles.imageRow}>
              <TextInput
                style={[styles.input, styles.imageInput]}
                placeholder={index === 0 ? 'Paste image URL or upload above' : 'Additional image URL'}
                value={image}
                onChangeText={(value) => updateImageField(index, value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {formData.images.length > 1 && (
                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImageField(index)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.thumbRow}>
            {(formData.images || []).filter(Boolean).map((uri, idx) => (
              <View key={`${idx}-${uri}`} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} />
                <TouchableOpacity style={styles.thumbRemove} onPress={() => removeImageField(idx)}>
                  <Ionicons name="close" size={14} color={COLORS.surface} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.buttonText}>{editingHouseId ? "Update Property" : "List Property"}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {toastMessage && (
        <View
          style={[
            styles.toastBanner,
            toastMessage.isError && { backgroundColor: '#7F1D1D' },
          ]}
        >
          <Ionicons
            name={toastMessage.isError ? 'alert-circle' : 'checkmark-circle'}
            size={20}
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
  scrollContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  formContainer: { marginBottom: SPACING.xl },
  label: { ...TYPOGRAPHY.body1, color: COLORS.text, marginBottom: SPACING.xs, fontWeight: "600" },
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
  multilineInput: { height: verticalScale(100), textAlignVertical: "top" },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginBottom: SPACING.md },
  optionChip: {
    flex: 1,
    minWidth: "48%",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  optionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { color: COLORS.text, fontWeight: "600" },
  optionTextActive: { color: COLORS.surface },
  row: { flexDirection: "row", gap: SPACING.md },
  stackRow: { flexDirection: 'column' },
  column: { flex: 1 },
  booleanChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  booleanChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  booleanText: { color: COLORS.text, fontWeight: "600" },
  booleanTextActive: { color: COLORS.surface },
  imageRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  imageInput: { flex: 1 },
  removeImageButton: {
    width: verticalScale(44),
    height: verticalScale(44),
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  secondaryButtonText: { color: COLORS.primary, fontWeight: "600" },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  buttonText: { color: COLORS.surface, ...TYPOGRAPHY.body1, fontWeight: "700" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: SPACING.lg },
  errorTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.lg },
  errorText: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginVertical: SPACING.md, textAlign: "center" },
  pickerRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  thumbRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, flexWrap: 'wrap' },
  thumbWrap: { width: 90, height: 90, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbRemove: { position: 'absolute', top: 6, right: 6, backgroundColor: COLORS.primary, borderRadius: 12, padding: 2 },
  dateButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: verticalScale(46),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: { color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  datePlaceholder: { color: COLORS.textMuted },
  toastBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#064E3B',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 9999,
  },
  toastText: {
    ...TYPOGRAPHY.body2,
    color: '#ECFDF5',
    fontWeight: '700',
    flex: 1,
  },
});
