import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../types/services';
import { bookService } from '../api/servicesApi';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';

const formatInr = (val: number) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const ServiceDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const service: Service = route.params?.service;

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Service details not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookService = async () => {
    setLoading(true);
    try {
      await bookService({
        listingId: service.id,
        startDate: bookingDate ? new Date(bookingDate).toISOString() : new Date().toISOString(),
        totalAmount: service.price,
      });

      const msg = `Successfully booked "${service.title}"! The provider will contact you shortly.`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Booking Confirmed', msg);
      }
      setBookingModalVisible(false);
      setBookingDate('');
      setBookingNotes('');
    } catch (err: any) {
      console.error('Failed to book service:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to book service';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errMsg}`);
      } else {
        Alert.alert('Booking Failed', errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const imageUri = service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{service.title}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={async () => {
            const shareUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:8081';
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              await navigator.clipboard.writeText(shareUrl);
              window.alert('Service link copied to clipboard!');
            } else {
              Alert.alert('Shared', 'Service link copied!');
            }
          }}
        >
          <Ionicons name="share-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{service.type}</Text>
            </View>
            <View style={styles.pricingBadge}>
              <Text style={styles.pricingBadgeText}>{service.pricingModel.replace('_', ' ')}</Text>
            </View>
          </View>

          <Text style={styles.title}>{service.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatInr(service.price)}</Text>
            <Text style={styles.pricePeriod}>/{service.pricingModel.toLowerCase().replace('_', ' ')}</Text>
          </View>

          {/* Provider Details Card */}
          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>{service.providerName || 'Verified Partner'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{service.providerRating ? `${service.providerRating} Rating` : '4.8 (24 reviews)'}</Text>
                <View style={styles.verifiedChip}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this service</Text>
            <Text style={styles.description}>
              {service.description || 'Professional, trusted and thoroughly vetted service designed to give you complete peace of mind. Available on flexible schedules.'}
            </Text>
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.includedItem}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              <Text style={styles.includedText}>Background-verified professionals</Text>
            </View>
            <View style={styles.includedItem}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <Text style={styles.includedText}>Flexible scheduling & instant booking</Text>
            </View>
            <View style={styles.includedItem}>
              <Ionicons name="card-outline" size={18} color={COLORS.primary} />
              <Text style={styles.includedText}>Transparent pricing with zero hidden costs</Text>
            </View>
            <View style={styles.includedItem}>
              <Ionicons name="headset-outline" size={18} color={COLORS.primary} />
              <Text style={styles.includedText}>24/7 dedicated customer settlement support</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPrice}>{formatInr(service.price)}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookNowBtn}
          onPress={() => setBookingModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.bookNowBtnText}>Book Service</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Service</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSummary}>
              <Text style={styles.modalServiceName}>{service.title}</Text>
              <Text style={styles.modalServicePrice}>{formatInr(service.price)}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preferred Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (e.g., 2026-08-25)"
                placeholderTextColor={COLORS.textMuted}
                value={bookingDate}
                onChangeText={setBookingDate}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Special Instructions / Notes</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Any special instructions for the service provider..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                value={bookingNotes}
                onChangeText={setBookingNotes}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBookingModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleBookService}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.surface} size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm Booking</Text>
                )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  container: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  pricingBadge: {
    backgroundColor: '#10B98115',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  pricingBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#10B981',
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.lg,
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: '800',
  },
  pricePeriod: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#10B98115',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  includedText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomPriceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  bottomPrice: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '800',
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  bookNowBtnText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.surface,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  backBtnText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  modalSummary: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  modalServiceName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  modalServicePrice: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  formLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
});
