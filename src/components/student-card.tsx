'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Student } from '@/lib/types';
import { getAge, cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Edit2, Star, Users, ShoppingCart, Undo2, CalendarCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableFieldProps {
  value: string | number;
  onSave: (newValue: string) => void;
  inputType?: 'text' | 'number' | 'date';
}

function EditableField({ value, onSave, inputType = 'text' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
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
        className="h-8"
      />
    );
  }

  return (
    <div className="group flex items-center gap-2" onClick={() => setIsEditing(true)}>
      <span>{value}</span>
      <Edit2 className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
    </div>
  );
}


interface StudentCardProps {
  student: Student;
  onUpdateStudent: (student: Student) => void;
  onMarkPresent: () => void;
  onUndoPresent: () => void;
}

export function StudentCard({ student, onUpdateStudent, onMarkPresent, onUndoPresent }: StudentCardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const age = getAge(student.birthday);
  const avatar = PlaceHolderImages.find(img => img.id === student.avatarId);
  const [avatarUrl, setAvatarUrl] = useState(avatar?.imageUrl);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const isPresentThisMonth = useMemo(() => {
    return student.attendance.some(att => att.month === currentMonth && att.year === currentYear);
  }, [student.attendance, currentMonth, currentYear]);

  const handleFieldSave = (field: keyof Student, value: string) => {
    const updatedValue = field === 'points' ? parseInt(value, 10) : value;
    
    if (field === 'points' && isNaN(updatedValue as number)) {
        toast({ variant: 'destructive', title: 'Invalid points value' });
        return;
    }

    const updatedStudent = { ...student, [field]: updatedValue };
    onUpdateStudent(updatedStudent);
    toast({ title: 'Student Updated', description: `${student.name}'s ${field} has been updated.` });
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAvatarUrl = event.target?.result as string;
        setAvatarUrl(newAvatarUrl);
        // Here you would typically upload the file and get a new URL
        // For now, we just update it visually on the client
        toast({ title: "Avatar Updated", description: "The new avatar is shown. Note: This is a preview and isn't saved permanently."});
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFriendPoints = (friendCount: number) => {
    if (friendCount <= 0) return;
    const points = friendCount * 30;
    const updatedStudent = { ...student, points: student.points + points };
    onUpdateStudent(updatedStudent);
    toast({
      title: 'Points Updated!',
      description: `${student.name} received ${points} points for inviting ${friendCount} friend(s).`,
    });
  };

  const handlePurchase = (cost: number) => {
    if (cost <= 0) return;
    if (student.points < cost) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Points',
        description: `${student.name} does not have enough points for this purchase.`,
      });
      return;
    }
    const updatedStudent = { ...student, points: student.points - cost };
    onUpdateStudent(updatedStudent);
    toast({
      title: 'Purchase Successful',
      description: `${student.name} spent ${cost} points.`,
    });
  };
  
  const [friendCount, setFriendCount] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');

  const handleFriendsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(friendCount, 10);
    if (!isNaN(count) && count > 0) {
      handleFriendPoints(count);
      setFriendCount('');
    }
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseInt(purchaseCost, 10);
    if (!isNaN(cost) && cost > 0) {
      handlePurchase(cost);
      setPurchaseCost('');
    }
  };


  return (
    <Card className="flex flex-col">
       <CardHeader className="items-center text-center pt-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-primary/50 cursor-pointer" onClick={handleAvatarClick}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={student.name} data-ai-hint={avatar?.imageHint}/>}
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <div className="absolute bottom-1 right-1 bg-background/80 rounded-full p-1">
             <Edit2 className="h-4 w-4 text-muted-foreground/80"/>
          </div>
        </div>
        <div className="grid gap-1 mt-4">
          <CardTitle className="font-headline text-xl">
             <EditableField value={student.name} onSave={(v) => handleFieldSave('name', v)} />
          </CardTitle>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-4">
            <EditableField value={student.birthday} onSave={(v) => handleFieldSave('birthday', v)} inputType="date" />
            <span>({age} yrs)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow text-center">
         <div className="flex items-center justify-center gap-2 font-bold text-2xl mb-4">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            <EditableField value={student.points} onSave={(v) => handleFieldSave('points', v)} inputType="number" />
            <span className="text-sm font-medium text-muted-foreground">points</span>
          </div>

        {isPresentThisMonth ? (
          <Button onClick={onUndoPresent} variant="outline" className="w-full">
            <Undo2 className="mr-2 h-4 w-4" />
            Undo Present
          </Button>
        ) : (
          <Button onClick={onMarkPresent} className="w-full">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Present (+10 pts)
          </Button>
        )}
      </CardContent>
       <CardFooter className="flex-col items-start gap-4 p-4 pt-0">
          <Separator />
          <form onSubmit={handleFriendsSubmit} className="space-y-2 w-full">
            <Label htmlFor={`friends-${student.id}`} className="flex items-center gap-2 text-sm"><Users className="h-4 w-4" />Friends Invited (+30pts each)</Label>
            <div className="flex gap-2">
              <Input
                id={`friends-${student.id}`}
                type="number"
                min="1"
                placeholder="0"
                value={friendCount}
                onChange={e => setFriendCount(e.target.value)}
                className="flex-1 h-9"
              />
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
          <Separator />
          <form onSubmit={handlePurchaseSubmit} className="space-y-2 w-full">
            <Label htmlFor={`purchase-${student.id}`} className="flex items-center gap-2 text-sm"><ShoppingCart className="h-4 w-4" />Store Purchase</Label>
             <div className="flex gap-2">
              <Input
                id={`purchase-${student.id}`}
                type="number"
                min="1"
                placeholder="e.g., 50"
                value={purchaseCost}
                onChange={e => setPurchaseCost(e.target.value)}
                className="flex-1 h-9"
              />
              <Button type="submit" variant="secondary" size="sm">Spend</Button>
            </div>
          </form>
       </CardFooter>
    </Card>
  );
}
