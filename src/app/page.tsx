'use client';

import { Dashboard } from '@/components/dashboard';
import { useState, useEffect } from 'react';
import type { Student } from '@/lib/types';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const studentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];
        setStudents(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  if (authLoading || initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // AuthProvider handles redirect
  }
  
  return <Dashboard initialStudents={students} setStudents={setStudents} />;
}
