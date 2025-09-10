'use server';

/**
 * @fileOverview Generates a list of students with their details.
 *
 * - generateStudents - A function that generates student data.
 * - GenerateStudentsInput - The input type for the generateStudents function.
 * - GenerateStudentsOutput - The return type for the generateStudents function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateStudentsInputSchema = z.object({
  studentInfo: z.string().describe('A simple description of the students to generate, like "6 students from Brazil".'),
});
export type GenerateStudentsInput = z.infer<typeof GenerateStudentsInputSchema>;

const StudentSchema = z.object({
  id: z.string().describe("A unique ID for the student."),
  name: z.string().describe("The student's full name."),
  avatarId: z.string().describe("The ID for the student's avatar placeholder image. Use one of: student-liam, student-olivia, student-noah, student-emma, student-oliver, student-ava"),
  birthday: z.string().describe("The student's birthday in YYYY-MM-DD format."),
  points: z.number().describe("The initial points for the student."),
  attendance: z.array(z.object({
    month: z.string().describe("The month of attendance."),
    year: z.number().describe("The year of attendance."),
  })).describe("An array of attendance records."),
});

const GenerateStudentsOutputSchema = z.object({
  students: z.array(StudentSchema).describe('An array of generated student objects.'),
});
export type GenerateStudentsOutput = z.infer<typeof GenerateStudentsOutputSchema>;

export async function generateStudents(input: GenerateStudentsInput): Promise<GenerateStudentsOutput> {
  return generateStudentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentsPrompt',
  input: { schema: GenerateStudentsInputSchema },
  output: { schema: GenerateStudentsOutputSchema },
  prompt: `You are an assistant that creates student data for an app.
  
  Generate a list of students based on the following information:
  {{studentInfo}}
  
  Please provide the data in the format requested. Ensure birthdays are realistic for children (e.g., between 2014-2018). Give them some initial points and a few attendance records for early 2024.
  `,
});

const generateStudentsFlow = ai.defineFlow(
  {
    name: 'generateStudentsFlow',
    inputSchema: GenerateStudentsInputSchema,
    outputSchema: GenerateStudentsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
