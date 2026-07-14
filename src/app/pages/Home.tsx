import { ChevronDown, Shield, Drill, Factory, Wrench, Gauge, AlertTriangle, FlaskConical, ArrowRight, CheckCircle2, HandCoins, ShoppingCart, Truck, Ship } from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAppData } from '../context/AppDataContext';

const iconMap = {
  'Well Control - BOP': Shield,
  'Drilling Equipment': Drill,
  'Production Equipment': Factory,
  'Completion Tools': Wrench,
  'Pumps & Valves': Gauge,
  'Safety Equipment': AlertTriangle,
  'Testing Equipment': FlaskConical,
  'Vessels': Ship,
};

export function Home() {
  const { addToCart } = useCart();
  const { products, categories, blogPosts } = useAppData();
  const featuredProducts = [...products].slice(-4).reverse();
  const publishedBlogPosts = blogPosts
    .filter((post) => post.status === 'published')
    .slice(0, 3);
  const operationGuides = [
    {
      step: '1. SELLS',
      icon: ShoppingCart,
      accent: 'from-orange-500 to-orange-600',
      surface: 'bg-orange-50 border-orange-200',
      title: 'Buy equipment directly',
      description: 'Choose SELLS when you want to purchase listed equipment outright with a standard commercial flow.',
      highlights: ['Direct ownership transfer', 'Admin quote approval flow', 'Fast checkout for stocked items'],
      ctaLabel: 'Browse Equipment to Buy',
      ctaTo: '/products?q=equipment',
    },
    {
      step: '2. LEASE',
      icon: Truck,
      accent: 'from-slate-800 to-slate-900',
      surface: 'bg-slate-50 border-slate-200',
      title: 'Lease for active projects',
      description: 'Use LEASE for rental-driven operations, project mobilization, and flexible asset access without full ownership.',
      highlights: ['Short and long-term usage', 'Project-based deployment support', 'Lower upfront capital commitment'],
      ctaLabel: 'Explore Leasing Options',
      ctaTo: '/products?operation=lease',
    },
    {
      step: '3. BUY FOR ME',
      icon: HandCoins,
      accent: 'from-emerald-500 to-emerald-600',
      surface: 'bg-emerald-50 border-emerald-200',
      title: 'Let us procure for you',
      description: 'Choose BUY FOR ME if you want our team to source, negotiate, and handle procurement on your behalf.',
      highlights: ['Vendor sourcing and negotiation', 'Specification-led procurement', 'Handled by our commercial team'],
      ctaLabel: 'Start a Procurement Request',
      ctaTo: '/contact?intent=quote',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
                Sells, Lease, and Buy-For-Me Support for Oil & Gas Equipment
              </h1>
              <p className="mb-8 text-lg text-gray-600 sm:text-xl">
                Oil Mart Pro helps clients buy available equipment, lease assets for active projects, or request end-to-end procurement support when they need us to source on their behalf.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/contact?intent=quote" className="rounded-lg bg-orange-500 px-8 py-4 text-center text-white transition hover:bg-orange-600">
                  Request a Quote
                </Link>
                <Link to="/products" className="rounded-lg border-2 border-orange-500 px-8 py-4 text-center text-orange-500 transition hover:bg-orange-50">
                  Browse Equipment
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-12 sm:grid-cols-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">SELLS</div>
                  <div className="text-gray-600 mt-2">Purchase listed equipment directly with fast commercial processing.</div>
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">LEASE</div>
                  <div className="text-gray-600 mt-2">Access project-ready equipment without committing to full ownership.</div>
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">BUY FOR ME</div>
                  <div className="text-gray-600 mt-2">Let our team source, negotiate, and procure equipment to your specification.</div>
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

      {/* Blog Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Latest Insights</p>
              <h2 className="text-3xl font-bold text-gray-900">Latest Updates</h2>
            </div>
            <p className="max-w-2xl text-sm text-gray-600">
              Insights, safety notes, operations updates, and procurement guidance from Oil Mart Pro.
            </p>
          </div>

          {publishedBlogPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {publishedBlogPosts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-orange-500">
                      <span>{post.category}</span>
                      <span className="h-1 w-1 rounded-full bg-orange-300" />
                      <span>{new Date(post.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{post.title}</h3>
                    <p className="mb-5 text-sm leading-6 text-gray-600">{post.excerpt}</p>
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-sm font-semibold text-orange-500 transition hover:text-orange-600"
                    >
                      Read full article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-600">
              Publish a blog post from the admin panel and it will appear here automatically.
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
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
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    Choose Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Core Operations Guide</p>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Choose the commercial path that fits your project</h2>
              <p className="text-base text-gray-600 sm:text-lg">
                Every request on Oilmart Pro follows one of three clear service models. That makes it easier for customers to understand what happens next and helps your team process requests faster.
              </p>
            </div>

            <div className="mb-8 grid gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-5 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Fast response times
                </div>
                <p className="text-sm text-gray-600">Choose the right operation model quickly and move straight into quote, order, or procurement support without delays.</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Flexible commercial options
                </div>
                <p className="text-sm text-gray-600">Buy available equipment, lease for project-based needs, or ask our team to source exactly what your operation requires.</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  Handled by experts
                </div>
                <p className="text-sm text-gray-600">Our team supports equipment selection, commercial guidance, and procurement follow-through so you can move with confidence.</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {operationGuides.map((guide) => (
                <div key={guide.step} className={`overflow-hidden rounded-3xl border ${guide.surface} shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}>
                  <div className={`bg-gradient-to-r ${guide.accent} p-6 text-white`}>
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">{guide.step}</p>
                        <h3 className="text-2xl font-bold">{guide.title}</h3>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                        <guide.icon className="h-7 w-7" />
                      </div>
                    </div>
                    <p className="max-w-sm text-sm leading-6 text-white/85">{guide.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Best for</p>
                      <p className="mt-2 text-sm text-gray-700">
                        Customers can choose this option directly from any product page, then continue through cart, checkout, or quote handling with the matching workflow.
                      </p>
                    </div>

                    <div className="mb-6 space-y-3">
                      {guide.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                            <CheckCircle2 className="h-4 w-4 text-orange-500" />
                          </div>
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={guide.ctaTo}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      {guide.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Oil Mart Pro?</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
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
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
          <p className="mb-8 text-lg opacity-90 sm:text-xl">Join thousands of satisfied customers who trust Oil Mart Pro</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/contact?intent=quote" className="rounded-lg bg-white px-8 py-4 text-center text-orange-500 transition hover:bg-gray-100">
              Request a Quote
            </Link>
            <Link to="/contact?intent=sales" className="rounded-lg border-2 border-white px-8 py-4 text-center text-white transition hover:bg-white hover:text-orange-500">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
