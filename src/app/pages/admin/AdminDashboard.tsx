import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Users, BarChart3, FileText, Home } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    navigate('/admin');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/dashboard/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/dashboard/orders' },
    { icon: Users, label: 'Customers', path: '/admin/dashboard/customers' },
    { icon: FileText, label: 'Blog Posts', path: '/admin/dashboard/blog' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/dashboard/analytics' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">OMP</span>
            </div>
            <div>
              <div className="font-bold">Oil Mart Pro</div>
              <div className="text-xs text-gray-400">Admin Panel</div>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition w-full"
          >
            <Home className="w-5 h-5" />
            <span>Back to Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}