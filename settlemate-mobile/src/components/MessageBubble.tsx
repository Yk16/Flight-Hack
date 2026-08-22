import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';

export interface MessageActionItem {
  id: number;
  senderId: number;
  roomId?: string;
  senderName?: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
  replyToId?: number;
  replyToText?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface MessageBubbleProps {
  message: MessageActionItem;
  isMyMessage: boolean;
  onReply?: (msg: MessageActionItem) => void;
  onEdit?: (msg: MessageActionItem) => void;
  onDelete?: (msg: MessageActionItem) => void;
}

export const MessageBubble = ({
  message,
  isMyMessage,
  onReply,
  onEdit,
  onDelete,
}: MessageBubbleProps) => {
  const { width } = useWindowDimensions();
  const maxBubbleWidth = Math.min(width * 0.8, 480);
  const [showOptions, setShowOptions] = useState(false);

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, isMyMessage ? styles.myContainer : styles.theirContainer]}>
      <View style={[styles.bubbleWrapper, isMyMessage ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        
        {/* Reply Preview */}
        {message.replyToText && (
          <View style={[styles.replyPreview, isMyMessage ? styles.myReplyPreview : styles.theirReplyPreview]}>
            <View style={styles.replyBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.replyPreviewLabel}>Replying to</Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {message.replyToText}
              </Text>
            </View>
          </View>
        )}

        {/* Main Bubble */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowOptions((prev) => !prev)}
          style={[
            styles.bubble,
            isMyMessage ? styles.myBubble : styles.theirBubble,
            { maxWidth: maxBubbleWidth },
            message.isDeleted && styles.deletedBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myText : styles.theirText,
              message.isDeleted && styles.deletedText,
            ]}
          >
            {message.content}
          </Text>

          <View style={styles.footerRow}>
            {message.isEdited && !message.isDeleted && (
              <Text style={[styles.editedTag, isMyMessage ? styles.myEditedTag : styles.theirEditedTag]}>
                edited
              </Text>
            )}
            <Text style={[styles.timestamp, isMyMessage ? styles.myTimestamp : styles.theirTimestamp]}>
              {formattedTime}
            </Text>
            {isMyMessage && !message.isDeleted && (
              <Ionicons
                name={message.isRead ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={message.isRead ? '#60A5FA' : 'rgba(255,255,255,0.7)'}
                style={styles.statusIcon}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Message Quick Action Row (Reply / Edit / Delete) */}
        {showOptions && !message.isDeleted && (
          <View style={[styles.actionRow, isMyMessage ? styles.myActionRow : styles.theirActionRow]}>
            {onReply && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  setShowOptions(false);
                  onReply(message);
                }}
              >
                <Ionicons name="arrow-undo" size={14} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Reply</Text>
              </TouchableOpacity>
            )}

            {isMyMessage && onEdit && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  setShowOptions(false);
                  onEdit(message);
                }}
              >
                <Ionicons name="pencil" size={14} color="#10B981" />
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
            )}

            {isMyMessage && onDelete && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  setShowOptions(false);
                  onDelete(message);
                }}
              >
                <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  theirContainer: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '85%',
  },
  myBubbleWrapper: {
    alignItems: 'flex-end',
  },
  theirBubbleWrapper: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2,
  },
  deletedBubble: {
    backgroundColor: COLORS.background,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    ...TYPOGRAPHY.body1,
    fontSize: 15,
    lineHeight: 21,
  },
  myText: {
    color: COLORS.surface,
  },
  theirText: {
    color: COLORS.text,
  },
  deletedText: {
    fontStyle: 'italic',
    color: COLORS.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  theirTimestamp: {
    color: COLORS.textMuted,
  },
  statusIcon: {
    marginLeft: 2,
  },
  editedTag: {
    fontSize: 10,
    fontStyle: 'italic',
    marginRight: 2,
  },
  myEditedTag: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  theirEditedTag: {
    color: COLORS.textMuted,
  },
  replyPreview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    width: '100%',
  },
  myReplyPreview: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  theirReplyPreview: {
    backgroundColor: COLORS.background,
  },
  replyBar: {
    width: 2,
  },
  replyPreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  replyPreviewText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myActionRow: {
    alignSelf: 'flex-end',
  },
  theirActionRow: {
    alignSelf: 'flex-start',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
});
