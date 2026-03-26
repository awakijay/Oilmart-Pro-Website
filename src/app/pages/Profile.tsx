import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { User, Package, MessageSquare, Settings, Send, Clock, CheckCircle, Truck, Camera } from 'lucide-react';
import { formatNaira } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useAppData } from '../context/AppDataContext';

export function Profile() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { sendUserMessage, getMessagesForThread, getOrCreateAccountThread, markUserInboxRead } = useChat();
  const { orders: allOrders } = useAppData();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'chat' | 'settings'>('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    avatar: '',
    password: '',
  });
  useEffect(() => {
    if (!user) return;
    setSettingsForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      company: user.company,
      avatar: user.avatar ?? '',
      password: user.password,
    });
  }, [user]);

  const displayName = useMemo(() => user ? `${user.firstName} ${user.lastName}` : '', [user]);
  const profileThread = user ? getOrCreateAccountThread(user.email, displayName) : null;
  const messages = profileThread ? getMessagesForThread(profileThread.id) : [];
  const orders = useMemo(() => {
    if (!user) return [];

    return allOrders
      .filter((order) => order.email.toLowerCase() === user.email.toLowerCase())
      .map((order) => ({
        id: order.id,
        date: order.date,
        status: order.status,
        total: order.amount,
        items: order.product.split(',').filter(Boolean).length,
        product: order.product,
        operationType: order.operationType,
      }));
  }, [allOrders, user]);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const activeRentals = orders.filter((order) => order.operationType.includes('LEASE') && !['Completed', 'Cancelled', 'Rejected'].includes(order.status)).length;
  const completedOrders = orders.filter((order) => ['Completed', 'Accepted', 'Approved'].includes(order.status)).length;

  useEffect(() => {
    if (activeTab === 'chat' && profileThread) {
      markUserInboxRead(profileThread.id);
    }
  }, [activeTab, markUserInboxRead, profileThread]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !profileThread || !user) return;
    sendUserMessage(chatMessage, {
      threadId: profileThread.id,
      userEmail: user.email,
      userName: displayName,
      source: 'account',
    });
    setChatMessage('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = typeof reader.result === 'string' ? reader.result : '';
      setSettingsForm((prev) => ({ ...prev, avatar }));
      updateProfile({ avatar });
    };
    reader.readAsDataURL(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
      case 'Accepted':
        return 'text-green-600 bg-green-50';
      case 'In Transit':
      case 'Approved':
        return 'text-blue-600 bg-blue-50';
      case 'Processing':
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'Rejected':
      case 'Cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Transit':
      case 'Approved':
        return <Truck className="w-4 h-4" />;
      case 'Processing':
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <User className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign in to view your profile</h1>
          <p className="mt-3 text-gray-600">
            Create an account or sign in to manage your details, update your profile picture, and access your customer profile.
          </p>
          <Link to="/auth" className="mt-8 inline-flex rounded-2xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:bg-orange-600">
            Go to Auth Screen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col items-center mb-6">
                {user.avatar ? (
                  <img src={user.avatar} alt={displayName} className="mb-4 h-24 w-24 rounded-full border-4 border-orange-100 object-cover" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900">{displayName}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1 lg:space-y-2">
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'overview' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <User className="w-5 h-5" />
                  <span className="truncate">Overview</span>
                </button>
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'orders' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Package className="w-5 h-5" />
                  <span className="truncate">My Orders</span>
                </button>
                <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'chat' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <MessageSquare className="w-5 h-5" />
                  <span className="truncate">Chat with Admin</span>
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Settings className="w-5 h-5" />
                  <span className="truncate">Settings</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
                  <div className="mb-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                    <div className="bg-orange-50 rounded-lg p-6">
                      <Package className="w-8 h-8 text-orange-500 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <Truck className="w-8 h-8 text-blue-500 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
                      <p className="text-3xl font-bold text-gray-900">{activeRentals}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">{completedOrders}</p>
                    </div>
                  </div>

                  <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Profile Summary</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div><p className="text-xs text-gray-500">Full Name</p><p className="font-semibold text-gray-900">{displayName}</p></div>
                      <div><p className="text-xs text-gray-500">Email</p><p className="font-semibold text-gray-900">{user.email}</p></div>
                      <div><p className="text-xs text-gray-500">Phone</p><p className="font-semibold text-gray-900">{user.phone}</p></div>
                      <div><p className="text-xs text-gray-500">Company</p><p className="font-semibold text-gray-900">{user.company}</p></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center">
                          <div className={`p-3 rounded-lg ${getStatusColor(order.status)}`}>{getStatusIcon(order.status)}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-gray-900">{order.total}</p>
                            <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>{order.status}</p>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                          No orders yet. Your future checkout orders will appear here automatically.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-lg font-bold text-gray-900 mb-1">{order.id}</p>
                            <p className="text-sm text-gray-500">Placed on {order.date}</p>
                          </div>
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{order.items} item(s)</p>
                            <p className="text-sm text-gray-600">{order.operationType}</p>
                            <p className="text-lg font-bold text-gray-900">{order.total}</p>
                          </div>
                          <button onClick={() => setSelectedOrderId(order.id)} className="px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition w-full sm:w-auto">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
                        You do not have any orders yet. Once you complete checkout, your orders will show here.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat with Admin</h2>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${message.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type your message..." className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                        <button type="submit" className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 sm:justify-start">
                          <Send className="w-5 h-5" />
                          Send
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800"><strong>Note:</strong> Replies from the admin team will appear in this conversation thread.</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <form className="space-y-6" onSubmit={handleSaveSettings}>
                    {settingsSaved && (
                      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                        Your account settings were saved successfully.
                      </div>
                    )}

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        {settingsForm.avatar ? (
                          <img src={settingsForm.avatar} alt={displayName} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm" />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                            <User className="h-10 w-10" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Profile Picture</h3>
                          <p className="text-sm text-gray-600">Upload a photo and it will appear on your profile and in the website header profile tab.</p>
                          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm">
                            <Camera className="h-4 w-4 text-orange-500" />
                            Upload New Photo
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
                        <input type="text" value={settingsForm.firstName} onChange={(e) => setSettingsForm({ ...settingsForm, firstName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
                        <input type="text" value={settingsForm.lastName} onChange={(e) => setSettingsForm({ ...settingsForm, lastName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                      <input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                      <input type="tel" value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Company</label>
                      <input type="text" value={settingsForm.company} onChange={(e) => setSettingsForm({ ...settingsForm, company: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                      <input type="password" value={settingsForm.password} onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                    </div>

                    <button type="submit" className="w-full rounded-lg bg-orange-500 px-8 py-4 text-white transition hover:bg-orange-600 sm:w-auto">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.id}</h2>
                <p className="text-gray-600">Placed on {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrderId(null)} className="text-gray-500 hover:text-gray-700 transition">Close</button>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>Operation Type</span><span className="font-semibold text-gray-900 sm:text-right">{selectedOrder.operationType}</span></div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>Items</span><span className="font-semibold text-gray-900">{selectedOrder.items}</span></div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><span>Products</span><span className="font-semibold text-gray-900 sm:max-w-[60%] sm:text-right">{selectedOrder.product}</span></div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>Total</span><span className="font-semibold text-gray-900">{selectedOrder.total}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
