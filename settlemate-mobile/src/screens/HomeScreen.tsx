import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { PropertyCardHorizontal } from '../components/PropertyCardHorizontal';
import { FlatmateCard } from '../components/FlatmateCard';
import { ServiceCardCompact } from '../components/ServiceCardCompact';
import { HorizontalSection } from '../components/HorizontalSection';
import { fetchHouses } from '../api/housingApi';
import { fetchServices } from '../api/servicesApi';
import { searchFlatmates } from '../api/flatmateApi';
import { House } from '../types/housing';
import { Service } from '../types/services';
const MOCK_ROOMS: House[] = [
  {
    id: 'mock-room-1', title: 'Cozy Single Room in Koramangala', description: 'Well-lit room with attached bathroom, near metro station', type: 'ROOM',
    rent: 8500, deposit: 17000, city: 'Bangalore', addressLine1: '4th Block, Koramangala', state: 'Karnataka',
    bedrooms: 1, bathrooms: 1, area: 120, status: 'AVAILABLE', furnishing: 'SEMI_FURNISHED',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'],
    amenities: ['WiFi', 'Washing Machine', 'Fridge'], availableFrom: '2026-08-01', viewCount: 312,
    createdAt: '2026-07-10T10:00:00Z', owner: { id: 1, name: 'Arjun M.', aadhaarVerified: true, trustScore: 4.6 },
  },
  {
    id: 'mock-room-2', title: 'Furnished Room near HITEC City', description: 'Spacious room in a shared apartment, ideal for IT professionals', type: 'ROOM',
    rent: 12000, deposit: 24000, city: 'Hyderabad', addressLine1: 'Madhapur, HITEC City', state: 'Telangana',
    bedrooms: 1, bathrooms: 1, area: 140, status: 'AVAILABLE', furnishing: 'FURNISHED',
    images: ['https://images.unsplash.com/photo-1595514535415-dae8580c416c?w=600'],
    amenities: ['WiFi', 'AC', 'Gym'], availableFrom: '2026-07-20', viewCount: 487,
    createdAt: '2026-07-08T14:30:00Z', owner: { id: 2, name: 'Priya K.', aadhaarVerified: true, trustScore: 4.8 },
  },
  {
    id: 'mock-room-3', title: 'Private Room in Andheri West', description: 'Compact room with cupboard, close to the railway station', type: 'ROOM',
    rent: 9500, deposit: 19000, city: 'Mumbai', addressLine1: 'Andheri West, Lokhandwala', state: 'Maharashtra',
    bedrooms: 1, bathrooms: 1, area: 100, status: 'AVAILABLE', furnishing: 'SEMI_FURNISHED',
    images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600'],
    amenities: ['WiFi', 'Power Backup'], availableFrom: '2026-08-05', viewCount: 256,
    createdAt: '2026-07-09T09:15:00Z', owner: { id: 3, name: 'Rohit S.', aadhaarVerified: false, trustScore: 4.2 },
  },
  {
    id: 'mock-room-4', title: 'Well-Ventilated Room in Whitefield', description: 'Bright room in a gated society, shared kitchen and hall', type: 'ROOM',
    rent: 7500, deposit: 15000, city: 'Bangalore', addressLine1: 'Whitefield Main Road', state: 'Karnataka',
    bedrooms: 1, bathrooms: 1, area: 110, status: 'AVAILABLE', furnishing: 'UNFURNISHED',
    images: ['https://images.unsplash.com/photo-1598928506311-c55ez06e0d26?w=600'],
    amenities: ['WiFi', 'Parking'], availableFrom: '2026-07-25', viewCount: 198,
    createdAt: '2026-07-11T16:45:00Z', owner: { id: 4, name: 'Neha D.', aadhaarVerified: true, trustScore: 4.5 },
  },
  {
    id: 'mock-room-5', title: 'AC Room in Salt Lake Sector V', description: 'Fully furnished room with AC and study table', type: 'ROOM',
    rent: 10000, deposit: 20000, city: 'Kolkata', addressLine1: 'Sector V, Salt Lake', state: 'West Bengal',
    bedrooms: 1, bathrooms: 1, area: 130, status: 'AVAILABLE', furnishing: 'FURNISHED',
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600'],
    amenities: ['WiFi', 'AC', 'Fridge'], availableFrom: '2026-08-10', viewCount: 345,
    createdAt: '2026-07-07T11:20:00Z', owner: { id: 5, name: 'Vikram P.', aadhaarVerified: true, trustScore: 4.7 },
  },
  {
    id: 'mock-room-6', title: 'Sunlit Room near Anna Nagar Metro', description: 'Quiet room in a family home, great connectivity', type: 'ROOM',
    rent: 6500, deposit: 13000, city: 'Chennai', addressLine1: 'Anna Nagar West Extension', state: 'Tamil Nadu',
    bedrooms: 1, bathrooms: 1, area: 105, status: 'AVAILABLE', furnishing: 'SEMI_FURNISHED',
    images: ['https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600'],
    amenities: ['WiFi', 'Power Backup'], availableFrom: '2026-07-30', viewCount: 178,
    createdAt: '2026-07-12T08:00:00Z', owner: { id: 6, name: 'Lakshmi R.', aadhaarVerified: true, trustScore: 4.3 },
  },
];

