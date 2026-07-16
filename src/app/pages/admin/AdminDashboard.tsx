import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Users, BarChart3, FileText, Home, MessageCircle, Truck, Settings } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { useChat } from '../../context/ChatContext';
import { apiRequest } from '../../utils/api';
import { clearStoredAdminToken, fetchAdminMe, getStoredAdminToken } from '../../utils/adminAuth';

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadForAdmin } = useChat();

  useEffect(() => {
    let isActive = true;

    const validateAdmin = async () => {
      try {
        await fetchAdminMe();
      } catch {
        if (!isActive) return;
        clearStoredAdminToken();
        navigate('/admin');
      }
    };

    void validateAdmin();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiRequest<{ success: boolean }>('/admin/logout', {
        method: 'POST',
        auth: true,
        token: getStoredAdminToken(),
      });
    } catch {
      // Continue local cleanup if the admin session is already invalid.
    } finally {
      clearStoredAdminToken();
      navigate('/admin');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/dashboard/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/dashboard/orders' },
    { icon: Truck, label: 'Tracker', path: '/admin/dashboard/tracker' },
    { icon: MessageCircle, label: 'Chats', path: '/admin/dashboard/chats' },
    { icon: Users, label: 'Customers', path: '/admin/dashboard/customers' },
    { icon: FileText, label: 'Blog Posts', path: '/admin/dashboard/blog' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/dashboard/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/dashboard/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar */}
      <div className="bg-gray-900 text-white lg:flex lg:w-64 lg:flex-col">
        <div className="p-4 sm:p-6">
          <div className="mb-6 flex items-center gap-2 lg:mb-8">
            <BrandLogo padded imageClassName="h-7" />
            {/* <div>
              <div className="font-bold">Oil Mart Pro</div>
              <div className="text-xs text-gray-400">Admin Panel</div>
            </div> */}
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive(item.path)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate">{item.label}</span>
                {item.label === 'Chats' && unreadForAdmin > 0 && (
                  <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-orange-500">
                    {unreadForAdmin}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-800 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition hover:bg-gray-800"
            >
              <Home className="w-5 h-5" />
              <span>Back to Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition hover:bg-gray-800"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <Link
        to="/admin/dashboard/chats"
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl transition hover:bg-orange-600 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        aria-label="Open admin chats"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadForAdmin > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-orange-500">
            {unreadForAdmin}
          </span>
        )}
      </Link>
    </div>
  );
}
