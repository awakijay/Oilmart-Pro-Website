import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ShoppingCart, ArrowLeft, Check, Truck, Shield, Clock, Star, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link to="/products" className="text-orange-500 hover:text-orange-600">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="bg-white rounded-lg p-8">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Info */}
          <div>
            <div className="text-sm text-orange-500 mb-2">{product.category}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <span className="text-gray-600">{product.rating} / 5.0</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{product.orders} orders</span>
            </div>

            <div className="text-4xl font-bold text-gray-900 mb-6">{product.price}</div>

            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Rental & Service Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-blue-600 font-semibold">Free Delivery</p>
                  <p className="text-xs text-blue-500">Within 100 miles</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-green-600 font-semibold">Certified</p>
                  <p className="text-xs text-green-500">API Compliant</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-orange-600 font-semibold">24/7 Support</p>
                  <p className="text-xs text-orange-500">Technical help</p>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 border-2 border-gray-300 rounded-lg text-center focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition">
                Request Quote
              </button>
            </div>

            {showAddedMessage && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-green-700">Added to cart successfully!</span>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rental Terms, Reviews, and Q&A Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <Tabs defaultValue="rental" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="rental">Rental Terms</TabsTrigger>
              <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rental" className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Flexible Rental Options</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Daily Rental</h4>
                  <p className="text-3xl font-bold text-orange-500 mb-3">{product.price}/day</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Minimum 1 day rental</li>
                    <li>• Free delivery within 100 miles</li>
                    <li>• 24/7 technical support</li>
                    <li>• Flexible pickup/return</li>
                  </ul>
                </div>
                <div className="border border-orange-500 rounded-lg p-6 bg-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">Weekly Rental</h4>
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">Save 15%</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-500 mb-3">${(parseInt(product.price.replace(/[^0-9]/g, '')) * 0.85).toLocaleString()}/week</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Minimum 7 days rental</li>
                    <li>• Free delivery within 200 miles</li>
                    <li>• Priority support</li>
                    <li>• Free operator training</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">Monthly Rental</h4>
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Save 25%</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-500 mb-3">${(parseInt(product.price.replace(/[^0-9]/g, '')) * 0.75).toLocaleString()}/month</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Minimum 30 days rental</li>
                    <li>• Nationwide delivery</li>
                    <li>• Dedicated support manager</li>
                    <li>• Free maintenance included</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold">{product.rating}</span>
                  <span className="text-gray-500">out of 5</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'John Smith', rating: 5, comment: 'Excellent equipment! Worked flawlessly throughout our project. Highly recommend for deep well operations.', date: '2 days ago' },
                  { name: 'Sarah Johnson', rating: 5, comment: 'Professional service from start to finish. Equipment was in perfect condition and delivery was on time.', date: '1 week ago' },
                  { name: 'Mike Wilson', rating: 4, comment: 'Great quality equipment. Only minor issue was the setup instructions could be clearer, but customer support was very helpful.', date: '2 weeks ago' },
                ].map((review, i) => (
                  <div key={i} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="qa" className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions & Answers</h3>
              
              <div className="space-y-4">
                {[
                  { question: 'What certifications does this equipment have?', answer: 'This equipment is fully certified to API standards and includes all necessary documentation for compliance.' },
                  { question: 'Is operator training included?', answer: 'Yes! We provide comprehensive operator training for all weekly and monthly rentals at no additional cost.' },
                  { question: 'What is included in the rental?', answer: 'The rental includes the complete equipment, delivery, setup assistance, 24/7 support, and regular maintenance checks.' },
                ].map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <MessageCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                      <p className="font-semibold text-gray-900">{item.question}</p>
                    </div>
                    <p className="text-gray-600 ml-8">{item.answer}</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-3 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition">
                Ask a Question
              </button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition group">
                  <Link to={`/product/${relatedProduct.id}`} className="block">
                    <div className="relative overflow-hidden aspect-square">
                      <ImageWithFallback
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="text-sm text-orange-500 mb-1">{relatedProduct.category}</div>
                    <Link to={`/product/${relatedProduct.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-500">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="text-lg font-bold text-gray-900 mb-3">{relatedProduct.price}</div>
                    <button
                      onClick={() => addToCart(relatedProduct)}
                      className="w-full py-2 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}