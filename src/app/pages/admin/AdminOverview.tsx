import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { products } from '../../data/products';

export function AdminOverview() {
  const stats = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      positive: true,
    },
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: '1,847',
      change: '+8.2%',
      positive: true,
    },
    {
      icon: Package,
      label: 'Total Products',
      value: products.length.toString(),
      change: '+3 new',
      positive: true,
    },
    {
      icon: TrendingUp,
      label: 'Conversion Rate',
      value: '3.2%',
      change: '+0.4%',
      positive: true,
    },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'ABC Energy Corp', product: 'Cameron BOP Stack', amount: '$125,000', status: 'Completed' },
    { id: 'ORD-002', customer: 'Delta Drilling', product: 'Drilling Rig Package', amount: '$850,000', status: 'Processing' },
    { id: 'ORD-003', customer: 'Omega Oil Services', product: 'Production Separator', amount: '$95,000', status: 'Pending' },
    { id: 'ORD-004', customer: 'Titan Energy', product: 'Pressure Testing Unit', amount: '$45,000', status: 'Completed' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-orange-500" />
              </div>
              <span className={`text-sm font-semibold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
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
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
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
      </div>
    </div>
  );
}
