import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from './CartContext';
import { getCategories, seedProducts } from '../data/products';
import { normalizeCurrencyString } from '../utils/currency';

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
    const savedProducts = localStorage.getItem(PRODUCTS_KEY);
    const savedBlog = localStorage.getItem(BLOG_KEY);
    const savedOrders = localStorage.getItem(ORDERS_KEY);
    const savedQuotes = localStorage.getItem(QUOTES_KEY);
    if (savedProducts) setProducts(JSON.parse(savedProducts).map(normalizeProduct));
    if (savedBlog) {
      setBlogPosts(
        JSON.parse(savedBlog).filter((post: BlogPost) => post.content !== 'Full blog content here...'),
      );
    }
    if (savedOrders) {
      setOrders(
        JSON.parse(savedOrders)
          .filter((order: OrderRecord) => !LEGACY_ORDER_IDS.has(order.id))
          .map(normalizeOrder),
      );
    }
    if (savedQuotes) setQuoteRequests(JSON.parse(savedQuotes));
  }, []);

  useEffect(() => { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(BLOG_KEY, JSON.stringify(blogPosts)); }, [blogPosts]);
  useEffect(() => { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(QUOTES_KEY, JSON.stringify(quoteRequests)); }, [quoteRequests]);

  const value = useMemo<AppDataContextType>(() => ({
    products,
    categories: getCategories(products),
    blogPosts,
    orders,
    quoteRequests,
    addProduct: (product) => setProducts((prev) => [...prev, normalizeProduct(product)]),
    updateProduct: (productId, product) => setProducts((prev) => prev.map((item) => item.id === productId ? normalizeProduct({ ...item, ...product }) : item)),
    deleteProduct: (productId) => setProducts((prev) => prev.filter((item) => item.id !== productId)),
    addBlogPost: (post) => setBlogPosts((prev) => [post, ...prev]),
    updateBlogPost: (postId, post) => setBlogPosts((prev) => prev.map((item) => item.id === postId ? { ...item, ...post } : item)),
    deleteBlogPost: (postId) => setBlogPosts((prev) => prev.filter((item) => item.id !== postId)),
    addOrder: (order) => setOrders((prev) => [normalizeOrder(order), ...prev]),
    updateOrderStatus: (orderId, status) => setOrders((prev) => prev.map((item) => item.id === orderId ? { ...item, status } : item)),
    addQuoteRequest: (request) => setQuoteRequests((prev) => [request, ...prev]),
    updateQuoteStatus: (quoteId, status) => setQuoteRequests((prev) => prev.map((item) => item.id === quoteId ? { ...item, status } : item)),
  }), [blogPosts, orders, products, quoteRequests]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
}
