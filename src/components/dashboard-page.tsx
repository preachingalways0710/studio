'use client';

import { Dashboard } from '@/components/dashboard';
import { useState, useEffect } from 'react';
import type { Student, HelperAttendance } from '@/lib/types';
import React from 'react';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

const ANONYMOUS_USER_ID = 'shared-user-id';

export function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [helperAttendance, setHelperAttendance] = useState<HelperAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = ANONYMOUS_USER_ID;
    let unsubscribers: (() => void)[] = [];

    try {
      // Listener for students
      const studentQuery = query(collection(db, 'students'), where('userId', '==', userId));
      const studentsUnsubscribe = onSnapshot(studentQuery, (snapshot) => {
        const updatedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student);
        setStudents(updatedStudents);
        setLoading(false);
        setError(null); 
      }, (err) => {
        console.error("Error fetching students:", err);
        setError("Could not connect to the student database. Please ensure Firestore is enabled and permissions are set correctly.");
        setLoading(false);
      });
      unsubscribers.push(studentsUnsubscribe);

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
      }, (err) => {
        console.error("Error fetching helpers:", err);
        // This error is less critical, so we don't set the main error state
      });
      unsubscribers.push(helperUnsubscribe);

    } catch (e) {
        console.error("Error setting up listeners:", e);
        setError("An unexpected error occurred while trying to connect to the database.");
        setLoading(false);
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
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
          <p className="text-muted-foreground">Connecting to Database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const firebaseUrl = `https://console.firebase.google.com/project/studio-6494355702-581e6/firestore`;
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTitle>Database Connection Failed</AlertTitle>
          <AlertDescription>
            <p className="mb-4">The application could not connect to Firestore. This usually means the database hasn't been created yet.</p>
            <p className="mb-4">Please visit the Firebase console to create your database. Select a location and start in **Test Mode** to allow the app to read and write data.</p>
            <Button asChild>
              <a href={firebaseUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Firebase Console
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Dashboard 
      students={students} 
      helperAttendance={helperAttendance} 
    />
  );
}
