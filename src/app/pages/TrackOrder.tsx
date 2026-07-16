import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, Clock, MapPin, PackageCheck, Search, Truck } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface OrderTrackingInfo {
  id: string;
  status: string;
  date: string;
  product: string;
  operationType: string;
  trackingLocation: string;
  trackingUpdate: string;
  estimatedDelivery: string;
  trackingUpdatedAt: string;
}

function formatTrackingTime(value: string) {
  if (!value) return 'Not updated yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Completed':
    case 'Accepted':
      return 'bg-green-100 text-green-700';
    case 'Approved':
      return 'bg-blue-100 text-blue-700';
    case 'Rejected':
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
}

export function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') ?? '');
  const [tracking, setTracking] = useState<OrderTrackingInfo | null>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const lookupOrder = async (value: string) => {
    const nextOrderNumber = value.trim();

    if (!nextOrderNumber) {
      setError('Enter your order number to view tracking details.');
      setTracking(null);
      return;
    }

    try {
      setIsSearching(true);
      setError('');
      const result = await apiRequest<OrderTrackingInfo>(`/order-tracking/${encodeURIComponent(nextOrderNumber)}`);
      setTracking(result);
      setSearchParams({ order: result.id });
    } catch {
      setTracking(null);
      setError(`No tracker record was found for ${nextOrderNumber}. Check the order number from checkout or your profile order history.`);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const initialOrderNumber = searchParams.get('order');
    if (initialOrderNumber) {
      void lookupOrder(initialOrderNumber);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void lookupOrder(orderNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_22rem] lg:items-center lg:py-14">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              <Truck className="h-4 w-4" />
              Live order tracker
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Track your Oilmart Pro order</h1>
            <p className="mt-4 max-w-2xl text-gray-600">
              Enter the order number shown after checkout to see the current status, tracker location, latest admin update, and estimated delivery.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-900">Also available in chat</p>
            <p className="mt-2 text-sm text-blue-800">
              Send your order number in the support chat to get the current tracker details automatically.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <label className="mb-2 block text-sm font-semibold text-gray-900">Order Number</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="Example: ORD-1234567890"
                className="w-full rounded-xl border-2 border-gray-300 py-3 pl-12 pr-4 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSearching ? 'Checking...' : 'Track Order'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </form>

        {tracking && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <h2 className="text-2xl font-bold text-gray-900">{tracking.id}</h2>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(tracking.status)}`}>
                  {tracking.status}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product</p>
                  <p className="mt-2 font-semibold text-gray-900">{tracking.product}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Operation</p>
                  <p className="mt-2 font-semibold text-gray-900">{tracking.operationType}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Current Location</p>
                    <p className="mt-1 text-sm text-gray-700">{tracking.trackingLocation || 'Awaiting admin location update'}</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-gray-200 p-4">
                  <PackageCheck className="mt-1 h-5 w-5 shrink-0 text-orange-500" />
                  <div>
                    <p className="font-semibold text-gray-900">Latest Update</p>
                    <p className="mt-1 text-sm text-gray-700">{tracking.trackingUpdate || 'No tracking note has been added yet.'}</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-xl border border-gray-200 p-4">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-900">Estimated Delivery</p>
                    <p className="mt-1 text-sm text-gray-700">{tracking.estimatedDelivery || 'Pending admin confirmation'}</p>
                    <p className="mt-2 text-xs text-gray-500">Last updated: {formatTrackingTime(tracking.trackingUpdatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-gray-900">Need more help?</h3>
              <p className="mt-2 text-sm text-gray-600">
                If the tracker does not answer your question, message support and an admin can continue from the same conversation.
              </p>
              <Link
                to="/contact?intent=support"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border-2 border-orange-500 px-5 py-3 font-semibold text-orange-500 transition hover:bg-orange-50"
              >
                Contact Support
              </Link>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
