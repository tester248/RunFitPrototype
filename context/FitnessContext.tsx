import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Student, PerformanceTest, StudentWithLatestTest, RunSession } from '@/types';
import { sampleStudents, sampleTests, sampleRuns } from '@/mocks/sampleData';

const STORAGE_KEYS = {
  STUDENTS: '@fitness_students',
  TESTS: '@fitness_tests',
  RUNS: '@fitness_runs',
};

const legacyNameById: Record<string, string> = {
  '1': 'Aarav Sharma',
  '2': 'Diya Patel',
  '3': 'Vihaan Reddy',
  '4': 'Ananya Iyer',
  '5': 'Kabir Singh',
};

const legacyNames = new Set([
  'Alex Johnson',
  'Sarah Mitchell',
  'Marcus Chen',
  'Emma Rodriguez',
  'Jordan Williams',
]);

const migrateLegacyStudents = (storedStudents: Student[]): Student[] => {
  let didChange = false;
  const migrated = storedStudents.map((student) => {
    if (legacyNames.has(student.name) && legacyNameById[student.id]) {
      didChange = true;
      return {
        ...student,
        name: legacyNameById[student.id],
      };
    }
    return student;
  });

  return didChange ? migrated : storedStudents;
};

export const [FitnessContext, useFitness] = createContextHook(() => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<PerformanceTest[]>([]);
  const [runs, setRuns] = useState<RunSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, testsData, runsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.STUDENTS),
        AsyncStorage.getItem(STORAGE_KEYS.TESTS),
        AsyncStorage.getItem(STORAGE_KEYS.RUNS),
      ]);

      if (studentsData && testsData) {
        const parsedStudents: Student[] = JSON.parse(studentsData);
        const migratedStudents = migrateLegacyStudents(parsedStudents);
        const parsedTests: PerformanceTest[] = JSON.parse(testsData);
        const parsedRuns: RunSession[] = runsData ? JSON.parse(runsData) : [];
        const hydratedRuns = parsedRuns.length > 0 ? parsedRuns : sampleRuns;

        setStudents(migratedStudents);
        setTests(parsedTests);
        setRuns(hydratedRuns);

        await Promise.all([
          migratedStudents !== parsedStudents
            ? AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(migratedStudents))
            : Promise.resolve(),
          parsedRuns.length === 0
            ? AsyncStorage.setItem(STORAGE_KEYS.RUNS, JSON.stringify(sampleRuns))
            : Promise.resolve(),
        ]);
      } else {
        setStudents(sampleStudents);
        setTests(sampleTests);
        setRuns(sampleRuns);
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(sampleStudents)),
          AsyncStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(sampleTests)),
          AsyncStorage.setItem(STORAGE_KEYS.RUNS, JSON.stringify(sampleRuns)),
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStudents(sampleStudents);
      setTests(sampleTests);
      setRuns(sampleRuns);
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async (student: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    return newStudent;
  };

  const addTest = async (test: Omit<PerformanceTest, 'id'>) => {
    const newTest: PerformanceTest = {
      ...test,
      id: Date.now().toString(),
    };
    const updated = [...tests, newTest];
    setTests(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(updated));
    return newTest;
  };

  const addRun = async (run: Omit<RunSession, 'id' | 'date'> & { date?: string }) => {
    const newRun: RunSession = {
      ...run,
      id: Date.now().toString(),
      date: run.date ?? new Date().toISOString(),
    };
    const updated = [newRun, ...runs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    setRuns(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.RUNS, JSON.stringify(updated));
    return newRun;
  };

  const getStudentTests = (studentId: string): PerformanceTest[] => {
    return tests
      .filter(test => test.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStudentsWithLatestTest = (): StudentWithLatestTest[] => {
    return students.map(student => {
      const studentTests = getStudentTests(student.id);
      return {
        ...student,
        latestTest: studentTests[0],
        totalTests: studentTests.length,
      };
    });
  };

  return {
    students,
    tests,
    runs,
    isLoading,
    addStudent,
    addTest,
    addRun,
    getStudentTests,
    getStudentsWithLatestTest,
  };
});
