import { DollarSign, Package, ShoppingBag, TrendingUp, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useAppData } from '../../context/AppDataContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { formatCompactNaira, parseCurrencyValue } from '../../utils/currency';

export function AdminOverview() {
  const { unreadForAdmin } = useChat();
  const { users } = useAuth();
  const { products, orders, quoteRequests } = useAppData();
  const totalRevenue = orders.reduce((sum, order) => sum + parseCurrencyValue(order.amount), 0);
  const approvedOrders = orders.filter((order) => ['Approved', 'Accepted', 'Completed'].includes(order.status)).length;
  const conversionRate = quoteRequests.length > 0 ? `${Math.round((approvedOrders / quoteRequests.length) * 100)}%` : '0%';
  const stats = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: formatCompactNaira(totalRevenue),
      change: orders.length > 0 ? `${orders.length} live orders` : 'No orders yet',
      positive: true,
    },
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: orders.length.toString(),
      change: orders.length > 0 ? `${approvedOrders} approved` : 'Awaiting first order',
      positive: true,
    },
    {
      icon: Package,
      label: 'Total Products',
      value: products.length.toString(),
      change: products.length > 0 ? 'Catalog active' : 'No products yet',
      positive: true,
    },
    {
      icon: Users,
      label: 'Registered Users',
      value: users.length.toString(),
      change: users.length > 0 ? 'Customer accounts live' : 'No customer accounts yet',
      positive: true,
    },
    {
      icon: MessageCircle,
      label: 'Quotes & Chats',
      value: (quoteRequests.length + unreadForAdmin).toString(),
      change: quoteRequests.length > 0 ? `${quoteRequests.length} open quotes` : 'Inbox clear',
      positive: quoteRequests.length === 0,
    },
    {
      icon: TrendingUp,
      label: 'Conversion Rate',
      value: conversionRate,
      change: quoteRequests.length > 0 ? `${quoteRequests.length} quote requests` : 'No quote requests',
      positive: true,
    },
  ];

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-h-[176px] flex-col rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-orange-500" />
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold leading-5 ${stat.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-auto">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-600">{order.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ['Completed', 'Accepted'].includes(order.status) ? 'bg-green-100 text-green-700' :
                        order.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                        ['Rejected', 'Cancelled'].includes(order.status) ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-gray-500">No live orders yet.</div>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-gray-900 p-4 text-white sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Customer support inbox</h2>
            <p className="mt-1 text-sm text-gray-300">
              Customer and guest chat messages land here so your team can reply without leaving the admin panel.
            </p>
          </div>
          <Link
            to="/admin/dashboard/chats"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 transition"
          >
            Open Chats
          </Link>
        </div>
      </div>
    </div>
  );
}
