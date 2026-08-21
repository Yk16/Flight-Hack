import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale } from '../utils/responsive';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a listing?',
      answer:
        'To create a listing, navigate to "My Listings" tab and click the "+" button. Fill in all the required details about your property and submit. Your listing will be reviewed and published within 24 hours.',
    },
    {
      id: '2',
      question: 'How do I change my password?',
      answer:
        'Go to your Profile, select "Edit Profile", scroll down to "Change Password" section, enter your current and new password, and click "Change Password".',
    },
    {
      id: '3',
      question: 'How do I contact a property owner?',
      answer:
        'Go to the property listing, click on the owner\'s name, and use the "Message" button to start a conversation. You can also call them directly if their phone number is visible.',
    },
    {
      id: '4',
      question: 'How do I view my transaction history?',
      answer:
        'Go to your Profile, select "Transaction History" to view all your payments, refunds, and earnings. You can filter by income or expenses.',
    },
    {
      id: '5',
      question: 'How do I become a host/provider?',
      answer:
        'Click on "Become Host/Provider" from your Profile. Complete the verification process by providing necessary documents and information. Once verified, you can start listing your properties.',
    },
  ];

  const supportOptions = [
    {
      id: 'email',
      label: 'Email Support',
      icon: '📧',
      description: 'support@settlemate.com',
      action: () => Alert.alert('Email Support', 'You can reach us at support@settlemate.com'),
    },
    {
      id: 'phone',
      label: 'Call Us',
      icon: '📞',
      description: '+1-800-SETTLE-1',
      action: () => Alert.alert('Call Support', 'You can reach us at +1-800-SETTLE-1'),
    },
    {
      id: 'chat',
      label: 'Live Chat',
      icon: '💬',
      description: 'Available 24/7',
      action: () => Alert.alert('Live Chat', 'Connecting you to the next available agent...'),
    },
  ];

  const handleSubmitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Validation Error', 'Please fill in both subject and message');
      return;
    }
    Alert.alert(
      'Success',
      'Support ticket submitted successfully! We will get back to you soon.'
    );
    setSubject('');
    setMessage('');
  };

  const renderFAQItem = (item: FAQItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.faqCard}
      onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion} numberOfLines={expandedFAQ === item.id ? 0 : 2}>
          {item.question}
        </Text>
        <Ionicons
          name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.primary}
        />
      </View>
      {expandedFAQ === item.id && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Support Options */}
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <View style={styles.supportGrid}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.supportCard}
              onPress={option.action}
              activeOpacity={0.8}
            >
              <Text style={styles.supportIcon}>{option.icon}</Text>
              <Text style={styles.supportLabel}>{option.label}</Text>
              <Text style={styles.supportDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Ticket Section */}
        <Text style={styles.sectionTitle}>Submit Support Ticket</Text>
        <View style={styles.ticketForm}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter issue subject"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Describe your issue in detail..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              placeholderTextColor={COLORS.textMuted}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitTicket}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {faqs.map((item) => renderFAQItem(item))}
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesTitle}>Additional Resources</Text>
          <TouchableOpacity style={styles.resourceLink}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
            <Text style={styles.resourceLinkText}>User Guide & Documentation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceLink}>
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
            <Text style={styles.resourceLinkText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceLink}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
            <Text style={styles.resourceLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
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
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  supportGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  supportCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  supportIcon: {
    fontSize: moderateScale(32),
    marginBottom: SPACING.md,
  },
  supportLabel: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  supportDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: moderateScale(11),
  },
  ticketForm: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    fontSize: moderateScale(16),
  },
  messageInput: {
    minHeight: moderateScale(120),
    paddingTop: SPACING.md,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.surface,
  },
  faqContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  faqQuestion: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  faqAnswer: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    lineHeight: moderateScale(22),
  },
  resourcesContainer: {
    marginBottom: SPACING.xl,
  },
  resourcesTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    marginTop: SPACING.lg,
  },
  resourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.primary}10`,
    marginBottom: SPACING.sm,
  },
  resourceLinkText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
  },
});

