'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddStudentDialogProps {
  children: React.ReactNode;
  onAddStudent: (newStudent: Omit<Student, 'id' | 'avatarId' | 'attendance' | 'userId'>) => Promise<void>;
}

export function AddStudentDialog({ children, onAddStudent }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [points, setPoints] = useState('0');
  const [birthday, setBirthday] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Student name is required.' });
      return;
    }
    
    const pointsNumber = parseInt(points, 10);
    if (isNaN(pointsNumber) || pointsNumber < 0) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please enter a valid number for points.' });
      return;
    }

    setIsSaving(true);
    try {
      await onAddStudent({
        name: name.trim(),
        points: pointsNumber,
        birthday: birthday ? format(birthday, 'yyyy-MM-dd') : '',
      });
      // Reset form and close dialog
      setOpen(false);
      setName('');
      setPoints('0');
      setBirthday(undefined);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Enter the details for the new student below. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Student's full name" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="points" className="text-right">
              Points
            </Label>
            <Input id="points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} className="col-span-3" placeholder="Initial points" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthday" className="text-right">
              Birthday
            </Label>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full col-span-3 justify-start text-left font-normal",
                      !birthday && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthday ? format(birthday, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={birthday}
                    onSelect={setBirthday}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 20}
                    toYear={new Date().getFullYear()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
