import { DashboardPage } from '@/components/dashboard-page';

export default function Home() {
  // Data is fetched on the client-side in DashboardPage
  return <DashboardPage initialStudents={[]} initialHelperAttendance={null} />;
}
