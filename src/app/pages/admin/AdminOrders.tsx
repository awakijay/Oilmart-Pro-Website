import { useState } from 'react';
import { Search, Eye, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react';
import { QuoteRequest, useAppData } from '../../context/AppDataContext';

export function AdminOrders() {
  const { orders, quoteRequests, updateOrderStatus, updateQuoteStatus } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredQuotes = quoteRequests.filter((quote) => {
    const haystack = `${quote.id} ${quote.name} ${quote.subject} ${quote.message}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const selectedQuote = quoteRequests.find((quote) => quote.id === selectedQuoteId) ?? null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
      case 'Accepted':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Rejected':
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const QuoteActions = ({ quote }: { quote: QuoteRequest }) => (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => updateQuoteStatus(quote.id, 'Approved')} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition"><BadgeCheck className="w-4 h-4" />Approve</button>
      <button onClick={() => updateQuoteStatus(quote.id, 'Accepted')} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 hover:bg-green-100 transition"><CheckCircle2 className="w-4 h-4" />Accept</button>
      <button onClick={() => updateQuoteStatus(quote.id, 'Rejected')} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 transition"><XCircle className="w-4 h-4" />Reject</button>
    </div>
  );

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders & Quotes</h1>
        <p className="text-gray-600">Approve, accept, reject, and review customer orders and quote requests.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders and quotes..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-orange-500 md:w-auto">
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <section className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Operation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.customer}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.operationType}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button onClick={() => updateOrderStatus(order.id, 'Approved')} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition"><BadgeCheck className="w-4 h-4" />Approve</button>
                      <button onClick={() => updateOrderStatus(order.id, 'Accepted')} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 hover:bg-green-100 transition"><CheckCircle2 className="w-4 h-4" />Accept</button>
                      <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 transition"><XCircle className="w-4 h-4" />Reject</button>
                      <button onClick={() => setSelectedOrderId(order.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Eye className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Quote Requests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredQuotes.length === 0 && <div className="p-6 text-gray-500">No quote requests yet.</div>}
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-semibold text-gray-900">{quote.subject}</div>
                <div className="text-sm text-gray-500">{quote.name} • {quote.email} • {quote.date}</div>
                <div className="mt-2 text-sm text-gray-600 line-clamp-2">{quote.message}</div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>{quote.status}</span>
                <QuoteActions quote={quote} />
                <button onClick={() => setSelectedQuoteId(quote.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Eye className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.id}</h2>
                <p className="text-gray-600">{selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrderId(null)} className="text-gray-500 hover:text-gray-700 transition">Close</button>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>Customer</span><span className="font-semibold text-gray-900 sm:text-right">{selectedOrder.customer}</span></div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>Email</span><span className="font-semibold text-gray-900 sm:text-right">{selectedOrder.email}</span></div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><span>Products</span><span className="max-w-xs font-semibold text-gray-900 sm:text-right">{selectedOrder.product}</span></div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>Amount</span><span className="font-semibold text-gray-900">{selectedOrder.amount}</span></div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><span>Operation</span><span className="font-semibold text-gray-900 sm:text-right">{selectedOrder.operationType}</span></div>
            </div>
          </div>
        </div>
      )}

      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedQuote.subject}</h2>
                <p className="text-gray-600">{selectedQuote.name} • {selectedQuote.date}</p>
              </div>
              <button onClick={() => setSelectedQuoteId(null)} className="text-gray-500 hover:text-gray-700 transition">Close</button>
            </div>
            <div className="space-y-4 text-gray-600">
              <div><span className="font-semibold text-gray-900">Email:</span> {selectedQuote.email}</div>
              <div><span className="font-semibold text-gray-900">Company:</span> {selectedQuote.company || 'N/A'}</div>
              <div><span className="font-semibold text-gray-900">Type:</span> {selectedQuote.intent}</div>
              <div><span className="font-semibold text-gray-900">Message:</span> {selectedQuote.message}</div>
              <QuoteActions quote={selectedQuote} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
