'use server';

/**
 * @fileOverview Provides a summary of student attendance for each month of the year using GenAI.
 *
 * - getMonthlyAttendanceOverview - A function that generates the monthly attendance overview.
 * - MonthlyAttendanceOverviewInput - The input type for the getMonthlyAttendanceOverview function.
 * - MonthlyAttendanceOverviewOutput - The return type for the getMonthlyAttendanceOverview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlyAttendanceOverviewInputSchema = z.object({
  attendanceData: z
    .string()
    .describe(
      'A string containing the attendance data, formatted as a CSV with columns for student name, month, and attendance status (present/absent).'
    ),
});
export type MonthlyAttendanceOverviewInput = z.infer<
  typeof MonthlyAttendanceOverviewInputSchema
>;

const MonthlyAttendanceOverviewOutputSchema = z.object({
  overview: z
    .string()
    .describe(
      'A summary of student attendance for each month of the year, highlighting key trends and participation rates.'
    ),
});
export type MonthlyAttendanceOverviewOutput = z.infer<
  typeof MonthlyAttendanceOverviewOutputSchema
>;

export async function getMonthlyAttendanceOverview(
  input: MonthlyAttendanceOverviewInput
): Promise<MonthlyAttendanceOverviewOutput> {
  return monthlyAttendanceOverviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monthlyAttendanceOverviewPrompt',
  input: {schema: MonthlyAttendanceOverviewInputSchema},
  output: {schema: MonthlyAttendanceOverviewOutputSchema},
  prompt: `You are an AI assistant that analyzes student attendance data and provides a monthly overview.

  Analyze the following attendance data and provide a summary of attendance trends for each month of the year. Highlight any significant changes in participation rates or notable patterns.

  Attendance Data:
  {{attendanceData}}

  Please provide a concise overview that is easy for administrators to understand.
  `,
});

const monthlyAttendanceOverviewFlow = ai.defineFlow(
  {
    name: 'monthlyAttendanceOverviewFlow',
    inputSchema: MonthlyAttendanceOverviewInputSchema,
    outputSchema: MonthlyAttendanceOverviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
