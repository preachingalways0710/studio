'use client';

import { Dashboard } from '@/components/dashboard';
import { useState, useEffect } from 'react';
import type { Student, HelperAttendance } from '@/lib/types';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [helperAttendance, setHelperAttendance] = useState<HelperAttendance | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Students
        const studentQuery = query(collection(db, 'students'), where('userId', '==', user.uid));
        const studentSnapshot = await getDocs(studentQuery);
        const studentData = studentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];
        setStudents(studentData);
        
        // Fetch Helper Attendance for current month
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();
        const helperDocId = `${user.uid}_${currentMonth}_${currentYear}`;
        const helperDocRef = doc(db, 'helpers', helperDocId);
        const helperDocSnap = await getDoc(helperDocRef);

        if (helperDocSnap.exists()) {
          setHelperAttendance(helperDocSnap.data() as HelperAttendance);
        } else {
          // If no document exists for the current month, initialize it
          setHelperAttendance({ userId: user.uid, month: currentMonth, year: currentYear, count: 0 });
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        // It's possible to get here if firestore rules are not set up correctly
        // or if there's a network issue that persistence can't handle.
        // For now, we'll just log it and show an empty dashboard.
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // This is a fallback, but the useEffect should have already redirected.
    return null;
  }
  
  return <Dashboard initialStudents={students} setStudents={setStudents} initialHelperAttendance={helperAttendance} />;
}
