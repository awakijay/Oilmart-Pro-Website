import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, PackageCheck, Save, Search, Truck } from 'lucide-react';
import { OrderRecord, useAppData } from '../../context/AppDataContext';

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

export function AdminTracker() {
  const { orders, updateOrderStatus, updateOrderTracking } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null);
  const [trackingForm, setTrackingForm] = useState({
    status: 'Pending' as OrderRecord['status'],
    trackingLocation: '',
    trackingUpdate: '',
    estimatedDelivery: '',
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const haystack = `${order.id} ${order.customer} ${order.email} ${order.product} ${order.trackingLocation} ${order.trackingUpdate}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, searchQuery]);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0] ?? null;

  useEffect(() => {
    if (!selectedOrderId && filteredOrders[0]) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrder) return;

    setTrackingForm({
      status: selectedOrder.status,
      trackingLocation: selectedOrder.trackingLocation,
      trackingUpdate: selectedOrder.trackingUpdate,
      estimatedDelivery: selectedOrder.estimatedDelivery,
    });
    setSaveMessage('');
    setSaveError('');
  }, [selectedOrder]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsSaving(true);
      setSaveMessage('');
      setSaveError('');

      if (trackingForm.status !== selectedOrder.status) {
        updateOrderStatus(selectedOrder.id, trackingForm.status);
      }

      await updateOrderTracking(selectedOrder.id, {
        trackingLocation: trackingForm.trackingLocation,
        trackingUpdate: trackingForm.trackingUpdate,
        estimatedDelivery: trackingForm.estimatedDelivery,
      });
      setSaveMessage('Tracker update saved. Customers can now see it on the website tracker, profile, and support chat replies.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save tracker update.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
          <Truck className="h-4 w-4" />
          Tracker Control
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Tracker</h1>
        <p className="mt-2 text-gray-600">Control the location, progress note, delivery estimate, and status customers see across the public tracker and support chat.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <label className="mb-2 block text-sm font-semibold text-gray-900">Find Order</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search order, customer, product..."
                className="w-full rounded-xl border-2 border-gray-300 py-3 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[36rem] overflow-y-auto p-3">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className={`mb-2 w-full rounded-xl border p-4 text-left transition ${
                  selectedOrder?.id === order.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <p className="truncate text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-3 truncate text-sm text-gray-600">{order.trackingLocation || 'No tracker location yet'}</p>
              </button>
            ))}

            {filteredOrders.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                No matching orders.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          {selectedOrder ? (
            <>
              <div className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.id}</h2>
                  <p className="mt-1 text-sm text-gray-500">{selectedOrder.customer} - {selectedOrder.email}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <PackageCheck className="mb-2 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product</p>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900">{selectedOrder.product}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <MapPin className="mb-2 h-5 w-5 text-blue-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Location</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{selectedOrder.trackingLocation || 'Awaiting update'}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <Clock className="mb-2 h-5 w-5 text-gray-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last Updated</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{formatTrackingTime(selectedOrder.trackingUpdatedAt)}</p>
                </div>
              </div>

              {saveMessage && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{saveMessage}</div>}
              {saveError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Order Status</label>
                  <select
                    value={trackingForm.status}
                    onChange={(event) => setTrackingForm((current) => ({ ...current, status: event.target.value as OrderRecord['status'] }))}
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Tracker Location</label>
                  <input
                    value={trackingForm.trackingLocation}
                    onChange={(event) => setTrackingForm((current) => ({ ...current, trackingLocation: event.target.value }))}
                    placeholder="e.g. Port Harcourt dispatch yard"
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Tracker Update</label>
                  <textarea
                    value={trackingForm.trackingUpdate}
                    onChange={(event) => setTrackingForm((current) => ({ ...current, trackingUpdate: event.target.value }))}
                    rows={4}
                    placeholder="e.g. Equipment inspected and queued for dispatch."
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">Estimated Delivery</label>
                  <input
                    value={trackingForm.estimatedDelivery}
                    onChange={(event) => setTrackingForm((current) => ({ ...current, estimatedDelivery: event.target.value }))}
                    placeholder="e.g. 24 July 2026 or pending confirmation"
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving Tracker...' : 'Save Tracker'}
                </button>
              </form>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No orders are available yet. New checkout orders will appear here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
