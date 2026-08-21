/**
 * Chat Types - Extended from existing Message interface
 * Maintains backward compatibility with socket implementation
 */

export type MessageType = 'TEXT' | 'IMAGE' | 'SETTLEMENT' | 'PAYMENT' | 'PROPERTY' | 'SERVICE' | 'DOCUMENT' | 'OFFER';
export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'SUPPORT';
export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';
export type SettlementStatus = 'PENDING' | 'CONFIRMED' | 'RESOLVED' | 'DISPUTED';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  receiverId?: string;
  roomId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
  // Settlement-specific fields
  settlementId?: string;
  paymentId?: string;
  propertyId?: string;
  serviceId?: string;
  documentUrls?: string[];
  offer?: OfferData;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  roomId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: ChatMessage;
  lastMessageAt: string;
  unreadCount: number;
  isPinned: boolean;
  status: ConversationStatus;
  type: 'DIRECT' | 'GROUP' | 'SUPPORT';
  isOnline?: boolean;
}

export interface OfferData {
  title: string;
  amount?: number;
  description?: string;
  expiresAt?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface DocumentData {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}
