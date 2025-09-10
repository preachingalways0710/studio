'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import type { Student } from '@/lib/types';
import { getAge, cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Star, Users, ShoppingCart, Undo2, CalendarCheck, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

interface EditableFieldProps {
  value: string | number;
  onSave: (newValue: string) => void;
  inputType?: 'text' | 'number';
  className?: string;
  textClassName?: string;
}

function EditableField({ value, onSave, inputType = 'text', className, textClassName }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(String(value));
    }
  };

  if (isEditing) {
    return (
      <Input
        type={inputType}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className={cn("h-8", className)}
      />
    );
  }

  return (
    <div className={cn("group flex items-center gap-2", textClassName)} onClick={() => setIsEditing(true)}>
      <span>{value}</span>
      <Edit2 className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
    </div>
  );
}

interface StudentCardProps {
  student: Student;
  onUpdateStudent: (updatedData: Partial<Omit<Student, 'id'>>) => void;
  onMarkPresent: () => void;
  onUndoPresent: () => void;
}

export function StudentCard({ student, onUpdateStudent, onMarkPresent, onUndoPresent }: StudentCardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const age = student.birthday ? getAge(student.birthday) : null;
  const avatar = PlaceHolderImages.find(img => img.id === student.avatarId);
  const [avatarUrl, setAvatarUrl] = useState(avatar?.imageUrl);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const isPresentThisMonth = useMemo(() => {
    return student.attendance.some(att => att.month === currentMonth && att.year === currentYear);
  }, [student.attendance, currentMonth, currentYear]);

  const handleFieldSave = (field: keyof Omit<Student, 'id' | 'attendance'>, value: string) => {
    let updatedValue: string | number = value;
    if (field === 'points') {
      updatedValue = parseInt(value, 10);
      if (isNaN(updatedValue)) {
        toast({ variant: 'destructive', title: 'Invalid points value' });
        return;
      }
    }
    
    onUpdateStudent({ [field]: updatedValue });
    toast({ title: 'Student Updated', description: `${student.name}'s ${field} has been updated.` });
  };
  
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAvatarUrl = event.target?.result as string;
        setAvatarUrl(newAvatarUrl);
        toast({ title: "Avatar Updated", description: "The new avatar is shown as a preview and is not saved to the database."});
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPoints = (points: number, description: string, undoDescription: string) => {
    const updatedPoints = Math.max(0, student.points + points);
    onUpdateStudent({ points: updatedPoints });

    toast({
      title: 'Points Updated!',
      description,
      action: (
        <Button variant="ghost" size="sm" onClick={() => undoPoints(points, undoDescription)}>
          <Undo2 className="mr-2" /> Undo
        </Button>
      ),
    });
  };

  const undoPoints = (points: number, description: string) => {
    const restoredPoints = student.points - points;
    onUpdateStudent({ points: restoredPoints });

    toast({
      title: 'Points Restored!',
      description,
    });
  }

  const handleFriendPoints = (friendCount: number) => {
    if (friendCount <= 0) return;
    const points = friendCount * 30;
    applyPoints(points, `${student.name} received ${points} points for inviting ${friendCount} friend(s).`, `Removed ${points} points from ${student.name}.`);
  };

  const handlePurchase = (cost: number) => {
    if (cost <= 0) return;
    if (student.points < cost) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Points',
        description: `${student.name} does not have enough points.`,
      });
      return;
    }
    const pointsToDeduct = -cost;
    applyPoints(pointsToDeduct, `${student.name} spent ${cost} points.`, `Restored ${cost} points to ${student.name}.`);
  };
  
  return (
    <Card className="flex flex-col">
       <CardHeader className="items-center text-center p-4 relative">
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7">
                    <PartyPopper className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={student.birthday ? new Date(student.birthday) : undefined}
                    onSelect={(date) => {
                        if (date) {
                            handleFieldSave('birthday', format(date, 'yyyy-MM-dd'))
                        }
                    }}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 20}
                    toYear={new Date().getFullYear()}
                />
            </PopoverContent>
        </Popover>

        <div className="relative mt-2">
          <Avatar className="h-32 w-32 border-4 border-background shadow-md cursor-pointer" onClick={handleAvatarClick}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={student.name} data-ai-hint={avatar?.imageHint}/>}
            <AvatarFallback className="text-4xl">{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <div className="absolute bottom-1 right-1 bg-background/80 rounded-full p-2 cursor-pointer" onClick={handleAvatarClick}>
             <Edit2 className="h-4 w-4 text-muted-foreground/80"/>
          </div>
        </div>
        <div className="grid gap-0.5 mt-3">
          <CardTitle className="font-headline text-2xl">
             <EditableField value={student.name} onSave={(v) => handleFieldSave('name', v)} textClassName="justify-center"/>
          </CardTitle>
          {age !== null && <p className="text-sm text-muted-foreground">{age} anos</p>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center px-4 pb-4">
         <div className="flex items-center justify-center gap-2 font-bold text-3xl mb-4">
            <Star className="h-7 w-7 text-yellow-400 fill-yellow-400" />
            <EditableField value={student.points} onSave={(v) => handleFieldSave('points', v)} inputType="number" />
          </div>
        
        <div className="grid grid-cols-2 gap-2 items-stretch">
            {isPresentThisMonth ? (
                <Button onClick={onUndoPresent} variant="outline" className="w-full h-auto">
                    <Undo2 className="mr-2 h-4 w-4" />
                    Undo
                </Button>
            ) : (
                <Button onClick={onMarkPresent} className="w-full h-auto">
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Presente
                </Button>
            )}
            <ActionItem
                icon={Users}
                label="Convidados"
                pointsLabel="+"
                onAction={handleFriendPoints}
                placeholder="+30"
            />
        </div>
      </CardContent>
       <CardFooter className="flex flex-col gap-2 p-2 pt-0 border-t bg-muted/50">
         <ActionItem
            icon={ShoppingCart}
            label="Loja"
            pointsLabel="Gastar"
            onAction={handlePurchase}
            variant="secondary"
         />
       </CardFooter>
    </Card>
  );
}


function ActionItem({ icon: Icon, label, pointsLabel, onAction, variant = 'default', placeholder }: {
    icon: React.ElementType,
    label: string,
    pointsLabel: string,
    onAction: (value: number) => void,
    variant?: 'default' | 'secondary',
    placeholder?: string
}) {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
            onAction(numValue);
            setValue('');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-between space-y-1 py-1 px-1 rounded-lg w-full bg-background border rounded-md">
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                <Icon className="h-3 w-3" />
                <span>{label}</span>
            </div>
            <div className="flex items-center gap-1 w-full px-1 pb-1">
                <Input
                    type="number"
                    min="1"
                    placeholder={placeholder || "0"}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="h-7 w-full text-center p-1"
                />
                <Button type="submit" size="sm" variant={variant} className="h-7 text-xs px-2">
                    {pointsLabel}
                </Button>
            </div>
        </form>
    );
}
