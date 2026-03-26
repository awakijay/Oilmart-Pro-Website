import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
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
  });

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
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

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email with tracking details shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-2xl font-bold text-orange-500">OMP-{Math.floor(Math.random() * 1000000)}</p>
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
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 'info' ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-semibold">Shipping Info</span>
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              {step === 'info' && (
                <form onSubmit={handleSubmitInfo}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                  
                  <div className="space-y-4">
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
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
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
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
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
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="NG">Nigeria</option>
                        <option value="SA">Saudi Arabia</option>
                      </select>
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
                    Place Order - ${finalTotal.toLocaleString()}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-orange-500">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-500">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-500">
                      ${finalTotal.toLocaleString()}
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
