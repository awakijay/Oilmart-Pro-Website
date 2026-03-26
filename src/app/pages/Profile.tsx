import { useState } from 'react';
import { User, Package, MessageSquare, Settings, Send, Clock, CheckCircle, Truck } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
}

export function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'chat' | 'settings'>('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: 'I need information about the Cameron BOP Stack System rental terms.',
      sender: 'user',
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: '3',
      text: 'Of course! Our rental terms are flexible. We offer daily, weekly, and monthly rates. Would you like a custom quote?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 2400000),
    },
  ]);

  const orders = [
    {
      id: 'OMP-789456',
      date: '2026-03-20',
      status: 'Delivered',
      total: '$125,000',
      items: 2,
    },
    {
      id: 'OMP-789123',
      date: '2026-03-15',
      status: 'In Transit',
      total: '$45,000',
      items: 1,
    },
    {
      id: 'OMP-788901',
      date: '2026-03-10',
      status: 'Processing',
      total: '$95,000',
      items: 3,
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setChatMessage('');

    // Simulate admin response
    setTimeout(() => {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. Our team will review this and get back to you shortly!',
        sender: 'admin',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, adminResponse]);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-50';
      case 'In Transit':
        return 'text-blue-600 bg-blue-50';
      case 'Processing':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Transit':
        return <Truck className="w-4 h-4" />;
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">John Doe</h3>
                <p className="text-sm text-gray-500">john.doe@company.com</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'overview'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'orders'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'chat'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat with Admin</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'settings'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-orange-50 rounded-lg p-6">
                      <Package className="w-8 h-8 text-orange-500 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900">24</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <Truck className="w-8 h-8 text-blue-500 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
                      <p className="text-3xl font-bold text-gray-900">5</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">19</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className={`p-3 rounded-lg ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{order.total}</p>
                            <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </p>
                          </div>
                        </div>
                      ))}
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
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-lg font-bold text-gray-900 mb-1">{order.id}</p>
                            <p className="text-sm text-gray-500">Placed on {order.date}</p>
                          </div>
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">{order.items} item(s)</p>
                            <p className="text-lg font-bold text-gray-900">{order.total}</p>
                          </div>
                          <button className="px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat with Admin</h2>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Chat Messages */}
                    <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="submit"
                          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                        >
                          <Send className="w-5 h-5" />
                          Send
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Our support team typically responds within 2-4 hours during business hours (9 AM - 6 PM EST).
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue="John"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue="Doe"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="john.doe@company.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Company</label>
                      <input
                        type="text"
                        defaultValue="ABC Energy Solutions"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
