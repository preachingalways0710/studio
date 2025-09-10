'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LineChart, Search, Users, Upload, LogOut, User as UserIcon, UserPlus, Minus, Plus } from 'lucide-react';
import { MonthlyOverview } from './monthly-overview';
import type { Student, HelperAttendance } from '@/lib/types';
import type { User } from 'firebase/auth';
import { AddStudentDialog } from './add-student-dialog';
import { useRouter } from 'next/navigation';


interface DashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  students: Student[];
  presentCount: number;
  onImport: (file: File) => void;
  user: User | null;
  onAddStudent: (newStudent: Omit<Student, 'id' | 'avatarId' | 'attendance' | 'userId'>) => Promise<void>;
  helperAttendance: HelperAttendance | null;
  onUpdateHelpers: (newCount: number) => void;
}

export function DashboardHeader({
  searchTerm,
  onSearchChange,
  students,
  presentCount,
  onImport,
  user,
  onAddStudent,
  helperAttendance,
  onUpdateHelpers,
}: DashboardHeaderProps) {
  
  const router = useRouter();

  const handleLogout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    } catch(error) {
        console.error("Logout failed", error);
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset the file input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDecrementHelpers = () => {
    if (helperAttendance && helperAttendance.count > 0) {
      onUpdateHelpers(helperAttendance.count - 1);
    }
  };

  const handleIncrementHelpers = () => {
    onUpdateHelpers((helperAttendance?.count || 0) + 1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-auto min-h-16 flex-col items-start gap-4 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex-row md:items-center md:px-6">
      <div className="flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold font-headline">KidPoint Tracker</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{presentCount}/{students.length} Present</span>
            </div>
             <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent-foreground" />
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDecrementHelpers} disabled={(helperAttendance?.count ?? 0) === 0}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-bold">{helperAttendance?.count || 0} Helpers</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleIncrementHelpers}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative ml-auto flex w-full flex-1 items-center justify-end gap-2 md:w-auto md:grow-0">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar pessoas..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[280px]"
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv"
          id="csv-importer"
        />
        <Button asChild variant="outline" size="icon" className="h-9 w-9">
          <label htmlFor="csv-importer" className="cursor-pointer flex items-center justify-center">
            <Upload className="h-4 w-4" />
            <span className="sr-only">Import Students</span>
          </label>
        </Button>

        <AddStudentDialog onAddStudent={onAddStudent}>
          <Button variant="outline" size="icon" className="h-9 w-9">
              <UserPlus className="h-4 w-4" />
              <span className="sr-only">Add Student</span>
          </Button>
        </AddStudentDialog>
        
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <LineChart className="h-4 w-4" />
                    <span className="sr-only">View Monthly Overview</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                 <MonthlyOverview students={students} helperAttendance={helperAttendance} />
            </SheetContent>
        </Sheet>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                <UserIcon className="h-4 w-4" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
