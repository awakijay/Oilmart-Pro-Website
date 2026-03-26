import { useEffect, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export function ChatWidget() {
  const {
    guestThreadId,
    isWidgetOpen,
    unreadForUser,
    toggleWidget,
    closeWidget,
    sendUserMessage,
    getMessagesForThread,
    markUserInboxRead,
  } = useChat();
  const [draft, setDraft] = useState('');
  const messages = getMessagesForThread(guestThreadId);

  useEffect(() => {
    if (isWidgetOpen) {
      markUserInboxRead(guestThreadId);
    }
  }, [guestThreadId, isWidgetOpen, markUserInboxRead]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    sendUserMessage(draft, { threadId: guestThreadId, source: 'guest' });
    setDraft('');
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
      {isWidgetOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:mb-4 sm:w-[min(22rem,calc(100vw-2rem))]">
          <div className="flex items-start justify-between gap-3 bg-gray-900 px-4 py-4 text-white sm:px-5">
            <div>
              <div className="font-semibold">Support Chat</div>
              <div className="text-xs text-gray-300">Sales, lease, and buy-for-me assistance</div>
            </div>
            <button onClick={closeWidget} className="rounded-full p-1 hover:bg-gray-800 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[55vh] space-y-3 overflow-y-auto bg-gray-50 p-3 sm:max-h-80 sm:p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.sender === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'border border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`mt-1 text-[11px] ${message.sender === 'user' ? 'text-orange-100' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about sells, lease, or buy-for-me..."
                className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={toggleWidget}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl transition hover:bg-orange-600 sm:h-14 sm:w-14"
        aria-label="Open support chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadForUser > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-semibold">
            {unreadForUser}
          </span>
        )}
      </button>
    </div>
  );
}
