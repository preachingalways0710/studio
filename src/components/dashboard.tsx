'use client';

import { useState } from 'react';
import type { Student } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard-header';
import { StudentCard } from '@/components/student-card';
import { MonthlyOverview } from '@/components/monthly-overview';
import { useToast } from '@/hooks/use-toast';

export function Dashboard({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const updateStudentPoints = (studentId: string, pointsToAdd: number, message: string) => {
    setStudents(prevStudents =>
      prevStudents.map(s =>
        s.id === studentId ? { ...s, points: s.points + pointsToAdd } : s
      )
    );
    toast({
      title: 'Points Updated!',
      description: message,
    });
  };

  const handleMarkPresent = (studentId: string) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const alreadyAttended = student.attendance.some(
      att => att.month === currentMonth && att.year === currentYear
    );

    if (alreadyAttended) {
      toast({
        variant: 'destructive',
        title: 'Already Marked',
        description: `${student.name} has already been marked present for ${currentMonth}.`,
      });
      return;
    }
    
    setStudents(prevStudents =>
        prevStudents.map(s =>
            s.id === studentId
            ? {
                ...s,
                points: s.points + 10,
                attendance: [...s.attendance, { month: currentMonth, year: currentYear }],
                }
            : s
        )
    );
    toast({
        title: 'Attendance Marked!',
        description: `${student.name} received 10 points for being present.`,
    });
  };

  const handleAddFriendPoints = (studentId: string, friendCount: number) => {
    if (friendCount <= 0) return;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const points = friendCount * 30;
    updateStudentPoints(studentId, points, `${student.name} received ${points} points for inviting ${friendCount} friend(s).`);
  };

  const handlePurchase = (studentId: string, cost: number) => {
    if (cost <= 0) return;
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (student.points < cost) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Points',
        description: `${student.name} does not have enough points for this purchase.`,
      });
      return;
    }
    updateStudentPoints(studentId, -cost, `${student.name} spent ${cost} points.`);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onMarkPresent={() => handleMarkPresent(student.id)}
                onAddFriendPoints={handleAddFriendPoints}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No students found. Try a different search.</p>
          </div>
        )}
        <MonthlyOverview students={students} />
      </main>
    </div>
  );
}