const MOCK_FLATMATES: FlatmateProfile[] = [
  {
    id: 101, budget: 12000, lifestyle: ['Non-smoker', 'Vegetarian', 'Early bird'],
    lookingFor: ['Working professional', 'Female preferred'], occupation: 'Software Engineer',
    bio: 'Quiet person who enjoys reading. Looking for a clean and peaceful living space.',
    moveInDate: '2026-08-01', city: 'Bangalore', preferredLocation: 'Koramangala / HSR Layout',
    user: { id: 201, name: 'Ananya Sharma', gender: 'Female', occupation: 'Software Engineer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  },
  {
    id: 102, budget: 15000, lifestyle: ['Non-smoker', 'Fitness enthusiast', 'Social'],
    lookingFor: ['Any gender', 'Working professionals'], occupation: 'Product Manager',
    bio: 'Love cooking and weekend hikes. Looking for a friendly and active flatmate.',
    moveInDate: '2026-07-20', city: 'Mumbai', preferredLocation: 'Powai / Andheri',
    user: { id: 202, name: 'Rohan Mehta', gender: 'Male', occupation: 'Product Manager', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  },
  {
    id: 103, budget: 9000, lifestyle: ['Non-smoker', 'Night owl', 'Student-friendly'],
    lookingFor: ['Students preferred', 'Quiet environment'], occupation: 'MBA Student',
    bio: 'Grad student looking for a budget-friendly place with good internet.',
    moveInDate: '2026-08-10', city: 'Hyderabad', preferredLocation: 'Gachibowli / Madhapur',
    user: { id: 203, name: 'Deepika Nair', gender: 'Female', occupation: 'MBA Student', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  },
  {
    id: 104, budget: 18000, lifestyle: ['Pet lover', 'Non-smoker', 'Minimalist'],
    lookingFor: ['Pet-friendly flat', 'Any gender'], occupation: 'UX Designer',
    bio: 'I have a small dog. Looking for a spacious, pet-friendly place.',
    moveInDate: '2026-09-01', city: 'Pune', preferredLocation: 'Kothrud / Baner',
    user: { id: 204, name: 'Karthik Iyer', gender: 'Male', occupation: 'UX Designer', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  },
  {
    id: 105, budget: 7000, lifestyle: ['Vegetarian', 'Early riser', 'Studious'],
    lookingFor: ['Female preferred', 'Students or freshers'], occupation: 'Content Writer',
    bio: 'Freelance writer who needs a quiet and affordable space to work from home.',
    moveInDate: '2026-08-15', city: 'Delhi', preferredLocation: 'Lajpat Nagar / South Extension',
    user: { id: 205, name: 'Meghna Gupta', gender: 'Female', occupation: 'Content Writer', avatar: 'https://randomuser.me/api/portraits/women/90.jpg' },
  },
  {
    id: 106, budget: 20000, lifestyle: ['Social drinker', 'Foodie', 'Travel lover'],
    lookingFor: ['Working professionals', 'Any gender'], occupation: 'Management Consultant',
    bio: 'Outgoing and fun-loving. Looking for flatmates who are up for weekend trips and food runs.',
    moveInDate: '2026-07-25', city: 'Gurgaon', preferredLocation: 'DLF Phase 2 / Cyber Hub area',
    user: { id: 206, name: 'Arnav Joshi', gender: 'Male', occupation: 'Management Consultant', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
  },
];

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../theme/colors';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

const AnimatedSection = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

type FlatmateProfile = {
  id: number;
  budget: number;
  lifestyle: string[];
  lookingFor: string[];
  occupation?: string;
  bio?: string;
  moveInDate?: string;
  city?: string;
  state?: string;
  preferredLocation?: string;
  user: {
    id: number;
    name?: string;
    avatar?: string;
    gender?: string;
    occupation?: string;
  };
};

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [houses, setHouses] = useState<House[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [flatmates, setFlatmates] = useState<FlatmateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [notificationVisible, setNotificationVisible] = useState(false);

  const sectionRefs = useRef<Record<string, View | null>>({});

  const categories = [
    { id: 'All', icon: 'apps' },
    { id: 'Houses', icon: 'home' },
    { id: 'Apartments', icon: 'business' },
    { id: 'Rooms', icon: 'bed' },
    { id: 'Flatmates', icon: 'people' },
    { id: 'Services', icon: 'briefcase' },
  ];

  const loadData = async () => {
    try {
      const [housesData, servicesData, flatmatesResult] = await Promise.all([
        fetchHouses(),
        fetchServices(),
        searchFlatmates({ limit: 20 }).catch(() => ({ profiles: [], pagination: { page: 1, limit: 20, total: 0 } })),
      ]);
      const hasRooms = housesData.some((h) => h.type === 'ROOM');
      setHouses(hasRooms ? housesData : [...housesData, ...MOCK_ROOMS]);
      setServices(servicesData);
      setFlatmates(flatmatesResult.profiles?.length ? flatmatesResult.profiles : MOCK_FLATMATES);
    } catch (error) {
      console.error('[HomeScreen] Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      loadData();
    }
  }, [isFocused]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const ref = sectionRefs.current[sectionId];
    if (ref && scrollViewRef.current) {
      const handle = findNodeHandle(ref);
      if (handle) {
        UIManager.measureLayout(
          handle,
          findNodeHandle(scrollViewRef.current)!,
          () => {},
          (_x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 10, animated: true });
          }
        );
      }
    }
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    switch (categoryId) {
      case 'All':
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        break;
      case 'Houses':
        scrollToSection('independent-houses');
        break;
      case 'Apartments':
        scrollToSection('apartments');
        break;
      case 'Rooms':
        scrollToSection('private-rooms');
        break;
      case 'Flatmates':
        scrollToSection('flatmates');
        break;
      case 'Services':
        scrollToSection('services');
        break;
    }
  }, [scrollToSection]);

  const handlePropertyPress = useCallback((house: House) => {
    navigation.navigate('HouseDetails', { houseId: house.id, house });
  }, [navigation]);

  const handleSeeAll = useCallback((section: string) => {
    // Placeholder for navigation to full list screens
  }, []);

  const filteredHouses = useMemo(() => {
    if (!searchQuery.trim()) return houses;
    const q = searchQuery.toLowerCase();
    return houses.filter(
      (h) =>
        h.title?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.type?.toLowerCase().includes(q)
    );
  }, [houses, searchQuery]);

  const featuredHouses = useMemo(
    () =>
      [...filteredHouses]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 8),
    [filteredHouses]
  );

  const independentHouses = useMemo(
    () => filteredHouses.filter((h) => h.type === 'INDEPENDENT_HOUSE'),
    [filteredHouses]
  );

  const apartments = useMemo(
    () => filteredHouses.filter((h) => h.type === 'APARTMENT'),
    [filteredHouses]
  );

  const rooms = useMemo(
    () => filteredHouses.filter((h) => h.type === 'ROOM'),
    [filteredHouses]
  );

  const newlyAdded = useMemo(
    () =>
      [...filteredHouses]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 8),
    [filteredHouses]
  );

  const budgetFriendly = useMemo(
    () => filteredHouses.filter((h) => h.rent < 20000).slice(0, 8),
    [filteredHouses]
  );

  const premiumCollection = useMemo(
    () => filteredHouses.filter((h) => h.rent >= 40000).slice(0, 8),
    [filteredHouses]
  );

  const renderPropertyCard = useCallback(
    (item: House) => (
      <PropertyCardHorizontal
        house={item}
        onPress={() => handlePropertyPress(item)}
      />
    ),
    [handlePropertyPress]
  );

  const renderFlatmateCard = useCallback(
    (item: FlatmateProfile) => (
      <FlatmateCard
        profile={item}
        onPress={() => navigation.navigate('FlatmateProfile')}
        onChat={() => {
          if (item.user?.id) {
            navigation.navigate('Chat', {
              screen: 'ChatDetail',
              params: {
                roomId: `chat-${Math.min(Number(user?.id || 1), item.user.id)}-${Math.max(Number(user?.id || 1), item.user.id)}`,
                recipientName: item.user.name || 'Flatmate',
                recipientId: item.user.id,
              },
            });
          } else {
            navigation.navigate('Chat');
          }
        }}
      />
    ),
    [navigation, user]
  );

  const renderServiceCard = useCallback(
    (item: Service) => (
      <ServiceCardCompact
        service={item}
        onPress={() => navigation.navigate('Services')}
        onBook={() => navigation.navigate('Services')}
      />
    ),
    [navigation]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding properties near you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View style={styles.greetingSection}>
              <Text style={styles.subtext}>Location</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
                <Text style={styles.locationText}>Ahmedabad, Gujarat</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.text} style={styles.chevron} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => setNotificationVisible(true)}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <View style={styles.searchIcon}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search properties, services..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="default"
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons name="options-outline" size={20} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  style={[
                    styles.categoryChip,
                    activeCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategoryPress(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={18}
                    color={activeCategory === cat.id ? COLORS.surface : COLORS.textMuted}
                    style={styles.categoryIcon}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      activeCategory === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Sections */}
        {(activeCategory === 'All' || activeCategory === 'Houses') && (
          <AnimatedSection index={0}>
            <View ref={(r) => { sectionRefs.current['independent-houses'] = r; }}>
              <HorizontalSection
                title="Independent Houses"
                subtitle="Spacious homes for families and professionals"
                data={independentHouses}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => `house-${item.id}`}
                onSeeAll={() => handleSeeAll('houses')}
                emptyMessage="No independent houses found."
              />
            </View>
          </AnimatedSection>
        )}

        {(activeCategory === 'All' || activeCategory === 'Apartments') && (
          <AnimatedSection index={1}>
            <View ref={(r) => { sectionRefs.current['apartments'] = r; }}>
              <HorizontalSection
                title="Apartments"
                subtitle="Modern apartments in prime locations"
                data={apartments}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => `apt-${item.id}`}
                onSeeAll={() => handleSeeAll('apartments')}
                emptyMessage="No apartments available."
              />
            </View>
          </AnimatedSection>
        )}

        {(activeCategory === 'All' || activeCategory === 'Rooms') && (
          <AnimatedSection index={2}>
            <View ref={(r) => { sectionRefs.current['private-rooms'] = r; }}>
              <HorizontalSection
                title="Private Rooms"
                subtitle="Affordable rooms for students and professionals"
                data={rooms}
                renderItem={renderPropertyCard}
                keyExtractor={(item) => `room-${item.id}`}
                onSeeAll={() => handleSeeAll('rooms')}
                emptyMessage="No rooms available."
              />
            </View>
          </AnimatedSection>
        )}

        {(activeCategory === 'All' || activeCategory === 'Flatmates') && (
          <AnimatedSection index={3}>
            <View ref={(r) => { sectionRefs.current['flatmates'] = r; }}>
              <HorizontalSection
                title="Find Your Flatmate"
                subtitle="People looking to share a home near you"
                data={flatmates}
                renderItem={renderFlatmateCard}
                keyExtractor={(item) => `flatmate-${item.id}`}
                onSeeAll={() => handleSeeAll('flatmates')}
                emptyMessage="No flatmates available right now."
              />
            </View>
          </AnimatedSection>
        )}

        {(activeCategory === 'All' || activeCategory === 'Services') && (
          <AnimatedSection index={4}>
            <View ref={(r) => { sectionRefs.current['services'] = r; }}>
              <HorizontalSection
                title="Settlement Services"
                subtitle="Everything you need after moving in"
                data={services}
                renderItem={renderServiceCard}
                keyExtractor={(item) => `service-${item.id}`}
                onSeeAll={() => handleSeeAll('services')}
                emptyMessage="No services available."
              />
            </View>
          </AnimatedSection>
        )}

        {activeCategory === 'All' && (
          <>
            <AnimatedSection index={5}>
              <View ref={(r) => { sectionRefs.current['featured'] = r; }}>
                <HorizontalSection
                  title="Featured Properties"
                  subtitle="Handpicked homes recommended for you"
                  data={featuredHouses}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item) => `featured-${item.id}`}
                  onSeeAll={() => handleSeeAll('featured')}
                  emptyMessage="No featured properties available."
                />
              </View>
            </AnimatedSection>

            <AnimatedSection index={6}>
              <View ref={(r) => { sectionRefs.current['newly-added'] = r; }}>
                <HorizontalSection
                  title="Newly Added"
                  subtitle="Fresh listings added recently"
                  data={newlyAdded}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item) => `new-${item.id}`}
                  emptyMessage="No new listings yet."
                />
              </View>
            </AnimatedSection>

            <AnimatedSection index={7}>
              <View ref={(r) => { sectionRefs.current['budget'] = r; }}>
                <HorizontalSection
                  title="Budget Friendly"
                  subtitle="Great homes within your budget"
                  data={budgetFriendly}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item) => `budget-${item.id}`}
                  emptyMessage="No budget-friendly listings found."
                />
              </View>
            </AnimatedSection>

            <AnimatedSection index={8}>
              <View ref={(r) => { sectionRefs.current['premium'] = r; }}>
                <HorizontalSection
                  title="Premium Collection"
                  subtitle="Luxury homes with premium amenities"
                  data={premiumCollection}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item) => `premium-${item.id}`}
                  emptyMessage="No premium listings available."
                />
              </View>
            </AnimatedSection>

            <AnimatedSection index={9}>
              <View ref={(r) => { sectionRefs.current['near-you'] = r; }}>
                <HorizontalSection
                  title="Near You"
                  subtitle="Properties close to your selected location"
                  data={filteredHouses.slice(0, 10)}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item) => `near-${item.id}`}
                  emptyMessage="No properties near your location."
                />
              </View>
            </AnimatedSection>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Notification Modal */}
      <Modal
        visible={notificationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationVisible(false)}
      >
        <View style={styles.notifOverlay}>
          <View style={styles.notifCard}>
            <View style={styles.notifHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="notifications" size={20} color={COLORS.primary} />
                <Text style={styles.notifTitle}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => setNotificationVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <View style={styles.notifItem}>
                <View style={[styles.notifIconWrap, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifItemTitle}>Welcome to SettleMate!</Text>
                  <Text style={styles.notifItemBody}>Explore verified homes, rooms, and settlement services in your city.</Text>
                  <Text style={styles.notifTime}>Just now</Text>
                </View>
              </View>

              <View style={styles.notifItem}>
                <View style={[styles.notifIconWrap, { backgroundColor: '#3B82F620' }]}>
                  <Ionicons name="home" size={20} color="#3B82F6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifItemTitle}>New Listings Available</Text>
                  <Text style={styles.notifItemBody}>Fresh verified apartments added in Ahmedabad & Bangalore.</Text>
                  <Text style={styles.notifTime}>2 hours ago</Text>
                </View>
              </View>

              <View style={styles.notifItem}>
                <View style={[styles.notifIconWrap, { backgroundColor: '#8B5CF620' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifItemTitle}>KYC Verification</Text>
                  <Text style={styles.notifItemBody}>Verify your Aadhaar or PAN in Profile to boost your Trust Score.</Text>
                  <Text style={styles.notifTime}>1 day ago</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.notifCloseBtn}
              onPress={() => setNotificationVisible(false)}
            >
              <Text style={styles.notifCloseText}>Mark all as read</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  headerContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greetingSection: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  locationText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginLeft: scale(4),
  },
  chevron: {
    marginLeft: scale(4),
    marginTop: verticalScale(2),
  },
  notificationBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  notificationBadge: {
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(12),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  subtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: moderateScale(0.5),
  },
  searchContainer: {
    marginBottom: SPACING.lg,
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    fontSize: moderateScale(15),
    color: COLORS.text,
    height: verticalScale(48),
  },
  searchIcon: {
    paddingHorizontal: SPACING.md,
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.md,
  },
  categoryList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  categoryTextActive: {
    color: COLORS.surface,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },

  // Notification Modal Styles
  notifOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  notifCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notifTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifItemTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text,
    fontWeight: '600',
  },
  notifItemBody: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  notifTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  notifCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  notifCloseText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 14,
  },
});
