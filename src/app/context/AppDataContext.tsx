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
  trackingLocation: string;
  trackingUpdate: string;
  estimatedDelivery: string;
  trackingUpdatedAt: string;
}

export interface OrderedProductItem {
  productId: string;
  quantity: number;
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
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addBlogPost: (post: BlogPost) => Promise<void>;
  updateBlogPost: (postId: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (postId: string) => Promise<void>;
  addOrder: (order: OrderRecord, productItems?: OrderedProductItem[]) => void;
  updateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  updateOrderTracking: (orderId: string, tracking: Partial<Pick<OrderRecord, 'trackingLocation' | 'trackingUpdate' | 'estimatedDelivery' | 'trackingUpdatedAt'>>) => Promise<void>;
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
    trackingLocation: order.trackingLocation ?? '',
    trackingUpdate: order.trackingUpdate ?? '',
    estimatedDelivery: order.estimatedDelivery ?? '',
    trackingUpdatedAt: order.trackingUpdatedAt ?? '',
  };
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readStoredCollection<T>(storageKey: string): T[] {
  if (!canUseLocalStorage()) return [];

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCollection<T>(storageKey: string, items: T[]) {
  if (!canUseLocalStorage()) return;

  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // Storage can be unavailable or full; the API remains the source of truth.
  }
}

function mergeMissingById<T extends { id: string }>(primary: T[], fallback: T[]) {
  const seenIds = new Set(primary.map((item) => item.id));
  const missingItems = fallback.filter((item) => !seenIds.has(item.id));

  return [...primary, ...missingItems];
}

function getMissingById<T extends { id: string }>(source: T[], existing: T[]) {
  const existingIds = new Set(existing.map((item) => item.id));

  return source.filter((item) => !existingIds.has(item.id));
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  const exists = items.some((current) => current.id === item.id);

  return exists
    ? items.map((current) => current.id === item.id ? item : current)
    : [...items, item];
}

function normalizeOrderedProductItems(items: OrderedProductItem[] = []) {
  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    const productId = item.productId?.trim();
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

    if (!productId) continue;

    quantitiesByProductId.set(productId, (quantitiesByProductId.get(productId) ?? 0) + quantity);
  }

  return Array.from(quantitiesByProductId, ([productId, quantity]) => ({ productId, quantity }));
}

function incrementOrderLabel(label: string, quantity: number) {
  const currentCount = Number(label.match(/\d+/)?.[0] ?? 0);
  const suffix = label.trim().endsWith('+') ? '+' : '';

  return `${currentCount + quantity}${suffix}`;
}

function incrementProductOrderCounts(products: Product[], orderedItems: OrderedProductItem[]) {
  if (!orderedItems.length) return products;

  const quantitiesByProductId = new Map(orderedItems.map((item) => [item.productId, item.quantity]));

  return products.map((product) => {
    const quantity = quantitiesByProductId.get(product.id);

    if (!quantity) return product;

    return {
      ...product,
      orders: incrementOrderLabel(product.orders, quantity),
    };
  });
}

