import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CheckCircle2, HandCoins, ShoppingCart, Truck, X } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
  orders: string;
  description?: string;
  specifications?: { [key: string]: string };
}

export type OperationType = 'sell' | 'lease' | 'buy_for_me';

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  operationType: OperationType;
}

interface CartContextType {
  cart: CartItem[];
  lastAddedItem: { name: string; operationType: OperationType; timestamp: number } | null;
  addToCart: (product: Product, operationType?: OperationType, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateOperationType: (cartItemId: string, operationType: OperationType) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearLastAddedItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const operationOptions = [
  {
    value: 'sell' as const,
    label: 'SELLS',
    title: 'Buy this equipment',
    description: 'Use this when you want ownership transfer and standard sales processing.',
    icon: ShoppingCart,
    activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    iconClass: 'bg-emerald-100 text-emerald-600',
  },
  {
    value: 'lease' as const,
    label: 'LEASE',
    title: 'Lease for a project',
    description: 'Use this when you need temporary access, rental terms, or project deployment.',
    icon: Truck,
    activeClass: 'border-blue-500 bg-blue-50 text-blue-700',
    iconClass: 'bg-blue-100 text-blue-600',
  },
  {
    value: 'buy_for_me' as const,
    label: 'BUY FOR ME',
    title: 'Let us procure it',
    description: 'Use this when you want Oil Mart Pro to source, negotiate, and buy on your behalf.',
    icon: HandCoins,
    activeClass: 'border-orange-500 bg-orange-50 text-orange-700',
    iconClass: 'bg-orange-100 text-orange-600',
  },
];

const isOperationType = (value: unknown): value is OperationType =>
  value === 'sell' || value === 'lease' || value === 'buy_for_me';

const getCartItemId = (productId: string, operationType: OperationType) => `${productId}-${operationType}`;

const getCartLineId = (item: Pick<CartItem, 'id' | 'operationType'> & { cartItemId?: string }) =>
  item.cartItemId ?? getCartItemId(item.id, item.operationType);

const getCartQuantity = (quantity?: number) => Math.max(1, Math.floor(Number(quantity) || 1));

const normalizeCartItems = (items: CartItem[]) =>
  items.reduce<CartItem[]>((normalizedItems, item) => {
    const operationType = isOperationType(item.operationType) ? item.operationType : 'sell';
    const cartItemId = item.cartItemId ?? getCartItemId(item.id, operationType);
    const quantity = getCartQuantity(item.quantity);
    const existingIndex = normalizedItems.findIndex((existingItem) => getCartLineId(existingItem) === cartItemId);

    if (existingIndex >= 0) {
      return normalizedItems.map((existingItem, index) =>
        index === existingIndex
          ? { ...existingItem, quantity: existingItem.quantity + quantity }
          : existingItem
      );
    }

    return [
      ...normalizedItems,
      {
        ...item,
        cartItemId,
        operationType,
        quantity,
      },
    ];
  }, []);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<{ name: string; operationType: OperationType; timestamp: number } | null>(null);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [selectedOperation, setSelectedOperation] = useState<OperationType | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('oilmartpro_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (Array.isArray(parsedCart)) {
        setCart(normalizeCartItems(parsedCart));
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('oilmartpro_cart', JSON.stringify(cart));
  }, [cart]);

  const commitAddToCart = (product: Product, operationType: OperationType, quantity = 1) => {
    const cartItemId = getCartItemId(product.id, operationType);
    const quantityToAdd = getCartQuantity(quantity);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => getCartLineId(item) === cartItemId);
      if (existingItem) {
        return prevCart.map((item) =>
          getCartLineId(item) === cartItemId
            ? { ...item, cartItemId, quantity: item.quantity + quantityToAdd, operationType }
            : item
        );
      }
      return [...prevCart, { ...product, cartItemId, quantity: quantityToAdd, operationType }];
    });
    setLastAddedItem({
      name: product.name,
      operationType,
      timestamp: Date.now(),
    });
  };

  const addToCart = (product: Product, operationType?: OperationType, quantity = 1) => {
    setPendingProduct(product);
    setPendingQuantity(getCartQuantity(quantity));
    setSelectedOperation(operationType ?? null);
  };

  const closeServiceSelector = () => {
    setPendingProduct(null);
    setPendingQuantity(1);
    setSelectedOperation(null);
  };

  const confirmServiceSelection = () => {
    if (!pendingProduct || !selectedOperation) return;

    commitAddToCart(pendingProduct, selectedOperation, pendingQuantity);
    closeServiceSelector();
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => getCartLineId(item) !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        getCartLineId(item) === cartItemId ? { ...item, quantity: getCartQuantity(quantity) } : item
      )
    );
  };

  const updateOperationType = (cartItemId: string, operationType: OperationType) => {
    setCart((prevCart) => {
      const currentItem = prevCart.find((item) => getCartLineId(item) === cartItemId);
      if (!currentItem) return prevCart;

      const nextCartItemId = getCartItemId(currentItem.id, operationType);
      if (nextCartItemId === cartItemId) return prevCart;

      const targetItem = prevCart.find((item) => getCartLineId(item) === nextCartItemId);
      if (targetItem) {
        return prevCart.reduce<CartItem[]>((nextCart, item) => {
          const itemLineId = getCartLineId(item);

          if (itemLineId === cartItemId) {
            return nextCart;
          }

          if (itemLineId === nextCartItemId) {
            return [
              ...nextCart,
              {
                ...item,
                cartItemId: nextCartItemId,
                operationType,
                quantity: item.quantity + currentItem.quantity,
              },
            ];
          }

          return [...nextCart, item];
        }, []);
      }

      return prevCart.map((item) =>
        getCartLineId(item) === cartItemId
          ? { ...item, cartItemId: nextCartItemId, operationType }
          : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearLastAddedItem = () => {
    setLastAddedItem(null);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      // Extract numeric value from price string if it exists
      const priceMatch = item.price.match(/[\d,]+/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <>
      <CartContext.Provider
        value={{
          cart,
          lastAddedItem,
          addToCart,
          removeFromCart,
          updateQuantity,
          updateOperationType,
          clearCart,
          getTotalItems,
          getTotalPrice,
          clearLastAddedItem,
        }}
      >
        {children}
      </CartContext.Provider>

      {pendingProduct && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-service-title"
          onClick={closeServiceSelector}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 sm:p-6">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Choose service</p>
                <h2 id="cart-service-title" className="mt-2 text-2xl font-bold text-gray-900">How do you need this item?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Select the service path for <span className="font-semibold text-gray-900">{pendingProduct.name}</span> before adding it to your cart.
                </p>
              </div>
              <button
                type="button"
                onClick={closeServiceSelector}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
                aria-label="Close service selector"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-3">
                <img
                  src={pendingProduct.image}
                  alt={pendingProduct.name}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{pendingProduct.name}</p>
                  <p className="mt-1 text-sm text-gray-600">{pendingProduct.price}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Quantity: {pendingQuantity}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
              {operationOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOperation === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedOperation(option.value)}
                    aria-pressed={isSelected}
                    className={`relative rounded-xl border-2 p-4 text-left transition ${
                      isSelected
                        ? option.activeClass
                        : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? option.iconClass : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-current" />}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em]">{option.label}</div>
                    <div className="mt-2 font-semibold text-gray-900">{option.title}</div>
                    <div className="mt-2 text-sm leading-5 text-gray-600">{option.description}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={closeServiceSelector}
                className="rounded-lg border-2 border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmServiceSelection}
                disabled={!selectedOperation}
                className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {selectedOperation ? `Add ${pendingQuantity} to Cart` : 'Select a Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
