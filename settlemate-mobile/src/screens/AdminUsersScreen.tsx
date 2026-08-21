import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Image, Linking, ScrollView, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';
import { useAuthStore } from '../store/authStore';

type UserItem = {
  id: number;
  email?: string | null;
  name?: string | null;
  status: string;
  aadhaarVerified: boolean;
  panVerified: boolean;
  kycDocuments?: Array<{
    documentType?: string;
    documentNumber?: string;
    documentImage?: string;
    submittedAt?: string;
  }>;
  kycDocumentCount?: number;
};

type ServiceProviderItem = {
  id: number;
  title: string;
  type: string;
  status: string;
  price: number;
  pricingModel: string;
  description?: string | null;
  rejectionReason?: string | null;
  images?: string[];
  provider: {
    id: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    aadhaarVerified?: boolean;
    panVerified?: boolean;
  };
};

type ViewMode = 'users' | 'providers';

export const AdminUsersScreen = () => {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProviderItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProviderItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const compact = width < 380;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users', { params: { kycSubmitted: true } });
      const list = res?.data?.data ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    setProviderLoading(true);
    try {
      const res = await apiClient.get('/services/admin/providers');
      const list = res?.data?.data ?? [];
      setServiceProviders(Array.isArray(list) ? list : []);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || err?.response?.data?.message || 'Failed to load service provider requests');
    } finally {
      setProviderLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.isAdmin) return;
    fetchUsers();
  }, [user?.isAdmin]);

  useEffect(() => {
    if (user?.isAdmin && viewMode === 'providers') {
      fetchProviders();
    }
  }, [user?.isAdmin, viewMode]);

  const verifyUser = async (id: number) => {
    try {
      await apiClient.post(`/admin/users/${id}/verify`);
      Alert.alert('Success', 'User verified successfully');
      fetchUsers();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || err?.response?.data?.message || 'Verification failed');
    }
  };

  const openDocument = async (url?: string) => {
    if (!url) return;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Document URL', url);
    }
  };

  const selectedDocuments = useMemo(() => selectedUser?.kycDocuments || [], [selectedUser]);

  const openProviderDetails = (provider: ServiceProviderItem) => {
    setSelectedProvider(provider);
    setRejectionReason('');
  };

  const updateProviderStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedProvider) return;
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      await apiClient.patch(`/services/admin/providers/${selectedProvider.id}/verify`, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason.trim() : undefined,
      });
      Alert.alert('Success', `Service provider ${status.toLowerCase()} successfully`);
      setSelectedProvider(null);
      setRejectionReason('');
      fetchProviders();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error?.message || err?.response?.data?.message || 'Verification failed');
    }
  };

  const renderUserItem = ({ item }: { item: UserItem }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name || item.email}</Text>
        <Text style={styles.meta}>Status: {item.status}</Text>
        <Text style={styles.meta}>Aadhaar: {item.aadhaarVerified ? 'Yes' : 'No'} • PAN: {item.panVerified ? 'Yes' : 'No'}</Text>
        <Text style={styles.meta}>KYC Docs: {item.kycDocumentCount ?? item.kycDocuments?.length ?? 0}</Text>
        {!!item.kycDocuments?.length && (
          <TouchableOpacity style={styles.viewDocsBtn} onPress={() => setSelectedUser(item)}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
            <Text style={styles.viewDocsText}>View Documents</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.actions}>
        {item.status !== 'VERIFIED' && (
          <TouchableOpacity style={styles.verifyBtn} onPress={() => verifyUser(item.id)}>
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderProviderItem = ({ item }: { item: ServiceProviderItem }) => (
    <TouchableOpacity style={styles.providerRow} activeOpacity={0.85} onPress={() => openProviderDetails(item)}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.meta}>{item.type} • ₹{item.price}</Text>
        <Text style={styles.meta} numberOfLines={1}>{item.provider.name || item.provider.email || 'Unknown provider'}</Text>
      </View>
      <View style={styles.providerBadge}>
        <Text style={styles.providerBadgeText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Manage KYC and service provider verification requests</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentButton, viewMode === 'users' && styles.segmentButtonActive]}
            onPress={() => setViewMode('users')}
          >
            <Text style={[styles.segmentText, viewMode === 'users' && styles.segmentTextActive]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, viewMode === 'providers' && styles.segmentButtonActive]}
            onPress={() => setViewMode('providers')}
          >
            <Text style={[styles.segmentText, viewMode === 'providers' && styles.segmentTextActive]}>Service Providers</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'users' ? (
        loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderUserItem}
            contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
            ListEmptyComponent={() => (
              <View style={{ padding: SPACING.md }}>
                <Text style={styles.empty}>No users found</Text>
              </View>
            )}
          />
        )
      ) : providerLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
      ) : (
        <FlatList
          data={serviceProviders}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderProviderItem}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListEmptyComponent={() => (
            <View style={{ padding: SPACING.md }}>
              <Text style={styles.empty}>No service provider requests found</Text>
            </View>
          )}
        />
      )}

      <Modal
        visible={!!selectedUser}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { width: compact ? '100%' : '94%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>KYC Documents</Text>
                <Text style={styles.modalSubtitle}>{selectedUser?.name || selectedUser?.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              {selectedDocuments.length ? (
                selectedDocuments.map((doc, index) => (
                  <View key={`${doc.documentType ?? 'doc'}-${index}`} style={styles.docCard}>
                    <View style={styles.docRow}><Text style={styles.docLabel}>Type</Text><Text style={styles.docValue}>{doc.documentType || 'Unknown'}</Text></View>
                    <View style={styles.docRow}><Text style={styles.docLabel}>Number</Text><Text style={styles.docValue}>{doc.documentNumber || 'N/A'}</Text></View>
                    <View style={styles.docRow}><Text style={styles.docLabel}>Submitted</Text><Text style={styles.docValue}>{doc.submittedAt ? new Date(doc.submittedAt).toLocaleString() : 'N/A'}</Text></View>
                    {!!doc.documentImage && (
                      <TouchableOpacity onPress={() => setFullScreenImage(doc.documentImage ?? null)} activeOpacity={0.85}>
                        <Image source={{ uri: doc.documentImage }} style={styles.docImage} resizeMode="cover" />
                        <View style={{ position: 'absolute', bottom: SPACING.xs, right: SPACING.xs, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.xs, paddingVertical: 2 }}>
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>Tap to view full</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyDocs}>No documents available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedProvider}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProvider(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { width: compact ? '100%' : '94%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Service Provider Request</Text>
                <Text style={styles.modalSubtitle}>{selectedProvider?.provider.name || selectedProvider?.provider.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedProvider(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.docCard}>
                <View style={styles.docRow}><Text style={styles.docLabel}>Title</Text><Text style={styles.docValue}>{selectedProvider?.title}</Text></View>
                <View style={styles.docRow}><Text style={styles.docLabel}>Type</Text><Text style={styles.docValue}>{selectedProvider?.type}</Text></View>
                <View style={styles.docRow}><Text style={styles.docLabel}>Price</Text><Text style={styles.docValue}>₹{selectedProvider?.price}</Text></View>
                <View style={styles.docRow}><Text style={styles.docLabel}>Status</Text><Text style={styles.docValue}>{selectedProvider?.status}</Text></View>
                <View style={styles.docRow}><Text style={styles.docLabel}>Aadhaar</Text><Text style={styles.docValue}>{selectedProvider?.provider.aadhaarVerified ? 'Yes' : 'No'}</Text></View>
                <View style={styles.docRow}><Text style={styles.docLabel}>PAN</Text><Text style={styles.docValue}>{selectedProvider?.provider.panVerified ? 'Yes' : 'No'}</Text></View>
                {!!selectedProvider?.description && <Text style={[styles.docValue, { textAlign: 'left', marginTop: SPACING.sm }]}>{selectedProvider.description}</Text>}
              </View>

              {selectedProvider?.status === 'PENDING' && (
                <View style={styles.docCard}>
                  <Text style={styles.docLabel}>Rejection Reason</Text>
                  <TextInput
                    style={styles.reasonInput}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    placeholder="Enter reason if rejecting"
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                  />
                  <View style={styles.providerActionRow}>
                    <TouchableOpacity style={[styles.providerActionBtn, styles.approveBtn]} onPress={() => updateProviderStatus('APPROVED')}>
                      <Text style={styles.providerActionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.providerActionBtn, styles.rejectBtn]} onPress={() => updateProviderStatus('REJECTED')}>
                      <Text style={styles.providerActionText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!fullScreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: SPACING.xl, right: SPACING.md, zIndex: 10, padding: SPACING.sm }} onPress={() => setFullScreenImage(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: fullScreenImage || '' }} style={{ width: width * 0.95, height: '80%', borderRadius: BORDER_RADIUS.md }} resizeMode="contain" />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginTop: SPACING.xs },
  segmentRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  segmentButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  segmentButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  segmentText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: '700' },
  segmentTextActive: { color: COLORS.surface },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerBadge: {
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#EEF2FF',
  },
  providerBadgeText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '700' },
  info: { flex: 1, minWidth: 0 },
  name: { ...TYPOGRAPHY.h4, color: COLORS.text },
  meta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: SPACING.xs },
  actions: { marginLeft: SPACING.md },
  verifyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  verifyText: { color: COLORS.surface, fontWeight: '700' },
  empty: { ...TYPOGRAPHY.body2, color: COLORS.textMuted },
  viewDocsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#EEF2FF',
  },
  viewDocsText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  modalSubtitle: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginTop: SPACING.xs },
  closeBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { paddingBottom: SPACING.lg },
  docCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  docLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, flex: 1 },
  docValue: { ...TYPOGRAPHY.caption, color: COLORS.text, flex: 2, textAlign: 'right' },
  docImage: {
    width: '100%',
    height: moderateScale(180),
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.border,
  },
  reasonInput: {
    minHeight: verticalScale(88),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    textAlignVertical: 'top',
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  providerActionRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  providerActionBtn: { flex: 1, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.sm, alignItems: 'center' },
  approveBtn: { backgroundColor: COLORS.primary },
  rejectBtn: { backgroundColor: '#DC2626' },
  providerActionText: { color: COLORS.surface, fontWeight: '700' },
  emptyDocs: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.lg },
});
