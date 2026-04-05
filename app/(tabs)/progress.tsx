import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useFitness } from '@/context/FitnessContext';
import { useTheme } from '@/context/ThemeContext';
import { TrendingUp, TrendingDown, Award, Users } from 'lucide-react-native';
import { formatTime, formatPace } from '@/utils/helpers';

export default function ProgressScreen() {
  const { students, tests, runs } = useFitness();
  const { colors } = useTheme();

  const totalTests = tests.length;
  const activeStudents = students.length;
  const totalGpsRuns = runs.length;

  const averageRunDistance = runs.length > 0
    ? runs.reduce((sum, run) => sum + run.distanceKm, 0) / runs.length
    : 0;
  
  const averagePace = tests.length > 0
    ? tests.reduce((sum, test) => sum + test.pace, 0) / tests.length
    : 0;

  const averageTime = tests.length > 0
    ? tests.reduce((sum, test) => sum + test.timeInSeconds, 0) / tests.length
    : 0;

  const recentTests = [...tests]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const topPerformers = students
    .map(student => {
      const studentTests = tests.filter(t => t.studentId === student.id);
      if (studentTests.length === 0) return null;
      
      const avgPace = studentTests.reduce((sum, test) => sum + test.pace, 0) / studentTests.length;
      const latestTest = studentTests.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      return {
        ...student,
        avgPace,
        latestTime: latestTest.timeInSeconds,
        testCount: studentTests.length,
      };
    })
    .filter(s => s !== null)
    .sort((a, b) => a!.avgPace - b!.avgPace)
    .slice(0, 5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Progress Overview</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Track performance trends</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Users color="#FFFFFF" size={28} />
            <Text style={styles.statValue}>{activeStudents}</Text>
            <Text style={styles.statLabel}>Active Students</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <Award color="#FFFFFF" size={28} />
            <Text style={styles.statValue}>{totalTests}</Text>
            <Text style={styles.statLabel}>Total Tests</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}> 
            <TrendingUp color={colors.primary} size={24} />
            <Text style={[styles.statValue, { color: colors.text }]}>{totalGpsRuns}</Text>
            <Text style={[styles.statLabel, styles.statLabelDark, { color: colors.textSecondary }]}>GPS Runs</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}> 
            <TrendingUp color={colors.secondary} size={24} />
            <Text style={[styles.statValue, { color: colors.text }]}>{averageRunDistance.toFixed(2)} km</Text>
            <Text style={[styles.statLabel, styles.statLabelDark, { color: colors.textSecondary }]}>Avg Run Dist.</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <TrendingUp color={colors.success} size={24} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatPace(averagePace)}
            </Text>
            <Text style={[styles.statLabel, styles.statLabelDark, { color: colors.textSecondary }]}>Avg Pace/km</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <TrendingDown color={colors.secondary} size={24} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatTime(Math.round(averageTime))}
            </Text>
            <Text style={[styles.statLabel, styles.statLabelDark, { color: colors.textSecondary }]}>Avg Time</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Top Performers</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Based on average pace</Text>
          
          {topPerformers.map((student, index) => (
            <View key={student!.id} style={[styles.performerCard, { backgroundColor: colors.card }]}>
              <View style={[styles.performerRank, { backgroundColor: colors.primary }]}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              
              <View style={styles.performerInfo}>
                <Text style={[styles.performerName, { color: colors.text }]}>{student!.name}</Text>
                <Text style={[styles.performerMeta, { color: colors.textSecondary }]}>
                  {student!.testCount} tests completed
                </Text>
              </View>

              <View style={styles.performerStats}>
                <Text style={[styles.performerPace, { color: colors.primary }]}>
                  {formatPace(student!.avgPace)}
                </Text>
                <Text style={[styles.performerPaceLabel, { color: colors.textSecondary }]}>avg pace</Text>
              </View>
            </View>
          ))}

          {topPerformers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No performance data yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Recent Activity</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Latest {recentTests.length} tests</Text>

          {recentTests.map((test) => {
            const student = students.find(s => s.id === test.studentId);
            return (
              <View key={test.id} style={[styles.activityCard, { backgroundColor: colors.card }]}>
                <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityName, { color: colors.text }]}>{student?.name || 'Unknown'}</Text>
                  <Text style={[styles.activityDetails, { color: colors.text }]}>
                    {test.distance}km in {formatTime(test.timeInSeconds)} • {formatPace(test.pace)}/km
                  </Text>
                  <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                    {new Date(test.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}

          {recentTests.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent tests</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🗺️ GPS Sessions</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Latest {Math.min(runs.length, 5)} tracked runs</Text>

          {runs.slice(0, 5).map((run) => {
            const student = students.find(s => s.id === run.studentId);
            return (
              <View key={run.id} style={[styles.activityCard, { backgroundColor: colors.card }]}> 
                <View style={[styles.activityDot, { backgroundColor: colors.secondary }]} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityName, { color: colors.text }]}>{student?.name || 'Unassigned run'}</Text>
                  <Text style={[styles.activityDetails, { color: colors.text }]}>
                    {run.distanceKm.toFixed(2)}km in {formatTime(run.durationSeconds)} • {formatPace(run.averagePace)}/km
                  </Text>
                  <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                    {new Date(run.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}

          {runs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No GPS sessions yet</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },

  statLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statLabelDark: {
    opacity: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500' as const,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  performerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  performerMeta: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  performerStats: {
    alignItems: 'flex-end',
  },
  performerPace: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  performerPaceLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
});
