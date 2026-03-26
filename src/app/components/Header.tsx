import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';

export function Header() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-1">
              +(234) 706 884 1116
            </span>
            <span className="flex items-center gap-1">
              rentals@oilmartpro.com
            </span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange-400 transition">Become a Supplier</a>
            <a href="#" className="hover:text-orange-400 transition">Help Center</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">OMP</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Oil Mart Pro</div>
                <div className="text-xs text-gray-500">B2B Marketplace</div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for oil & gas equipment, tools, services..."
                  className="w-full px-4 py-3 pr-12 border-2 border-orange-500 rounded-lg focus:outline-none focus:border-orange-600"
                />
                <button className="absolute right-0 top-0 bottom-0 px-6 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600 transition">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-6">
              <Link to="/profile" className="flex items-center gap-2 hover:text-orange-500 transition">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link to="/admin" className="flex items-center gap-2 hover:text-orange-500 transition text-gray-600">
                <span className="text-sm">Admin</span>
              </Link>
              <Link to="/cart" className="relative hover:text-orange-500 transition">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto py-2">
              <Link to="/products" className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition whitespace-nowrap">
                <Menu className="w-4 h-4" />
                All Categories
              </Link>
              {['Drilling', 'Well Control', 'Production', 'Completion', 'Safety', 'Testing'].map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${cat}`}
                  className="px-4 py-2 hover:text-orange-500 hover:bg-white rounded transition whitespace-nowrap"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}