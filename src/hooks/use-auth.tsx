'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firestore'; // Corrected import path

// Mock user object for a non-authenticated setup
const ANONYMOUS_USER = {
  uid: 'shared-user-id',
  email: 'shared@example.com',
  displayName: 'Shared User',
  // Add any other user properties your app might use
} as User;

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(ANONYMOUS_USER);
  const [loading, setLoading] = useState(false); // Set to false as we are not fetching auth state

  // No-op useEffect, since we are not listening for auth changes.
  useEffect(() => {
    // You could potentially load some app-wide settings here if needed
  }, []);


  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
