export interface Student {
  id: string;
  userId: string;
  name: string;
  avatarId: string;
  avatarUrl?: string; // To store custom uploaded avatar URLs
  birthday: string; // YYYY-MM-DD
  points: number;
  attendance: {
    month: string;
    year: number;
  }[];
}

export interface HelperAttendance {
  userId: string;
  month: string;
  year: number;
  count: number;
}
