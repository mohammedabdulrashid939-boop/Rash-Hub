import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartItem, Product, ProductSize } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: ProductSize['size_label'], quantity?: number) => { success: boolean; message: string };
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CART_STORAGE_KEY = 'rash_hub_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items]);

  const addToCart = (product: Product, size: ProductSize['size_label'], quantity = 1) => {
    // 1. Find size record to check stock
    const sizeRecord = product.sizes?.find((s) => s.size_label === size);
    const stockAvailable = sizeRecord ? sizeRecord.stock_quantity : 0;

    if (stockAvailable <= 0) {
      return {
        success: false,
        message: `Sorry, size ${size} is currently out of stock for this jersey.`,
      };
    }

    const existingIndex = items.findIndex(
      (item) => item.product.id === product.id && item.selected_size === size
    );

    if (existingIndex > -1) {
      const existingItem = items[existingIndex];
      const proposedQuantity = existingItem.quantity + quantity;

      if (proposedQuantity > stockAvailable) {
        return {
          success: false,
          message: `Only ${stockAvailable} item(s) in size ${size} available in stock.`,
        };
      }

      const updated = [...items];
      updated[existingIndex] = {
        ...existingItem,
        quantity: proposedQuantity,
      };
      setItems(updated);
      setIsCartOpen(true);
      return { success: true, message: `Updated quantity for ${product.name} (Size: ${size}).` };
    } else {
      if (quantity > stockAvailable) {
        return {
          success: false,
          message: `Only ${stockAvailable} item(s) in size ${size} available in stock.`,
        };
      }

      const newItem: CartItem = {
        id: `${product.id}_${size}_${Date.now()}`,
        product,
        selected_size: size,
        quantity,
        unit_price: product.selling_price,
      };
      setItems((prev) => [...prev, newItem]);
      setIsCartOpen(true);
      return { success: true, message: `Added ${product.name} (Size: ${size}) to cart.` };
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return { success: true };
    }

    const item = items.find((i) => i.id === cartItemId);
    if (!item) return { success: false, message: 'Item not found in cart' };

    const sizeRecord = item.product.sizes?.find((s) => s.size_label === item.selected_size);
    const stockAvailable = sizeRecord ? sizeRecord.stock_quantity : 999;

    if (newQuantity > stockAvailable) {
      return {
        success: false,
        message: `Cannot exceed available stock of ${stockAvailable} for size ${item.selected_size}.`,
      };
    }

    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQuantity } : i))
    );
    return { success: true };
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  }, [items]);

  // Delivery inside Abofour is flat or free promotional
  const totalAmount = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
