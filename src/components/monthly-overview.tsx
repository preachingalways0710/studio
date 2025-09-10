'use client';

import { useState } from 'react';
import { Student } from '@/lib/types';
import { generateMonthlyOverviewAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, LineChart } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface MonthlyOverviewProps {
  students: Student[];
}

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyOverview({ students }: MonthlyOverviewProps) {
  const [overview, setOverview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setOverview('');

    const currentYear = new Date().getFullYear();
    const header = 'student_name,month,attendance_status';
    
    const csvRows = students.flatMap(student => 
        ALL_MONTHS.map(month => {
            const attended = student.attendance.some(att => att.month === month && att.year === currentYear);
            return `${student.name},${month},${attended ? 'present' : 'absent'}`;
        })
    );
    
    const csvData = [header, ...csvRows].join('\n');

    const result = await generateMonthlyOverviewAction(csvData);

    if (result.startsWith('An error occurred')) {
        setError(result);
    } else {
        setOverview(result);
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="mt-8 col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-6 w-6" />
                    Monthly Attendance Overview
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                    <Bot className="h-4 w-4" />
                    AI-powered summary of attendance trends for the year.
                </CardDescription>
            </div>
             <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Overview'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )}
        {error && <p className="text-destructive">{error}</p>}
        {overview && <p className="text-sm text-foreground whitespace-pre-wrap">{overview}</p>}
        {!isLoading && !overview && !error && (
            <p className="text-sm text-muted-foreground">Click the "Generate Overview" button to see an AI-generated summary of this year's attendance.</p>
        )}
      </CardContent>
    </Card>
  );
}
