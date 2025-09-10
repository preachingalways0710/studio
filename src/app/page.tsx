'use client';

import { Dashboard } from '@/components/dashboard';
import { initialStudents } from '@/lib/students';
import { generateStudentsAction } from './actions';
import { useEffect, useState } from 'react';
import type { Student } from '@/lib/types';

export default function Home() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateData = async () => {
      try {
        const result = await generateStudentsAction('A list of 6 students with diverse names and birthdays in 2024.');
        if (result && Array.isArray(result.students)) {
          setStudents(result.students);
        }
      } catch (error) {
        console.error("Failed to generate students:", error);
      } finally {
        setLoading(false);
      }
    };
    generateData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading student data...</p>
      </div>
    );
  }

  return <Dashboard initialStudents={students} />;
}
