import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { fetchProviderBookings, updateBookingStatus } from '../api/servicesAdminApi';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

export const ProviderBookingsScreen = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchProviderBookings();
      setBookings(res || []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: number, status: string) => {
    try {
      await updateBookingStatus(id, status);
      Alert.alert('Updated', 'Booking status updated');
      load();
    } catch (err) {
      console.error('Update failed', err);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: SPACING.md }}>
        <Text style={{ ...TYPOGRAPHY.h2, color: COLORS.text }}>Bookings</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: SPACING.md }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.listing.title}</Text>
              <Text style={styles.meta}>By: {item.user?.name || item.userId}</Text>
              <Text style={styles.meta}>Status: {item.status}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.btn} onPress={() => changeStatus(item.id, 'ACCEPTED')}>
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#F97316' }]} onPress={() => changeStatus(item.id, 'REJECTED')}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#10B981' }]} onPress={() => changeStatus(item.id, 'COMPLETED')}>
                  <Text style={styles.btnText}>Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md },
  title: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.xs },
  meta: { ...TYPOGRAPHY.body2, color: COLORS.textMuted },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  btnText: { color: COLORS.surface, fontWeight: '700' },
});
