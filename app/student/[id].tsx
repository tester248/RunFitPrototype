import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFitness } from '@/context/FitnessContext';
import { useTheme } from '@/context/ThemeContext';
import { formatDate, formatTime, formatPace, getInitials } from '@/utils/helpers';
import { Calendar, Clock, Zap, TrendingUp, Heart } from 'lucide-react-native';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, getStudentTests } = useFitness();
  const { colors, isDark } = useTheme();

  const student = students.find(s => s.id === id);
  const tests = getStudentTests(id || '');

  if (!student) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerStyle: { backgroundColor: colors.card } }} />
        <Text style={[styles.errorText, { color: colors.text }]}>Student not found</Text>
      </View>
    );
  }

  const averagePace = tests.length > 0
    ? tests.reduce((sum, test) => sum + test.pace, 0) / tests.length
    : 0;

  const bestTime = tests.length > 0
    ? Math.min(...tests.map(t => t.timeInSeconds))
    : 0;

  const improvement = tests.length >= 2
    ? tests[tests.length - 1].pace - tests[0].pace
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }} 
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
          </View>
          <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
          <Text style={[styles.studentAge, { color: colors.textSecondary }]}>Age {student.age}</Text>
        </View>

        {tests.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <TrendingUp color={colors.primary} size={24} />
              <Text style={[styles.statValue, { color: colors.text }]}>{tests.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Tests</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Zap color={colors.secondary} size={24} />
              <Text style={[styles.statValue, { color: colors.text }]}>{formatPace(averagePace)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Pace</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Clock color={colors.success} size={24} />
              <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(bestTime)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Time</Text>
            </View>
          </View>
        )}

        {improvement !== 0 && (
          <View style={[
            styles.improvementBanner,
            { backgroundColor: improvement < 0 ? (isDark ? '#1A3A2A' : '#E8F5E9') : (isDark ? '#3A2C1F' : '#FFF3E0') }
          ]}>
            <Text style={[styles.improvementText, { color: improvement < 0 ? colors.success : colors.warning }]}>
              {improvement < 0 ? '🎉 Improved by ' : '⚠️ Pace decreased by '}
              {Math.abs(improvement).toFixed(2)} min/km
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance History</Text>
          
          {tests.length > 0 ? (
            tests.map((test, index) => (
              <View key={test.id} style={[styles.testCard, { backgroundColor: colors.card }]}>
                <View style={styles.testHeader}>
                  <View style={[styles.testNumberBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.testNumberText}>#{tests.length - index}</Text>
                  </View>
                  <View style={styles.testDateContainer}>
                    <Calendar color={colors.textSecondary} size={16} />
                    <Text style={[styles.testDate, { color: colors.textSecondary }]}>{formatDate(test.date)}</Text>
                  </View>
                </View>

                <View style={styles.testMetrics}>
                  <View style={[styles.metricItem, { backgroundColor: colors.background }]}>
                    <Clock color={colors.primary} size={18} />
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Time</Text>
                      <Text style={[styles.metricValue, { color: colors.text }]}>
                        {formatTime(test.timeInSeconds)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.metricItem, { backgroundColor: colors.background }]}>
                    <Zap color={colors.secondary} size={18} />
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pace</Text>
                      <Text style={[styles.metricValue, { color: colors.text }]}>
                        {formatPace(test.pace)}/km
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.metricItem, { backgroundColor: colors.background }]}>
                    <TrendingUp color={colors.success} size={18} />
                    <View style={styles.metricContent}>
                      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Distance</Text>
                      <Text style={[styles.metricValue, { color: colors.text }]}>{test.distance}km</Text>
                    </View>
                  </View>

                  {test.heartRate && (
                    <View style={[styles.metricItem, { backgroundColor: colors.background }]}>
                      <Heart color={colors.error} size={18} />
                      <View style={styles.metricContent}>
                        <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Heart Rate</Text>
                        <Text style={[styles.metricValue, { color: colors.text }]}>{test.heartRate} bpm</Text>
                      </View>
                    </View>
                  )}
                </View>

                {test.notes && (
                  <View style={[styles.notesContainer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes:</Text>
                    <Text style={[styles.notesText, { color: colors.text }]}>{test.notes}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No performance tests recorded yet</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700' as const,
  },
  studentName: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  studentAge: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  improvementBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  improvementText: {
    fontSize: 15,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  testCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  testNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  testDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testDate: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  testMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    minWidth: '47%',
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
});
