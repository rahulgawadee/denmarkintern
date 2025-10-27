'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './index';
import { setCredentials } from './slices/authSlice';

export default function StoreProvider({ children }) {
  const storeRef = useRef();
  
  if (!storeRef.current) {
    storeRef.current = makeStore();
    
    // Load auth state from localStorage on initialization
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('auth');
      if (savedAuth) {
        try {
          const { user, token } = JSON.parse(savedAuth);
          storeRef.current.dispatch(setCredentials({ user, token }));
        } catch (error) {
          console.error('Error loading auth from localStorage:', error);
          localStorage.removeItem('auth');
        }
      }
    }
  }

  useEffect(() => {
    // Subscribe to store changes and save auth to localStorage
    const unsubscribe = storeRef.current.subscribe(() => {
      const state = storeRef.current.getState();
      const { user, token, isAuthenticated } = state.auth;
      
      if (isAuthenticated && user && token) {
        localStorage.setItem('auth', JSON.stringify({ user, token }));
      } else {
        localStorage.removeItem('auth');
      }
    });

    return () => unsubscribe();
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
