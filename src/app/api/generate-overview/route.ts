'use server';

import { getMonthlyAttendanceOverview } from '@/ai/flows/monthly-attendance-overview';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { attendanceData } = await request.json();

    if (!attendanceData) {
      return NextResponse.json({ error: 'No attendance data provided.' }, { status: 400 });
    }

    const result = await getMonthlyAttendanceOverview({ attendanceData });
    return NextResponse.json({ overview: result.overview });
    
  } catch (error) {
    console.error('Error in generate-overview route:', error);
    return NextResponse.json({ error: 'An error occurred while generating the overview.' }, { status: 500 });
  }
}
