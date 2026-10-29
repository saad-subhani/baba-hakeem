'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const CART_STORAGE_KEY = 'baba-hakeem-cart';

export function mergeCartItem(items, product, quantity = 1) {
  const current = Array.isArray(items) ? items : [];
  const existing = current.find((item) => item.id === product.id);
  return existing
    ? current.map((item) => item.id === product.id ? { ...item, quantity: Number(item.quantity || 0) + quantity } : item)
    : [...current, { ...product, quantity }];
}

export function persistCartItems(items) {
  try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); } catch {}
}

export default function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [ready, setReady] = useState(false);
  const cartItemsRef = useRef(cartItems);
  const readyRef = useRef(false);
  cartItemsRef.current = cartItems;
  readyRef.current = ready;

  const updateCartItems = useCallback((update) => {
    let current = cartItemsRef.current;
    if (!readyRef.current) {
      try {
        const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
        if (Array.isArray(stored)) current = stored;
      } catch {}
    }
    const next = typeof update === 'function' ? update(current) : update;
    const safeNext = Array.isArray(next) ? next : [];
    cartItemsRef.current = safeNext;
    setCartItems(safeNext);
    persistCartItems(safeNext);
    window.dispatchEvent(new CustomEvent('bh-cart-sync', { detail: safeNext }));
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) {
        const validItems = saved.filter((item) => item && item.id && item.name && Number(item.quantity) > 0);
        cartItemsRef.current = validItems;
        setCartItems(validItems);
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const applyItems = (items) => {
      if (!Array.isArray(items)) return;
      const validItems = items.filter((item) => item && item.id && item.name && Number(item.quantity) > 0);
      if (JSON.stringify(validItems) === JSON.stringify(cartItemsRef.current)) return;
      cartItemsRef.current = validItems;
      setCartItems(validItems);
    };
    const onCartSync = (event) => applyItems(event.detail);
    const onStorage = (event) => {
      if (event.key !== CART_STORAGE_KEY) return;
      try { applyItems(JSON.parse(event.newValue || '[]')); } catch {}
    };
    window.addEventListener('bh-cart-sync', onCartSync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('bh-cart-sync', onCartSync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return [cartItems, updateCartItems, ready];
}
