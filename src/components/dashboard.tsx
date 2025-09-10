'use client';

import React, { useState, useMemo } from 'react';
import type { Student, HelperAttendance } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard-header';
import { StudentCard } from '@/components/student-card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, writeBatch, collection, updateDoc, addDoc, setDoc } from 'firebase/firestore';


interface DashboardProps {
    students: Student[];
    helperAttendance: HelperAttendance | null;
}

const ANONYMOUS_USER_ID = 'shared-user-id';

export function Dashboard({ students, helperAttendance }: DashboardProps) {
  const userId = ANONYMOUS_USER_ID;
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
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

          if (nameIndex === -1) {
            toast({
              variant: 'destructive',
              title: 'Invalid CSV Header',
              description: 'CSV must include a "name" column.',
            });
            return;
          }

          const importedStudents: Omit<Student, 'id' | 'avatarId'>[] = lines.slice(1).map((line) => {
            const values = line.split(',');
            return {
              userId: userId,
              name: values[nameIndex]?.trim() || 'No Name',
              points: pointsIndex > -1 ? (parseInt(values[pointsIndex]?.trim(), 10) || 0) : 0,
              birthday: birthdayIndex > -1 && values[birthdayIndex]?.trim() ? values[birthdayIndex]!.trim() : '',
              attendance: [],
            };
          }).filter(s => s.name !== 'No Name' && s.name.trim() !== '');

          if (importedStudents.length === 0) {
            toast({ title: 'Import Finished', description: 'No valid student data found to import.'});
            return;
          }

          const batch = writeBatch(db);
          const avatarIdOptions = ['student-liam', 'student-olivia', 'student-noah', 'student-emma', 'student-oliver', 'student-ava'];
          
          const currentStudentCount = students.length;
          importedStudents.forEach((studentData, index) => {
            const docRef = doc(collection(db, 'students'));
            const avatarId = avatarIdOptions[(currentStudentCount + index) % avatarIdOptions.length];
            const studentWithAvatar = {
              ...studentData,
              avatarId: avatarId!,
            };
            batch.set(docRef, studentWithAvatar);
          });
          
          await batch.commit();

          toast({
            title: 'Import Successful',
            description: `${importedStudents.length} students have been saved. The dashboard will update momentarily.`,
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
  
  const handleAddStudent = async (newStudentData: Omit<Student, 'id' | 'avatarId' | 'attendance' | 'userId'>) => {
    const avatarIdOptions = ['student-liam', 'student-olivia', 'student-noah', 'student-emma', 'student-oliver', 'student-ava'];
    const avatarId = avatarIdOptions[students.length % avatarIdOptions.length];

    const studentToAdd = {
        ...newStudentData,
        userId: userId,
        avatarId: avatarId!,
        attendance: [],
    };

    try {
        await addDoc(collection(db, 'students'), studentToAdd);
        toast({
            title: 'Student Added',
            description: `${newStudentData.name} has been added.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Add Student Failed',
            description: 'There was an error saving the new student.',
        });
        console.error('Add Student Error:', error);
    }
  };


  const updateStudentInFirestore = async (studentId: string, updatedData: Partial<Omit<Student, 'id'>>) => {
    const studentRef = doc(db, 'students', studentId);
    try {
      await updateDoc(studentRef, updatedData);
    } catch (error) {
      console.error('Error updating student in Firestore:', error);
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Could not save student changes to the database.',
      });
    }
  };
  
  const handleUpdateHelpers = async (newCount: number) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const docId = `${userId}_${currentMonth}_${currentYear}`;
    
    const newHelperData: HelperAttendance = {
      userId: userId,
      month: currentMonth,
      year: currentYear,
      count: newCount,
    };

    try {
      await setDoc(doc(db, 'helpers', docId), newHelperData, { merge: true });
    } catch (error) {
       console.error("Error updating helpers:", error);
       toast({ variant: "destructive", title: "Update Failed", description: "Could not save helper count." });
    }
  };

  const updateStudent = (updatedStudent: Student) => {
    const { id, ...studentData } = updatedStudent;
    updateStudentInFirestore(updatedStudent.id, studentData);
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
    
    const updatedStudent = {
      ...student,
      points: student.points + 10,
      attendance: [...student.attendance, { month: currentMonth, year: currentYear }],
    };

    updateStudent(updatedStudent);
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

    const updatedStudent = {
      ...student,
      points: student.points >= 10 ? student.points - 10 : 0,
      attendance: student.attendance.filter(
        att => !(att.month === currentMonth && att.year === currentYear)
      ),
    };
    
    updateStudent(updatedStudent);

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

  const filteredStudents = useMemo(() => students
    .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name)), [students, searchTerm]);
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        students={students}
        presentCount={presentCount}
        onImport={handleImport}
        onAddStudent={handleAddStudent}
        helperAttendance={helperAttendance}
        onUpdateHelpers={handleUpdateHelpers}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {students.length === 0 ? (
           <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Welcome to KidPoint Tracker</h2>
            <p className="text-muted-foreground mt-2">
              It looks like you don't have any students yet.
              <br />
              You can add students individually or by importing a CSV file.
            </p>
            <p className="text-xs text-muted-foreground mt-4">Use the buttons in the header to get started. CSVs need a 'name' column. 'points' and 'birthday' (YYYY-MM-DD) are optional.</p>
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
