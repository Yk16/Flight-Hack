import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale } from '../utils/responsive';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      title: 'Booking Payment',
      amount: 150.00,
      type: 'debit',
      date: '2025-04-25',
      status: 'completed',
      description: 'Payment for property booking',
    },
    {
      id: '2',
      title: 'Refund',
      amount: 50.00,
      type: 'credit',
      date: '2025-04-24',
      status: 'completed',
      description: 'Cancellation refund',
    },
    {
      id: '3',
      title: 'Service Fee',
      amount: 25.00,
      type: 'debit',
      date: '2025-04-23',
      status: 'completed',
      description: 'Platform service fee',
    },
    {
      id: '4',
      title: 'Hosting Payout',
      amount: 500.00,
      type: 'credit',
      date: '2025-04-20',
      status: 'completed',
      description: 'Monthly hosting earnings',
    },
    {
      id: '5',
      title: 'Pending Payment',
      amount: 100.00,
      type: 'debit',
      date: '2025-04-22',
      status: 'pending',
      description: 'Pending booking payment',
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedFilter === 'all') return true;
    return tx.type === selectedFilter;
  });

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionIcon}>
          <Text style={styles.transactionIconText}>
            {item.type === 'credit' ? '⬆️' : '⬇️'}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            {
              color: item.type === 'credit' ? '#10B981' : '#EF4444',
            },
          ]}
        >
          {item.type === 'credit' ? '+' : '-'} ₹{item.amount.toFixed(2)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'completed'
                  ? '#D1FAE5'
                  : item.status === 'pending'
                  ? '#FEF3C7'
                  : '#FEE2E2',
            },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              {
                color:
                  item.status === 'completed'
                    ? '#065F46'
                    : item.status === 'pending'
                    ? '#92400E'
                    : '#7F1D1D',
              },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'credit', 'debit'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'credit'
                  ? 'Income'
                  : 'Expenses'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
              +₹550.00
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
              -₹275.00
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        {filteredTransactions.map((item) => (
          <View key={item.id}>
            {renderTransaction({ item })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
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
  filterContainer: {
    flexDirection: 'row',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  filterTab: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterTabTextActive: {
    color: COLORS.surface,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    minWidth: 0,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  summaryAmount: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
  },
  transactionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  transactionIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  transactionIconText: {
    fontSize: moderateScale(20),
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  transactionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  transactionDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: moderateScale(11),
  },
  transactionRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    fontSize: moderateScale(11),
  },
});
