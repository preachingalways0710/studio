'use server';

import { generateStudents } from '@/ai/flows/generate-students';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { studentInfo } = await request.json();

    if (!studentInfo) {
      return NextResponse.json({ error: 'No student info provided.' }, { status: 400 });
    }

    const result = await generateStudents({ studentInfo });
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in generate-students route:', error);
    return NextResponse.json({ error: 'An error occurred while generating students.' }, { status: 500 });
  }
}
