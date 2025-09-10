import type { Student } from './types';

export const initialStudents: Student[] = [
  {
    id: '1',
    name: 'Liam Smith',
    avatarId: 'student-liam',
    birthday: '2015-05-20',
    points: 120,
    attendance: [
      { month: 'January', year: 2024 },
      { month: 'February', year: 2024 },
      { month: 'March', year: 2024 },
    ],
  },
  {
    id: '2',
    name: 'Olivia Brown',
    avatarId: 'student-olivia',
    birthday: '2016-08-15',
    points: 250,
    attendance: [
      { month: 'January', year: 2024 },
      { month: 'February', year: 2024 },
      { month: 'April', year: 2024 },
    ],
  },
  {
    id: '3',
    name: 'Noah Jones',
    avatarId: 'student-noah',
    birthday: '2014-11-30',
    points: 80,
    attendance: [
      { month: 'February', year: 2024 },
      { month: 'March', year: 2024 },
      { month: 'May', year: 2024 },
    ],
  },
  {
    id: '4',
    name: 'Emma Garcia',
    avatarId: 'student-emma',
    birthday: '2017-02-10',
    points: 310,
    attendance: [
      { month: 'January', year: 2024 },
      { month: 'March', year: 2024 },
      { month: 'April', year: 2024 },
      { month: 'May', year: 2024 },
    ],
  },
  {
    id: '5',
    name: 'Oliver Miller',
    avatarId: 'student-oliver',
    birthday: '2015-09-05',
    points: 150,
    attendance: [
      { month: 'January', year: 2024 },
      { month: 'February', year: 2024 },
      { month: 'May', year: 2024 },
    ],
  },
  {
    id: '6',
    name: 'Ava Davis',
    avatarId: 'student-ava',
    birthday: '2016-07-22',
    points: 190,
    attendance: [
      { month: 'March', year: 2024 },
      { month: 'April', year: 2024 },
    ],
  },
];
