import { useState } from 'react';
import { Search, Eye } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  date: string;
}

export function AdminOrders() {
  const [orders] = useState<Order[]>([
    { id: 'ORD-001', customer: 'ABC Energy Corp', email: 'contact@abcenergy.com', product: 'Cameron BOP Stack', amount: '$125,000', status: 'Completed', date: '2026-03-20' },
    { id: 'ORD-002', customer: 'Delta Drilling', email: 'sales@deltadrilling.com', product: 'Drilling Rig Package', amount: '$850,000', status: 'Processing', date: '2026-03-21' },
    { id: 'ORD-003', customer: 'Omega Oil Services', email: 'info@omegaoil.com', product: 'Production Separator', amount: '$95,000', status: 'Pending', date: '2026-03-22' },
    { id: 'ORD-004', customer: 'Titan Energy', email: 'orders@titanenergy.com', product: 'Pressure Testing Unit', amount: '$45,000', status: 'Completed', date: '2026-03-22' },
    { id: 'ORD-005', customer: 'Apex Petroleum', email: 'procurement@apexpetro.com', product: 'Industrial Gate Valve Set', amount: '$12,500', status: 'Processing', date: '2026-03-23' },
    { id: 'ORD-006', customer: 'Nova Drilling Co', email: 'contact@novadrilling.com', product: 'Wellhead Control Panel', amount: '$35,000', status: 'Pending', date: '2026-03-23' },
    { id: 'ORD-007', customer: 'Prime Energy Solutions', email: 'sales@primeenergy.com', product: 'Mud Pump System', amount: '$185,000', status: 'Completed', date: '2026-03-24' },
    { id: 'ORD-008', customer: 'Coastal Oil & Gas', email: 'orders@coastaloil.com', product: 'Safety Relief Valve System', amount: '$8,750', status: 'Cancelled', date: '2026-03-24' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.customer}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                      <Eye className="w-4 h-4" />
                    </button>
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
