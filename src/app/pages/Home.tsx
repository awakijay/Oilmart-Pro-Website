import { ChevronDown, Shield, Drill, Factory, Wrench, Gauge, AlertTriangle, FlaskConical } from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { products, categories } from '../data/products';

const iconMap = {
  'Well Control - BOP': Shield,
  'Drilling Equipment': Drill,
  'Production Equipment': Factory,
  'Completion Tools': Wrench,
  'Pumps & Valves': Gauge,
  'Safety Equipment': AlertTriangle,
  'Testing Equipment': FlaskConical,
};

export function Home() {
  const { addToCart } = useCart();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Premium Oil & Gas Equipment Rental
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Top-of-the-line equipment ready at flexible rates. From drilling to production, we've got you covered.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                  Request a Quote
                </button>
                <Link to="/products" className="px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition">
                  Browse Equipment
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-8 mt-12">
                <div>
                  <div className="text-3xl font-bold text-orange-500">5,000+</div>
                  <div className="text-gray-600">Equipment Items</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-500">500+</div>
                  <div className="text-gray-600">Suppliers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-500">98%</div>
                  <div className="text-gray-600">Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1629540946404-ebe133e99f49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Oil and gas equipment"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(1).map((category) => {
              const IconComponent = iconMap[category.name as keyof typeof iconMap] || Shield;
              return (
                <Link
                  key={category.name}
                  to={`/products?category=${category.name}`}
                  className="border border-gray-200 rounded-lg p-6 hover:border-orange-500 hover:shadow-lg transition cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-lg mb-4 flex items-center justify-center group-hover:bg-orange-500 transition">
                    <IconComponent className="w-8 h-8 text-orange-500 group-hover:text-white transition" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} items</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Equipment</h2>
            <Link to="/products" className="text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition group">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative overflow-hidden aspect-square">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="text-sm text-orange-500 mb-1">{product.category}</div>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-500">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({product.orders} orders)</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-3">{product.price}</div>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-2 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Oil Mart Pro?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">All equipment inspected and certified to industry standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Pricing</h3>
              <p className="text-gray-600 text-sm">Competitive rates with flexible rental terms</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick turnaround and delivery to your location</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Expert technical support whenever you need it</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of satisfied customers who trust Oil Mart Pro</p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-orange-500 rounded-lg hover:bg-gray-100 transition">
              Request a Quote
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-orange-500 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}