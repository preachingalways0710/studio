export interface Student {
  id: string;
  userId: string;
  name: string;
  avatarId: string;
  birthday: string; // YYYY-MM-DD
  points: number;
  attendance: {
    month: string;
    year: number;
  }[];
}
