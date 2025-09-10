'use client';

import { Dashboard } from '@/components/dashboard';
import { useState, useEffect } from 'react';
import type { Student, HelperAttendance } from '@/lib/types';
import React from 'react';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ANONYMOUS_USER_ID = 'shared-user-id';

export function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [helperAttendance, setHelperAttendance] = useState<HelperAttendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = ANONYMOUS_USER_ID;

    // Listener for students
    const studentQuery = query(collection(db, 'students'), where('userId', '==', userId));
    const studentsUnsubscribe = onSnapshot(studentQuery, (snapshot) => {
      const updatedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student);
      setStudents(updatedStudents);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setLoading(false);
    });

    // Listener for helpers
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const helperDocId = `${userId}_${currentMonth}_${currentYear}`;
    const helperDocRef = doc(db, 'helpers', helperDocId);
    const helperUnsubscribe = onSnapshot(helperDocRef, (doc) => {
      if (doc.exists()) {
        setHelperAttendance(doc.data() as HelperAttendance);
      } else {
        setHelperAttendance({ userId, month: currentMonth, year: currentYear, count: 0 });
      }
    }, (error) => {
      console.error("Error fetching helpers:", error);
    });

    return () => {
      studentsUnsubscribe();
      helperUnsubscribe();
    };
  }, []);

  if (loading) {
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

  return (
    <Dashboard 
      initialStudents={students} 
      setStudents={setStudents} 
      initialHelperAttendance={helperAttendance} 
      setHelperAttendance={setHelperAttendance} 
    />
  );
}
