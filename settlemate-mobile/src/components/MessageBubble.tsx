import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { ChatMessage, MessageStatus } from '../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
}

const getStatusIcon = (status: MessageStatus) => {
  switch (status) {
    case 'SENDING':
      return 'time-outline';
    case 'SENT':
      return 'checkmark';
    case 'DELIVERED':
      return 'checkmark-done';
    case 'READ':
      return 'checkmark-done';
    default:
      return 'checkmark';
  }
};

export const MessageBubble = ({
  message,
  isMyMessage,
  showAvatar = false,
  showSenderName = false,
}: MessageBubbleProps) => {
  const { width } = useWindowDimensions();
  const maxBubbleWidth = width * 0.75;

  return (
    <View
      style={[
        styles.container,
        isMyMessage ? styles.myContainer : styles.theirContainer,
      ]}
    >
      {/* Avatar - for group chats */}
      {!isMyMessage && showAvatar && (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person-circle" size={32} color={COLORS.primary} />
        </View>
      )}

      <View style={[styles.bubbleWrapper, isMyMessage && styles.myBubbleWrapper]}>
        {/* Sender name - for group chats */}
        {!isMyMessage && showSenderName && (
          <Text style={styles.senderName}>{message.senderName || 'User'}</Text>
        )}

        {/* Main bubble */}
        <View
          style={[
            styles.bubble,
            isMyMessage ? styles.myBubble : styles.theirBubble,
            { maxWidth: maxBubbleWidth },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myText : styles.theirText,
            ]}
          >
            {message.content}
          </Text>
        </View>

        {/* Timestamp and status */}
        <View
          style={[
            styles.metadata,
            isMyMessage ? styles.myMetadata : styles.theirMetadata,
          ]}
        >
          <Text style={styles.timestamp}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          {isMyMessage && (
            <Ionicons
              name={getStatusIcon(message.status)}
              size={12}
              color={
                message.status === 'READ' ? COLORS.primary : COLORS.textMuted
              }
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  theirContainer: {
    justifyContent: 'flex-start',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  bubbleWrapper: {
    flex: 1,
    alignItems: 'flex-start',
  },
  myBubbleWrapper: {
    alignItems: 'flex-end',
  },
  senderName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  theirBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  messageText: {
    ...TYPOGRAPHY.body2,
    lineHeight: 20,
  },
  myText: {
    color: COLORS.surface,
  },
  theirText: {
    color: COLORS.text,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginHorizontal: SPACING.sm,
  },
  myMetadata: {
    justifyContent: 'flex-end',
  },
  theirMetadata: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  statusIcon: {
    marginLeft: SPACING.xs,
  },
});
