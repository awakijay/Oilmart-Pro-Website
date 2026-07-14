import { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function AdminChats() {
  const { threads, sendAdminMessage, getMessagesForThread, markAdminInboxRead, guestThreadId } = useChat();
  const [draft, setDraft] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState(guestThreadId);
  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];
  const messages = selectedThread ? getMessagesForThread(selectedThread.id) : [];
  const adminHasJoined = messages.some((message) => message.sender === 'admin');

  useEffect(() => {
    if (selectedThreadId) {
      markAdminInboxRead(selectedThreadId);
    }
  }, [markAdminInboxRead, selectedThreadId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !selectedThread) return;
    sendAdminMessage(draft, selectedThread.id);
    setDraft('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Chats</h1>
        <p className="text-gray-600">Respond to support, sales, leasing, and buy-for-me requests.</p>
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
        <div className="border-b border-gray-200 bg-gray-50 lg:border-b-0 lg:border-r">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3">
                <MessageCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Customer Conversations</div>
                <div className="text-sm text-gray-500">Select a registered user or the website support inbox.</div>
              </div>
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto p-3 sm:max-h-[38rem]">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`mb-2 w-full rounded-2xl border px-4 py-4 text-left transition ${
                  selectedThreadId === thread.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-transparent bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{thread.label}</div>
                    <div className="text-xs text-gray-500">
                      {thread.source === 'account' ? thread.userEmail : 'Guest website support chat'}
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    thread.source === 'account' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {thread.source === 'account' ? 'Registered' : 'Guest'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold text-gray-900">{selectedThread?.label ?? 'Conversation'}</div>
                <div className="text-sm text-gray-500">
                  {selectedThread?.source === 'account'
                    ? `Replying to ${selectedThread.userEmail}`
                    : 'Shared live thread from the storefront chat FAB'}
                </div>
              </div>
              {selectedThread && (
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  adminHasJoined ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {adminHasJoined ? 'Admin joined' : 'Bot active'}
                </span>
              )}
            </div>
          </div>

          <div className="max-h-[50vh] space-y-4 overflow-y-auto bg-gray-50 p-4 sm:max-h-[28rem] sm:p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-2xl ${
                    message.sender === 'admin'
                      ? 'bg-gray-900 text-white'
                      : message.sender === 'bot'
                        ? 'border border-blue-100 bg-blue-50 text-blue-950'
                        : 'border border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                    {message.sender === 'admin' ? 'Admin Reply' : message.sender === 'bot' ? 'Oilmart Assistant' : 'Customer'}
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                  <p className={`mt-2 text-[11px] ${message.sender === 'admin' ? 'text-gray-300' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Reply to the customer..."
                className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-white hover:bg-orange-600 transition"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
