import { Dashboard } from '@/components/dashboard';
import { initialStudents } from '@/lib/students';

export default function Home() {
  return <Dashboard initialStudents={initialStudents} />;
}
