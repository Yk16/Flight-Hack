import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { MessageBubble } from '../components/MessageBubble';
import { ChatMessage } from '../types/chat';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';
import { CHAT_CONVERSATIONS, CHAT_MESSAGES } from '../data/chatData';

type ChatThreadRouteParams = {
  ChatThread: {
    roomId: string;
  };
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const ChatScreen = () => {
  const { user } = useAuthStore();
  const route = useRoute<RouteProp<ChatThreadRouteParams, 'ChatThread'>>();
  const roomId = route.params?.roomId || CHAT_CONVERSATIONS[0].roomId;
  const conversation = CHAT_CONVERSATIONS.find((item) => item.roomId === roomId) || CHAT_CONVERSATIONS[0];
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES[roomId] || []);
  const [inputText, setInputText] = useState('');

  const conversationMeta = useMemo(
    () => ({
      name: conversation.participantName,
      role: conversation.type === 'SUPPORT' ? 'Support' : 'Property visitor',
      online: !!conversation.isOnline,
      badge: conversation.type === 'SUPPORT' ? 'Support' : 'Verified',
      initials: getInitials(conversation.participantName),
    }),
    [conversation]
  );

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      senderId: user?.id || 'me',
      senderName: user?.name || 'You',
      roomId,
      content: trimmedText,
      type: 'TEXT',
      status: 'SENDING',
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, newMessage]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, conversation.type === 'SUPPORT' && styles.supportAvatar]}>
              <Text style={styles.avatarText}>{conversationMeta.initials}</Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title} numberOfLines={1}>{conversationMeta.name}</Text>
              <View style={styles.subtitleRow}>
                <View style={styles.statusDot} />
                <Text style={styles.subtitle}>{conversationMeta.online ? 'Active now' : 'Offline'}</Text>
                <Text style={styles.subtitleBullet}>•</Text>
                <Text style={styles.subtitle}>{conversationMeta.role}</Text>
              </View>
            </View>
          </View>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.primary} />
            <Text style={styles.badgeText}>{conversationMeta.badge}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.threadScroll}
          contentContainerStyle={styles.threadContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>Today</Text>
          </View>

          <View style={styles.messagesWrap}>
            {messages.map((message) => {
              const isMyMessage = message.senderId === (user?.id || 'me');
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMyMessage={isMyMessage}
                  showAvatar={!isMyMessage}
                />
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.composerBar}>
          <View style={styles.composerInputWrap}>
            <TouchableOpacity style={styles.actionIcon} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={styles.composerInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message"
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
            <TouchableOpacity style={styles.actionIcon} hitSlop={8}>
              <Ionicons name="image-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color={COLORS.surface} />
          </TouchableOpacity>
        </View>

        <View style={styles.helperRow}>
          <Ionicons name="lock-closed-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.helperText}>
            Messages stay readable on all mobile sizes with fixed spacing, max bubble width, and a responsive input bar.
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  supportAvatar: {
    backgroundColor: COLORS.secondary,
  },
  avatarText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: moderateScale(15),
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.success,
    marginRight: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  subtitleBullet: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  threadScroll: {
    flex: 1,
  },
  threadContent: {
    paddingBottom: SPACING.md,
  },
  dateChip: {
    alignSelf: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dateChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  messagesWrap: {
    gap: SPACING.sm,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  composerInputWrap: {
    flex: 1,
    minHeight: verticalScale(54),
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  actionIcon: {
    width: moderateScale(26),
    height: moderateScale(26),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  composerInput: {
    flex: 1,
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
    minHeight: verticalScale(28),
    maxHeight: verticalScale(96),
  },
  sendButton: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.primaryLight,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  helperText: {
    ...TYPOGRAPHY.caption,
    flex: 1,
    color: COLORS.textMuted,
    lineHeight: moderateScale(18),
  },
});
