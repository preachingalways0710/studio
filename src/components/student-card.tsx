'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Student } from '@/lib/types';
import { getAge, cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Cake, CalendarCheck, Star, Users, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface StudentCardProps {
  student: Student;
  onMarkPresent: () => void;
  onAddFriendPoints: (studentId: string, friendCount: number) => void;
  onPurchase: (studentId: string, cost: number) => void;
}

export function StudentCard({ student, onMarkPresent, onAddFriendPoints, onPurchase }: StudentCardProps) {
  const [friendCount, setFriendCount] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [pointsDisplay, setPointsDisplay] = useState(student.points);
  const [justUpdated, setJustUpdated] = useState(false);

  const { toast } = useToast();

  const age = getAge(student.birthday);
  const avatar = PlaceHolderImages.find(img => img.id === student.avatarId);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const isPresentThisMonth = useMemo(() => {
    return student.attendance.some(att => att.month === currentMonth && att.year === currentYear);
  }, [student.attendance, currentMonth, currentYear]);

  const handleFriendsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(friendCount, 10);
    if (!isNaN(count) && count > 0) {
      onAddFriendPoints(student.id, count);
      setFriendCount('');
    }
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseInt(purchaseCost, 10);
    if (!isNaN(cost) && cost > 0) {
      onPurchase(student.id, cost);
      setPurchaseCost('');
    }
  };

  if (student.points !== pointsDisplay) {
    setPointsDisplay(student.points);
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 300);
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 border">
          {avatar && <AvatarImage src={avatar.imageUrl} alt={student.name} data-ai-hint={avatar.imageHint} />}
          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle className="font-headline">{student.name}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Cake className="h-4 w-4" />
            <span>{age} years old</span>
          </CardDescription>
          <div className="flex items-center gap-2 font-bold text-lg">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className={cn('transition-all', justUpdated && 'animate-pop text-primary')}>{pointsDisplay}</span>
            <span className="text-sm font-medium text-muted-foreground">points</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Button onClick={onMarkPresent} disabled={isPresentThisMonth} className="w-full">
          <CalendarCheck className="mr-2 h-4 w-4" />
          {isPresentThisMonth ? `Present in ${currentMonth}` : 'Mark as Present (+10 pts)'}
        </Button>
      </CardContent>
      <CardFooter>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="actions">
            <AccordionTrigger className="text-sm">More Actions</AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <form onSubmit={handleFriendsSubmit} className="space-y-2">
                  <Label htmlFor={`friends-${student.id}`} className="flex items-center gap-2"><Users className="h-4 w-4" />Friends Invited</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`friends-${student.id}`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={friendCount}
                      onChange={e => setFriendCount(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit">Add Points</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">+30 points per friend</p>
                </form>
                <Separator />
                <form onSubmit={handlePurchaseSubmit} className="space-y-2">
                  <Label htmlFor={`purchase-${student.id}`} className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Store Purchase</Label>
                   <div className="flex gap-2">
                    <Input
                      id={`purchase-${student.id}`}
                      type="number"
                      min="0"
                      placeholder="e.g., 50"
                      value={purchaseCost}
                      onChange={e => setPurchaseCost(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" variant="secondary">Spend</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Subtract points from total</p>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
