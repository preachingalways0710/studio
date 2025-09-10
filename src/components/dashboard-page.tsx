'use client';

import { Dashboard } from '@/components/dashboard';
import { useState, useEffect } from 'react';
import type { Student, HelperAttendance } from '@/lib/types';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth as getFirebaseAuth, onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';

interface DashboardPageProps {
  initialStudents: Student[];
  initialHelperAttendance: HelperAttendance | null;
}

export function DashboardPage({ initialStudents, initialHelperAttendance }: DashboardPageProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [helperAttendance, setHelperAttendance] = useState<HelperAttendance | null>(initialHelperAttendance);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // The `initialLoading` state is no longer needed because the data is provided by the server component.
  // We only need to wait for the authentication to be confirmed.

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 animate-pulse text-primary"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallback in case the hook-based redirection is slow.
  if (!user) {
    return null;
  }
  
  return <Dashboard initialStudents={students} setStudents={setStudents} initialHelperAttendance={helperAttendance} />;
}
