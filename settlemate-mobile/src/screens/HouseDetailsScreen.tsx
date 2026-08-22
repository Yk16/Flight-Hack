import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { fetchHouseById, deleteHouse } from '../api/housingApi';
import { createBooking } from '../api/bookingApi';
import { House } from '../types/housing';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';

const formatInr = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartment',
  INDEPENDENT_HOUSE: 'House',
  VILLA: 'Villa',
  ROOM: 'Room',
  PG: 'Paying Guest',
  SHARED_ROOM: 'Shared Room',
  STUDIO: 'Studio',
};

const FURNISHING_LABELS: Record<string, string> = {
  FURNISHED: 'Fully Furnished',
  SEMI_FURNISHED: 'Semi Furnished',
  UNFURNISHED: 'Unfurnished',
};

const DetailRow = ({ label, value, icon }: { label: string; value?: string | number | boolean | null; icon?: string }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.detailRow}>
      {icon ? (
        <View style={styles.detailIconWrap}>
          <Ionicons name={icon as any} size={16} color={COLORS.primary} />
        </View>
      ) : null}
      <View style={styles.detailTextWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{String(value)}</Text>
      </View>
    </View>
  );
};

const InfoBadge = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoBadge}>
    <Ionicons name={icon as any} size={15} color={COLORS.primary} />
    <Text style={styles.infoBadgeText}>{label}</Text>
  </View>
);

