import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from './CartContext';
import { getCategories, seedProducts } from '../data/products';
import { normalizeCurrencyString } from '../utils/currency';
import { apiRequest, getStoredAuthToken } from '../utils/api';
import { getStoredAdminToken } from '../utils/adminAuth';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
  category: string;
}

export interface OrderRecord {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: string;
  status: 'Pending' | 'Approved' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';
  date: string;
  operationType: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  intent: 'quote' | 'sales' | 'support' | 'question';
  status: 'Pending' | 'Approved' | 'Accepted' | 'Rejected';
  date: string;
}

interface AppDataContextType {
  products: Product[];
  categories: ReturnType<typeof getCategories>;
  blogPosts: BlogPost[];
  orders: OrderRecord[];
  quoteRequests: QuoteRequest[];
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, product: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (postId: string, post: Partial<BlogPost>) => void;
  deleteBlogPost: (postId: string) => void;
  addOrder: (order: OrderRecord) => void;
  updateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  addQuoteRequest: (request: QuoteRequest) => void;
  updateQuoteStatus: (quoteId: string, status: QuoteRequest['status']) => void;
}

const seedBlogPosts: BlogPost[] = [];

const seedOrders: OrderRecord[] = [];

const PRODUCTS_KEY = 'oilmartpro_products';
const BLOG_KEY = 'oilmartpro_blog_posts';
const ORDERS_KEY = 'oilmartpro_orders';
const QUOTES_KEY = 'oilmartpro_quote_requests';
const LEGACY_ORDER_IDS = new Set(['ORD-001', 'ORD-002', 'ORD-003']);

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

function normalizeProduct(product: Product): Product {
  const category = product.category === 'Vessel Rental' || product.category === 'Vessel Sales'
    ? 'Vessels'
    : product.category;

  return {
    ...product,
    category,
    price: normalizeCurrencyString(product.price),
  };
}

