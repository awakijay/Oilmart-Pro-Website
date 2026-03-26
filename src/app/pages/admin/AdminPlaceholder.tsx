interface AdminPlaceholderProps {
  title: string;
  description: string;
}

import { Activity, BarChart3, Boxes, FileText, MessageCircle, TrendingUp } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCompactNaira, parseCurrencyValue } from '../../utils/currency';

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  const { orders, quoteRequests, products } = useAppData();
  const { users } = useAuth();

  if (title === 'Customers') {
    const customers = users.map((customer) => {
      const customerOrders = orders.filter((order) => order.email.toLowerCase() === customer.email.toLowerCase());
      const latestOrder = customerOrders[0];
      const totalValue = customerOrders.reduce((sum, order) => sum + parseCurrencyValue(order.amount), 0);

      return {
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email,
        company: customer.company,
        latestOrder: latestOrder?.id ?? 'No orders yet',
        totalValue: customerOrders.length > 0 ? formatCompactNaira(totalValue) : 'No order value yet',
      };
    });

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Latest Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.company}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.latestOrder}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{customer.totalValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {customers.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-600">
            Customer accounts will appear here as soon as users create an account on the website.
          </div>
        )}
      </div>
    );
  }

  if (title === 'Analytics') {
    const approvedOrders = orders.filter((order) => order.status === 'Approved' || order.status === 'Accepted' || order.status === 'Completed').length;
    const pendingQuotes = quoteRequests.filter((quote) => quote.status === 'Pending').length;
    const approvedQuotes = quoteRequests.filter((quote) => quote.status === 'Approved').length;
    const acceptedQuotes = quoteRequests.filter((quote) => quote.status === 'Accepted').length;
    const rejectedQuotes = quoteRequests.filter((quote) => quote.status === 'Rejected').length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseCurrencyValue(order.amount), 0);
    const conversionRate = quoteRequests.length > 0 ? Math.round((approvedOrders / quoteRequests.length) * 100) : 0;
    const totalTrackedRequests = orders.length + quoteRequests.length;
    const quoteShare = totalTrackedRequests > 0 ? Math.round((quoteRequests.length / totalTrackedRequests) * 100) : 0;
    const pendingOrders = orders.filter((order) => order.status === 'Pending').length;
    const approvedOrderOnly = orders.filter((order) => order.status === 'Approved').length;
    const acceptedOrders = orders.filter((order) => order.status === 'Accepted' || order.status === 'Completed').length;
    const rejectedOrders = orders.filter((order) => order.status === 'Rejected' || order.status === 'Cancelled').length;
    const productMix = [
      { label: 'Products', value: products.length, color: 'bg-orange-500' },
      { label: 'Orders', value: orders.length, color: 'bg-slate-800' },
      { label: 'Quotes', value: quoteRequests.length, color: 'bg-emerald-500' },
    ];
    const statusBreakdown = [
      { label: 'Pending', value: orders.filter((order) => order.status === 'Pending').length, color: 'bg-amber-400' },
      { label: 'Approved', value: orders.filter((order) => order.status === 'Approved').length, color: 'bg-sky-500' },
      { label: 'Accepted', value: orders.filter((order) => order.status === 'Accepted' || order.status === 'Completed').length, color: 'bg-emerald-500' },
      { label: 'Rejected', value: orders.filter((order) => order.status === 'Rejected' || order.status === 'Cancelled').length, color: 'bg-rose-500' },
    ];
    const maxStatusValue = Math.max(...statusBreakdown.map((item) => item.value), 1);
    const maxMixValue = Math.max(...productMix.map((item) => item.value), 1);

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Live</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">Revenue Captured</div>
            <div className="text-3xl font-bold text-gray-900">{formatCompactNaira(totalRevenue)}</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                <Activity className="h-6 w-6 text-sky-600" />
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{orders.length} orders</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">Order Conversion</div>
            <div className="text-3xl font-bold text-gray-900">{conversionRate}%</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{pendingQuotes} open</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">Pending Quote Requests</div>
            <div className="text-3xl font-bold text-gray-900">{pendingQuotes}</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                <Boxes className="h-6 w-6 text-violet-600" />
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Catalog</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">Active Product Listings</div>
            <div className="text-3xl font-bold text-gray-900">{products.length}</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Commercial Funnel</h2>
                <p className="text-sm text-gray-500">A quick view of how catalog activity is distributed.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
                <BarChart3 className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="space-y-5">
              {productMix.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className="text-gray-500">{item.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div
                      className={`h-3 rounded-full ${item.color}`}
                      style={{ width: `${Math.max((item.value / maxMixValue) * 100, item.value > 0 ? 18 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Quote volume
                </div>
                <p className="text-2xl font-bold text-gray-900">{quoteRequests.length}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Activity className="h-4 w-4 text-sky-500" />
                  Approved orders
                </div>
                <p className="text-2xl font-bold text-gray-900">{approvedOrders}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Boxes className="h-4 w-4 text-emerald-500" />
                  Catalog readiness
                </div>
                <p className="text-2xl font-bold text-gray-900">{products.length > 0 ? 'Active' : 'Empty'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Status Breakdown</h2>
                <p className="text-sm text-gray-500">A simple operational snapshot for the team.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <TrendingUp className="h-6 w-6 text-slate-700" />
              </div>
            </div>

            <div className="space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className="text-gray-500">{item.value}</span>
                  </div>
                  <div className="h-24 rounded-2xl bg-gray-50 p-3 flex items-end">
                    <div
                      className={`w-full rounded-xl ${item.color}`}
                      style={{ height: `${Math.max((item.value / maxStatusValue) * 100, item.value > 0 ? 18 : 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-gray-900 p-5 text-white">
              <p className="text-sm text-gray-300">Pipeline insight</p>
              <p className="mt-2 text-lg font-semibold">
                {totalTrackedRequests > 0
                  ? `Quotes make up ${quoteShare}% of tracked activity. Orders: ${pendingOrders} pending, ${approvedOrderOnly} approved, ${acceptedOrders} accepted, ${rejectedOrders} rejected. Quotes: ${pendingQuotes} pending, ${approvedQuotes} approved, ${acceptedQuotes} accepted, ${rejectedQuotes} rejected.`
                  : 'No orders or quote requests have entered the pipeline yet.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600">This feature is under development and will be available soon.</p>
      </div>
    </div>
  );
}
