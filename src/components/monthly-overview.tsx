'use client';

import { useMemo } from 'react';
import { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from 'lucide-react';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface MonthlyOverviewProps {
  students: Student[];
}

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyOverview({ students }: MonthlyOverviewProps) {
  const currentYear = new Date().getFullYear();

  const chartData = useMemo(() => {
    return ALL_MONTHS.map(month => {
      const presentCount = students.filter(student =>
        student.attendance.some(att => att.month === month && att.year === currentYear)
      ).length;
      return {
        name: month.substring(0, 3),
        present: presentCount,
        absent: students.length - presentCount,
      };
    });
  }, [students, currentYear]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <LineChart className="h-6 w-6" />
          Monthly Attendance Overview
        </SheetTitle>
        <SheetDescription>
          A chart showing student attendance trends for {currentYear}.
        </SheetDescription>
      </SheetHeader>
      <div className="py-4 h-[400px]">
        {students.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                 />
                <Legend />
                <Bar dataKey="present" fill="hsl(var(--primary))" name="Present" />
                <Bar dataKey="absent" fill="hsl(var(--muted))" name="Absent" />
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>No student data available to display chart.</p>
            </div>
        )}
      </div>
    </>
  );
}
