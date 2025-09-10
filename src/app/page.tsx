import { DashboardPage } from '@/components/dashboard-page';
import { cookies } from 'next/headers';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin'; // Using admin SDK for server-side
import type { Student, HelperAttendance } from '@/lib/types';
import { auth } from 'firebase-admin';

async function getAuthenticatedUser() {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    const decodedIdToken = await auth().verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

export default async function Home() {
  const user = await getAuthenticatedUser();

  let students: Student[] = [];
  let helperAttendance: HelperAttendance | null = null;

  if (user) {
    try {
      // Fetch Students
      const studentQuery = query(collection(db, 'students'), where('userId', '==', user.uid));
      const studentSnapshot = await getDocs(studentQuery);
      students = studentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];

      // Fetch Helper Attendance for current month
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      const currentYear = new Date().getFullYear();
      const helperDocId = `${user.uid}_${currentMonth}_${currentYear}`;
      const helperDocRef = doc(db, 'helpers', helperDocId);
      const helperDocSnap = await getDoc(helperDocRef);

      if (helperDocSnap.exists()) {
        helperAttendance = helperDocSnap.data() as HelperAttendance;
      } else {
        // If no document exists for the current month, initialize it locally for the client
        helperAttendance = { userId: user.uid, month: currentMonth, year: currentYear, count: 0 };
      }
    } catch (error) {
      console.error('Error fetching data on server:', error);
      // In case of error, pass empty data to the client to handle
      students = [];
      helperAttendance = null;
    }
  }

  return <DashboardPage initialStudents={students} initialHelperAttendance={helperAttendance} />;
}
