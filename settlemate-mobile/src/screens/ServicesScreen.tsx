import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceSkeleton } from '../components/ServiceSkeleton';
import { ServiceEmptyState } from '../components/ServiceEmptyState';
import { Testimonial } from '../components/Testimonial';
import { FAQAccordion } from '../components/FAQAccordion';
import { fetchServices, bookService } from '../api/servicesApi';
import { Service, ServiceType } from '../types/services';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';

import { moderateScale, scale, verticalScale } from '../utils/responsive';

const SERVICE_TYPES: ServiceType[] = ['MAID', 'COOK', 'LAUNDRY', 'FURNITURE', 'APPLIANCE'];

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    content: 'Excellent service! The cleaning team was professional and thorough. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Raj Patel',
    role: 'Working Professional',
    content: 'The cooking service has saved me so much time. Fresh, delicious meals every day!',
    rating: 5,
  },
  {
    name: 'Priya Singh',
    role: 'Busy Parent',
    content: 'Reliable and trustworthy. They treat my home like their own. Best decision ever!',
    rating: 4,
  },
];

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I book a service?',
    answer:
      'Simply browse through our services, select the one you like, and click the booking button. Follow the prompts to complete your booking. You can schedule it for your preferred date and time.',
  },
  {
    id: '2',
    question: 'Are the service providers verified?',
    answer:
      'Yes, all our service providers go through a rigorous verification process. They are background checked and have been rated by multiple customers.',
  },
  {
    id: '3',
    question: 'Can I reschedule or cancel my booking?',
    answer:
      'You can reschedule or cancel your booking up to 24 hours before the scheduled service. After that, a cancellation fee may apply.',
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, debit cards, digital wallets, and bank transfers. Payments are secure and encrypted.',
  },
  {
    id: '5',
    question: 'What if I\'m not satisfied with the service?',
    answer:
      'We offer a 100% satisfaction guarantee. If you\'re not happy with the service, contact our support team within 24 hours for a full refund or re-service.',
  },
];

