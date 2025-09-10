'use client';

import { Dashboard } from '@/components/dashboard';
import { initialStudents } from '@/lib/students';
import { useState } from 'react';
import type { Student } from '@/lib/types';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // The AuthProvider will handle the redirect.
  }
  
  return <Dashboard initialStudents={students} setStudents={setStudents} />;
}