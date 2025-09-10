'use client';

import { useState, useMemo } from 'react';
import type { Student } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard-header';
import { StudentCard } from '@/components/student-card';
import { useToast } from '@/hooks/use-toast';

export function Dashboard({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prevStudents =>
      prevStudents.map(s =>
        s.id === updatedStudent.id ? updatedStudent : s
      )
    );
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

  const handleUndoPresent = (studentId: string) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const attendanceRecord = student.attendance.find(
      att => att.month === currentMonth && att.year === currentYear
    );

    if (!attendanceRecord) return;

    setStudents(prevStudents =>
      prevStudents.map(s =>
        s.id === studentId
          ? {
              ...s,
              points: s.points >= 10 ? s.points - 10 : 0,
              attendance: s.attendance.filter(
                att => !(att.month === currentMonth && att.year === currentYear)
              ),
            }
          : s
      )
    );

    toast({
      title: 'Attendance Undone',
      description: `Removed attendance and 10 points for ${student.name} for ${currentMonth}.`,
    });
  };
  
  const presentCount = useMemo(() => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    return students.filter(s => s.attendance.some(att => att.month === currentMonth && att.year === currentYear)).length;
  }, [students]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        students={students}
        presentCount={presentCount}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onUpdateStudent={updateStudent}
                onMarkPresent={() => handleMarkPresent(student.id)}
                onUndoPresent={() => handleUndoPresent(student.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No students found. Try a different search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
