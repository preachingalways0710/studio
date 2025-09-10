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
        // Only create session and redirect if user is on an auth page and has just logged in.
        // The middleware will handle redirecting already-logged-in users.
        if (isAuthPage) {
            try {
              const idToken = await newUser.getIdToken();
              await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
              });
              // The middleware will handle the redirect on the next navigation or refresh.
              // A soft router refresh is better than a hard page load.
              router.push('/');
            } catch (error) {
                console.error("Error setting session cookie:", error);
                // If session creation fails, log the user out of firebase client-side
                // to prevent an inconsistent state.
                await auth.signOut();
            }
        }
      } else {
        // User is logged out. Ensure the session cookie is cleared.
        await fetch('/api/auth/logout', { method: 'POST' });
        // If they are not on an auth page, redirect them to login.
        if (!isAuthPage) {
            router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router]);


  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);