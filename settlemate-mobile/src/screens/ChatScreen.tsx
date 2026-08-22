import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { MessageBubble, MessageActionItem } from '../components/MessageBubble';
import { getSocket } from '../utils/socketClient';
import apiClient from '../api/client';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';

export const ChatScreen = () => {
  const { user } = useAuthStore();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const roomId = route.params?.roomId || 'chat-general';
  const recipientName = route.params?.recipientName || route.params?.name || 'User';

  const [messages, setMessages] = useState<MessageActionItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);

  // Reply & Edit state
  const [replyingTo, setReplyingTo] = useState<MessageActionItem | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageActionItem | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load message history from backend REST endpoint
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/chat/${roomId}/messages`);
      const list = res.data?.data || res.data || [];
      setMessages(list);
    } catch (err) {
      console.warn('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Connect socket and listen for real-time events
  useEffect(() => {
    let mounted = true;

    fetchHistory();

    getSocket().then((socket) => {
      if (!mounted) return;
      socketRef.current = socket;

      // Join current room
      socket.emit('join_room', roomId);
      socket.emit('mark_read', { roomId });

      // Listen for incoming messages
      socket.on('receive_message', (msg: MessageActionItem) => {
        if (msg.roomId === roomId) {
          setMessages((prev) => {
            // Check if exact message id already exists
            const exactExists = prev.some((m) => m.id === msg.id);
            if (exactExists) return prev;

            // Check if this incoming message matches our own temporary optimistic message
            const tempIdx = prev.findIndex(
              (m) =>
                m.senderId === msg.senderId &&
                m.content === msg.content &&
                typeof m.id === 'number' &&
                m.id > 1000000000000 // Temporary Date.now() timestamp
            );

            if (tempIdx !== -1) {
              // Replace optimistic temp bubble with confirmed DB message
              const copy = [...prev];
              copy[tempIdx] = msg;
              return copy;
            }

            return [...prev, msg];
          });
          socket.emit('mark_read', { roomId });
        }
      });

      // Listen for edited messages
      socket.on('message_edited', (updated: MessageActionItem) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
        );
      });

      // Listen for deleted messages
      socket.on('message_deleted', (deleted: MessageActionItem) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === deleted.id ? { ...m, ...deleted } : m))
        );
      });

      // Listen for read receipts
      socket.on('messages_read', (data: { roomId: string; readBy: number }) => {
        if (data.roomId === roomId) {
          setMessages((prev) =>
            prev.map((m) => (m.senderId === Number(user?.id) ? { ...m, isRead: true } : m))
          );
        }
      });

      // Listen for typing indicator
      socket.on('user_typing', (data: { userId: number; userName: string; isTyping: boolean }) => {
        if (data.userId !== Number(user?.id)) {
          setOtherUserTyping(data.isTyping ? data.userName : null);
        }
      });
    });

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('leave_room', roomId);
        socketRef.current.off('receive_message');
        socketRef.current.off('message_edited');
        socketRef.current.off('message_deleted');
        socketRef.current.off('messages_read');
        socketRef.current.off('user_typing');
      }
    };
  }, [roomId, fetchHistory, user?.id]);

  // Handle typing debounce
  const handleInputChange = (text: string) => {
    setInputText(text);

    if (socketRef.current) {
      if (!isTyping) {
        setIsTyping(true);
        socketRef.current.emit('typing', {
          roomId,
          isTyping: true,
          userName: user?.name || 'User',
        });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketRef.current?.emit('typing', {
          roomId,
          isTyping: false,
          userName: user?.name || 'User',
        });
      }, 1500);
    }
  };

  // Send new message or submit edited message
  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (editingMessage) {
      // Edit message flow
      if (socketRef.current) {
        socketRef.current.emit('edit_message', {
          roomId,
          messageId: editingMessage.id,
          content: trimmed,
        });
      } else {
        await apiClient.put(`/chat/messages/${editingMessage.id}`, { content: trimmed });
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMessage.id ? { ...m, content: trimmed, isEdited: true } : m))
        );
      }
      setEditingMessage(null);
      setInputText('');
      return;
    }

    // Normal or Reply send flow
    const optimisticMessage: MessageActionItem = {
      id: Date.now(),
      senderId: Number(user?.id || 1),
      content: trimmed,
      createdAt: new Date().toISOString(),
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.content ? replyingTo.content.slice(0, 80) : undefined,
      isRead: false,
    };

    // Optimistically add to state right away
    setMessages((prev) => [...prev, optimisticMessage]);

    const payload = {
      roomId,
      content: trimmed,
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.content ? replyingTo.content.slice(0, 80) : undefined,
    };

    // Emit over socket if connected (which saves to DB and broadcasts to room)
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', payload);
    } else {
      // Fallback REST endpoint only if socket is disconnected
      try {
        apiClient.post('/chat/messages', payload).catch((err) => {
          console.error('[ChatScreen] Error saving message to database:', err);
        });
      } catch (e) {
        console.error('[ChatScreen] Exception saving message:', e);
      }
    }

    setInputText('');
    setReplyingTo(null);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
  };

  // Handle message deletion
  const handleDeleteMessage = (msg: MessageActionItem) => {
    const confirmDelete = async () => {
      if (socketRef.current) {
        socketRef.current.emit('delete_message', { roomId, messageId: msg.id });
      } else {
        await apiClient.delete(`/chat/messages/${msg.id}`);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, content: 'This message was deleted', isDeleted: true } : m))
        );
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this message?')) {
        confirmDelete();
      }
    } else {
      Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: confirmDelete, style: 'destructive' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              navigation.navigate('Chat', { screen: 'ChatInbox' });
            }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>{recipientName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: otherUserTyping ? '#10B981' : '#10B981' }]} />
              <Text style={styles.statusText}>
                {otherUserTyping ? `${otherUserTyping} is typing...` : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Start a Conversation</Text>
                <Text style={styles.emptySub}>Send a message to start chatting in real-time.</Text>
              </View>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMyMessage={msg.senderId === Number(user?.id)}
                  onReply={(m) => {
                    setReplyingTo(m);
                    setEditingMessage(null);
                  }}
                  onEdit={(m) => {
                    setEditingMessage(m);
                    setReplyingTo(null);
                    setInputText(m.content);
                  }}
                  onDelete={handleDeleteMessage}
                />
              ))
            )}
          </ScrollView>
        )}

        {/* Reply / Edit Banner */}
        {replyingTo && (
          <View style={styles.contextBanner}>
            <View style={styles.contextBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contextLabel}>Replying to message</Text>
              <Text style={styles.contextText} numberOfLines={1}>{replyingTo.content}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {editingMessage && (
          <View style={[styles.contextBanner, { borderLeftColor: '#10B981' }]}>
            <View style={[styles.contextBar, { backgroundColor: '#10B981' }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.contextLabel, { color: '#10B981' }]}>Editing message</Text>
              <Text style={styles.contextText} numberOfLines={1}>{editingMessage.content}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              setEditingMessage(null);
              setInputText('');
            }}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder={editingMessage ? 'Edit your message...' : 'Type a message...'}
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name={editingMessage ? 'checkmark' : 'send'}
              size={18}
              color={COLORS.surface}
            />
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  backBtn: {
    padding: 4,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: 60,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptySub: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  contextBar: {
    width: 0,
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  contextText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
