import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  quantity: number;
  operationType: OperationType;
}

interface CartContextType {
  cart: CartItem[];
  lastAddedItem: { name: string; operationType: OperationType; timestamp: number } | null;
  addToCart: (product: Product, operationType?: OperationType) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateOperationType: (productId: string, operationType: OperationType) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearLastAddedItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<{ name: string; operationType: OperationType; timestamp: number } | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('oilmartpro_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('oilmartpro_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, operationType: OperationType = 'sell') => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, operationType }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, operationType }];
    });
    setLastAddedItem({
      name: product.name,
      operationType,
      timestamp: Date.now(),
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateOperationType = (productId: string, operationType: OperationType) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, operationType } : item
      )
    );
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
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
