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
      setLoading(true); // Start loading when auth state changes
      setUser(newUser);
      
      if (newUser) {
        try {
          const idToken = await newUser.getIdToken();
          // Set session cookie
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          // After session is set, if on a public page, redirect to home
          if (pathname === '/login' || pathname === '/signup') {
            router.push('/');
          }

        } catch (error) {
            console.error("Error setting session cookie:", error);
            // Handle error case, maybe sign out user
             await fetch('/api/auth/logout', { method: 'POST' });
        }
      } else {
        // User is logged out, clear session cookie
        await fetch('/api/auth/logout', { method: 'POST' });
        // If on a protected page, redirect to login
        if (pathname !== '/login' && pathname !== '/signup') {
            router.push('/login');
        }
      }
      setLoading(false); // Stop loading after all logic is done
    });

    return () => unsubscribe();
  // We add router and pathname to dependencies to ensure redirects are handled correctly on change
  }, [router, pathname]);


  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
