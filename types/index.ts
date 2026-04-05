export interface Student {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  createdAt: string;
}

export interface PerformanceTest {
  id: string;
  studentId: string;
  date: string;
  distance: number;
  timeInSeconds: number;
  pace: number;
  heartRate?: number;
  notes?: string;
}

export interface StudentWithLatestTest extends Student {
  latestTest?: PerformanceTest;
  totalTests: number;
}

export interface RunPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number | null;
}

export interface RunSession {
  id: string;
  studentId?: string;
  date: string;
  durationSeconds: number;
  distanceKm: number;
  averagePace: number;
  points: RunPoint[];
}
