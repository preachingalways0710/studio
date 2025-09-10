'use client';

import { useMemo } from 'react';
import { Student, HelperAttendance } from '@/lib/types';
import { LineChart } from 'lucide-react';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyOverviewProps {
  students: Student[];
  helperAttendance: HelperAttendance | null;
}

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyOverview({ students, helperAttendance }: MonthlyOverviewProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const chartData = useMemo(() => {
    return ALL_MONTHS.map(month => {
      const presentCount = students.filter(student =>
        student.attendance.some(att => att.month === month && att.year === currentYear)
      ).length;
      
      // We only have helper data for the current month in this implementation
      const helpers = (month === currentMonth && helperAttendance) ? helperAttendance.count : 0;

      return {
        name: month.substring(0, 3),
        present: presentCount,
        absent: students.length - presentCount,
        helpers: helpers,
      };
    });
  }, [students, currentYear, helperAttendance, currentMonth]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <LineChart className="h-6 w-6" />
          Monthly Attendance Overview
        </SheetTitle>
        <SheetDescription>
          A chart showing student and helper attendance trends for {currentYear}.
        </SheetDescription>
      </SheetHeader>
      <div className="py-4 h-[400px]">
        {students.length > 0 || (helperAttendance && helperAttendance.count > 0) ? (
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
                <Bar dataKey="present" fill="hsl(var(--primary))" name="Present" stackId="a" />
                <Bar dataKey="absent" fill="hsl(var(--muted))" name="Absent" stackId="a" />
                <Bar dataKey="helpers" fill="hsl(var(--accent))" name="Helpers" />
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>No student or helper data available to display chart.</p>
            </div>
        )}
      </div>
    </>
  );
}