function normalizeOrder(order: OrderRecord): OrderRecord {
  return {
    ...order,
    amount: normalizeCurrencyString(order.amount),
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(seedBlogPosts);
  const [orders, setOrders] = useState<OrderRecord[]>(seedOrders);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);

  useEffect(() => {
    let isActive = true;

    const migrateLegacyCollection = async <T extends { id: string }>(
      storageKey: string,
      route: string,
      fallback: T[],
    ) => {
      const raw = localStorage.getItem(storageKey);
      const items: T[] = raw ? JSON.parse(raw) : fallback;

      if (!items.length) return;

      for (const item of items) {
        try {
          await apiRequest(route, { method: 'POST', body: item });
        } catch {
          // Ignore duplicates during migration.
        }
      }
    };

    const hydrate = async () => {
      try {
        const adminToken = getStoredAdminToken();
        const customerToken = getStoredAuthToken();
        const [fetchedProducts, fetchedBlogPosts, fetchedOrders, fetchedQuotes] = await Promise.all([
          apiRequest<Product[]>('/products'),
          apiRequest<BlogPost[]>('/blog-posts'),
          adminToken
            ? apiRequest<OrderRecord[]>('/orders', { auth: true, token: adminToken })
            : customerToken
              ? apiRequest<OrderRecord[]>('/orders?mine=true', { auth: true, token: customerToken })
              : Promise.resolve([]),
          adminToken
            ? apiRequest<QuoteRequest[]>('/quote-requests', { auth: true, token: adminToken })
            : Promise.resolve([]),
        ]);

        if (!fetchedProducts.length) {
          await migrateLegacyCollection(PRODUCTS_KEY, '/products', seedProducts);
        }
        if (!fetchedBlogPosts.length) {
          await migrateLegacyCollection(BLOG_KEY, '/blog-posts', []);
        }
        if (!fetchedOrders.length) {
          await migrateLegacyCollection(ORDERS_KEY, '/orders', []);
        }
        if (!fetchedQuotes.length) {
          await migrateLegacyCollection(QUOTES_KEY, '/quote-requests', []);
        }

        const [nextProducts, nextBlogPosts, nextOrders, nextQuotes] = await Promise.all([
          apiRequest<Product[]>('/products'),
          apiRequest<BlogPost[]>('/blog-posts'),
          apiRequest<OrderRecord[]>('/orders'),
          apiRequest<QuoteRequest[]>('/quote-requests'),
        ]);

        if (!isActive) return;

        setProducts((nextProducts.length ? nextProducts : seedProducts).map(normalizeProduct));
        setBlogPosts(
          nextBlogPosts.filter((post) => post.content !== 'Full blog content here...'),
        );
        setOrders(
          nextOrders
            .filter((order) => !LEGACY_ORDER_IDS.has(order.id))
            .map(normalizeOrder),
        );
        setQuoteRequests(nextQuotes);
      } catch {
        if (!isActive) return;
        setProducts(seedProducts);
      } finally {
        localStorage.removeItem(PRODUCTS_KEY);
        localStorage.removeItem(BLOG_KEY);
        localStorage.removeItem(ORDERS_KEY);
        localStorage.removeItem(QUOTES_KEY);
      }
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo<AppDataContextType>(() => ({
    products,
    categories: getCategories(products),
    blogPosts,
    orders,
    quoteRequests,
    addProduct: (product) => {
      const normalized = normalizeProduct(product);
      setProducts((prev) => [...prev, normalized]);
      void apiRequest<Product>('/products', { method: 'POST', body: normalized, auth: true, token: getStoredAdminToken() });
    },
    updateProduct: (productId, product) => {
      setProducts((prev) => prev.map((item) => item.id === productId ? normalizeProduct({ ...item, ...product }) : item));
      void apiRequest<Product>(`/products/${productId}`, { method: 'PATCH', body: product, auth: true, token: getStoredAdminToken() });
    },
    deleteProduct: (productId) => {
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      void apiRequest<{ success: boolean }>(`/products/${productId}`, { method: 'DELETE', auth: true, token: getStoredAdminToken() });
    },
    addBlogPost: (post) => {
      setBlogPosts((prev) => [post, ...prev]);
      void apiRequest<BlogPost>('/blog-posts', { method: 'POST', body: post, auth: true, token: getStoredAdminToken() });
    },
    updateBlogPost: (postId, post) => {
      setBlogPosts((prev) => prev.map((item) => item.id === postId ? { ...item, ...post } : item));
      void apiRequest<BlogPost>(`/blog-posts/${postId}`, { method: 'PATCH', body: post, auth: true, token: getStoredAdminToken() });
    },
    deleteBlogPost: (postId) => {
      setBlogPosts((prev) => prev.filter((item) => item.id !== postId));
      void apiRequest<{ success: boolean }>(`/blog-posts/${postId}`, { method: 'DELETE', auth: true, token: getStoredAdminToken() });
    },
    addOrder: (order) => {
      const normalized = normalizeOrder(order);
      setOrders((prev) => [normalized, ...prev]);
      void apiRequest<OrderRecord>('/orders', { method: 'POST', body: normalized, auth: true });
    },
    updateOrderStatus: (orderId, status) => {
      setOrders((prev) => prev.map((item) => item.id === orderId ? { ...item, status } : item));
      void apiRequest<OrderRecord>(`/orders/${orderId}`, { method: 'PATCH', body: { status }, auth: true, token: getStoredAdminToken() });
    },
    addQuoteRequest: (request) => {
      setQuoteRequests((prev) => [request, ...prev]);
      void apiRequest<QuoteRequest>('/quote-requests', { method: 'POST', body: request });
    },
    updateQuoteStatus: (quoteId, status) => {
      setQuoteRequests((prev) => prev.map((item) => item.id === quoteId ? { ...item, status } : item));
      void apiRequest<QuoteRequest>(`/quote-requests/${quoteId}`, { method: 'PATCH', body: { status }, auth: true, token: getStoredAdminToken() });
    },
  }), [blogPosts, orders, products, quoteRequests]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
}
