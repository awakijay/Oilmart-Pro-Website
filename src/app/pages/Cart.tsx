import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../utils/currency';

const operationLabels = {
  sell: 'SELLS',
  lease: 'LEASE',
  buy_for_me: 'BUY FOR ME',
} as const;

const operationStyles = {
  sell: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  lease: 'border-blue-200 bg-blue-50 text-blue-700',
  buy_for_me: 'border-orange-200 bg-orange-50 text-orange-700',
} as const;

export function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, updateOperationType, clearCart, getTotalPrice } = useCart();
  const operationCounts = cart.reduce(
    (counts, item) => {
      counts[item.operationType] += item.quantity;
      return counts;
    },
    { sell: 0, lease: 0, buy_for_me: 0 },
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some equipment to get started!</p>
            <Link
              to="/products"
              className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Browse Equipment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Shopping Cart</h1>
            <p className="mt-2 text-sm text-gray-600">
              Review each item’s operation type carefully before checkout.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-600 text-sm font-semibold transition"
          >
            Clear Cart
          </button>
        </div>

        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Operation Summary</p>
              <p className="mt-1 text-sm text-gray-600">
                These labels determine whether the order is treated as a direct sale, lease, or procurement request.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(operationLabels).map(([key, label]) => (
                <div
                  key={key}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${operationStyles[key as keyof typeof operationStyles]}`}
                >
                  {label}: {operationCounts[key as keyof typeof operationCounts]}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.cartItemId} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="h-40 w-full rounded-lg object-cover sm:h-32 sm:w-32"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-orange-500 mb-1">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-[0.16em] ${operationStyles[item.operationType]}`}>
                            {operationLabels[item.operationType]}
                          </span>
                          <label className="sr-only" htmlFor={`operation-${item.cartItemId}`}>Operation Type</label>
                          <select
                            id={`operation-${item.cartItemId}`}
                            value={item.operationType}
                            onChange={(event) => updateOperationType(item.cartItemId, event.target.value as keyof typeof operationLabels)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-500 sm:w-auto"
                          >
                            <option value="sell">{operationLabels.sell}</option>
                            <option value="lease">{operationLabels.lease}</option>
                            <option value="buy_for_me">{operationLabels.buy_for_me}</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="self-start text-red-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({item.rating})</span>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-8 h-8 border-2 border-gray-300 rounded hover:border-orange-500 transition flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-8 h-8 border-2 border-gray-300 rounded hover:border-orange-500 transition flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-left text-xl font-bold text-gray-900 sm:text-right">{item.price}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Order Routing</p>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    {Object.entries(operationLabels).map(([key, label]) => {
                      const count = operationCounts[key as keyof typeof operationCounts];
                      if (count === 0) return null;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span>{label}</span>
                          <span className="font-semibold">{count} item{count > 1 ? 's' : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{formatNaira(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-500">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatNaira(totalPrice * 0.08)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-500">
                      {formatNaira(totalPrice * 1.08)}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(isAuthenticated ? '/checkout' : '/auth?redirect=/checkout')}
                className="w-full py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition mb-3"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </button>
              {!isAuthenticated && (
                <p className="mb-3 text-center text-xs text-gray-500">
                  Create an account or sign in before placing an order.
                </p>
              )}
              <Link
                to="/products"
                className="block w-full py-4 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition text-center"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">Contact our sales team for bulk orders or custom quotes</p>
                <button
                  onClick={() => navigate('/contact?intent=sales')}
                  className="text-sm text-orange-500 font-semibold hover:text-orange-600"
                >
                  Contact Sales →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
