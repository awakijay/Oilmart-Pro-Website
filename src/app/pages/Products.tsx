import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Filter } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { products, categories } from '../data/products';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const { addToCart } = useCart();

  useEffect(() => {
    if (categoryParam) {
      // Find category by matching the full name or part of it
      const matchedCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryParam.toLowerCase()) ||
        categoryParam.toLowerCase().includes(cat.name.toLowerCase())
      );
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.id);
      }
    }
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p =>
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
        const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
        const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
        return priceB - priceA;
      });
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Equipment Catalog</h1>
          <p className="text-gray-600">Browse our complete selection of oil & gas equipment</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded transition ${
                        selectedCategory === cat.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-xs opacity-75">{cat.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-gray-600">
              Showing {filteredProducts.length} products
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
                      <span className="text-sm text-gray-500">({product.orders})</span>
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
        </div>
      </div>
    </div>
  );
}