export const HouseDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const routeHouse = route?.params?.house as House | undefined;
  const houseId = useMemo(() => route?.params?.houseId ?? routeHouse?.id, [route?.params, routeHouse?.id]);
  const prevHouseIdRef = useRef<string | undefined>(undefined);

  const [house, setHouse] = useState<House | null>(routeHouse ?? null);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!houseId) return;

    if (routeHouse) {
      setHouse(routeHouse);
    }

    setLoading(!routeHouse);
    fetchHouseById(String(houseId))
      .then((result) => {
        if (result) {
          setHouse(result);
        }
      })
      .catch((error) => {
        console.error('[HouseDetailsScreen] Failed to load house', error);
      })
      .finally(() => setLoading(false));
  }, [houseId]);

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleBooking = async () => {
    if (!house) return;
    setBookingLoading(true);
    try {
      const bookingData: any = { houseId: Number(house.id) };
      if (bookingMessage.trim()) bookingData.message = bookingMessage.trim();
      if (checkInDate.trim()) {
        const date = new Date(checkInDate);
        if (!isNaN(date.getTime())) {
          bookingData.checkInDate = date.toISOString();
        }
      }
      await createBooking(bookingData);
      
      setBookingModalVisible(false);
      setBookingMessage('');
      setCheckInDate('');
      
      setToastMessage({ text: 'Booking request sent' });
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('[HouseDetailsScreen] Booking error:', error);
      const errMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to send booking request';

      setBookingModalVisible(false);
      setToastMessage({ text: errMsg, isError: true });
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    } finally {
      setBookingLoading(false);
    }
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteProperty = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!house) return;
    try {
      setDeleteLoading(true);
      await deleteHouse(String(house.id));
      setDeleteModalVisible(false);
      setToastMessage({ text: 'Listing removed' });
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (e: any) {
      const err = e?.response?.data?.error?.message || e?.message || 'Failed to remove listing';
      setToastMessage({ text: err, isError: true });
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setDeleteLoading(false);
    }
  };

  const ownerIdValue = (house as any)?.ownerId || (house as any)?.owner?.id || (typeof (house as any)?.owner === 'number' || typeof (house as any)?.owner === 'string' ? (house as any)?.owner : undefined);
  const isOwner = Boolean(
    user?.id &&
    ownerIdValue &&
    String(user.id) === String(ownerIdValue)
  );
  const canEdit = isOwner && house?.status !== 'RENTED';
  const photos = house?.images?.length
    ? house.images
    : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop&q=80'];

  // --- Loading state ---
  if (loading && !house) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading property...</Text>
        </View>
      </View>
    );
  }

  // --- Not found state ---
  if (!house) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="home-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Property not found</Text>
          <Text style={styles.emptyText}>The listing may have been removed or is unavailable.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header — matches FlatmateProfile / TransactionHistory exactly */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{house.title || 'Property Details'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={async () => {
            const shareTitle = house.title || 'Check out this property on SettleMate';
            const shareUrl = typeof window !== 'undefined' ? window.location.href : `http://localhost:8081`;
            if (typeof navigator !== 'undefined' && (navigator as any).share) {
              try {
                await (navigator as any).share({
                  title: shareTitle,
                  text: `${shareTitle} - ${formatInr(house.rent)}/mo`,
                  url: shareUrl,
                });
              } catch (e) {
                // Share dismissed
              }
            } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
              await navigator.clipboard.writeText(shareUrl);
              window.alert('Property link copied to clipboard!');
            } else {
              Alert.alert('Shared', 'Property link copied!');
            }
          }}
        >
          <Ionicons name="share-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View style={styles.imageSection}>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `photo-${i}`}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
              setActiveImageIndex(idx);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
            )}
          />
          {photos.length > 1 && (
            <View style={styles.imageCounter}>
              <Ionicons name="camera-outline" size={14} color={COLORS.surface} />
              <Text style={styles.imageCounterText}>{activeImageIndex + 1}/{photos.length}</Text>
            </View>
          )}
        </View>

        {/* Price + Title + Status */}
        <View style={styles.headerCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatInr(house.rent)}</Text>
            <Text style={styles.pricePeriod}>/ month</Text>
            {house.status ? (
              <View style={[styles.statusChip, house.status === 'AVAILABLE' && styles.statusAvailable, house.status === 'RENTED' && styles.statusRented]}>
                <View style={[styles.statusDot, house.status === 'AVAILABLE' && styles.statusDotGreen, house.status === 'RENTED' && styles.statusDotRed]} />
                <Text style={styles.statusChipText}>{house.status.replace(/_/g, ' ')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.title}>{house.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.location} numberOfLines={2}>
              {[house.addressLine1, house.addressLine2, house.city, house.state].filter(Boolean).join(', ')}
            </Text>
          </View>

          {/* Quick Info Badges */}
          <View style={styles.badgeRow}>
            {house.type ? <InfoBadge icon="home-outline" label={TYPE_LABELS[house.type] || house.type} /> : null}
            {house.bedrooms != null ? <InfoBadge icon="bed-outline" label={`${house.bedrooms} Bed`} /> : null}
            {house.bathrooms != null ? <InfoBadge icon="water-outline" label={`${house.bathrooms} Bath`} /> : null}
            {house.area ? <InfoBadge icon="resize-outline" label={`${house.area} sqft`} /> : null}
            {house.furnishing ? <InfoBadge icon="cube-outline" label={FURNISHING_LABELS[house.furnishing] || house.furnishing} /> : null}
          </View>

          {/* Deposit */}
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Security Deposit</Text>
            <Text style={styles.depositValue}>{formatInr(house.deposit)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {canEdit ? (
              <View style={{ flexDirection: 'row', gap: SPACING.sm, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1 }]}
                  onPress={() => navigation.navigate('AddHouse', { house })}
                >
                  <Ionicons name="create-outline" size={18} color={COLORS.surface} />
                  <Text style={styles.primaryButtonText}>Edit Listing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, backgroundColor: COLORS.error }]}
                  onPress={handleDeleteProperty}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.surface} />
                  <Text style={styles.primaryButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : isOwner ? (
              <View style={styles.lockedNotice}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.lockedNoticeText}>Editing locked while rented</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={() => setBookingModalVisible(true)}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.surface} />
                <Text style={styles.primaryButtonText}>Book Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.description}>{house.description || 'No description provided by the owner.'}</Text>
          </View>
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.sectionCard}>
            <DetailRow label="Property Type" value={TYPE_LABELS[house.type || ''] || house.type} icon="home-outline" />
            <DetailRow label="Bedrooms" value={house.bedrooms} icon="bed-outline" />
            <DetailRow label="Bathrooms" value={house.bathrooms} icon="water-outline" />
            <DetailRow label="Area" value={house.area ? `${house.area} sq ft` : null} icon="resize-outline" />
            <DetailRow label="Furnishing" value={FURNISHING_LABELS[house.furnishing || ''] || house.furnishing} icon="cube-outline" />
            <DetailRow label="Floor" value={house.floor} icon="layers-outline" />
            <DetailRow label="Total Floors" value={house.totalFloors} icon="layers-outline" />
            <DetailRow label="Maintenance" value={house.maintenanceCharges != null ? formatInr(house.maintenanceCharges) : null} icon="wallet-outline" />
            <DetailRow label="Deposit" value={formatInr(house.deposit)} icon="card-outline" />
            <DetailRow label="Pets Allowed" value={house.petsAllowed ? 'Yes' : 'No'} icon="paw-outline" />
            <DetailRow
              label="Available From"
              value={house.availableFrom ? new Date(house.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null}
              icon="calendar-outline"
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.sectionCard}>
            <DetailRow label="Address" value={house.addressLine1} icon="location-outline" />
            {house.addressLine2 ? <DetailRow label="" value={house.addressLine2} /> : null}
            <DetailRow label="City" value={house.city} icon="business-outline" />
            <DetailRow label="State" value={house.state} icon="map-outline" />
            <DetailRow label="Pincode" value={house.pincode} icon="mail-outline" />
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.chipWrap}>
            {(house.amenities?.length ? house.amenities : ['No amenities listed']).map((item) => (
              <View key={item} style={styles.amenityChip}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                <Text style={styles.amenityChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Preferred Tenants */}
        {house.preferredTenants && house.preferredTenants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Tenants</Text>
            <View style={styles.chipWrap}>
              {house.preferredTenants.map((item) => (
                <View key={item} style={styles.tenantChip}>
                  <Ionicons name="person-outline" size={13} color={COLORS.secondary} />
                  <Text style={styles.tenantChipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity */}
        {(house.viewCount != null || house.inquiryCount != null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.sectionCard}>
              <View style={styles.activityRow}>
                {house.viewCount != null && (
                  <View style={styles.activityItem}>
                    <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.activityValue}>{house.viewCount}</Text>
                    <Text style={styles.activityLabel}>Views</Text>
                  </View>
                )}
                {house.inquiryCount != null && (
                  <View style={styles.activityItem}>
                    <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.activityValue}>{house.inquiryCount}</Text>
                    <Text style={styles.activityLabel}>Inquiries</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Owner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listed By</Text>
          <View style={styles.ownerCard}>
            {house.owner?.avatar ? (
              <Image source={{ uri: house.owner.avatar }} style={styles.ownerAvatar} />
            ) : (
              <View style={styles.ownerAvatarFallback}>
                <Ionicons name="person" size={22} color={COLORS.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{house.owner?.name || 'Owner'}</Text>
              {house.owner?.trustScore != null && (
                <View style={styles.trustRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.trustText}>{house.owner.trustScore} Trust Score</Text>
                </View>
              )}
              <View style={styles.verifiedRow}>
                {house.owner?.aadhaarVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
                    <Text style={styles.verifiedText}>Identity Verified</Text>
                  </View>
                ) : (
                  <Text style={styles.notVerifiedText}>Identity not verified</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Owner edit button */}
        {isOwner && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.secondaryButton, house.status === 'RENTED' && styles.disabledButton]}
              disabled={house.status === 'RENTED'}
              onPress={() => navigation.navigate('AddHouse', { house })}
            >
              <Ionicons name="create-outline" size={16} color={house.status === 'RENTED' ? COLORS.textMuted : COLORS.primary} />
              <Text style={[styles.secondaryButtonText, house.status === 'RENTED' && styles.disabledButtonText]}>
                {house.status === 'RENTED' ? 'Editing Locked' : 'Edit Property'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Property</Text>
                <TouchableOpacity onPress={() => setBookingModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <View style={styles.modalPropertySummary}>
                  <Text style={styles.modalPropertyName}>{house.title}</Text>
                  <Text style={styles.modalPropertyPrice}>{formatInr(house.rent)} / month</Text>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Message (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Add your message or questions..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={4}
                    value={bookingMessage}
                    onChangeText={setBookingMessage}
                    editable={!bookingLoading}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Desired Check-in Date (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD (e.g., 2026-08-15)"
                    placeholderTextColor={COLORS.textMuted}
                    value={checkInDate}
                    onChangeText={setCheckInDate}
                    editable={!bookingLoading}
                  />
                  <Text style={styles.formHint}>Enter the date you'd like to move in</Text>
                </View>
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setBookingModalVisible(false)}
                  disabled={bookingLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, bookingLoading && styles.disabledButton]}
                  onPress={handleBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color={COLORS.surface} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Branded Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="trash" size={28} color={COLORS.error} />
            </View>
            <Text style={styles.deleteModalTitle}>Remove Property?</Text>
            <Text style={styles.deleteModalDesc}>
              Are you sure you want to delete <Text style={{ fontWeight: '700', color: COLORS.text }}>"{house?.title}"</Text>? This action cannot be undone.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryBtnText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.surface,
    fontWeight: '600',
  },
  content: {
    paddingBottom: SPACING.xl * 2,
  },
  imageSection: {
    position: 'relative',
  },
  heroImage: {
    width: moderateScale(375),
    height: verticalScale(240),
    backgroundColor: COLORS.border,
  },
  imageCounter: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  imageCounterText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  price: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
  },
  pricePeriod: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginLeft: 'auto',
  },
  statusAvailable: {
    backgroundColor: '#ECFDF5',
  },
  statusRented: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  statusDotGreen: {
    backgroundColor: COLORS.secondary,
  },
  statusDotRed: {
    backgroundColor: COLORS.error,
  },
  statusChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  location: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
  },
  infoBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  depositLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
  },
  depositValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  actionRow: {
    marginTop: SPACING.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.surface,
    fontWeight: '700',
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  lockedNoticeText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  detailIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    marginTop: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
  },
  amenityChipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '500',
  },
  tenantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
  },
  tenantChipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
    gap: 4,
  },
  activityValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  activityLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  ownerAvatar: {
    width: verticalScale(54),
    height: verticalScale(54),
    borderRadius: verticalScale(27),
    backgroundColor: COLORS.border,
  },
  ownerAvatarFallback: {
    width: verticalScale(54),
    height: verticalScale(54),
    borderRadius: verticalScale(27),
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '700',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  trustText: {
    ...TYPOGRAPHY.body2,
    color: '#F59E0B',
    fontWeight: '600',
  },
  verifiedRow: {
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  notVerifiedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  disabledButton: {
    borderColor: COLORS.border,
  },
  disabledButtonText: {
    color: COLORS.textMuted,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  modalCloseBtn: {
    padding: SPACING.sm,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  modalPropertySummary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalPropertyName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalPropertyPrice: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  formHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    ...TYPOGRAPHY.body2,
    minHeight: 44,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
  },

  // Floating Toast
  deleteModalOverlay: {
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
