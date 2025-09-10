'use client';

import { useState, useMemo } from 'react';
import type { Student } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard-header';
import { StudentCard } from '@/components/student-card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';

interface DashboardProps {
    initialStudents: Student[];
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export function Dashboard({ initialStudents, setStudents: setStudentsProp }: DashboardProps) {
  const students = initialStudents;
  const setStudents = setStudentsProp;
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        try {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          if (lines.length < 2) {
            toast({ variant: 'destructive', title: 'Invalid CSV', description: 'CSV must have a header and at least one data row.'});
            return;
          }
          
          const header = lines[0].split(',').map(h => h.trim().toLowerCase());
          const nameIndex = header.indexOf('name');
          const pointsIndex = header.indexOf('points');
          const birthdayIndex = header.indexOf('birthday');

          if (nameIndex === -1 || pointsIndex === -1) {
            toast({
              variant: 'destructive',
              title: 'Invalid CSV Header',
              description: 'CSV must include "name" and "points" columns.',
            });
            return;
          }

          const importedStudents: Student[] = lines.slice(1).map((line, index) => {
            const values = line.split(',');
            return {
              id: `imported-${Date.now()}-${index}`,
              name: values[nameIndex]?.trim() || 'No Name',
              points: parseInt(values[pointsIndex]?.trim(), 10) || 0,
              birthday: birthdayIndex !== -1 && values[birthdayIndex]?.trim() ? values[birthdayIndex]!.trim() : '',
              avatarId: `student-${(index % 6) + 1}`,
              attendance: [],
            };
          });

          setStudents(prev => [...prev, ...importedStudents]);
          toast({
            title: 'Import Successful',
            description: `${importedStudents.length} students have been added.`,
          });
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: 'There was an error processing the CSV file.',
          });
          console.error('CSV Import Error:', error);
        }
      }
    };
    reader.readAsText(file);
  };


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
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        students={students}
        presentCount={presentCount}
        onImportClick={handleImportClick}
        user={user}
      />
       <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv"
        />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {students.length === 0 ? (
           <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Welcome to KidPoint Tracker</h2>
            <p className="text-muted-foreground mt-2">
              It looks like you don't have any students yet.
              <br />
              You can add students by importing a CSV file.
            </p>
            <Button onClick={handleImportClick} className="mt-4">
              <Upload className="mr-2 h-4 w-4"/>
              Import Students from CSV
            </Button>
             <p className="text-xs text-muted-foreground mt-4">Your CSV should have 'name' and 'points' columns. 'birthday' (YYYY-MM-DD) is optional.</p>
          </div>
        ) : filteredStudents.length > 0 ? (
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
