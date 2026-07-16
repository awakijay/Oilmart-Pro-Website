import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, getStoredAuthToken } from '../utils/api';
import { getStoredAdminToken } from '../utils/adminAuth';

export interface ChatThread {
  id: string;
  label: string;
  source: 'guest' | 'account';
  userEmail?: string;
  userName?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
}

type StoredChatMessage = Omit<ChatMessage, 'sender'> & {
  sender: ChatMessage['sender'] | 'bot';
};

interface OrderTrackingInfo {
  id: string;
  status: string;
  date: string;
  product: string;
  operationType: string;
  trackingLocation: string;
  trackingUpdate: string;
  estimatedDelivery: string;
  trackingUpdatedAt: string;
}

interface SendUserMessageOptions {
  threadId?: string;
  userEmail?: string;
  userName?: string;
  source?: 'guest' | 'account';
}

interface ChatContextType {
  threads: ChatThread[];
  messages: ChatMessage[];
  isWidgetOpen: boolean;
  unreadForAdmin: number;
  unreadForUser: number;
  guestThreadId: string;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  sendUserMessage: (text: string, options?: SendUserMessageOptions) => void;
  sendAdminMessage: (text: string, threadId: string) => void;
  getMessagesForThread: (threadId: string) => ChatMessage[];
  getOrCreateAccountThread: (userEmail: string, userName: string) => ChatThread;
  markUserInboxRead: (threadId?: string) => void;
  markAdminInboxRead: (threadId?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_THREADS_KEY = 'oilmartpro_chat_threads';
const CHAT_MESSAGES_KEY = 'oilmartpro_chat_messages';
const CHAT_UNREAD_USER_KEY = 'oilmartpro_chat_unread_user';
const CHAT_UNREAD_ADMIN_KEY = 'oilmartpro_chat_unread_admin';

const guestThread: ChatThread = {
  id: 'guest-support',
  label: 'Website Support Inbox',
  source: 'guest',
};

const starterMessages: ChatMessage[] = [];

function getAccountThreadId(userEmail: string) {
  return `account:${userEmail.toLowerCase()}`;
}

function extractOrderId(text: string) {
  return text.match(/\b(?:ORD|OMP)-[A-Z0-9-]+\b/i)?.[0].toUpperCase() ?? null;
}

function formatTrackingTime(value: string) {
  if (!value) return 'Not updated yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatTrackingReply(tracking: OrderTrackingInfo) {
  return [
    `Order ${tracking.id} is currently ${tracking.status}.`,
    `Location: ${tracking.trackingLocation || 'Awaiting admin location update'}.`,
    `Update: ${tracking.trackingUpdate || 'No tracking note has been added yet.'}`,
    `Estimated delivery: ${tracking.estimatedDelivery || 'Pending admin confirmation'}.`,
    `Last updated: ${formatTrackingTime(tracking.trackingUpdatedAt)}.`,
  ].join('\n');
}

function getWebsiteHelpReply(text: string) {
  const lower = text.toLowerCase();

  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(lower)) {
    return 'Hello. I can help with products, sells, lease, buy-for-me requests, checkout, quotes, accounts, blog posts, contact details, and order tracking. Send your order number like ORD-1234567890 to track an order.';
  }

  if (lower.includes('track') || lower.includes('order number') || lower.includes('where is my order') || lower.includes('delivery')) {
    return 'To track an order, send the order number exactly as shown after checkout, for example: ORD-1234567890. I will check the current status, location, latest update, and estimated delivery.';
  }

  if (lower.includes('lease') || lower.includes('rent') || lower.includes('rental')) {
    return 'For LEASE requests, open a product, choose the lease option, add it to cart, and submit checkout. The admin team can review availability, duration, mobilization, and rental terms from your order details.';
  }

  if (lower.includes('buy for me') || lower.includes('procure') || lower.includes('procurement')) {
    return 'For BUY FOR ME, choose the buy-for-me option on a product and complete checkout. Oilmart Pro will review the request, confirm specifications, and follow up with sourcing or procurement details.';
  }

  if (lower.includes('sell') || lower.includes('sales') || lower.includes('buy equipment') || lower.includes('purchase')) {
    return 'For SELLS, browse Products, open the equipment you need, choose the sells option, add it to cart, and complete checkout. Your order will appear in your profile and in the admin order panel.';
  }

  if (lower.includes('quote') || lower.includes('pricing') || lower.includes('price')) {
    return 'You can request pricing from the Contact page or by checking out with the selected equipment. Quotes and order requests are reviewed by the admin team before final approval.';
  }

  if (lower.includes('account') || lower.includes('profile') || lower.includes('login') || lower.includes('sign in')) {
    return 'Create or sign in to an account to place orders, view your profile, see order history, and keep a dedicated chat thread with the admin team.';
  }

  if (lower.includes('payment') || lower.includes('checkout') || lower.includes('cart')) {
    return 'Add products to cart, choose your operation type, then complete checkout from the cart page. Checkout supports card, wire transfer, and purchase order options in the current flow.';
  }

  if (lower.includes('blog') || lower.includes('article') || lower.includes('news')) {
    return 'Published blog posts appear on the homepage and blog pages. Draft posts stay hidden until an admin publishes them.';
  }

  if (lower.includes('contact') || lower.includes('support') || lower.includes('phone') || lower.includes('email')) {
    return 'You can use this chat or the Contact page for support, sales, quote, leasing, or procurement questions. The admin team can also reply here when they are available.';
  }

  return 'I can help with Oilmart Pro products, sells, lease, buy-for-me, checkout, quotes, accounts, blog posts, contact, and order tracking. For tracking, send your order number like ORD-1234567890. An admin can still reply here when they are available.';
}

async function buildAutomatedReply(text: string) {
  const orderId = extractOrderId(text);

  if (orderId) {
    try {
      const tracking = await apiRequest<OrderTrackingInfo>(`/order-tracking/${encodeURIComponent(orderId)}`);
      return formatTrackingReply(tracking);
    } catch {
      return `I could not find tracking details for ${orderId}. Please check the order number from checkout or your profile order history.`;
    }
  }

  return getWebsiteHelpReply(text);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([guestThread]);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [unreadForAdminByThread, setUnreadForAdminByThread] = useState<Record<string, number>>({});
  const [unreadForUserByThread, setUnreadForUserByThread] = useState<Record<string, number>>({});

  useEffect(() => {
    let isActive = true;

    const migrateLegacyChat = async () => {
      const savedThreads = localStorage.getItem(CHAT_THREADS_KEY);
      const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
      const parsedThreads: ChatThread[] = savedThreads ? JSON.parse(savedThreads) : [];
      const parsedMessages: StoredChatMessage[] = savedMessages ? JSON.parse(savedMessages) : [];
      const adminToken = getStoredAdminToken();
      const customerToken = getStoredAuthToken();

      for (const thread of parsedThreads) {
        try {
          await apiRequest<ChatThread>('/chat/threads', {
            method: 'POST',
            body: thread,
            ...(thread.id === guestThread.id
              ? {}
              : adminToken
                ? { auth: true, token: adminToken }
                : customerToken
                  ? { auth: true, token: customerToken }
                  : {}),
          });
        } catch {
          // Ignore duplicates during migration.
        }
      }

      for (const message of parsedMessages.filter((item) => item.id !== 'welcome-1')) {
        try {
          const sender = message.sender === 'bot' ? 'admin' : message.sender;
          await apiRequest<ChatMessage>('/chat/messages', {
            method: 'POST',
            body: { ...message, sender, suppressAutomatedReply: true },
            ...(message.threadId === guestThread.id
              ? {}
              : adminToken
                ? { auth: true, token: adminToken }
                : customerToken
                  ? { auth: true, token: customerToken }
                  : {}),
          });
        } catch {
          // Ignore duplicates during migration.
        }
      }
    };

    const hydrate = async () => {
      try {
        await migrateLegacyChat();
        const adminToken = getStoredAdminToken();
        const customerToken = getStoredAuthToken();
        const authOptions = adminToken
          ? { auth: true as const, token: adminToken }
          : customerToken
            ? { auth: true as const, token: customerToken }
            : undefined;
        const fetchedThreads = await apiRequest<ChatThread[]>('/chat/threads', authOptions);
        const messageGroups = await Promise.all(
          fetchedThreads.map((thread) =>
            apiRequest<ChatMessage[]>(`/chat/messages?threadId=${encodeURIComponent(thread.id)}`, authOptions)
          )
        );
        const fetchedMessages = messageGroups.flat();

        if (!isActive) return;

        setThreads(
          fetchedThreads.some((thread) => thread.id === guestThread.id)
            ? fetchedThreads
            : [guestThread, ...fetchedThreads],
        );
        setMessages(fetchedMessages.filter((message) => message.id !== 'welcome-1'));
      } catch {
        if (!isActive) return;
        setThreads([guestThread]);
        setMessages([]);
      } finally {
        const savedUnreadUser = localStorage.getItem(CHAT_UNREAD_USER_KEY);
        const savedUnreadAdmin = localStorage.getItem(CHAT_UNREAD_ADMIN_KEY);

        if (savedUnreadUser) {
          setUnreadForUserByThread(JSON.parse(savedUnreadUser));
        }
        if (savedUnreadAdmin) {
          setUnreadForAdminByThread(JSON.parse(savedUnreadAdmin));
        }

        localStorage.removeItem(CHAT_THREADS_KEY);
        localStorage.removeItem(CHAT_MESSAGES_KEY);
      }
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_UNREAD_USER_KEY, JSON.stringify(unreadForUserByThread));
  }, [unreadForUserByThread]);

  useEffect(() => {
    localStorage.setItem(CHAT_UNREAD_ADMIN_KEY, JSON.stringify(unreadForAdminByThread));
  }, [unreadForAdminByThread]);

  const createAccountThread = (userEmail: string, userName: string, source: 'guest' | 'account' = 'account') => {
    const threadId = getAccountThreadId(userEmail);
    const nextThread: ChatThread = {
      id: threadId,
      label: userName,
      source,
      userEmail,
      userName,
    };

    setThreads((prev) => [nextThread, ...prev.filter((thread) => thread.id !== threadId)]);
    void apiRequest<ChatThread>('/chat/threads', {
      method: 'POST',
      body: nextThread,
      auth: true,
      token: getStoredAuthToken(),
    });

    return nextThread;
  };

  const ensureThread = (options?: SendUserMessageOptions) => {
    if (options?.threadId) {
      const existingThread = threads.find((thread) => thread.id === options.threadId);

      if (existingThread) {
        return existingThread;
      }

      if (options.threadId === guestThread.id) {
        return guestThread;
      }

      if (options.userEmail && options.userName && options.threadId === getAccountThreadId(options.userEmail)) {
        return createAccountThread(options.userEmail, options.userName, options.source ?? 'account');
      }

      return guestThread;
    }

    if (options?.userEmail && options?.userName) {
      const threadId = getAccountThreadId(options.userEmail);
      const existingThread = threads.find((thread) => thread.id === threadId);

      if (existingThread) {
        return existingThread;
      }

      return createAccountThread(options.userEmail, options.userName, options.source ?? 'account');
    }

    return guestThread;
  };

  const sendUserMessage = (text: string, options?: SendUserMessageOptions) => {
    const normalizedText = text.trim();
    if (!normalizedText) return;

    const thread = ensureThread(options);
    const nextMessage = {
      id: `${Date.now()}-user`,
      threadId: thread.id,
      sender: 'user' as const,
      text: normalizedText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, nextMessage]);
    void apiRequest<ChatMessage>('/chat/messages', {
      method: 'POST',
      body: nextMessage,
      ...(thread.id === guestThread.id ? {} : { auth: true, token: getStoredAuthToken() }),
    }).catch(() => undefined);
    setUnreadForAdminByThread((prev) => ({ ...prev, [thread.id]: (prev[thread.id] ?? 0) + 1 }));

    void sendAutomatedReply(thread.id, normalizedText);
  };

