import { DashboardPage } from '@/components/dashboard-page';
import { Student, HelperAttendance } from '@/lib/types';

export default async function Home() {
  // Data will now be fetched on the client-side in DashboardPage
  const students: Student[] = [];
  const helperAttendance: HelperAttendance | null = null;

  return <DashboardPage initialStudents={students} initialHelperAttendance={helperAttendance} />;
}
