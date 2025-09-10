'use client';

import { Dashboard } from '@/components/dashboard';
import { initialStudents } from '@/lib/students';
import { useState } from 'react';
import type { Student } from '@/lib/types';
import React from 'react';

export default function Home() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState(false);

  // The generateStudentsAction call has been removed.
  // The app will now start with an empty list of students from initialStudents.

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading student data...</p>
      </div>
    );
  }

  return <Dashboard initialStudents={students} setStudents={setStudents} />;
}
