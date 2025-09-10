'use server';

import { getMonthlyAttendanceOverview } from '@/ai/flows/monthly-attendance-overview';

export async function generateMonthlyOverviewAction(attendanceData: string) {
  if (!attendanceData) {
    return 'No attendance data available to generate an overview.';
  }
  
  try {
    const result = await getMonthlyAttendanceOverview({ attendanceData });
    return result.overview;
  } catch (error) {
    console.error('Error generating monthly overview:', error);
    return 'An error occurred while generating the overview. Please try again later.';
  }
}
