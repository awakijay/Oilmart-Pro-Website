import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { countries } from '../data/countries';
import { createBotChallenge, isBotCheckValid } from '../utils/botProtection';
import { formatNaira } from '../utils/currency';

const operationLabels = {
  sell: 'SELLS',
  lease: 'LEASE',
  buy_for_me: 'BUY FOR ME',
} as const;

export function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useAppData();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [error, setError] = useState('');
  const [botChallenge, setBotChallenge] = useState(() => createBotChallenge());
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'credit',
    securityAnswer: '',
    website: '',
  });

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: prev.phone || user.phone,
      company: prev.company || user.company,
    }));
  }, [user]);

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + tax;
  const hasBuyForMeRequest = cart.some((item) => item.operationType === 'buy_for_me');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    if (!isBotCheckValid(formData.securityAnswer, botChallenge.answer, formData.website)) {
      setError('Security check failed. Please answer the question correctly.');
      setBotChallenge(createBotChallenge());
      setFormData((prev) => ({ ...prev, securityAnswer: '', website: '' }));
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate('/auth?redirect=/checkout');
      return;
    }

    const orderId = `ORD-${Date.now()}`;
    const trackingUpdatedAt = new Date().toISOString();
    const orderedProductItems = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    addOrder({
      id: orderId,
      customer: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      product: cart.map((item) => `${item.name} (${operationLabels[item.operationType]} x${item.quantity})`).join(', '),
      amount: formatNaira(finalTotal),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      operationType: [...new Set(cart.map((item) => operationLabels[item.operationType]))].join(', '),
      trackingLocation: 'Order desk',
      trackingUpdate: 'Order received. The admin team will update the tracker as processing and dispatch progress.',
      estimatedDelivery: '',
      trackingUpdatedAt,
    }, orderedProductItems);
    setPlacedOrderId(orderId);
    setStep('success');
    // Simulate order placement
    setTimeout(() => {
      clearCart();
    }, 2000);
  };

  if (cart.length === 0 && step !== 'success') {
    navigate('/cart');
    return null;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto flex max-w-3xl px-4 py-16">
          <div className="w-full rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm lg:p-10">
            <div className="mb-6 inline-flex rounded-2xl bg-orange-100 p-4 text-orange-500">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create an account before checkout</h1>
            <p className="mt-4 text-base text-gray-600">
              Orders must be tied to a registered customer account so the admin panel, profile page, and order history stay accurate.
            </p>
            <div className="mt-6 rounded-3xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-sm font-semibold text-gray-900">Your cart is safe.</p>
              <p className="mt-2 text-sm text-gray-600">
                Sign in or create an account to continue with checkout. Once you’re done, we’ll bring you straight back here with your current cart items.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auth?redirect=/checkout"
                className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:bg-orange-600"
              >
                Sign In or Create Account
              </Link>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-300 px-6 py-4 font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            {hasBuyForMeRequest
              ? "Thank you for your request. We'll review the buy-for-me items and follow up with procurement details shortly."
              : "Thank you for your order. We'll send you a confirmation email with tracking details shortly."}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-2xl font-bold text-orange-500">{placedOrderId}</p>
            <p className="mt-2 text-sm text-gray-500">Use this number in chat to track your order.</p>
          </div>
          <Link
            to="/products"
            className="inline-block px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => step === 'payment' ? setStep('info') : navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex w-full max-w-md flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 'info' ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-semibold">Shipping Info</span>
            </div>
            <div className="h-1 w-full bg-gray-200 sm:w-16"></div>
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 'payment' ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-semibold">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
              {step === 'info' && (
                <form onSubmit={handleSubmitInfo}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                  {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      You are checking out as <span className="font-semibold">{user.firstName} {user.lastName}</span> ({user.email}).
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          readOnly
                          className="w-full cursor-not-allowed px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          readOnly
                          className="w-full cursor-not-allowed px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    <div className="hidden" aria-hidden="true">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        tabIndex={-1}
                        autoComplete="off"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Security Question: {botChallenge.question}
                      </label>
                      <input
                        type="text"
                        name="securityAnswer"
                        value={formData.securityAnswer}
                        onChange={handleInputChange}
                        required
                        inputMode="numeric"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    Continue to Payment
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <form onSubmit={handleSubmitPayment}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div
                      onClick={() => setFormData({ ...formData, paymentMethod: 'credit' })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.paymentMethod === 'credit'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                          <p className="text-sm text-gray-500">Pay securely with your card</p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, paymentMethod: 'wire' })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.paymentMethod === 'wire'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-900">Wire Transfer</p>
                          <p className="text-sm text-gray-500">Bank transfer for large orders</p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, paymentMethod: 'purchase' })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        formData.paymentMethod === 'purchase'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-900">Purchase Order</p>
                          <p className="text-sm text-gray-500">For registered businesses</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.paymentMethod === 'credit' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    Place Order - {formatNaira(finalTotal)}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3 pb-3 border-b border-gray-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-blue-600 font-semibold">{operationLabels[item.operationType]}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-orange-500">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatNaira(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-500">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>{formatNaira(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-500">
                      {formatNaira(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
