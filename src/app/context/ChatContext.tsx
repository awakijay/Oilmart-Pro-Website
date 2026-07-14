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
      const parsedMessages: ChatMessage[] = savedMessages ? JSON.parse(savedMessages) : [];
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
          await apiRequest<ChatMessage>('/chat/messages', {
            method: 'POST',
            body: message,
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

  const ensureThread = (options?: SendUserMessageOptions) => {
    if (options?.threadId) {
      return threads.find((thread) => thread.id === options.threadId) ?? guestThread;
    }

    if (options?.userEmail && options?.userName) {
      const threadId = getAccountThreadId(options.userEmail);
      const existingThread = threads.find((thread) => thread.id === threadId);

      if (existingThread) {
        return existingThread;
      }

      const nextThread: ChatThread = {
        id: threadId,
        label: options.userName,
        source: options.source ?? 'account',
        userEmail: options.userEmail,
        userName: options.userName,
      };

      setThreads((prev) => [nextThread, ...prev.filter((thread) => thread.id !== threadId)]);
      void apiRequest<ChatThread>('/chat/threads', {
        method: 'POST',
        body: nextThread,
        auth: true,
        token: getStoredAuthToken(),
      });
      return nextThread;
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
    });
    setUnreadForAdminByThread((prev) => ({ ...prev, [thread.id]: (prev[thread.id] ?? 0) + 1 }));
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

    const nextThread: ChatThread = {
      id: threadId,
      label: userName,
      source: 'account',
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
