import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LineChart, Search, Users, Upload } from 'lucide-react';
import { MonthlyOverview } from './monthly-overview';
import type { Student } from '@/lib/types';
import React from 'react';

interface DashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  students: Student[];
  presentCount: number;
  onImportClick: () => void;
}

export function DashboardHeader({ searchTerm, onSearchChange, students, presentCount, onImportClick }: DashboardHeaderProps) {
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <div className="flex flex-col">
            <h1 className="text-lg font-bold font-headline">KidPoint Tracker</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{presentCount}/{students.length} Presente</span>
            </div>
        </div>
      </div>
      <div className="relative ml-auto flex flex-1 items-center justify-end gap-2 md:grow-0">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar pessoas..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[280px]"
        />

        <Button onClick={onImportClick} variant="outline" size="icon" className="h-9 w-9">
            <Upload className="h-4 w-4" />
            <span className="sr-only">Import Students</span>
        </Button>
        
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <LineChart className="h-4 w-4" />
                    <span className="sr-only">View Monthly Overview</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                 <MonthlyOverview students={students} />
            </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
