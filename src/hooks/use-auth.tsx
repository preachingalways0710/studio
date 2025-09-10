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
      
      const isAuthPage = pathname === '/login' || pathname === '/signup';

      if (newUser) {
        // Only create session and redirect if user is on an auth page
        if (isAuthPage) {
            try {
              const idToken = await newUser.getIdToken();
              await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
              });
              // A hard refresh is more reliable to trigger middleware after cookie is set.
              window.location.href = '/';
            } catch (error) {
                console.error("Error setting session cookie:", error);
                await auth.signOut();
                await fetch('/api/auth/logout', { method: 'POST' });
            }
        }
      } else {
        // If the user is logged out, ensure the session is cleared.
        await fetch('/api/auth/logout', { method: 'POST' });
        // If they are not on an auth page, redirect them to login.
        if (!isAuthPage) {
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