  const sendAutomatedReply = async (threadId: string, userText: string) => {
    const replyText = await buildAutomatedReply(userText);
    const nextMessage = {
      id: `${Date.now()}-support-${Math.random().toString(36).slice(2, 8)}`,
      threadId,
      sender: 'admin' as const,
      text: replyText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, nextMessage]);
    setUnreadForUserByThread((prev) => ({ ...prev, [threadId]: (prev[threadId] ?? 0) + 1 }));
  };

  const sendAdminMessage = (text: string, threadId: string) => {
    const normalizedText = text.trim();
    if (!normalizedText) return;

    const nextMessage = {
      id: `${Date.now()}-admin`,
      threadId,
      sender: 'admin' as const,
      text: normalizedText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, nextMessage]);
    void apiRequest<ChatMessage>('/chat/messages', {
      method: 'POST',
      body: nextMessage,
      auth: true,
      token: getStoredAdminToken(),
    });
    setUnreadForUserByThread((prev) => ({ ...prev, [threadId]: (prev[threadId] ?? 0) + 1 }));
  };

  const getMessagesForThread = (threadId: string) => messages.filter((message) => message.threadId === threadId);

  const getOrCreateAccountThread = (userEmail: string, userName: string) => {
    const threadId = getAccountThreadId(userEmail);
    const existingThread = threads.find((thread) => thread.id === threadId);
    if (existingThread) return existingThread;

    return createAccountThread(userEmail, userName);
  };

  const unreadForAdmin = Object.values(unreadForAdminByThread).reduce((sum, count) => sum + count, 0);
  const unreadForUser = Object.values(unreadForUserByThread).reduce((sum, count) => sum + count, 0);

  const value = useMemo(
    () => ({
      threads,
      messages,
      isWidgetOpen,
      unreadForAdmin,
      unreadForUser,
      guestThreadId: guestThread.id,
      openWidget: () => setIsWidgetOpen(true),
      closeWidget: () => setIsWidgetOpen(false),
      toggleWidget: () => setIsWidgetOpen((prev) => !prev),
      sendUserMessage,
      sendAdminMessage,
      getMessagesForThread,
      getOrCreateAccountThread,
      markUserInboxRead: (threadId?: string) =>
        setUnreadForUserByThread((prev) => {
          if (!threadId) return {};
          return { ...prev, [threadId]: 0 };
        }),
      markAdminInboxRead: (threadId?: string) =>
        setUnreadForAdminByThread((prev) => {
          if (!threadId) return {};
          return { ...prev, [threadId]: 0 };
        }),
    }),
    [isWidgetOpen, messages, threads, unreadForAdmin, unreadForUser],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