function requireAdminToken() {
  const token = getStoredAdminToken();

  if (!token) {
    throw new Error('Your admin session has expired. Sign in again before saving changes.');
  }

  return token;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(seedBlogPosts);
  const [orders, setOrders] = useState<OrderRecord[]>(seedOrders);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);

  useEffect(() => {
    let isActive = true;

    const migrateCollection = async <T extends { id: string }>(
      route: string,
      items: T[],
      token: string,
    ) => {
      if (!items.length) return;

      for (const item of items) {
        try {
          await apiRequest(route, { method: 'POST', body: item, auth: true, token });
        } catch {
          // Ignore duplicates during migration.
        }
      }
    };

    const hydrate = async () => {
      try {
        const adminToken = getStoredAdminToken();
        const customerToken = getStoredAuthToken();

        const storedProducts = readStoredCollection<Product>(PRODUCTS_KEY).map(normalizeProduct);
        const storedBlogPosts = readStoredCollection<BlogPost>(BLOG_KEY);
        const storedOrders = readStoredCollection<OrderRecord>(ORDERS_KEY).map(normalizeOrder);
        const storedQuotes = readStoredCollection<QuoteRequest>(QUOTES_KEY);

        const [productsResult, blogPostsResult, ordersResult, quotesResult] = await Promise.allSettled([
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

        let fetchedProducts = productsResult.status === 'fulfilled'
          ? productsResult.value.map(normalizeProduct)
          : null;
        let fetchedBlogPosts = blogPostsResult.status === 'fulfilled'
          ? blogPostsResult.value.filter((post) => post.content !== 'Full blog content here...')
          : null;
        const fetchedOrders = ordersResult.status === 'fulfilled'
          ? ordersResult.value.map(normalizeOrder)
          : null;
        const fetchedQuotes = quotesResult.status === 'fulfilled'
          ? quotesResult.value
          : null;

        if (adminToken && fetchedProducts !== null) {
          const productsToMigrate = fetchedProducts.length
            ? getMissingById(storedProducts, fetchedProducts)
            : (storedProducts.length ? storedProducts : seedProducts).map(normalizeProduct);

          if (productsToMigrate.length) {
            await migrateCollection('/products', productsToMigrate, adminToken);
            try {
              fetchedProducts = (await apiRequest<Product[]>('/products')).map(normalizeProduct);
            } catch {
              // Keep the best already available product collection.
            }
          }
        }

        if (adminToken && fetchedBlogPosts !== null && storedBlogPosts.length) {
          const blogPostsToMigrate = getMissingById(storedBlogPosts, fetchedBlogPosts);

          if (blogPostsToMigrate.length) {
            await migrateCollection('/blog-posts', blogPostsToMigrate, adminToken);
            try {
              fetchedBlogPosts = (await apiRequest<BlogPost[]>('/blog-posts'))
                .filter((post) => post.content !== 'Full blog content here...');
            } catch {
              // Keep the best already available blog collection.
            }
          }
        }

        if (!isActive) return;

        const nextProducts = fetchedProducts === null
          ? (storedProducts.length ? storedProducts : seedProducts)
          : fetchedProducts.length
            ? mergeMissingById(fetchedProducts, storedProducts)
            : (storedProducts.length ? storedProducts : seedProducts);
        const nextBlogPosts = fetchedBlogPosts === null
          ? storedBlogPosts
          : fetchedBlogPosts.length
            ? mergeMissingById(fetchedBlogPosts, storedBlogPosts)
            : storedBlogPosts;
        const nextOrders = (fetchedOrders ?? storedOrders)
          .filter((order) => !LEGACY_ORDER_IDS.has(order.id))
          .map(normalizeOrder);
        const nextQuotes = fetchedQuotes ?? storedQuotes;

        setProducts(nextProducts.map(normalizeProduct));
        setBlogPosts(nextBlogPosts);
        setOrders(nextOrders);
        setQuoteRequests(nextQuotes);

        writeStoredCollection(PRODUCTS_KEY, nextProducts.map(normalizeProduct));
        writeStoredCollection(BLOG_KEY, nextBlogPosts);
        writeStoredCollection(ORDERS_KEY, nextOrders);
        writeStoredCollection(QUOTES_KEY, nextQuotes);
      } catch {
        if (!isActive) return;
        const storedProducts = readStoredCollection<Product>(PRODUCTS_KEY).map(normalizeProduct);
        setProducts(storedProducts.length ? storedProducts : seedProducts);
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
    addProduct: async (product) => {
      const token = requireAdminToken();
      const normalized = normalizeProduct(product);
      const savedProduct = normalizeProduct(
        await apiRequest<Product>('/products', { method: 'POST', body: normalized, auth: true, token }),
      );

      setProducts((prev) => {
        const nextProducts = upsertById(prev, savedProduct).map(normalizeProduct);
        writeStoredCollection(PRODUCTS_KEY, nextProducts);

        return nextProducts;
      });
    },
    updateProduct: async (productId, product) => {
      const token = requireAdminToken();
      const patch = product.price ? { ...product, price: normalizeCurrencyString(product.price) } : product;
      const savedProduct = normalizeProduct(
        await apiRequest<Product>(`/products/${productId}`, { method: 'PATCH', body: patch, auth: true, token }),
      );

      setProducts((prev) => {
        const nextProducts = prev.map((item) => item.id === productId ? savedProduct : item).map(normalizeProduct);
        writeStoredCollection(PRODUCTS_KEY, nextProducts);

        return nextProducts;
      });
    },
    deleteProduct: async (productId) => {
      const token = requireAdminToken();
      await apiRequest<{ success: boolean }>(`/products/${productId}`, { method: 'DELETE', auth: true, token });

      setProducts((prev) => {
        const nextProducts = prev.filter((item) => item.id !== productId);
        writeStoredCollection(PRODUCTS_KEY, nextProducts);

        return nextProducts;
      });
    },
    addBlogPost: async (post) => {
      const token = requireAdminToken();
      const savedPost = await apiRequest<BlogPost>('/blog-posts', { method: 'POST', body: post, auth: true, token });

      setBlogPosts((prev) => {
        const nextPosts = [savedPost, ...prev.filter((item) => item.id !== savedPost.id)];
        writeStoredCollection(BLOG_KEY, nextPosts);

        return nextPosts;
      });
    },
    updateBlogPost: async (postId, post) => {
      const token = requireAdminToken();
      const savedPost = await apiRequest<BlogPost>(`/blog-posts/${postId}`, { method: 'PATCH', body: post, auth: true, token });

      setBlogPosts((prev) => {
        const nextPosts = prev.map((item) => item.id === postId ? savedPost : item);
        writeStoredCollection(BLOG_KEY, nextPosts);

        return nextPosts;
      });
    },
    deleteBlogPost: async (postId) => {
      const token = requireAdminToken();
      await apiRequest<{ success: boolean }>(`/blog-posts/${postId}`, { method: 'DELETE', auth: true, token });

      setBlogPosts((prev) => {
        const nextPosts = prev.filter((item) => item.id !== postId);
        writeStoredCollection(BLOG_KEY, nextPosts);

        return nextPosts;
      });
    },
    addOrder: (order, productItems = []) => {
      const normalized = normalizeOrder(order);
      const orderedProductItems = normalizeOrderedProductItems(productItems);

      setOrders((prev) => [normalized, ...prev]);

      if (orderedProductItems.length) {
        setProducts((prev) => {
          const nextProducts = incrementProductOrderCounts(prev, orderedProductItems).map(normalizeProduct);
          writeStoredCollection(PRODUCTS_KEY, nextProducts);

          return nextProducts;
        });
      }

      void apiRequest<OrderRecord>('/orders', {
        method: 'POST',
        body: { ...normalized, productItems: orderedProductItems },
        auth: true,
      });
    },
    updateOrderStatus: (orderId, status) => {
      setOrders((prev) => prev.map((item) => item.id === orderId ? { ...item, status } : item));
      void apiRequest<OrderRecord>(`/orders/${orderId}`, { method: 'PATCH', body: { status }, auth: true, token: getStoredAdminToken() });
    },
    updateOrderTracking: async (orderId, tracking) => {
      const token = requireAdminToken();
      const trackingUpdatedAt = tracking.trackingUpdatedAt ?? new Date().toISOString();
      const savedOrder = normalizeOrder(
        await apiRequest<OrderRecord>(`/orders/${orderId}`, {
          method: 'PATCH',
          body: { ...tracking, trackingUpdatedAt },
          auth: true,
          token,
        }),
      );

      setOrders((prev) => {
        const nextOrders = prev.map((item) => item.id === orderId ? savedOrder : item).map(normalizeOrder);
        writeStoredCollection(ORDERS_KEY, nextOrders);

        return nextOrders;
      });
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
