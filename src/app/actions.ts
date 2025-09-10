'use server';

import { getMonthlyAttendanceOverview } from '@/ai/flows/monthly-attendance-overview';
import { generateStudents, GenerateStudentsOutput } from '@/ai/flows/generate-students';

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

export async function generateStudentsAction(studentInfo: string): Promise<GenerateStudentsOutput | null> {
  if (!studentInfo) {
    console.error('No student info provided.');
    return null;
  }

  try {
    const result = await generateStudents({ studentInfo });
    return result;
  } catch (error) {
    console.error('Error generating students:', error);
    return null;
  }
}
