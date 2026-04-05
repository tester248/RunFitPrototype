import { Student, PerformanceTest, RunSession } from '@/types';

const isoDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    age: 16,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Diya Patel',
    age: 17,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Vihaan Reddy',
    age: 16,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Ananya Iyer',
    age: 15,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Kabir Singh',
    age: 17,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
];

export const sampleTests: PerformanceTest[] = [
  {
    id: 't1',
    studentId: '1',
    date: isoDaysAgo(4),
    distance: 5,
    timeInSeconds: 1680,
    pace: 5.6,
    heartRate: 165,
  },
  {
    id: 't2',
    studentId: '1',
    date: isoDaysAgo(18),
    distance: 5,
    timeInSeconds: 1740,
    pace: 5.8,
    heartRate: 168,
  },
  {
    id: 't3',
    studentId: '1',
    date: isoDaysAgo(33),
    distance: 5,
    timeInSeconds: 1800,
    pace: 6.0,
    heartRate: 170,
  },
  {
    id: 't4',
    studentId: '2',
    date: isoDaysAgo(9),
    distance: 5,
    timeInSeconds: 1560,
    pace: 5.2,
    heartRate: 160,
  },
  {
    id: 't5',
    studentId: '2',
    date: isoDaysAgo(23),
    distance: 5,
    timeInSeconds: 1620,
    pace: 5.4,
    heartRate: 163,
  },
  {
    id: 't6',
    studentId: '3',
    date: isoDaysAgo(16),
    distance: 5,
    timeInSeconds: 1920,
    pace: 6.4,
    heartRate: 172,
  },
  {
    id: 't7',
    studentId: '3',
    date: isoDaysAgo(31),
    distance: 5,
    timeInSeconds: 1980,
    pace: 6.6,
    heartRate: 175,
  },
  {
    id: 't8',
    studentId: '4',
    date: isoDaysAgo(2),
    distance: 5,
    timeInSeconds: 1700,
    pace: 5.67,
    heartRate: 158,
  },
  {
    id: 't9',
    studentId: '5',
    date: isoDaysAgo(21),
    distance: 5,
    timeInSeconds: 1650,
    pace: 5.5,
    heartRate: 162,
  },
];

const route = (
  studentId: string,
  id: string,
  daysAgo: number,
  distanceKm: number,
  durationSeconds: number,
  averagePace: number,
  points: Array<[number, number]>,
): RunSession => ({
  id,
  studentId,
  date: isoDaysAgo(daysAgo),
  distanceKm,
  durationSeconds,
  averagePace,
  points: points.map(([latitude, longitude], index) => ({
    latitude,
    longitude,
    timestamp: isoDaysAgo(daysAgo) + `-${index}`,
    speed: null,
  })),
});

export const sampleRuns: RunSession[] = [
  route('1', 'r1', 3, 4.8, 1650, 5.73, [
    [12.9716, 77.5946],
    [12.9724, 77.5962],
    [12.9733, 77.5978],
    [12.9741, 77.5993],
    [12.9736, 77.6005],
  ]),
  route('2', 'r2', 6, 5.2, 1710, 5.48, [
    [12.9352, 77.6245],
    [12.9361, 77.6258],
    [12.9374, 77.6265],
    [12.9382, 77.6279],
    [12.9373, 77.6291],
  ]),
  route('3', 'r3', 8, 4.5, 1740, 6.44, [
    [12.9141, 77.6102],
    [12.9157, 77.6112],
    [12.9166, 77.6129],
    [12.9172, 77.6143],
    [12.9161, 77.6157],
  ]),
  route('4', 'r4', 2, 5.1, 1680, 5.49, [
    [13.0069, 77.5704],
    [13.0078, 77.5721],
    [13.0086, 77.5738],
    [13.0091, 77.5752],
    [13.0082, 77.5764],
  ]),
  route('5', 'r5', 5, 5.0, 1665, 5.55, [
    [12.9545, 77.6431],
    [12.9556, 77.6448],
    [12.9567, 77.646],
    [12.9576, 77.6474],
    [12.9568, 77.6487],
  ]),
];
