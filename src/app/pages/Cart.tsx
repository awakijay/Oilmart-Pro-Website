import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-600 text-sm font-semibold transition"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-6">
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-orange-500 mb-1">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 transition"
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

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border-2 border-gray-300 rounded hover:border-orange-500 transition flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border-2 border-gray-300 rounded hover:border-orange-500 transition flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{item.price}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-500">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.08).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-500">
                      ${(totalPrice * 1.08).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition mb-3"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/products"
                className="block w-full py-4 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition text-center"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">Contact our sales team for bulk orders or custom quotes</p>
                <button className="text-sm text-orange-500 font-semibold hover:text-orange-600">
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