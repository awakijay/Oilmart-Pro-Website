import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminPlaceholder } from './pages/admin/AdminPlaceholder';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'products', Component: Products },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'profile', Component: Profile },
    ],
  },
  {
    path: '/admin',
    Component: AdminLogin,
  },
  {
    path: '/admin/dashboard',
    Component: AdminDashboard,
    children: [
      { index: true, Component: AdminOverview },
      { path: 'products', Component: AdminProducts },
      { path: 'orders', Component: AdminOrders },
      { path: 'blog', Component: AdminBlog },
      {
        path: 'customers',
        element: <AdminPlaceholder title="Customers" description="Manage customer accounts and information" />,
      },
      {
        path: 'analytics',
        element: <AdminPlaceholder title="Analytics" description="View detailed analytics and reports" />,
      },
    ],
  },
]);