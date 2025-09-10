'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (newUser) => {
      setLoading(true);
      setUser(newUser);
      
      if (newUser) {
        try {
          const idToken = await newUser.getIdToken();
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          // THE FIX: Remove client-side redirect. The middleware will handle this.
          // After the session is set, a refresh or navigation will trigger the
          // middleware, which will redirect from /login if authenticated.
          // For a smoother UX, we can force a reload to trigger middleware.
          if (pathname === '/login' || pathname === '/signup') {
            router.refresh(); 
          }
        } catch (error) {
            console.error("Error setting session cookie:", error);
            await fetch('/api/auth/logout', { method: 'POST' });
        }
      } else {
        await fetch('/api/auth/logout', { method: 'POST' });
        if (pathname !== '/login' && pathname !== '/signup') {
            router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);


  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);