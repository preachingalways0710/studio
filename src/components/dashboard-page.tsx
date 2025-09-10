'use client';

import { Dashboard } from '@/components/dashboard';
import { useState, useEffect } from 'react';
import type { Student, HelperAttendance } from '@/lib/types';
import React from 'react';
import { collection, getDocs, query, where, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DashboardPageProps {
  initialStudents: Student[];
  initialHelperAttendance: HelperAttendance | null;
}

const ANONYMOUS_USER_ID = 'shared-user-id';

export function DashboardPage({ initialStudents, initialHelperAttendance }: DashboardPageProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [helperAttendance, setHelperAttendance] = useState<HelperAttendance | null>(initialHelperAttendance);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const userId = ANONYMOUS_USER_ID;

    // Set up listeners for real-time updates
    const studentQuery = query(collection(db, 'students'), where('userId', '==', userId));
    const studentsUnsubscribe = onSnapshot(studentQuery, (snapshot) => {
        const updatedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setStudents(updatedStudents);
        setDataLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setDataLoading(false);
    });
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const helperDocId = `${userId}_${currentMonth}_${currentYear}`;
    const helperDocRef = doc(db, 'helpers', helperDocId);
    const helperUnsubscribe = onSnapshot(helperDocRef, (doc) => {
        if (doc.exists()) {
            setHelperAttendance(doc.data() as HelperAttendance);
        } else {
             setHelperAttendance({ userId: userId, month: currentMonth, year: currentYear, count: 0 });
        }
    }, (error) => {
      console.error("Error fetching helpers:", error);
    });


    return () => {
        studentsUnsubscribe();
        helperUnsubscribe();
    };

  }, []);

  if (dataLoading) {
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
  
  return <Dashboard initialStudents={students} setStudents={setStudents} initialHelperAttendance={helperAttendance} setHelperAttendance={setHelperAttendance} />;
}