export const ServicesScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const isFocused = useIsFocused();
  const isVerifiedProvider = Boolean(user?.isProvider && user?.status === 'VERIFIED');
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceType | 'All'>('All');
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Load services
  const loadServices = async () => {
    try {
      const data = await fetchServices();
      setServices(data || []);
      // Ensure we always set filteredServices to an array
      setFilteredServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      loadServices();
    }
  }, [isFocused]);

  // Handle search - just update the query, filtering happens via useMemo
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Memoize filtering to avoid unnecessary re-renders that dismiss keyboard
  useEffect(() => {
    let filtered = services;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((s) => s.type === selectedCategory);
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(lowerQuery) ||
          s.description?.toLowerCase().includes(lowerQuery) ||
          s.type.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredServices(filtered);
  }, [services, searchQuery, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (category: ServiceType | 'All') => {
    setSelectedCategory(category);
    // Filtering will happen automatically via useEffect
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  // Render header
  const renderHeader = () => (
    <View>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Services</Text>
            <Text style={styles.headerSubtitle}>
              {Array.isArray(filteredServices) ? filteredServices.length : 0} {Array.isArray(filteredServices) && filteredServices.length === 1 ? 'service' : 'services'} available
            </Text>
          </View>
          <View style={styles.headerActions}>
            {isVerifiedProvider ? (
              <TouchableOpacity style={styles.addServiceBtn} onPress={() => navigation.navigate('AddService')}>
                <Ionicons name="add" size={18} color={COLORS.surface} />
                <Text style={styles.addServiceBtnText}>Add Service</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIcon}>
              <Ionicons name="search" size={20} color={COLORS.textMuted} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="default"
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'All' && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory('All')}
            >
              <Ionicons
                name="grid"
                size={16}
                color={selectedCategory === 'All' ? COLORS.surface : COLORS.textMuted}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'All' && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {SERVICE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.categoryChip,
                  selectedCategory === type && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(type)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === type && styles.categoryChipTextActive,
                  ]}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      {/* Featured Services Section */}
      {Array.isArray(filteredServices) && filteredServices.some((s) => s.isFeatured) && selectedCategory === 'All' && !searchQuery && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color={COLORS.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Featured Services</Text>
          </View>
          {filteredServices
            .filter((s) => s.isFeatured)
            .slice(0, 2)
            .map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
        </View>
      )}

      {/* Results Header */}
      {(searchQuery || selectedCategory !== 'All') && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {selectedCategory === 'All' ? 'All Services' : `${selectedCategory} Services`}
          </Text>
          {filteredServices.length > 0 && (
            <Text style={styles.resultsCount}>{filteredServices.length} results</Text>
          )}
        </View>
      )}
    </View>
  );

  // Render footer with testimonials and FAQ
  const renderFooter = () => (
    <View>
      {/* Testimonials Section */}
      {!loading && Array.isArray(filteredServices) && filteredServices.length > 0 && (
        <View style={styles.testimonialsSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="star-circle"
              size={20}
              color={COLORS.primary}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>What Users Say</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.testimonialsScroll}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* FAQ Section */}
      {!loading && Array.isArray(filteredServices) && filteredServices.length > 0 && (
        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="help-circle"
              size={20}
              color={COLORS.primary}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          <FAQAccordion items={FAQ_ITEMS} />
        </View>
      )}

      {/* CTA Section */}
      {!loading && Array.isArray(filteredServices) && filteredServices.length > 0 && (
        <View style={styles.ctaSection}>
          <View style={styles.ctaContent}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={32}
              color={COLORS.primary}
            />
            <Text style={styles.ctaTitle}>Ready to Book?</Text>
            <Text style={styles.ctaDescription}>
              Select your preferred service and schedule it today!
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Explore Now</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </View>
  );

  if (loading && (!Array.isArray(filteredServices) || filteredServices.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.flatListContent}>
          {renderHeader()}
          <View style={styles.skeletonsContainer}>
            {Array.from({ length: 3 }).map((_, i) => (
              <ServiceSkeleton key={i} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredServices}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            onPress={() => navigation.navigate('ServiceDetails', { service: item })}
            onBook={async () => {
              try {
                await bookService({ listingId: item.id, totalAmount: item.price });
                Alert.alert('Booked', 'Service booked successfully');
              } catch (err) {
                console.error('Booking failed', err);
                Alert.alert('Error', 'Failed to book service');
              }
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter()}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <ServiceEmptyState onRetry={handleRefresh} />
            </View>
          ) : null
        }
        contentContainerStyle={[styles.flatListContent, { flexGrow: 1 }]}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {isVerifiedProvider ? (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddService')}>
          <Ionicons name="add" size={28} color={COLORS.surface} />
        </TouchableOpacity>
      ) : null}
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
    backgroundColor: COLORS.background,
  },
  flatListContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },

  // Header
  headerContainer: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerGreeting: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  notificationBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.error,
  },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  addServiceBtnText: {
    color: COLORS.surface,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Hero Section
  heroSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIcon: {
    marginBottom: SPACING.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Search
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: SPACING.md,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },

  // Categories
  categoriesSection: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  sectionLabel: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  categoriesScroll: {
    paddingHorizontal: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: COLORS.surface,
  },

  // Featured Section
  featuredSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionIcon: {
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  resultsCount: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },

  // Testimonials Section
  testimonialsSection: {
    marginBottom: SPACING.xxl,
  },
  testimonialsScroll: {
    paddingHorizontal: SPACING.md,
  },

  // FAQ Section
  faqSection: {
    marginBottom: SPACING.xxl,
  },

  // CTA Section
  ctaSection: {
    marginBottom: SPACING.lg,
  },
  ctaContent: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.surface,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  ctaDescription: {
    ...TYPOGRAPHY.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  ctaButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },

  // Empty and Loading
  emptyContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
  },
  skeletonsContainer: {
    paddingHorizontal: SPACING.lg,
  },

  // Bottom spacing
  bottomSpacer: {
    height: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
