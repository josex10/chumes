"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";

export type CartLineType =
  | typeof QUOTE_LINE_TYPE.RENTAL
  | typeof QUOTE_LINE_TYPE.SALE;

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  lineType: CartLineType;
  quantity: number;
  unitPrice: number;
  rentalAvailable: boolean;
  saleAvailable: boolean;
  imageUrl?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  addItems: (
    items: Array<Omit<CartItem, "quantity"> & { quantity?: number }>,
  ) => void;
  updateQuantity: (
    productId: string,
    lineType: CartLineType,
    quantity: number,
  ) => void;
  removeItem: (productId: string, lineType: CartLineType) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "chumes-storefront-cart";

const CartContext = createContext<CartContextValue | null>(null);

function mergeCartItem(
  current: CartItem[],
  item: Omit<CartItem, "quantity"> & { quantity?: number },
): CartItem[] {
  const existingIndex = current.findIndex(
    (entry) =>
      entry.productId === item.productId && entry.lineType === item.lineType,
  );

  if (existingIndex === -1) {
    return [
      ...current,
      {
        ...item,
        quantity: item.quantity ?? 1,
      },
    ];
  }

  return current.map((entry, index) =>
    index === existingIndex
      ? {
          ...entry,
          quantity: entry.quantity + (item.quantity ?? 1),
        }
      : entry,
  );
}

function readStoredItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((current) => mergeCartItem(current, item));
    },
    [],
  );

  const addItems = useCallback(
    (incoming: Array<Omit<CartItem, "quantity"> & { quantity?: number }>) => {
      setItems((current) =>
        incoming.reduce((next, item) => mergeCartItem(next, item), current),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, lineType: CartLineType, quantity: number) => {
      setItems((current) => {
        if (quantity <= 0) {
          return current.filter(
            (entry) =>
              !(entry.productId === productId && entry.lineType === lineType),
          );
        }

        return current.map((entry) =>
          entry.productId === productId && entry.lineType === lineType
            ? { ...entry, quantity }
            : entry,
        );
      });
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string, lineType: CartLineType) => {
      setItems((current) =>
        current.filter(
          (entry) =>
            !(entry.productId === productId && entry.lineType === lineType),
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      addItem,
      addItems,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, addItems, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
