import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router';
import { ShoppingCart, ArrowLeft, Truck, Shield, Clock, Star, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { OperationType, useCart } from '../context/CartContext';
import { useAppData } from '../context/AppDataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatNaira, parseCurrencyValue } from '../utils/currency';

const operationOptions: { value: OperationType; label: string; description: string }[] = [
  { value: 'sell', label: 'SELLS', description: 'Buy this item directly from us.' },
  { value: 'lease', label: 'LEASE', description: 'Rent this equipment for operational use.' },
  { value: 'buy_for_me', label: 'BUY FOR ME', description: 'Request procurement and we handle the purchase for you.' },
];

function getRequestedOperation(value: string | null): OperationType | null {
  if (value === 'lease' || value === 'buy_for_me' || value === 'sell') {
    return value;
  }

  return null;
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { products } = useAppData();
  const [quantity, setQuantity] = useState(1);
  const [operationType, setOperationType] = useState<OperationType | null>(() => getRequestedOperation(searchParams.get('operation')));

  useEffect(() => {
    setOperationType(getRequestedOperation(searchParams.get('operation')));
  }, [searchParams]);

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
  const productAmount = parseCurrencyValue(product.price);
  const selectedOperation = operationOptions.find((option) => option.value === operationType);

  const handleAddToCart = () => {
    addToCart(product, operationType ?? undefined, quantity);
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
        <div className="mb-16 grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Image */}
          <div className="rounded-lg bg-white p-4 sm:p-6 lg:p-8">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Info */}
          <div>
            <div className="text-sm text-orange-500 mb-2">{product.category}</div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{product.name}</h1>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                ))}
              </div>
              <span className="text-gray-600">{product.rating} / 5.0</span>
              <span className="hidden text-gray-400 sm:inline">|</span>
              <span className="text-gray-600">{product.orders} orders</span>
            </div>

            <div className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">{product.price}</div>

            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Service Preference</h2>
              <div className="grid gap-3">
                {operationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOperationType(option.value)}
                    className={`rounded-lg border-2 p-4 text-left transition ${
                      operationType === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
              {selectedOperation ? (
                <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Selected for review</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{selectedOperation.label}</p>
                  <p className="mt-1 text-sm text-gray-600">{selectedOperation.description}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">No service selected yet</p>
                  <p className="mt-2 text-sm text-gray-600">
                    You can pick a preference here or choose the service in the add-to-cart dialog.
                  </p>
                </div>
              )}
            </div>

            {/* Rental & Service Features */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg sm:col-span-2 xl:col-span-1">
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
              <div className="flex items-center gap-2 sm:gap-3">
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
                  className="h-10 w-16 min-w-0 rounded-lg border-2 border-gray-300 text-center focus:outline-none focus:border-orange-500 sm:w-20"
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
            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-4 text-center text-white transition hover:bg-orange-600"
              >
                <ShoppingCart className="w-5 h-5" />
                {selectedOperation ? `Review & Add as ${selectedOperation.label}` : 'Choose Service & Add to Cart'}
              </button>
              <Link
                to={`/contact?intent=quote&product=${encodeURIComponent(product.name)}`}
                className="rounded-lg border-2 border-orange-500 px-6 py-4 text-center text-orange-500 transition hover:bg-orange-50"
              >
                Request Quote
              </Link>
            </div>

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
        <div className="mb-16 rounded-lg bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <Tabs defaultValue="rental" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
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
                  <p className="text-3xl font-bold text-orange-500 mb-3">{formatNaira(productAmount * 0.85)}/week</p>
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
                  <p className="text-3xl font-bold text-orange-500 mb-3">{formatNaira(productAmount * 0.75)}/month</p>
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
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              
              <Link
                to={`/contact?intent=question&product=${encodeURIComponent(product.name)}`}
                className="block w-full py-3 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition text-center"
              >
                Ask a Question
              </Link>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition group">
                  <Link to={`/product/${relatedProduct.id}${searchParams.get('operation') ? `?operation=${encodeURIComponent(searchParams.get('operation') ?? '')}` : ''}`} className="block">
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
                    <Link to={`/product/${relatedProduct.id}${searchParams.get('operation') ? `?operation=${encodeURIComponent(searchParams.get('operation') ?? '')}` : ''}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-500">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="text-lg font-bold text-gray-900 mb-3">{relatedProduct.price}</div>
                    <button
                      onClick={() => addToCart(relatedProduct, operationType ?? undefined)}
                      className="w-full py-2 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition"
                    >
                      {selectedOperation ? `Review ${selectedOperation.label}` : 'Choose Service'}
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
