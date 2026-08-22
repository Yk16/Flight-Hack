import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Platform, useWindowDimensions } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { HouseCard } from '../components/HouseCard';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale } from '../utils/responsive';
import { House } from '../types/housing';
import { deleteHouse, normalizeHouse } from '../api/housingApi';

export const MyPropertiesScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const [properties, setProperties] = useState<House[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const compact = width < 380;
  const fabOffset = compact ? SPACING.md : SPACING.lg;

  const fetchProperties = async () => {
    if (!user?.status) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/houses/owner/my');
      const housesData = res.data?.data?.houses ?? res.data?.data ?? res.data?.houses ?? [];
      const houses = (housesData || []).map(normalizeHouse) as House[];
      setProperties(houses);
    } catch (err: any) {
      console.error('Fetch error', err);
      setToastMessage({ text: 'Failed to load properties', isError: true });
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (house: House) => {
    const doDelete = async () => {
      try {
        await deleteHouse(String(house.id));
        setProperties((current) => current.filter((item) => item.id !== house.id));
        setToastMessage({ text: `🗑️ Property "${house.title}" deleted successfully.` });
        setTimeout(() => setToastMessage(null), 3000);
      } catch (error: any) {
        console.error('Delete error', error);
        const errMsg = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Failed to delete property';
        setToastMessage({ text: `⚠️ ${errMsg}`, isError: true });
        setTimeout(() => setToastMessage(null), 4000);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${house.title}"? This action cannot be undone.`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Property',
        `Delete "${house.title}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: doDelete,
          },
        ]
      );
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchProperties();
    }
  }, [isFocused]);

  if (user?.status !== 'VERIFIED') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.textMuted} />
          <Text style={styles.errorTitle}>Account Not Verified</Text>
          <Text style={styles.errorText}>Verify your KYC to list properties.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={styles.cardGroup}>
              <HouseCard
                house={item}
                onPress={() => navigation.navigate('HouseDetails', { house: item })}
              />
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, item.status === 'RENTED' && styles.actionButtonDisabled]}
                  onPress={() => navigation.navigate('AddHouse', { house: item })}
                  disabled={item.status === 'RENTED'}
                >
                  <Ionicons name="create-outline" size={16} color={item.status === 'RENTED' ? COLORS.textMuted : COLORS.primary} />
                  <Text style={[styles.actionText, item.status === 'RENTED' && styles.actionTextDisabled]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, item.status === 'RENTED' ? styles.statusDotRented : styles.statusDotAvail]} />
                  <Text style={styles.statusText}>{item.status?.replace(/_/g, ' ') || 'AVAILABLE'}</Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>My Properties</Text>
              <Text style={styles.subtitle}>{properties.length} active listings</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No properties listed</Text>
              <Text style={styles.emptyText}>Add your first property to get started</Text>
            </View>
          }
        />
      )}
      <TouchableOpacity 
        style={[styles.fab, { bottom: fabOffset, right: fabOffset }]}
        onPress={() => navigation.navigate('AddHouse')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.surface} />
      </TouchableOpacity>

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
  listContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, paddingBottom: SPACING.xl },
  cardGroup: { marginBottom: SPACING.sm },
  header: { marginBottom: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.textMuted },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  detailLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, flex: 1 },
  detailValue: { ...TYPOGRAPHY.caption, color: COLORS.text, flex: 2, textAlign: 'right' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  actionButtonDisabled: { opacity: 0.5 },
  actionText: { color: COLORS.primary, fontWeight: '700' },
  actionTextDisabled: { color: COLORS.textMuted },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.surface,
  },
  deleteText: { color: COLORS.error, fontWeight: '700' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotAvail: {
    backgroundColor: '#10B981',
  },
  statusDotRented: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginTop: SPACING.lg },
  emptyText: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginTop: SPACING.sm },
  fab: {
    position: 'absolute',
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
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg },
  errorTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.lg },
  errorText: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginTop: SPACING.sm, textAlign: 'center' },
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


