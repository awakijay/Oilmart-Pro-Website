import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, Menu, LogOut, X, CheckCircle2, Truck } from 'lucide-react';
import { Link } from 'react-router';
import { useNavigate, useSearchParams } from 'react-router';
import { useCart } from '../context/CartContext';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';

const categoryLinks = ['Drilling', 'Well Control', 'Production', 'Completion', 'Safety', 'Testing', 'Vessels'];
const operationLabels = {
  sell: 'SELLS',
  lease: 'LEASE',
  buy_for_me: 'BUY FOR ME',
} as const;

export function Header() {
  const { getTotalItems, lastAddedItem, clearLastAddedItem } = useCart();
  const totalItems = getTotalItems();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') ?? '');
    setMobileMenuOpen(false);
  }, [searchParams]);

  useEffect(() => {
    if (!lastAddedItem) return;

    const timeoutId = window.setTimeout(() => {
      clearLastAddedItem();
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [clearLastAddedItem, lastAddedItem]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      params.set('q', trimmedSearch);
    }

    navigate({
      pathname: '/products',
      search: params.toString() ? `?${params.toString()}` : '',
    });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="bg-gray-900 text-sm text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <span className="flex items-center gap-1">+(234) 706 884 1116</span>
            <span className="flex items-center gap-1">rentals@oilmartpro.com</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/become-a-supplier" className="transition hover:text-orange-400">Become a Supplier</Link>
            <Link to="/help-center" className="transition hover:text-orange-400">Help Center</Link>
            <Link to="/track-order" className="inline-flex items-center gap-1 font-semibold text-orange-300 transition hover:text-orange-200">
              <Truck className="h-4 w-4" />
              Track Order
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center shrink-0">
                <BrandLogo imageClassName="h-10 sm:h-12 lg:h-14" />
              </Link>

              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  to="/track-order"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600 transition hover:border-orange-500 hover:text-orange-700"
                  aria-label="Track order"
                >
                  <Truck className="h-5 w-5" />
                </Link>
                <Link
                  to="/cart"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex-1">
              <form className="relative" onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search for oil & gas equipment, tools, services..."
                  className="w-full rounded-lg border-2 border-orange-500 px-4 py-3 pr-12 focus:border-orange-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 rounded-r-lg bg-orange-500 px-5 text-white transition hover:bg-orange-600 sm:px-6"
                  aria-label="Search products"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            <div className="hidden items-center gap-4 lg:flex">
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <Truck className="h-4 w-4" />
                Track Order
              </Link>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-3 transition hover:text-orange-500">
                    {user.avatar ? (
                      <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-10 w-10 rounded-full border border-gray-200 object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="hidden text-left xl:block">
                      <div className="text-sm font-semibold text-gray-900">{user.firstName}</div>
                      <div className="text-xs text-gray-500">Profile</div>
                    </div>
                  </Link>
                  <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-orange-500">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="flex items-center gap-2 transition hover:text-orange-500">
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              )}
              <Link to="/admin" className="flex items-center gap-2 text-gray-600 transition hover:text-orange-500">
                <span className="text-sm">Admin</span>
              </Link>
              <Link to="/cart" className="relative transition hover:text-orange-500">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className={`${mobileMenuOpen ? 'mt-4 block' : 'hidden'} rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:hidden`}>
            <div className="flex flex-col gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                  <Link to="/profile" className="flex min-w-0 items-center gap-3 transition hover:text-orange-500">
                    {user.avatar ? (
                      <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-10 w-10 rounded-full border border-gray-200 object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="truncate text-xs text-gray-500">{user.email}</div>
                    </div>
                  </Link>
                  <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-orange-500">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-gray-700 transition hover:text-orange-500">
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Link to="/track-order" className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                  <Truck className="h-4 w-4" />
                  Track Order
                </Link>
                <Link to="/admin" className="flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 transition hover:text-orange-500">
                  Admin
                </Link>
              </div>

              <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Link to="/" className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-500">
                  Home
                </Link>
                <Link to="/products" className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-orange-600">
                  All Categories
                </Link>
                {categoryLinks.map((cat) => (
                  <Link
                    key={cat}
                    to={`/products?category=${cat}`}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-500"
                  >
                    {cat}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="hidden border-t bg-gray-50 lg:block">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex items-center gap-1 overflow-x-auto py-2">
              <Link to="/products" className="flex items-center gap-1 whitespace-nowrap rounded bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600">
                <Menu className="h-4 w-4" />
                All Categories
              </Link>
              <Link to="/" className="whitespace-nowrap rounded px-4 py-2 transition hover:bg-white hover:text-orange-500">
                Home
              </Link>
              <Link to="/track-order" className="inline-flex items-center gap-2 whitespace-nowrap rounded px-4 py-2 font-semibold text-orange-600 transition hover:bg-white hover:text-orange-500">
                <Truck className="h-4 w-4" />
                Track Order
              </Link>
              {categoryLinks.map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${cat}`}
                  className="whitespace-nowrap rounded px-4 py-2 transition hover:bg-white hover:text-orange-500"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {lastAddedItem && (
        <div className="pointer-events-none fixed inset-x-4 top-24 z-[60] mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:left-auto">
          <div className="rounded-2xl border border-green-200 bg-white px-4 py-3 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Added to cart</p>
                <p className="truncate text-sm text-gray-600">{lastAddedItem.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
                  {operationLabels[lastAddedItem.operationType]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
